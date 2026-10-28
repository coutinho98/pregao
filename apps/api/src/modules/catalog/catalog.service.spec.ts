import { ErrorCode } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { catalogItem, FakeCatalogProvider } from '../../../test/fakes/fake-catalog.provider.js';
import { CatalogService } from './catalog.service.js';

describe('CatalogService', () => {
  it('serves repeated searches from the cache', async () => {
    const provider = new FakeCatalogProvider();
    const service = new CatalogService(provider);

    await service.search('monet', 1);
    await service.search('  MONET ', 1);

    expect(provider.calls).toBe(1);
  });

  it('turns upstream failures into EXTERNAL_API_UNAVAILABLE', async () => {
    const provider = new FakeCatalogProvider();
    provider.available = false;
    const service = new CatalogService(provider);

    await expect(service.search('monet', 1)).rejects.toMatchObject({
      code: ErrorCode.EXTERNAL_API_UNAVAILABLE,
    });
  });

  it('keeps answering cached searches while the museum is down', async () => {
    const provider = new FakeCatalogProvider();
    const service = new CatalogService(provider);
    const first = await service.search('monet', 1);

    provider.available = false;

    await expect(service.search('monet', 1)).resolves.toEqual(first);
  });

  it('stops calling the museum once the circuit opens', async () => {
    const provider = new FakeCatalogProvider();
    provider.available = false;
    const service = new CatalogService(provider);

    for (let i = 0; i < 5; i++) await expect(service.search(`q${i}`, 1)).rejects.toThrow();
    const callsWhenOpened = provider.calls;
    await expect(service.search('another', 1)).rejects.toMatchObject({
      code: ErrorCode.EXTERNAL_API_UNAVAILABLE,
    });

    expect(provider.calls).toBe(callsWhenOpened);
  });

  it('reports artworks that cannot be auctioned as ARTWORK_NOT_FOUND', async () => {
    const service = new CatalogService(new FakeCatalogProvider([catalogItem({ externalId: '1' })]));
    await expect(service.getItem('999')).rejects.toMatchObject({
      code: ErrorCode.ARTWORK_NOT_FOUND,
    });
  });
});

describe('CatalogService thumbnails', () => {
  it('reuses search results and caches the thumbnail bytes', async () => {
    const provider = new FakeCatalogProvider([catalogItem({ externalId: '7', title: 'Monet' })]);
    const service = new CatalogService(provider);
    await service.search('monet', 1);
    const callsAfterSearch = provider.calls;

    await expect(service.getThumbnail('7')).resolves.toEqual(Buffer.from('thumb:7'));
    await service.getThumbnail('7');

    expect(provider.calls).toBe(callsAfterSearch + 1);
  });

  it('refuses thumbnails of artworks no search has shown, without calling the museum', async () => {
    const provider = new FakeCatalogProvider([catalogItem({ externalId: '7', title: 'Monet' })]);
    const service = new CatalogService(provider);

    await expect(service.getThumbnail('7')).rejects.toMatchObject({
      code: ErrorCode.ARTWORK_NOT_FOUND,
    });
    expect(provider.calls).toBe(0);
  });
});
