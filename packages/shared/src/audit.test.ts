import * as ed from '@noble/ed25519';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { type AuditCrypto, AuditFailure, type AuditTrail, verifyAuditTrail } from './audit';
import { bidMessage, genesisMessage, headMessage } from './audit-chain';
import { LotPhase } from './lot-phase';

const secretKey = new Uint8Array(32).fill(7);
const utf8 = (text: string) => new TextEncoder().encode(text);
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));

const nodeCrypto: AuditCrypto = {
  sha256Hex: async (message) => createHash('sha256').update(message, 'utf8').digest('hex'),
  verify: (signature, message, publicKey) =>
    ed.verifyAsync(fromHex(signature), utf8(message), fromHex(publicKey)),
};
const sign = async (message: string) => toHex(await ed.signAsync(utf8(message), secretKey));

/** A lot with `amounts.length` bids, chained and signed like the API does. */
async function signedTrail(amounts: number[]): Promise<AuditTrail> {
  const lotId = 'lot-1';
  const genesis = {
    itemId: '16568',
    startingPriceCents: 100_000,
    minIncrementCents: 5_000,
    startsAt: '2026-10-28T20:00:00.000Z',
  };
  const genesisHash = await nodeCrypto.sha256Hex(
    genesisMessage({ lotId, ...genesis, startsAt: new Date(genesis.startsAt) }),
  );
  const bids = [];
  let prevHash = genesisHash;
  for (const [index, amountCents] of amounts.entries()) {
    const fields = {
      prevHash,
      lotId,
      seq: index + 1,
      bidderPseudonym: `Licitante #00000${index % 2}`,
      amountCents,
      createdAt: new Date(Date.UTC(2026, 9, 28, 20, index + 1)),
    };
    const hash = await nodeCrypto.sha256Hex(bidMessage(fields));
    bids.push({
      ...fields,
      createdAt: fields.createdAt.toISOString(),
      hash,
      signature: await sign(hash),
    });
    prevHash = hash;
  }
  return {
    lotId,
    lotNumber: 1,
    title: 'Water Lilies',
    phase: LotPhase.LIVE,
    genesis: { ...genesis, hash: genesisHash },
    bids,
    head: {
      bidCount: bids.length,
      lastHash: prevHash,
      signature: await sign(headMessage({ lotId, bidCount: bids.length, lastHash: prevHash })),
    },
    receipt: null,
    publicKey: toHex(await ed.getPublicKeyAsync(secretKey)),
  };
}

const verify = (trail: AuditTrail) => verifyAuditTrail(trail, nodeCrypto);

describe('verifyAuditTrail', () => {
  it('accepts an untouched history', async () => {
    expect(await verify(await signedTrail([100_000, 105_000, 110_000]))).toEqual({
      ok: true,
      verifiedBids: 3,
    });
  });

  it('accepts a lot without bids', async () => {
    expect(await verify(await signedTrail([]))).toMatchObject({ ok: true, verifiedBids: 0 });
  });

  it('detects a changed bid amount at that bid', async () => {
    const trail = await signedTrail([100_000, 105_000, 110_000]);
    trail.bids[1]!.amountCents = 999_000;
    expect(await verify(trail)).toMatchObject({ failure: AuditFailure.BID_ALTERED, at: 2 });
  });

  it('detects a bid removed from the middle', async () => {
    const trail = await signedTrail([100_000, 105_000, 110_000]);
    trail.bids.splice(1, 1);
    expect(await verify(trail)).toMatchObject({ failure: AuditFailure.BID_MISSING, at: 2 });
  });

  it('detects the last bid removed together with the head fields', async () => {
    const trail = await signedTrail([100_000, 105_000, 110_000]);
    trail.bids.pop();
    trail.head = { ...trail.head, bidCount: 2, lastHash: trail.bids[1]!.hash };
    expect(await verify(trail)).toMatchObject({ failure: AuditFailure.HEAD_MISMATCH, at: 'head' });
  });

  it('detects a chain recomputed without the private key', async () => {
    const trail = await signedTrail([100_000, 105_000]);
    const forged = { ...trail.bids[1]!, amountCents: 500_000 };
    forged.hash = await nodeCrypto.sha256Hex(
      bidMessage({ ...forged, lotId: trail.lotId, createdAt: new Date(forged.createdAt) }),
    );
    trail.bids[1] = forged;
    trail.head.lastHash = forged.hash;
    expect(await verify(trail)).toMatchObject({ failure: AuditFailure.BAD_SIGNATURE, at: 2 });
  });

  it('detects altered lot terms in the genesis', async () => {
    const trail = await signedTrail([100_000]);
    trail.genesis.startingPriceCents = 1;
    expect(await verify(trail)).toMatchObject({
      failure: AuditFailure.GENESIS_ALTERED,
      at: 'genesis',
    });
  });

  it('detects a receipt that does not match the last bid', async () => {
    const trail = await signedTrail([100_000, 105_000]);
    trail.receipt = { finalHash: trail.head.lastHash, amountCents: 1 };
    expect(await verify(trail)).toMatchObject({ failure: AuditFailure.RECEIPT_MISMATCH });
  });
});
