import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CatalogItem, CatalogSearchResult } from '@pregao/shared';
import { Env } from '../../../common/config/env.js';
import type { ArtworkImage, CatalogProvider } from '../catalog-provider.js';
import { UpstreamError } from '../upstream-error.js';
import {
  ARTIC_FIELDS,
  type ArticDetailResponse,
  type ArticSearchResponse,
  toCatalogItem,
} from './artic.mapper.js';

const API_BASE_URL = 'https://api.artic.edu/api/v1';
const REQUEST_TIMEOUT_MS = 5_000;
const SEARCH_PAGE_SIZE = 12;
/** The museum's search index stops paginating deep results; beyond this, refine the query. */
const MAX_SEARCH_PAGES = 50;

@Injectable()
export class ArticCatalogProvider implements CatalogProvider {
  private readonly headers: Record<string, string>;

  constructor(config: ConfigService<Env, true>) {
    // The museum asks for this header; its image CDN rejects requests without it.
    const contact = config.get('AIC_CONTACT_EMAIL', { infer: true });
    this.headers = { 'AIC-User-Agent': `casa-de-leiloes-verzel (${contact})` };
  }

  async search(query: string, page: number): Promise<CatalogSearchResult> {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(SEARCH_PAGE_SIZE),
      fields: ARTIC_FIELDS,
      'query[term][is_public_domain]': 'true',
    });
    const response = await this.request(`${API_BASE_URL}/artworks/search?${params}`);
    const body = (await response.json()) as ArticSearchResponse;
    return {
      items: body.data.flatMap((artwork) => toCatalogItem(artwork, body.config) ?? []),
      page: body.pagination.current_page,
      totalPages: Math.min(body.pagination.total_pages, MAX_SEARCH_PAGES),
    };
  }

  async findItem(externalId: string): Promise<CatalogItem | null> {
    const response = await this.request(
      `${API_BASE_URL}/artworks/${encodeURIComponent(externalId)}?fields=${ARTIC_FIELDS}`,
      { allowNotFound: true },
    );
    if (response.status === 404) return null;
    const body = (await response.json()) as ArticDetailResponse;
    return toCatalogItem(body.data, body.config);
  }

  async downloadImage(item: CatalogItem): Promise<ArtworkImage> {
    const [full, thumbnail] = await Promise.all([
      this.downloadBytes(item.imageUrl),
      this.downloadBytes(item.thumbnailUrl),
    ]);
    return { mime: 'image/jpeg', full, thumbnail };
  }

  downloadThumbnail(item: CatalogItem): Promise<Buffer> {
    return this.downloadBytes(item.thumbnailUrl);
  }

  private async downloadBytes(url: string): Promise<Buffer> {
    const response = await this.request(url);
    return Buffer.from(await response.arrayBuffer());
  }

  private async request(url: string, { allowNotFound = false } = {}): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: this.headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new UpstreamError(`Request to ${url} failed`, null, { cause: error });
    }
    if (response.ok || (allowNotFound && response.status === 404)) return response;
    throw new UpstreamError(`Request to ${url} returned ${response.status}`, response.status);
  }
}
