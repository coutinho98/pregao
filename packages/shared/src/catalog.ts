export interface CatalogItem {
  externalId: string;
  title: string;
  artist: string | null;
  /** Nationality and life of the artist, as the museum writes it: "French, 1859–1891". */
  artistBio: string | null;
  dateDisplay: string | null;
  medium: string | null;
  dimensions: string | null;
  placeOfOrigin: string | null;
  /** Movement or period, as the museum names it: "Pointillism". */
  style: string | null;
  sourceUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  altText: string | null;
  /** A few sentences about the work, from the museum's catalogue (in English). */
  story: string | null;
}

export interface CatalogSearchResult {
  items: CatalogItem[];
  page: number;
  totalPages: number;
}

export const CATALOG_QUERY_MAX_LENGTH = 100;
