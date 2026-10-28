import type { INestApplication } from '@nestjs/common';
import { ErrorCode, LotPhase, Role } from '@pregao/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

const MINUTE = 60_000;

describe('Lots (e2e)', () => {
  let app: INestApplication;
  let catalog: FakeCatalogProvider;
  let clock: FakeClock;
  let auctioneerToken: string;
  const http = () => request(app.getHttpServer());

  const at = (offsetMs: number) => new Date(clock.now().getTime() + offsetMs).toISOString();
  const lotInput = (overrides: Record<string, unknown> = {}) => ({
    externalId: '1',
    startingPriceCents: 100_000,
    minIncrementCents: 5_000,
    startsAt: at(0),
    endsAt: at(60 * MINUTE),
    ...overrides,
  });
  const createLot = (overrides: Record<string, unknown> = {}) =>
    http()
      .post('/lots')
      .set('Authorization', `Bearer ${auctioneerToken}`)
      .send(lotInput(overrides));
  const listPhase = (phase: string, q?: string) =>
    http().get('/lots').query({ phase, q }).expect(200);

  beforeAll(async () => {
    catalog = new FakeCatalogProvider([
      catalogItem({ externalId: '1', title: 'Water Lilies', artist: 'Claude Monet' }),
      catalogItem({ externalId: '2', title: 'The Bedroom', artist: 'Vincent van Gogh' }),
      catalogItem({ externalId: '3', title: 'Nighthawks', artist: 'Edward Hopper' }),
    ]);
    clock = new FakeClock();
    app = await createTestApp({ catalog, clock });
  });

  beforeEach(async () => {
    catalog.available = true;
    await resetDatabase(app);
    auctioneerToken = (await registerUser(app, Role.AUCTIONEER)).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a lot from a snapshot of the artwork, sealed with a genesis hash', async () => {
    const response = await createLot().expect(201);

    expect(response.body).toMatchObject({
      number: 1,
      title: 'Water Lilies',
      artist: 'Claude Monet',
      phase: LotPhase.LIVE,
      startingPriceCents: 100_000,
      minIncrementCents: 5_000,
      currentBidCents: null,
      minNextBidCents: 100_000,
      bidCount: 0,
    });
    const lot = await app.get(PrismaService).lot.findUniqueOrThrow({
      where: { id: response.body.id },
      include: { itemSnapshot: { include: { image: true } } },
    });
    expect(lot.genesisHash).toMatch(/^[0-9a-f]{64}$/);
    expect(lot.lastHash).toBe(lot.genesisHash);
    expect(lot.headSignature).toMatch(/^[0-9a-f]{128}$/);
    expect(Buffer.from(lot.itemSnapshot.image!.imageBytes).toString()).toBe('full:1');
  });

  it('only lets auctioneers create lots', async () => {
    const bidder = await registerUser(app, Role.BIDDER);
    await http()
      .post('/lots')
      .set('Authorization', `Bearer ${bidder.accessToken}`)
      .send(lotInput())
      .expect(403);
    await http().post('/lots').send(lotInput()).expect(401);
  });

  it('rejects an invalid schedule with INVALID_LOT_SCHEDULE', async () => {
    const tooShort = await createLot({ endsAt: at(4 * MINUTE) }).expect(422);
    const inThePast = await createLot({ startsAt: at(-10 * MINUTE) }).expect(422);

    expect(tooShort.body.code).toBe(ErrorCode.INVALID_LOT_SCHEDULE);
    expect(inThePast.body.code).toBe(ErrorCode.INVALID_LOT_SCHEDULE);
  });

  it('rejects non-integer or tiny prices', async () => {
    const response = await createLot({ startingPriceCents: 10.5, minIncrementCents: 0 }).expect(
      400,
    );
    expect(Object.keys(response.body.details.fields)).toEqual(
      expect.arrayContaining(['startingPriceCents', 'minIncrementCents']),
    );
  });

  it('does not list the same artwork twice while a lot is open', async () => {
    await createLot().expect(201);
    const response = await createLot({ startsAt: at(2 * MINUTE) }).expect(409);
    expect(response.body.code).toBe(ErrorCode.ARTWORK_ALREADY_LISTED);
  });

  it('reports artworks the museum does not have', async () => {
    const response = await createLot({ externalId: '999' }).expect(404);
    expect(response.body.code).toBe(ErrorCode.ARTWORK_NOT_FOUND);
  });

  it('derives the showcase phase from the clock and hides cancelled lots', async () => {
    const live = await createLot({ externalId: '1' }).expect(201);
    const scheduled = await createLot({
      externalId: '2',
      startsAt: at(30 * MINUTE),
      endsAt: at(120 * MINUTE),
    }).expect(201);
    const cancelled = await createLot({ externalId: '3' }).expect(201);
    await app
      .get(PrismaService)
      .lot.update({ where: { id: cancelled.body.id }, data: { status: 'CANCELLED' } });

    expect(
      (await listPhase(LotPhase.LIVE)).body.items.map((lot: { id: string }) => lot.id),
    ).toEqual([live.body.id]);
    expect((await listPhase(LotPhase.SCHEDULED)).body.items[0].id).toBe(scheduled.body.id);
    expect((await listPhase(LotPhase.ENDED)).body.total).toBe(0);

    clock.advance(61 * MINUTE);

    expect((await listPhase(LotPhase.LIVE)).body.items[0].id).toBe(scheduled.body.id);
    expect((await listPhase(LotPhase.ENDED)).body.items[0]).toMatchObject({
      id: live.body.id,
      phase: LotPhase.ENDED,
    });
  });

  it('searches the showcase by title or artist', async () => {
    await createLot({ externalId: '1' }).expect(201);
    await createLot({ externalId: '2' }).expect(201);

    const byArtist = await listPhase(LotPhase.LIVE, 'gogh');
    const byTitle = await listPhase(LotPhase.LIVE, 'lilies');

    expect(byArtist.body.items.map((lot: { title: string }) => lot.title)).toEqual(['The Bedroom']);
    expect(byTitle.body.items.map((lot: { title: string }) => lot.title)).toEqual(['Water Lilies']);
  });

  it('finds lots by number and sorts the showcase', async () => {
    const ana = await registerUser(app, Role.BIDDER);
    await http()
      .post('/wallet/deposits')
      .set('Authorization', `Bearer ${ana.accessToken}`)
      .send({ amountCents: 1_000_000 })
      .expect(201);
    const first = await createLot({ externalId: '1' }).expect(201);
    const second = await createLot({ externalId: '2', endsAt: at(30 * MINUTE) }).expect(201);
    await http()
      .post(`/lots/${first.body.id}/bids`)
      .set('Authorization', `Bearer ${ana.accessToken}`)
      .send({ amountCents: 100_000 })
      .expect(201);

    const byNumber = await http()
      .get('/lots')
      .query({ phase: LotPhase.LIVE, q: 'lote 002' })
      .expect(200);
    expect(byNumber.body.items.map((lot: { id: string }) => lot.id)).toEqual([second.body.id]);

    const ids = async (sort: string) =>
      (await http().get('/lots').query({ phase: LotPhase.LIVE, sort }).expect(200)).body.items.map(
        (lot: { id: string }) => lot.id,
      );
    expect(await ids('SOON')).toEqual([second.body.id, first.body.id]);
    expect(await ids('MOST_BIDS')).toEqual([first.body.id, second.body.id]);
    expect(await ids('HIGHEST_BID')).toEqual([first.body.id, second.body.id]);
    await http().get('/lots').query({ phase: LotPhase.LIVE, sort: 'CHEAPEST' }).expect(400);
  });

  it('keeps the showcase, lot page and images working while the museum API is down', async () => {
    const lot = await createLot().expect(201);

    catalog.available = false;

    const showcase = await listPhase(LotPhase.LIVE);
    expect(showcase.body.items[0]).toMatchObject({ id: lot.body.id, title: 'Water Lilies' });
    await http().get(`/lots/${lot.body.id}`).expect(200);

    const image = await http().get(lot.body.image.url).expect(200);
    expect(image.headers['content-type']).toBe('image/jpeg');
    expect(image.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(image.body.toString()).toBe('full:1');
    const thumbnail = await http().get(lot.body.image.thumbnailUrl).expect(200);
    expect(thumbnail.body.toString()).toBe('thumb:1');

    const search = await http()
      .get('/catalog/search')
      .query({ q: 'monet' })
      .set('Authorization', `Bearer ${auctioneerToken}`)
      .expect(503);
    expect(search.body.code).toBe(ErrorCode.EXTERNAL_API_UNAVAILABLE);
  });

  it('proxies catalog thumbnails so browsers never hit the museum CDN', async () => {
    const search = (q: string) =>
      http().get('/catalog/search').query({ q }).set('Authorization', `Bearer ${auctioneerToken}`);
    const unseen = await http().get('/catalog/items/2/thumbnail').expect(404);
    expect(unseen.body.code).toBe(ErrorCode.ARTWORK_NOT_FOUND);

    await search('gogh').expect(200);
    await search('hopper').expect(200);
    const thumbnail = await http().get('/catalog/items/2/thumbnail').expect(200);
    expect(thumbnail.headers['content-type']).toBe('image/jpeg');
    expect(thumbnail.body.toString()).toBe('thumb:2');

    catalog.available = false;
    const unavailable = await http().get('/catalog/items/3/thumbnail').expect(503);
    expect(unavailable.body.code).toBe(ErrorCode.EXTERNAL_API_UNAVAILABLE);
  });

  it("lists the auctioneer's own lots", async () => {
    await createLot().expect(201);
    const mine = await http()
      .get('/lots/mine')
      .set('Authorization', `Bearer ${auctioneerToken}`)
      .expect(200);
    expect(mine.body.lots).toHaveLength(1);
  });
});
