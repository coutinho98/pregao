import { describe, expect, it } from 'vitest';
import { type ArticArtwork, toCatalogItem } from './artic.mapper.js';

const config = { iiif_url: 'https://iiif.test/iiif/2', website_url: 'https://museum.test' };
const artwork: ArticArtwork = {
  id: 16568,
  title: 'Water Lilies',
  artist_title: 'Claude Monet',
  date_display: '1906',
  medium_display: 'Oil on canvas',
  dimensions: '89.9 × 94.1 cm',
  place_of_origin: 'France',
  image_id: 'abc-123',
  is_public_domain: true,
  thumbnail: { width: 8808, height: 8460, alt_text: 'A pond with water lilies.' },
};

describe('toCatalogItem', () => {
  it('maps the artwork and builds IIIF urls from the config', () => {
    expect(toCatalogItem(artwork, config)).toEqual({
      externalId: '16568',
      title: 'Water Lilies',
      artist: 'Claude Monet',
      dateDisplay: '1906',
      medium: 'Oil on canvas',
      dimensions: '89.9 × 94.1 cm',
      placeOfOrigin: 'France',
      sourceUrl: 'https://museum.test/artworks/16568',
      imageUrl: 'https://iiif.test/iiif/2/abc-123/full/1686,/0/default.jpg',
      thumbnailUrl: 'https://iiif.test/iiif/2/abc-123/full/400,/0/default.jpg',
      imageWidth: 8808,
      imageHeight: 8460,
      altText: 'A pond with water lilies.',
    });
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
