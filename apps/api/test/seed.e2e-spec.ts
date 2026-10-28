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

  it('leaves balances consistent with every bid, win and sale', async () => {
    // Ana won Paris Street (R$ 2.500) and The Child's Bath (R$ 1.700), and leads Water
    // Lilies (R$ 1.500) and The Great Wave (R$ 4.500).
    expect(await wallet('ana@pregao.dev')).toMatchObject({
      totalCents: 4_580_000n,
      committedCents: 600_000n,
    });
    expect(await wallet('bruno@pregao.dev')).toMatchObject({
      totalCents: 4_790_000n,
      committedCents: 300_000n,
    });
    expect(await wallet('leiloeiro@pregao.dev')).toMatchObject({ totalCents: 630_000n });
    // The Millinery Shop closed without bids: settled, but no receipt.
    expect(await prisma.receipt.count()).toBe(3);
  });

  it('keeps genuine lots verifiable and the tampered one broken at bid 2', async () => {
    expect(await audit(lots.live)).toEqual({ ok: true, verifiedBids: 3 });
    expect(await audit(lots.sold)).toEqual({ ok: true, verifiedBids: 3 });
    expect(await audit(lots.tampered)).toMatchObject({
      ok: false,
      failure: AuditFailure.BID_ALTERED,
      at: 2,
    });
  });
});
