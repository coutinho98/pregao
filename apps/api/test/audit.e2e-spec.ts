import type { INestApplication } from '@nestjs/common';
import * as ed from '@noble/ed25519';
import {
  type AuditCrypto,
  AuditFailure,
  type AuditResult,
  type AuditTrail,
  type AuthResponse,
  bidMessage,
  type LotDetail,
  Role,
  verifyAuditTrail,
} from '@pregao/shared';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { SettlementService } from '../src/modules/settlement/settlement.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

const sha256Hex = (message: string) => createHash('sha256').update(message, 'utf8').digest('hex');

/** The same verification the audit page runs in the browser, with Node's crypto. */
const nodeCrypto: AuditCrypto = {
  sha256Hex: async (message) => sha256Hex(message),
  verify: (signature, message, publicKey) =>
    ed.verifyAsync(
      Buffer.from(signature, 'hex'),
      Buffer.from(message),
      Buffer.from(publicKey, 'hex'),
    ),
};

describe('Audit trail (e2e, tampering the real database)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clock: FakeClock;
  let s: ReturnType<typeof scenario>;
  let lot: LotDetail;
  let bidders: AuthResponse[];

  const trail = async (): Promise<AuditTrail> =>
    (await s.http().get(`/audit/${lot.id}`).expect(200)).body as AuditTrail;
  const audit = async (): Promise<AuditResult> => verifyAuditTrail(await trail(), nodeCrypto);
  const bidRow = (seq: number) =>
    prisma.bid.findUniqueOrThrow({ where: { lotId_seq: { lotId: lot.id, seq } } });
  /** Deleting a bid as an attacker would: first unhook the ledger lines pointing at it. */
  const deleteBid = async (seq: number) => {
    const bid = await bidRow(seq);
    await prisma.walletLedger.updateMany({ where: { bidId: bid.id }, data: { bidId: null } });
    await prisma.bid.delete({ where: { id: bid.id } });
  };

  beforeAll(async () => {
    clock = new FakeClock();
    app = await createTestApp({
      clock,
      catalog: new FakeCatalogProvider([catalogItem({ externalId: '1' })]),
    });
    prisma = app.get(PrismaService);
    s = scenario(app, clock);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    const auctioneer = await registerUser(app, Role.AUCTIONEER);
    bidders = await Promise.all([0, 1].map(() => registerUser(app, Role.BIDDER)));
    for (const bidder of bidders) await s.deposit(bidder.accessToken, 1_000_000);
    lot = await s.createLot(auctioneer.accessToken, '1');
    for (const [index, amount] of [100_000, 105_000, 110_000].entries()) {
      await s.acceptedBid(bidders[index % 2]!.accessToken, lot.id, amount);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('verifies an untouched history and never exposes who the bidders are', async () => {
    const body = await trail();

    expect(await verifyAuditTrail(body, nodeCrypto)).toEqual({ ok: true, verifiedBids: 3 });
    const json = JSON.stringify(body);
    for (const { user } of bidders) {
      expect(json).not.toContain(user.id);
      expect(json).not.toContain(user.email);
      expect(json).not.toContain(user.name);
    }
  });

  it('UPDATE of a bid amount is caught at that bid', async () => {
    await prisma.bid.update({
      where: { lotId_seq: { lotId: lot.id, seq: 2 } },
      data: { amountCents: 999_000n },
    });
    expect(await audit()).toMatchObject({ ok: false, failure: AuditFailure.BID_ALTERED, at: 2 });
  });

  it('DELETE of a bid in the middle is caught where the sequence jumps', async () => {
    await deleteBid(2);
    expect(await audit()).toMatchObject({ ok: false, failure: AuditFailure.BID_MISSING, at: 2 });
  });

  it('DELETE of the last bid is caught by the signed head, even with the head fields fixed', async () => {
    await deleteBid(3);
    expect(await audit()).toMatchObject({ failure: AuditFailure.HEAD_MISMATCH });

    const second = await bidRow(2);
    await prisma.lot.update({
      where: { id: lot.id },
      data: { bidCount: 2, lastHash: second.hash, currentBidCents: second.amountCents },
    });
    expect(await audit()).toMatchObject({ failure: AuditFailure.HEAD_MISMATCH, at: 'head' });
  });

  it('INSERT of a forged bid in the middle is caught at the forged bid', async () => {
    const third = await bidRow(3);
    await prisma.bid.update({ where: { id: third.id }, data: { seq: 4 } });
    const second = await bidRow(2);
    await prisma.bid.update({ where: { id: second.id }, data: { seq: 3 } });
    const first = await bidRow(1);
    const forged = {
      prevHash: first.hash,
      lotId: lot.id,
      seq: 2,
      bidderPseudonym: first.bidderPseudonym,
      amountCents: 102_000,
      createdAt: new Date(first.createdAt.getTime() + 1_000),
    };
    await prisma.bid.create({
      data: {
        ...forged,
        id: randomUUID(),
        bidderId: first.bidderId,
        amountCents: BigInt(forged.amountCents),
        hash: sha256Hex(bidMessage(forged)),
        signature: randomBytes(64).toString('hex'),
      },
    });

    expect(await audit()).toMatchObject({ failure: AuditFailure.BAD_SIGNATURE, at: 2 });
  });

  it('a chain recomputed without the private key is caught by the signatures', async () => {
    const [first, second, third] = await Promise.all([bidRow(1), bidRow(2), bidRow(3)]);
    const rehash = (bid: typeof second, prevHash: string, amountCents: number) =>
      sha256Hex(
        bidMessage({
          prevHash,
          lotId: lot.id,
          seq: bid.seq,
          bidderPseudonym: bid.bidderPseudonym,
          amountCents,
          createdAt: bid.createdAt,
        }),
      );
    const secondHash = rehash(second, first.hash, 500_000);
    const thirdHash = rehash(third, secondHash, Number(third.amountCents));
    await prisma.bid.update({
      where: { id: second.id },
      data: { amountCents: 500_000n, hash: secondHash },
    });
    await prisma.bid.update({
      where: { id: third.id },
      data: { prevHash: secondHash, hash: thirdHash },
    });
    await prisma.lot.update({ where: { id: lot.id }, data: { lastHash: thirdHash } });

    expect(await audit()).toMatchObject({ failure: AuditFailure.BAD_SIGNATURE, at: 2 });
  });

  it('changing the lot terms is caught at the genesis', async () => {
    await prisma.lot.update({ where: { id: lot.id }, data: { startingPriceCents: 1n } });
    expect(await audit()).toMatchObject({ failure: AuditFailure.GENESIS_ALTERED, at: 'genesis' });
  });

  it('changing the receipt is caught against the last bid', async () => {
    clock.advance(61 * 60_000);
    await app.get(SettlementService).settleDue();
    expect(await audit()).toEqual({ ok: true, verifiedBids: 3 });

    await prisma.receipt.update({ where: { lotId: lot.id }, data: { amountCents: 1n } });
    expect(await audit()).toMatchObject({ failure: AuditFailure.RECEIPT_MISMATCH, at: 'receipt' });
  });
});
