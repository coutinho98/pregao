import type { CatalogItem, CatalogSearchResult } from '@pregao/shared';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ArtworkImage, CatalogProvider } from './catalog-provider.js';

interface FixtureArtwork extends Omit<CatalogItem, 'imageUrl' | 'thumbnailUrl'> {
  image: string;
  thumbnail: string;
}

/**
 * Artworks read from a local folder (artworks.json + images) instead of the museum API.
 * Used by the demo seed and for offline demos: no network, same snapshots.
 */
export class FixtureCatalogProvider implements CatalogProvider {
  private readonly artworks: FixtureArtwork[];

  constructor(private readonly dir: string) {
    this.artworks = JSON.parse(
      readFileSync(join(dir, 'artworks.json'), 'utf8'),
    ) as FixtureArtwork[];
  }

  async search(query: string, page: number): Promise<CatalogSearchResult> {
    const needle = query.toLowerCase();
    const items = this.artworks
      .filter((artwork) =>
        `${artwork.title} ${artwork.artist ?? ''}`.toLowerCase().includes(needle),
      )
      .map((artwork) => this.toItem(artwork));
    return { items, page, totalPages: 1 };
  }

  async findItem(externalId: string): Promise<CatalogItem | null> {
    const artwork = this.artworks.find((candidate) => candidate.externalId === externalId);
    return artwork ? this.toItem(artwork) : null;
  }

  async downloadImage(item: CatalogItem): Promise<ArtworkImage> {
    const [full, thumbnail] = await Promise.all([
      readFile(item.imageUrl),
      readFile(item.thumbnailUrl),
    ]);
    return { mime: 'image/jpeg', full, thumbnail };
  }

  downloadThumbnail(item: CatalogItem): Promise<Buffer> {
    return readFile(item.thumbnailUrl);
  }

  private toItem({ image, thumbnail, ...artwork }: FixtureArtwork): CatalogItem {
    return { ...artwork, imageUrl: join(this.dir, image), thumbnailUrl: join(this.dir, thumbnail) };
  }
}
