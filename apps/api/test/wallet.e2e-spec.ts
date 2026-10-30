import type { INestApplication } from '@nestjs/common';
import { ErrorCode, LedgerEntryType, MAX_BALANCE_CENTS, Role } from '@pregao/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  const clock = new FakeClock();
  let s: ReturnType<typeof scenario>;

  beforeAll(async () => {
    app = await createTestApp({
      clock,
      catalog: new FakeCatalogProvider([catalogItem({ externalId: '1' })]),
    });
    s = scenario(app, clock);
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts empty and adds simulated deposits to the total', async () => {
    const { accessToken } = await registerUser(app, Role.BIDDER);
    expect(await s.wallet(accessToken)).toEqual({
      totalCents: 0,
      committedCents: 0,
      availableCents: 0,
    });

    await s.deposit(accessToken, 500_000);
    const summary = await s.deposit(accessToken, 250_050);

    expect(summary).toEqual({ totalCents: 750_050, committedCents: 0, availableCents: 750_050 });
  });

  it('rejects invalid deposit amounts', async () => {
    const { accessToken } = await registerUser(app, Role.BIDDER);
    for (const amountCents of [0, 99, 10.5, 100_000_001]) {
      const response = await s
        .http()
        .post('/wallet/deposits')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amountCents })
        .expect(400);
      expect(response.body.code).toBe(ErrorCode.VALIDATION_FAILED);
    }
  });

  it('refuses a deposit that would take the total past the balance limit', async () => {
    const { accessToken, user } = await registerUser(app, Role.BIDDER);
    await app.get(PrismaService).wallet.update({
      where: { userId: user.id },
      data: { totalCents: BigInt(MAX_BALANCE_CENTS) - 50_000n },
    });

    const response = await s
      .http()
      .post('/wallet/deposits')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amountCents: 50_100 })
      .expect(422);

    expect(response.body).toMatchObject({
      code: ErrorCode.BALANCE_LIMIT_REACHED,
      details: { maxDepositCents: 50_000 },
    });
    expect((await s.deposit(accessToken, 50_000)).totalCents).toBe(MAX_BALANCE_CENTS);
  });

  it('does not let auctioneers deposit', async () => {
    const { accessToken } = await registerUser(app, Role.AUCTIONEER);
    await s
      .http()
      .post('/wallet/deposits')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amountCents: 100_000 })
      .expect(403);
  });

  it('records every movement in the ledger, newest first, with the lot it refers to', async () => {
    const auctioneer = await registerUser(app, Role.AUCTIONEER);
    const ana = await registerUser(app, Role.BIDDER);
    const bia = await registerUser(app, Role.BIDDER);
    const lot = await s.createLot(auctioneer.accessToken, '1');
    await s.deposit(ana.accessToken, 500_000);
    await s.deposit(bia.accessToken, 500_000);
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    await s.acceptedBid(bia.accessToken, lot.id, 105_000);

    const ledger = await s
      .http()
      .get('/wallet/ledger')
      .set('Authorization', `Bearer ${ana.accessToken}`)
      .expect(200);

    expect(ledger.body.entries.map((entry: { type: string }) => entry.type)).toEqual([
      LedgerEntryType.RELEASE,
      LedgerEntryType.HOLD,
      LedgerEntryType.DEPOSIT,
    ]);
    expect(ledger.body.entries[0]).toMatchObject({
      amountCents: 100_000,
      totalAfterCents: 500_000,
      committedAfterCents: 0,
      lotNumber: lot.number,
      lotTitle: lot.title,
    });
    expect(ledger.body.nextCursor).toBeNull();
  });
});
