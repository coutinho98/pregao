import type { CatalogItem } from '@pregao/shared';

export const ARTIC_FIELDS = [
  'id',
  'title',
  'artist_title',
  'artist_display',
  'date_display',
  'medium_display',
  'dimensions',
  'place_of_origin',
  'style_title',
  'image_id',
  'is_public_domain',
  'thumbnail',
  'short_description',
  'description',
].join(',');

export interface ArticConfig {
  iiif_url: string;
  website_url: string;
}

export interface ArticArtwork {
  id: number;
  title: string | null;
  artist_title: string | null;
  artist_display?: string | null;
  date_display: string | null;
  medium_display: string | null;
  dimensions: string | null;
  place_of_origin: string | null;
  style_title?: string | null;
  image_id: string | null;
  is_public_domain: boolean;
  thumbnail: { width?: number; height?: number; alt_text?: string | null } | null;
  short_description?: string | null;
  description?: string | null;
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

/**
 * Who the artist was, without the name: "Georges Seurat (French, 1859–1891)" gives
 * "French, 1859–1891". The museum also writes it on a second line ("Katsushika Hokusai 葛飾 北斎
 * \nJapanese, 1760-1849") and sometimes puts another name first ("El Greco (Doménikos
 * Theotokópoulos; Greek, active in Spain, 1541–1614)").
 */
export function artistBio(display?: string | null): string | null {
  const text = display?.trim();
  if (!text) return null;
  const raw = text.match(/\(([^()]*)\)$/)?.[1] ?? text.split('\n').at(-1) ?? '';
  const bio = (raw.split(';').at(-1) ?? '').replace(/(\d{4})\s*-\s*(\d{4})/, '$1–$2').trim();
  return bio && bio !== text ? bio : null;
}

/** Longest story kept with an artwork: a few sentences, enough for a hover card. */
export const STORY_MAX_LENGTH = 320;

/**
 * A short story of the work: the museum's short description when it has one, otherwise the
 * opening sentences of its long description, without HTML, cut at a sentence within
 * STORY_MAX_LENGTH (or at a word, with an ellipsis, if the first sentence is longer).
 */
export function storyExcerpt(short?: string | null, long?: string | null): string | null {
  const text = (short?.trim() ? short : (long ?? ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  if (text.length <= STORY_MAX_LENGTH) return text;
  const sentences = text.match(/[^.!?]+[.!?]+["”’)]*\s*/g) ?? [text];
  let excerpt = '';
  for (const sentence of sentences) {
    if ((excerpt + sentence).trim().length > STORY_MAX_LENGTH) break;
    excerpt += sentence;
  }
  if (excerpt.trim()) return excerpt.trim();
  const cut = text.slice(0, STORY_MAX_LENGTH - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Null for artworks we must not auction: without an image or outside the public domain. */
export function toCatalogItem(artwork: ArticArtwork, config: ArticConfig): CatalogItem | null {
  if (!artwork.is_public_domain || !artwork.image_id) return null;
  const iiifBase = `${config.iiif_url}/${artwork.image_id}/full`;
  return {
    externalId: String(artwork.id),
    title: blankToNull(artwork.title) ?? 'Sem título',
    artist: blankToNull(artwork.artist_title),
    artistBio: artistBio(artwork.artist_display),
    dateDisplay: blankToNull(artwork.date_display),
    medium: blankToNull(artwork.medium_display),
    dimensions: blankToNull(artwork.dimensions),
    placeOfOrigin: blankToNull(artwork.place_of_origin),
    // The museum tags some styles as "Japanese (culture or style)"; the tag adds nothing.
    style: blankToNull(artwork.style_title?.replace(/\s*\(culture or style\)$/i, '')),
    sourceUrl: `${config.website_url}/artworks/${artwork.id}`,
    imageUrl: `${iiifBase}/1686,/0/default.jpg`,
    thumbnailUrl: `${iiifBase}/400,/0/default.jpg`,
    imageWidth: artwork.thumbnail?.width ?? null,
    imageHeight: artwork.thumbnail?.height ?? null,
    altText: blankToNull(artwork.thumbnail?.alt_text),
    story: storyExcerpt(artwork.short_description, artwork.description),
  };
}
