import { AuditFailure, type AuditTrail, LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { chainLinks } from './chain-links';

const bid = (seq: number) => ({
  seq,
  bidderPseudonym: 'Licitante #A3F9C2',
  amountCents: 100_000 + seq,
  createdAt: '2026-10-28T20:00:00.000Z',
  prevHash: `h${seq - 1}`,
  hash: `h${seq}`,
  signature: 's',
});

const trail: AuditTrail = {
  lotId: 'lot',
  lotNumber: 1,
  title: 'Obra',
  phase: LotPhase.ENDED,
  genesis: {
    itemId: '1',
    startingPriceCents: 100_000,
    minIncrementCents: 1_000,
    startsAt: '2026-10-28T19:00:00.000Z',
    hash: 'h0',
  },
  bids: [bid(1), bid(2), bid(3)],
  head: { bidCount: 3, lastHash: 'h3', signature: 's' },
  receipt: { finalHash: 'h3', amountCents: 100_003 },
  publicKey: 'k',
};

const statuses = (result: Parameters<typeof chainLinks>[1]) =>
  chainLinks(trail, result).map((link) => link.status);

describe('chainLinks', () => {
  it('marks every link verified when the chain is intact', () => {
    expect(statuses({ ok: true, verifiedBids: 3 })).toEqual(Array(6).fill('ok'));
  });

  it('breaks the failing bid and leaves the following links unchecked', () => {
    const result = {
      ok: false as const,
      failure: AuditFailure.BID_ALTERED,
      at: 2,
      message: '',
      verifiedBids: 1,
    };
    expect(statuses(result)).toEqual(['ok', 'ok', 'broken', 'unchecked', 'unchecked', 'unchecked']);
  });

  it('can break the head or the receipt after all bids check out', () => {
    const head = {
      ok: false as const,
      failure: AuditFailure.HEAD_MISMATCH,
      at: 'head' as const,
      message: '',
      verifiedBids: 3,
    };
    expect(statuses(head).slice(-2)).toEqual(['broken', 'unchecked']);
  });
});
