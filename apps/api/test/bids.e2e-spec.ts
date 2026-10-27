import type { INestApplication } from '@nestjs/common';
import { type AuthResponse, ErrorCode, LedgerEntryType, Role } from '@pregao/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

const MINUTE = 60_000;
const artworks = Array.from({ length: 10 }, (_, i) => catalogItem({ externalId: String(i + 1) }));

describe('Bids (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clock: FakeClock;
  let s: ReturnType<typeof scenario>;
  let auctioneer: AuthResponse;

  const bidder = async (depositCents = 1_000_000) => {
    const user = await registerUser(app, Role.BIDDER);
    if (depositCents > 0) await s.deposit(user.accessToken, depositCents);
    return user;
  };
  const errorOf = async (pending: ReturnType<typeof s.bid>) => (await pending).body;

  beforeAll(async () => {
    clock = new FakeClock();
    app = await createTestApp({ clock, catalog: new FakeCatalogProvider(artworks) });
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

  describe('accepted bids', () => {
    it('holds the amount, makes the bidder the leader and raises the minimum', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder(500_000);

      const result = await s.acceptedBid(ana.accessToken, lot.id, 100_000);

      expect(result.bid).toMatchObject({ seq: 1, amountCents: 100_000 });
      expect(result.bid.bidderPseudonym).toMatch(/^Licitante #[0-9A-F]{6}$/);
      expect(result.lot).toMatchObject({
        currentBidCents: 100_000,
        minNextBidCents: 105_000,
        bidCount: 1,
      });
      expect(result.extended).toBe(false);
      expect(await s.wallet(ana.accessToken)).toEqual({
        totalCents: 500_000,
        committedCents: 100_000,
        availableCents: 400_000,
      });
    });

    it("releases the previous leader's committed balance in the same transaction", async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder();
      const bia = await bidder();
      await s.acceptedBid(ana.accessToken, lot.id, 100_000);

      await s.acceptedBid(bia.accessToken, lot.id, 120_000);

      expect((await s.wallet(ana.accessToken)).committedCents).toBe(0);
      expect((await s.wallet(bia.accessToken)).committedCents).toBe(120_000);
    });

    it('lets a bidder lead several lots at once, committing each amount', async () => {
      const lots = await Promise.all(
        ['1', '2', '3'].map((id) => s.createLot(auctioneer.accessToken, id)),
      );
      const ana = await bidder(300_000);
      const bia = await bidder();

      await s.acceptedBid(ana.accessToken, lots[0]!.id, 100_000);
      await s.acceptedBid(ana.accessToken, lots[1]!.id, 150_000);
      expect(await s.wallet(ana.accessToken)).toMatchObject({
        committedCents: 250_000,
        availableCents: 50_000,
      });

      const refused = await errorOf(s.bid(ana.accessToken, lots[2]!.id, 100_000));
      expect(refused.code).toBe(ErrorCode.INSUFFICIENT_FUNDS);

      await s.acceptedBid(bia.accessToken, lots[0]!.id, 105_000);
      expect(await s.wallet(ana.accessToken)).toMatchObject({
        committedCents: 150_000,
        availableCents: 150_000,
      });
      await s.acceptedBid(ana.accessToken, lots[2]!.id, 100_000);
    });

    it('keeps each bidder on one paddle number per lot', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder();
      const bia = await bidder();
      const first = await s.acceptedBid(ana.accessToken, lot.id, 100_000);
      await s.acceptedBid(bia.accessToken, lot.id, 105_000);
      const third = await s.acceptedBid(ana.accessToken, lot.id, 110_000);

      expect(third.bid.bidderPseudonym).toBe(first.bid.bidderPseudonym);
      const history = await s.http().get(`/lots/${lot.id}/bids`).expect(200);
      expect(history.body.map((bid: { seq: number }) => bid.seq)).toEqual([3, 2, 1]);
      expect(JSON.stringify(history.body)).not.toContain(ana.user.email);
    });
  });

  describe('refusals carry a code and the minimum next bid', () => {
    it('AUCTIONEER_CANNOT_BID', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const body = await errorOf(s.bid(auctioneer.accessToken, lot.id, 100_000).expect(403));
      expect(body).toMatchObject({
        code: ErrorCode.AUCTIONEER_CANNOT_BID,
        minNextBidCents: 100_000,
      });
    });

    it('NOT_STARTED', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1', {
        startsAt: new Date(clock.now().getTime() + 30 * MINUTE).toISOString(),
      });
      const ana = await bidder();
      const body = await errorOf(s.bid(ana.accessToken, lot.id, 100_000).expect(409));
      expect(body).toMatchObject({ code: ErrorCode.NOT_STARTED, minNextBidCents: 100_000 });
    });

    it('LOT_ENDED', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder();
      clock.advance(60 * MINUTE);
      const body = await errorOf(s.bid(ana.accessToken, lot.id, 100_000).expect(409));
      expect(body.code).toBe(ErrorCode.LOT_ENDED);
    });

    it('ALREADY_WINNING', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder();
      await s.acceptedBid(ana.accessToken, lot.id, 100_000);
      const body = await errorOf(s.bid(ana.accessToken, lot.id, 200_000).expect(409));
      expect(body).toMatchObject({ code: ErrorCode.ALREADY_WINNING, minNextBidCents: 105_000 });
    });

    it('BELOW_MINIMUM on the first bid and after one', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder();
      const bia = await bidder();
      const first = await errorOf(s.bid(ana.accessToken, lot.id, 99_999).expect(422));
      expect(first).toMatchObject({ code: ErrorCode.BELOW_MINIMUM, minNextBidCents: 100_000 });

      await s.acceptedBid(ana.accessToken, lot.id, 100_000);
      const second = await errorOf(s.bid(bia.accessToken, lot.id, 104_999).expect(422));
      expect(second).toMatchObject({ code: ErrorCode.BELOW_MINIMUM, minNextBidCents: 105_000 });
    });

    it('INSUFFICIENT_FUNDS', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder(99_999);
      const body = await errorOf(s.bid(ana.accessToken, lot.id, 100_000).expect(422));
      expect(body).toMatchObject({ code: ErrorCode.INSUFFICIENT_FUNDS, minNextBidCents: 100_000 });
    });

    it('a refused bid changes nothing', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const ana = await bidder(500_000);
      await errorOf(s.bid(ana.accessToken, lot.id, 50_000).expect(422));

      expect(await s.wallet(ana.accessToken)).toMatchObject({ committedCents: 0 });
      expect(await prisma.bid.count()).toBe(0);
      expect(await prisma.walletLedger.count({ where: { type: LedgerEntryType.HOLD } })).toBe(0);
    });
  });

  describe('anti-sniping', () => {
    it('extends the end to now + 2 minutes when a bid lands in the last 2 minutes', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1', {
        endsAt: new Date(clock.now().getTime() + 10 * MINUTE).toISOString(),
      });
      const ana = await bidder();
      clock.advance(9 * MINUTE);

      const result = await s.acceptedBid(ana.accessToken, lot.id, 100_000);

      expect(result.extended).toBe(true);
      expect(result.lot.endsAt).toBe(new Date(clock.now().getTime() + 2 * MINUTE).toISOString());
    });

    it('keeps extending while bids keep arriving at the end', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1', {
        endsAt: new Date(clock.now().getTime() + 10 * MINUTE).toISOString(),
      });
      const ana = await bidder();
      const bia = await bidder();
      clock.advance(9 * MINUTE + 30_000);
      await s.acceptedBid(ana.accessToken, lot.id, 100_000);
      clock.advance(110_000);

      const result = await s.acceptedBid(bia.accessToken, lot.id, 105_000);

      expect(result.lot.endsAt).toBe(new Date(clock.now().getTime() + 2 * MINUTE).toISOString());
      const stored = await prisma.lot.findUniqueOrThrow({ where: { id: lot.id } });
      expect(stored.originalEndsAt.toISOString()).toBe(lot.endsAt);
    });

    it('does not extend when more than 2 minutes are left', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1', {
        endsAt: new Date(clock.now().getTime() + 10 * MINUTE).toISOString(),
      });
      const ana = await bidder();
      clock.advance(7 * MINUTE);

      const result = await s.acceptedBid(ana.accessToken, lot.id, 100_000);

      expect(result.extended).toBe(false);
      expect(result.lot.endsAt).toBe(lot.endsAt);
    });
  });

  describe('concurrency (real Postgres locks)', () => {
    it('20 simultaneous bids from different bidders leave one consistent leader', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1', {
        startingPriceCents: 10_000,
        minIncrementCents: 100,
      });
      const bidders = await Promise.all(Array.from({ length: 20 }, () => bidder(1_000_000)));
      const amounts = bidders.map((_, i) => 10_000 + i * 500).sort(() => Math.random() - 0.5);

      const responses = await Promise.all(
        bidders.map((user, i) => s.bid(user.accessToken, lot.id, amounts[i]!)),
      );

      const statuses = responses.map((response) => response.status);
      expect(statuses.every((status) => status === 201 || status === 422)).toBe(true);
      const accepted = statuses.filter((status) => status === 201).length;
      expect(accepted).toBeGreaterThan(0);

      const stored = await prisma.lot.findUniqueOrThrow({ where: { id: lot.id } });
      const bids = await prisma.bid.findMany({ where: { lotId: lot.id }, orderBy: { seq: 'asc' } });
      expect(bids.map((bid) => bid.seq)).toEqual(Array.from({ length: accepted }, (_, i) => i + 1));
      bids
        .slice(1)
        .forEach((bid, i) => expect(bid.amountCents).toBeGreaterThan(bids[i]!.amountCents));
      bids.forEach((bid, i) =>
        expect(bid.prevHash).toBe(i === 0 ? stored.genesisHash : bids[i - 1]!.hash),
      );

      const last = bids.at(-1)!;
      expect(stored).toMatchObject({
        bidCount: accepted,
        leaderId: last.bidderId,
        lastHash: last.hash,
      });
      expect(stored.currentBidCents).toBe(last.amountCents);

      const wallets = await prisma.wallet.findMany({
        where: { userId: { in: bidders.map(({ user }) => user.id) } },
        include: { entries: true },
      });
      for (const wallet of wallets) {
        const isLeader = wallet.userId === stored.leaderId;
        expect(wallet.totalCents).toBe(1_000_000n);
        expect(wallet.committedCents).toBe(isLeader ? stored.currentBidCents : 0n);
        const signed = wallet.entries.reduce((sum, entry) => {
          if (entry.type === LedgerEntryType.HOLD) return sum + entry.amountCents;
          if (entry.type === LedgerEntryType.RELEASE) return sum - entry.amountCents;
          return sum;
        }, 0n);
        expect(signed).toBe(wallet.committedCents);
      }
    });

    it('20 simultaneous bids at the same minimum: exactly one wins, the rest get BELOW_MINIMUM', async () => {
      const lot = await s.createLot(auctioneer.accessToken, '1');
      const bidders = await Promise.all(Array.from({ length: 20 }, () => bidder()));

      const responses = await Promise.all(
        bidders.map((user) => s.bid(user.accessToken, lot.id, 100_000)),
      );

      expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
      const refused = responses.filter((response) => response.status !== 201);
      expect(refused.every((response) => response.body.code === ErrorCode.BELOW_MINIMUM)).toBe(
        true,
      );
      const committed = await prisma.wallet.aggregate({ _sum: { committedCents: true } });
      expect(committed._sum.committedCents).toBe(100_000n);
    });

    it('crossed bids between two lots and two bidders never deadlock', async () => {
      const [lotA, lotB] = await Promise.all(
        ['1', '2'].map((id) => s.createLot(auctioneer.accessToken, id)),
      );
      const ana = await bidder(10_000_000);
      const bia = await bidder(10_000_000);
      await s.acceptedBid(ana.accessToken, lotA!.id, 100_000);
      await s.acceptedBid(bia.accessToken, lotB!.id, 100_000);

      for (let round = 1; round <= 5; round++) {
        const amount = 100_000 + round * 10_000;
        // Each bid locks both wallets (bidder + previous leader): opposite lots, same pair.
        const [onA, onB] = await Promise.all([
          s.bid(bia.accessToken, lotA!.id, amount),
          s.bid(ana.accessToken, lotB!.id, amount),
        ]);
        expect([onA.status, onB.status]).toEqual([201, 201]);
        await s.acceptedBid(ana.accessToken, lotA!.id, amount + 5_000);
        await s.acceptedBid(bia.accessToken, lotB!.id, amount + 5_000);
      }
    });
  });
});
