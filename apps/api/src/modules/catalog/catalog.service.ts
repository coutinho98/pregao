import { Inject, Injectable, Logger } from '@nestjs/common';
import { type CatalogItem, type CatalogSearchResult, ErrorCode } from '@pregao/shared';
import { DomainError } from '../../common/errors/domain-error.js';
import { CircuitBreaker } from '../../common/resilience/circuit-breaker.js';
import { withRetry } from '../../common/resilience/retry.js';
import { TtlCache } from '../../common/resilience/ttl-cache.js';
import { type ArtworkImage, CATALOG_PROVIDER, type CatalogProvider } from './catalog-provider.js';
import { isRetryableUpstreamError } from './upstream-error.js';

const CACHE_TTL_MS = 10 * 60_000;
/** How long an artwork seen in a search keeps its thumbnail available. */
const SEARCHED_TTL_MS = 60 * 60_000;

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private readonly breaker = new CircuitBreaker({ failureThreshold: 5, cooldownMs: 30_000 });
  private readonly searchCache = new TtlCache<CatalogSearchResult>(CACHE_TTL_MS, 200);
  private readonly itemCache = new TtlCache<CatalogItem | null>(CACHE_TTL_MS, 500);
  private readonly thumbnailCache = new TtlCache<Buffer>(60 * 60_000, 300);
  private readonly searched = new TtlCache<true>(SEARCHED_TTL_MS, 2_000);

  constructor(@Inject(CATALOG_PROVIDER) private readonly provider: CatalogProvider) {}

  async search(query: string, page: number): Promise<CatalogSearchResult> {
    const key = `${query.trim().toLowerCase()}|${page}`;
    const result =
      this.searchCache.get(key) ??
      (await this.callUpstream(() => this.provider.search(query, page)));
    this.searchCache.set(key, result);
    for (const item of result.items) {
      // The results' thumbnails are requested right after; avoid one detail call per artwork.
      this.itemCache.set(item.externalId, item);
      this.searched.set(item.externalId, true);
    }
    return result;
  }

  /**
   * Thumbnail proxied through the API: the museum's CDN blocks browsers hotlinking it. The
   * route is public (an <img> sends no token), so it only serves artworks that showed up in
   * a recent search; otherwise anyone could walk ids and spend the museum's rate limit.
   */
  async getThumbnail(externalId: string): Promise<Buffer> {
    const cached = this.thumbnailCache.get(externalId);
    if (cached) return cached;
    if (!this.searched.get(externalId)) {
      throw new DomainError(
        ErrorCode.ARTWORK_NOT_FOUND,
        'Miniatura disponível só para obras de uma busca recente no acervo.',
      );
    }

    const item = await this.getItem(externalId);
    const thumbnail = await this.callUpstream(() => this.provider.downloadThumbnail(item));
    this.thumbnailCache.set(externalId, thumbnail);
    return thumbnail;
  }

  async getItem(externalId: string): Promise<CatalogItem> {
    let item = this.itemCache.get(externalId);
    if (item === undefined) {
      item = await this.callUpstream(() => this.provider.findItem(externalId));
      this.itemCache.set(externalId, item);
    }
    if (!item) {
      throw new DomainError(
        ErrorCode.ARTWORK_NOT_FOUND,
        'Obra não encontrada no acervo ou fora do domínio público.',
      );
    }
    return item;
  }

  downloadImage(item: CatalogItem): Promise<ArtworkImage> {
    return this.callUpstream(() => this.provider.downloadImage(item));
  }

  private async callUpstream<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await this.breaker.execute(() =>
        withRetry(action, { retries: 2, baseDelayMs: 300, shouldRetry: isRetryableUpstreamError }),
      );
    } catch (error) {
      this.logger.warn(`Catalog unavailable: ${error instanceof Error ? error.message : error}`);
      throw new DomainError(
        ErrorCode.EXTERNAL_API_UNAVAILABLE,
        'O acervo do museu não respondeu agora. Os lotes já criados seguem funcionando; tente buscar de novo em instantes.',
      );
    }
  }
}
