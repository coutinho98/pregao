import type { CatalogItem, CatalogSearchResult } from '@pregao/shared';

export interface ArtworkImage {
  mime: string;
  full: Buffer;
  thumbnail: Buffer;
}

/** Source of artworks. Implemented by the Art Institute of Chicago client; faked in tests. */
export interface CatalogProvider {
  search(query: string, page: number): Promise<CatalogSearchResult>;
  /** Null when the artwork does not exist or cannot be auctioned (no image, not public domain). */
  findItem(externalId: string): Promise<CatalogItem | null>;
  downloadImage(item: CatalogItem): Promise<ArtworkImage>;
}

export const CATALOG_PROVIDER = Symbol('CATALOG_PROVIDER');

/** Stored on each snapshot so lots keep pointing at the right museum. */
export const CATALOG_SOURCE = 'ARTIC';
