import type { CatalogItem } from '@pregao/shared';

export const ARTIC_FIELDS = [
  'id',
  'title',
  'artist_title',
  'date_display',
  'medium_display',
  'dimensions',
  'place_of_origin',
  'image_id',
  'is_public_domain',
  'thumbnail',
].join(',');

export interface ArticConfig {
  iiif_url: string;
  website_url: string;
}

export interface ArticArtwork {
  id: number;
  title: string | null;
  artist_title: string | null;
  date_display: string | null;
  medium_display: string | null;
  dimensions: string | null;
  place_of_origin: string | null;
  image_id: string | null;
  is_public_domain: boolean;
  thumbnail: { width?: number; height?: number; alt_text?: string | null } | null;
}

export interface ArticSearchResponse {
  pagination: { total_pages: number; current_page: number };
  data: ArticArtwork[];
  config: ArticConfig;
}

export interface ArticDetailResponse {
  data: ArticArtwork;
  config: ArticConfig;
}

const blankToNull = (value: string | null | undefined): string | null => value?.trim() || null;

/** Null for artworks we must not auction: without an image or outside the public domain. */
export function toCatalogItem(artwork: ArticArtwork, config: ArticConfig): CatalogItem | null {
  if (!artwork.is_public_domain || !artwork.image_id) return null;
  const iiifBase = `${config.iiif_url}/${artwork.image_id}/full`;
  return {
    externalId: String(artwork.id),
    title: blankToNull(artwork.title) ?? 'Sem título',
    artist: blankToNull(artwork.artist_title),
    dateDisplay: blankToNull(artwork.date_display),
    medium: blankToNull(artwork.medium_display),
    dimensions: blankToNull(artwork.dimensions),
    placeOfOrigin: blankToNull(artwork.place_of_origin),
    sourceUrl: `${config.website_url}/artworks/${artwork.id}`,
    imageUrl: `${iiifBase}/1686,/0/default.jpg`,
    thumbnailUrl: `${iiifBase}/400,/0/default.jpg`,
    imageWidth: artwork.thumbnail?.width ?? null,
    imageHeight: artwork.thumbnail?.height ?? null,
    altText: blankToNull(artwork.thumbnail?.alt_text),
  };
}
