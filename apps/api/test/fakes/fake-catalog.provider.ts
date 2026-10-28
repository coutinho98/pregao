import type { CatalogItem, CatalogSearchResult } from '@pregao/shared';
import type { ArtworkImage, CatalogProvider } from '../../src/modules/catalog/catalog-provider.js';
import { UpstreamError } from '../../src/modules/catalog/upstream-error.js';

export function catalogItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  const externalId = overrides.externalId ?? '16568';
  return {
    externalId,
    title: 'Water Lilies',
    artist: 'Claude Monet',
    artistBio: 'French, 1840–1926',
    dateDisplay: '1906',
    medium: 'Oil on canvas',
    dimensions: '89.9 × 94.1 cm',
    placeOfOrigin: 'France',
    style: 'Impressionism',
    sourceUrl: `https://museum.test/artworks/${externalId}`,
    imageUrl: `https://iiif.test/${externalId}/1686.jpg`,
    thumbnailUrl: `https://iiif.test/${externalId}/400.jpg`,
    imageWidth: 800,
    imageHeight: 600,
    altText: 'A pond with water lilies.',
    story: 'Monet painted the water garden he built at Giverny.',
    ...overrides,
  };
}

/** In-memory museum. Flip `available` to simulate the external API being down. */
export class FakeCatalogProvider implements CatalogProvider {
  available = true;
  readonly items = new Map<string, CatalogItem>();
  calls = 0;

  constructor(items: CatalogItem[] = [catalogItem()]) {
    for (const item of items) this.items.set(item.externalId, item);
  }

  async search(query: string, page: number): Promise<CatalogSearchResult> {
    this.ensureAvailable();
    const needle = query.toLowerCase();
    const items = [...this.items.values()].filter((item) =>
      `${item.title} ${item.artist ?? ''}`.toLowerCase().includes(needle),
    );
    return { items, page, totalPages: 1 };
  }

  async findItem(externalId: string): Promise<CatalogItem | null> {
    this.ensureAvailable();
    return this.items.get(externalId) ?? null;
  }

  async downloadImage(item: CatalogItem): Promise<ArtworkImage> {
    this.ensureAvailable();
    return {
      mime: 'image/jpeg',
      full: Buffer.from(`full:${item.externalId}`),
      thumbnail: Buffer.from(`thumb:${item.externalId}`),
    };
  }

  async downloadThumbnail(item: CatalogItem): Promise<Buffer> {
    this.ensureAvailable();
    return Buffer.from(`thumb:${item.externalId}`);
  }

  private ensureAvailable(): void {
    this.calls += 1;
    if (!this.available) throw new UpstreamError('Fake catalog is down', 400);
  }
}
