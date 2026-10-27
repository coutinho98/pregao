import type { INestApplication } from '@nestjs/common';
import { type AuthResponse, LedgerEntryType, Role } from '@pregao/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { SettlementService } from '../src/modules/settlement/settlement.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

const MINUTE = 60_000;
const artworks = Array.from({ length: 5 }, (_, i) => catalogItem({ externalId: String(i + 1) }));

describe('Settlement (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let settlement: SettlementService;
  let clock: FakeClock;
  let s: ReturnType<typeof scenario>;
  let auctioneer: AuthResponse;
  let ana: AuthResponse;
  let bia: AuthResponse;

  const bidder = async () => {
    const user = await registerUser(app, Role.BIDDER);
    await s.deposit(user.accessToken, 500_000);
    return user;
  };
  /** A lot of one hour where Ana bids 100k and Bia wins with 120k. */
  const contestedLot = async (externalId = '1') => {
    const lot = await s.createLot(auctioneer.accessToken, externalId);
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    await s.acceptedBid(bia.accessToken, lot.id, 120_000);
    return lot;
  };
  const walletOf = (user: AuthResponse) =>
    prisma.wallet.findUniqueOrThrow({ where: { userId: user.user.id } });

  beforeAll(async () => {
    clock = new FakeClock();
    app = await createTestApp({ clock, catalog: new FakeCatalogProvider(artworks) });
    prisma = app.get(PrismaService);
    settlement = app.get(SettlementService);
    s = scenario(app, clock);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    auctioneer = await registerUser(app, Role.AUCTIONEER);
    ana = await bidder();
    bia = await bidder();
  });

  afterAll(async () => {
    await app.close();
  });

  it('charges the winner, credits the auctioneer and issues a receipt', async () => {
    const lot = await contestedLot();
    clock.advance(61 * MINUTE);

    expect(await settlement.settleDue()).toBe(1);

    expect(await walletOf(bia)).toMatchObject({ totalCents: 380_000n, committedCents: 0n });
    expect(await walletOf(ana)).toMatchObject({ totalCents: 500_000n, committedCents: 0n });
    expect(await walletOf(auctioneer)).toMatchObject({ totalCents: 120_000n, committedCents: 0n });

    const stored = await prisma.lot.findUniqueOrThrow({
      where: { id: lot.id },
      include: { receipt: true },
    });
    expect(stored.status).toBe('SETTLED');
    expect(stored.receipt).toMatchObject({
      winnerId: bia.user.id,
      amountCents: 120_000n,
      bidCount: 2,
      finalHash: stored.lastHash,
    });
    const ledger = await prisma.walletLedger.findMany({
      where: { lotId: lot.id, type: { in: [LedgerEntryType.DEBIT, LedgerEntryType.CREDIT] } },
    });
    expect(ledger.map((entry) => entry.type).sort()).toEqual(['CREDIT', 'DEBIT']);
  });

  it('serves a public receipt that names the paddle, never the person', async () => {
    const lot = await contestedLot();
    clock.advance(61 * MINUTE);
    await settlement.settleDue();
    const { publicToken, winnerPseudonym } = await prisma.receipt.findUniqueOrThrow({
      where: { lotId: lot.id },
    });

    const response = await s.http().get(`/receipts/${publicToken}`).expect(200);

    expect(response.body).toMatchObject({
      lotId: lot.id,
      lotNumber: lot.number,
      amountCents: 120_000,
      winnerPseudonym,
      bidCount: 2,
    });
    expect(JSON.stringify(response.body)).not.toContain(bia.user.email);
    expect(JSON.stringify(response.body)).not.toContain(bia.user.name);
    await s.http().get('/receipts/not-a-token').expect(404);
  });

  it('is idempotent: repeated and concurrent runs charge exactly once', async () => {
    const lot = await contestedLot();
    clock.advance(61 * MINUTE);

    await Promise.all([
      settlement.settleDue(),
      settlement.settleDue(),
      settlement.settleIfDue(lot.id),
      s.http().get(`/lots/${lot.id}`).expect(200),
    ]);
    expect(await settlement.settleDue()).toBe(0);

    expect(await prisma.receipt.count()).toBe(1);
    expect(await walletOf(bia)).toMatchObject({ totalCents: 380_000n });
    expect(await walletOf(auctioneer)).toMatchObject({ totalCents: 120_000n });
    expect(await prisma.walletLedger.count({ where: { type: LedgerEntryType.DEBIT } })).toBe(1);
  });

  it('closes a lot without bids with no winner, no receipt and no money moved', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    clock.advance(61 * MINUTE);

    expect(await settlement.settleDue()).toBe(1);

    const stored = await prisma.lot.findUniqueOrThrow({ where: { id: lot.id } });
    expect(stored).toMatchObject({ status: 'SETTLED', leaderId: null });
    expect(await prisma.receipt.count()).toBe(0);
    expect(await walletOf(auctioneer)).toMatchObject({ totalCents: 0n });
  });

  it('waits for the real end, including an anti-sniping extension', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1', {
      endsAt: new Date(clock.now().getTime() + 10 * MINUTE).toISOString(),
    });
    clock.advance(9 * MINUTE);
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);

    clock.advance(90_000);
    expect(await settlement.settleDue()).toBe(0);

    clock.advance(31_000);
    expect(await settlement.settleDue()).toBe(1);
  });

  it('settles on demand when an ended lot is read', async () => {
    const lot = await contestedLot();
    clock.advance(61 * MINUTE);

    const response = await s.http().get(`/lots/${lot.id}`).expect(200);

    expect(response.body.phase).toBe('ENDED');
    expect(await prisma.receipt.count({ where: { lotId: lot.id } })).toBe(1);
  });

  it('refuses to charge anyone when the leader was swapped in the database', async () => {
    const lot = await contestedLot();
    await prisma.lot.update({ where: { id: lot.id }, data: { leaderId: ana.user.id } });
    clock.advance(61 * MINUTE);

    expect(await settlement.settleDue()).toBe(0);

    expect(await prisma.lot.findUniqueOrThrow({ where: { id: lot.id } })).toMatchObject({
      status: 'ACTIVE',
    });
    expect(await prisma.receipt.count()).toBe(0);
    expect(await walletOf(ana)).toMatchObject({ totalCents: 500_000n });
  });

  it("gives the auctioneer each lot's result and the total received", async () => {
    await contestedLot('1');
    await s.createLot(auctioneer.accessToken, '2');
    await s.createLot(auctioneer.accessToken, '3', {
      endsAt: new Date(clock.now().getTime() + 120 * MINUTE).toISOString(),
    });
    clock.advance(61 * MINUTE);

    const response = await s
      .http()
      .get('/lots/mine')
      .set('Authorization', `Bearer ${auctioneer.accessToken}`)
      .expect(200);

    const results = response.body.lots.map((lot: { result: string | null }) => lot.result);
    expect(results.sort()).toEqual([null, 'SOLD', 'UNSOLD'].sort());
    expect(response.body.totalReceivedCents).toBe(120_000);
  });

  it('shows each bidder their lots, results and, for the winner, the receipt', async () => {
    const lot = await contestedLot();
    const asBidder = (user: AuthResponse, path: string) =>
      s.http().get(path).set('Authorization', `Bearer ${user.accessToken}`).expect(200);

    expect((await asBidder(ana, '/me/bids')).body[0]).toMatchObject({
      result: 'OUTBID',
      myHighestBidCents: 100_000,
    });

    clock.advance(61 * MINUTE);
    const won = (await asBidder(bia, '/me/bids')).body[0];
    const lost = (await asBidder(ana, '/me/bids')).body[0];

    expect(won).toMatchObject({ result: 'WON', myHighestBidCents: 120_000 });
    expect(won.receiptToken).toEqual(expect.any(String));
    expect(lost).toMatchObject({ result: 'LOST', receiptToken: null });
    expect((await asBidder(bia, `/lots/${lot.id}/bids/me`)).body.receiptToken).toBe(
      won.receiptToken,
    );
  });
});
