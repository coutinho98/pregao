import { describe, expect, it } from 'vitest';
import { paddleCode, withBid } from './bid-history';

const bid = (seq: number) => ({
  seq,
  bidderPseudonym: `Licitante #00000${seq}`,
  amountCents: seq * 1_000,
  createdAt: '2026-10-28T20:00:00.000Z',
});

describe('withBid', () => {
  it('puts the newest bid first', () => {
    expect(withBid([bid(2), bid(1)], bid(3)).map((b) => b.seq)).toEqual([3, 2, 1]);
  });

  it('ignores a bid that already arrived through the other channel', () => {
    expect(withBid([bid(3), bid(2)], bid(3)).map((b) => b.seq)).toEqual([3, 2]);
  });

  it('keeps order when a late event is older than the newest', () => {
    expect(withBid([bid(3), bid(1)], bid(2)).map((b) => b.seq)).toEqual([3, 2, 1]);
  });

  it('starts a history from nothing', () => {
    expect(withBid(undefined, bid(1))).toHaveLength(1);
  });
});

describe('paddleCode', () => {
  it('keeps only the paddle number', () => {
    expect(paddleCode('Licitante #A3F9C2')).toBe('#A3F9C2');
  });
});
