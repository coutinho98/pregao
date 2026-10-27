import type { INestApplication } from '@nestjs/common';
import { type AuthResponse, ErrorCode, LedgerEntryType, LotPhase, Role } from '@pregao/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { SettlementService } from '../src/modules/settlement/settlement.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

const MINUTE = 60_000;

describe('Lot cancellation with automatic refund (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clock: FakeClock;
  let s: ReturnType<typeof scenario>;
  let auctioneer: AuthResponse;

  const cancel = (token: string, lotId: string) =>
    s.http().post(`/lots/${lotId}/cancel`).set('Authorization', `Bearer ${token}`);
  const bidder = async () => {
    const user = await registerUser(app, Role.BIDDER);
    await s.deposit(user.accessToken, 500_000);
    return user;
  };

  beforeAll(async () => {
    clock = new FakeClock();
    app = await createTestApp({
      clock,
      catalog: new FakeCatalogProvider(['1', '2'].map((externalId) => catalogItem({ externalId }))),
    });
    prisma = app.get(PrismaService);
    s = scenario(app, clock);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    auctioneer = await registerUser(app, Role.AUCTIONEER);
  });

  afterAll(async () => {
    await app.close();
  });

  it('cancels a lot without bids and hides it from the showcase', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');

    const response = await cancel(auctioneer.accessToken, lot.id).expect(200);

    expect(response.body.phase).toBe(LotPhase.CANCELLED);
    const live = await s.http().get('/lots').query({ phase: LotPhase.LIVE }).expect(200);
    expect(live.body.total).toBe(0);
  });

  it("refunds the leader's committed amount in the same transaction and records it", async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    const bia = await bidder();
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    await s.acceptedBid(bia.accessToken, lot.id, 120_000);

    await cancel(auctioneer.accessToken, lot.id).expect(200);

    expect(await s.wallet(bia.accessToken)).toEqual({
      totalCents: 500_000,
      committedCents: 0,
      availableCents: 500_000,
    });
    expect(await s.wallet(ana.accessToken)).toMatchObject({
      committedCents: 0,
      totalCents: 500_000,
    });
    const refunds = await prisma.walletLedger.findMany({ where: { type: LedgerEntryType.REFUND } });
    expect(refunds).toHaveLength(1);
    expect(refunds[0]).toMatchObject({ lotId: lot.id, amountCents: 120_000n });
  });

  it('refuses bids on a cancelled lot and never settles it', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    await cancel(auctioneer.accessToken, lot.id).expect(200);

    const refused = await s.bid(ana.accessToken, lot.id, 100_000).expect(409);
    expect(refused.body.code).toBe(ErrorCode.LOT_ENDED);

    clock.advance(61 * MINUTE);
    expect(await app.get(SettlementService).settleDue()).toBe(0);
    expect(await prisma.receipt.count()).toBe(0);
  });

  it('only lets the owner cancel, and only while the lot is open', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const other = await registerUser(app, Role.AUCTIONEER);
    const ana = await bidder();

    expect((await cancel(other.accessToken, lot.id).expect(403)).body.code).toBe(
      ErrorCode.FORBIDDEN,
    );
    await cancel(ana.accessToken, lot.id).expect(403);

    clock.advance(61 * MINUTE);
    const ended = await cancel(auctioneer.accessToken, lot.id).expect(409);
    expect(ended.body.code).toBe(ErrorCode.LOT_ENDED);
  });

  it('cannot cancel the same lot twice', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    await cancel(auctioneer.accessToken, lot.id).expect(200);
    await cancel(auctioneer.accessToken, lot.id).expect(409);
  });
});
