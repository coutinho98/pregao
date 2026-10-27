export interface CatalogItem {
  externalId: string;
  title: string;
  artist: string | null;
  dateDisplay: string | null;
  medium: string | null;
  dimensions: string | null;
  placeOfOrigin: string | null;
  sourceUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  altText: string | null;
}

export interface CatalogSearchResult {
  items: CatalogItem[];
  page: number;
  totalPages: number;
}

export const CATALOG_QUERY_MAX_LENGTH = 100;
