import { BidStanding } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { liveStanding } from './standing';

const bid = (seq: number, bidderPseudonym: string) => ({
  seq,
  bidderPseudonym,
  amountCents: seq * 1_000,
  createdAt: '2026-10-28T20:00:00.000Z',
});
const history = [bid(3, 'Licitante #B'), bid(2, 'Licitante #A'), bid(1, 'Licitante #B')];

describe('liveStanding', () => {
  it('is winning when the newest bid is mine', () => {
    expect(liveStanding('Licitante #B', history)).toBe(BidStanding.WINNING);
  });

  it('is outbid when I bid but someone bid after', () => {
    expect(liveStanding('Licitante #A', history)).toBe(BidStanding.OUTBID);
  });

  it('is none for spectators or before my first bid', () => {
    expect(liveStanding(undefined, history)).toBe(BidStanding.NONE);
    expect(liveStanding('Licitante #C', history)).toBe(BidStanding.NONE);
  });
});
