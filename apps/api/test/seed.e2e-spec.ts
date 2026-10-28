import type { INestApplication } from '@nestjs/common';
import * as ed from '@noble/ed25519';
import {
  DEMO_ACCOUNTS,
  type AuditCrypto,
  AuditFailure,
  type AuditTrail,
  LotPhase,
  verifyAuditTrail,
} from '@pregao/shared';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { Clock } from '../src/common/time/clock.js';
import { FixtureCatalogProvider } from '../src/modules/catalog/fixture-catalog.provider.js';
import { type DemoLots, DemoSeed } from '../src/seed/demo-seed.js';
import { createTestApp, resetDatabase } from './test-app.js';

const nodeCrypto: AuditCrypto = {
  sha256Hex: async (message) => createHash('sha256').update(message, 'utf8').digest('hex'),
  verify: (signature, message, publicKey) =>
    ed.verifyAsync(
      Buffer.from(signature, 'hex'),
      Buffer.from(message),
      Buffer.from(publicKey, 'hex'),
    ),
};

describe('Demo seed (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let lots: DemoLots;
  const http = () => request(app.getHttpServer());

  const audit = async (lotId: string) =>
    verifyAuditTrail(
      (await http().get(`/audit/${lotId}`).expect(200)).body as AuditTrail,
      nodeCrypto,
    );
  const wallet = (email: string) => prisma.wallet.findFirstOrThrow({ where: { user: { email } } });

  beforeAll(async () => {
    app = await createTestApp({
      clock: new Clock(),
      catalog: new FixtureCatalogProvider(resolve(process.cwd(), 'prisma/seed-assets')),
    });
    prisma = app.get(PrismaService);
    await resetDatabase(app);
    lots = await new DemoSeed(app).run();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates the three demo accounts, which can sign in', async () => {
    for (const { email } of Object.values(DEMO_ACCOUNTS)) {
      await http().post('/auth/login').send({ email, password: 'pregao123' }).expect(200);
    }
  });

  it('puts each lot in the phase the walkthrough expects', async () => {
    const phaseOf = async (id: string) => (await http().get(`/lots/${id}`).expect(200)).body.phase;
    expect(await phaseOf(lots.live)).toBe(LotPhase.LIVE);
    expect(await phaseOf(lots.endingSoon)).toBe(LotPhase.LIVE);
    expect(await phaseOf(lots.scheduled)).toBe(LotPhase.SCHEDULED);
    expect(await phaseOf(lots.sold)).toBe(LotPhase.ENDED);

    const live = await http().get(`/lots/${lots.live}`).expect(200);
    expect(new Date(live.body.endsAt).getTime() - Date.now()).toBeGreaterThan(29 * 86_400_000);
  });

  it('fills the upcoming tab with two sessions every weekday', async () => {
    const upcoming = await http().get('/lots').query({ phase: LotPhase.SCHEDULED }).expect(200);
    // The Bedroom, the El Greco and fourteen weekday sessions.
    expect(upcoming.body.total).toBe(16);
  });

  it('leaves balances consistent with every bid, win and sale', async () => {
    // Ana won Paris Street (R$ 2.500), The Child's Bath (R$ 1.700) and At the Moulin Rouge
    // (R$ 1.900), and leads Water Lilies (R$ 1.500) and The Great Wave (R$ 4.500).
    expect(await wallet('ana@pregao.dev')).toMatchObject({
      totalCents: 4_390_000n,
      committedCents: 600_000n,
    });
    // Bruno won the tampered lot (R$ 2.100) and Stacks of Wheat (R$ 3.400).
    expect(await wallet('bruno@pregao.dev')).toMatchObject({
      totalCents: 4_450_000n,
      committedCents: 300_000n,
    });
    expect(await wallet('leiloeiro@pregao.dev')).toMatchObject({ totalCents: 1_160_000n });
    // The Millinery Shop closed without bids: settled, but no receipt.
    expect(await prisma.receipt.count()).toBe(5);
  });

  it('keeps genuine lots verifiable and points each tampered one at what was changed', async () => {
    expect(await audit(lots.live)).toEqual({ ok: true, verifiedBids: 3 });
    expect(await audit(lots.sold)).toEqual({ ok: true, verifiedBids: 3 });
    expect(await audit(lots.tampered)).toMatchObject({
      ok: false,
      failure: AuditFailure.BID_ALTERED,
      at: 2,
    });
    expect(await audit(lots.bidRemoved)).toMatchObject({
      ok: false,
      failure: AuditFailure.BID_MISSING,
      at: 2,
    });
    expect(await audit(lots.receiptForged)).toMatchObject({
      ok: false,
      failure: AuditFailure.RECEIPT_MISMATCH,
      at: 'receipt',
    });
  });
});
