import { describe, expect, it } from 'vitest';
import {
  artistBio,
  type ArticArtwork,
  STORY_MAX_LENGTH,
  storyExcerpt,
  toCatalogItem,
} from './artic.mapper.js';

const config = { iiif_url: 'https://iiif.test/iiif/2', website_url: 'https://museum.test' };
const artwork: ArticArtwork = {
  id: 16568,
  title: 'Water Lilies',
  artist_title: 'Claude Monet',
  artist_display: 'Claude Monet (French, 1840–1926)',
  date_display: '1906',
  medium_display: 'Oil on canvas',
  dimensions: '89.9 × 94.1 cm',
  place_of_origin: 'France',
  style_title: 'Impressionism',
  image_id: 'abc-123',
  is_public_domain: true,
  thumbnail: { width: 8808, height: 8460, alt_text: 'A pond with water lilies.' },
  short_description: 'Monet painted his water garden at Giverny.',
};

describe('toCatalogItem', () => {
  it('maps the artwork and builds IIIF urls from the config', () => {
    expect(toCatalogItem(artwork, config)).toEqual({
      externalId: '16568',
      title: 'Water Lilies',
      artist: 'Claude Monet',
      artistBio: 'French, 1840–1926',
      dateDisplay: '1906',
      medium: 'Oil on canvas',
      dimensions: '89.9 × 94.1 cm',
      placeOfOrigin: 'France',
      style: 'Impressionism',
      sourceUrl: 'https://museum.test/artworks/16568',
      imageUrl: 'https://iiif.test/iiif/2/abc-123/full/1686,/0/default.jpg',
      thumbnailUrl: 'https://iiif.test/iiif/2/abc-123/full/400,/0/default.jpg',
      imageWidth: 8808,
      imageHeight: 8460,
      altText: 'A pond with water lilies.',
      story: 'Monet painted his water garden at Giverny.',
    });
  });

  it('drops the "culture or style" tag from the style', () => {
    expect(
      toCatalogItem({ ...artwork, style_title: 'Japanese (culture or style)' }, config)?.style,
    ).toBe('Japanese');
  });

  it('discards artworks without an image', () => {
    expect(toCatalogItem({ ...artwork, image_id: null }, config)).toBeNull();
  });

  it('discards artworks outside the public domain', () => {
    expect(toCatalogItem({ ...artwork, is_public_domain: false }, config)).toBeNull();
  });

  it('turns blank fields into null and gives untitled works a title', () => {
    const item = toCatalogItem(
      { ...artwork, title: '  ', artist_title: '', thumbnail: null },
      config,
    );
    expect(item).toMatchObject({
      title: 'Sem título',
      artist: null,
      imageWidth: null,
      altText: null,
    });
  });
});

describe('storyExcerpt', () => {
  it('prefers the short description', () => {
    expect(storyExcerpt('Short one.', '<p>Long one.</p>')).toBe('Short one.');
  });

  it('falls back to the long description without HTML or entities', () => {
    expect(storyExcerpt(null, '<p>Monet&nbsp;painted <em>water</em> lilies.</p>')).toBe(
      'Monet painted water lilies.',
    );
  });

  it('keeps whole sentences within the limit', () => {
    const sentence = 'A sentence that is exactly long enough to matter here. ';
    const story = storyExcerpt(null, sentence.repeat(20))!;
    expect(story.length).toBeLessThanOrEqual(STORY_MAX_LENGTH);
    expect(story.endsWith('here.')).toBe(true);
  });

  it('cuts an overlong first sentence at a word, with an ellipsis', () => {
    const story = storyExcerpt(null, 'word '.repeat(200))!;
    expect(story.length).toBeLessThanOrEqual(STORY_MAX_LENGTH);
    expect(story.endsWith('word…')).toBe(true);
  });

  it('is null when the museum has nothing to say', () => {
    expect(storyExcerpt(null, null)).toBeNull();
    expect(storyExcerpt('  ', '')).toBeNull();
  });
});

describe('artistBio', () => {
  it('takes what follows the name in parentheses', () => {
    expect(artistBio('Georges Seurat (French, 1859–1891)')).toBe('French, 1859–1891');
  });

  it('drops another name given before a semicolon', () => {
    expect(artistBio('El Greco (Doménikos Theotokópoulos; Greek, active in Spain, 1541–1614)')).toBe(
      'Greek, active in Spain, 1541–1614',
    );
  });

  it('reads the second line and writes the years with an en dash', () => {
    expect(artistBio('Katsushika Hokusai 葛飾 北斎 \nJapanese, 1760-1849')).toBe(
      'Japanese, 1760–1849',
    );
  });

  it('is null when there is only a name', () => {
    expect(artistBio('Unknown artist')).toBeNull();
    expect(artistBio(null)).toBeNull();
  });
});
