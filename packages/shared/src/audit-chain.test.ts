import { describe, expect, it } from 'vitest';
import { bidMessage, genesisMessage, headMessage } from './audit-chain';

describe('audit chain canonical messages', () => {
  it('serializes the genesis with fixed field order and ISO UTC time', () => {
    expect(
      genesisMessage({
        lotId: 'lot-1',
        itemId: '16568',
        startingPriceCents: 100_000,
        minIncrementCents: 5_000,
        startsAt: new Date('2026-10-28T17:00:00-03:00'),
      }),
    ).toBe('GENESIS|lot-1|16568|100000|5000|2026-10-28T20:00:00.000Z');
  });

  it('serializes the head', () => {
    expect(headMessage({ lotId: 'lot-1', bidCount: 3, lastHash: 'abc' })).toBe('HEAD|lot-1|3|abc');
  });

  it('serializes a bid chained to the previous hash', () => {
    expect(
      bidMessage({
        prevHash: 'h0',
        lotId: 'lot-1',
        seq: 1,
        bidderPseudonym: 'Licitante #A3F9C2',
        amountCents: 150_000,
        createdAt: new Date('2026-10-28T20:00:01.500Z'),
      }),
    ).toBe('h0|lot-1|1|Licitante #A3F9C2|150000|2026-10-28T20:00:01.500Z');
  });
});
