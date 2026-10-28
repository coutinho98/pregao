import { BidStanding, type LotDetail, LotPhase, type PublicBid } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { buildLiveRoom } from './live-room';

const lot = {
  id: 'lot-1',
  number: 1,
  title: 'Water Lilies',
  phase: LotPhase.LIVE,
  startsAt: '2026-10-28T20:00:00.000Z',
  endsAt: '2026-10-28T21:00:00.000Z',
  startingPriceCents: 100_000,
  minIncrementCents: 10_000,
  minNextBidCents: 120_000,
  currentBidCents: 110_000,
  bidCount: 1,
} as LotDetail;
const bids: PublicBid[] = [
  {
    seq: 1,
    bidderPseudonym: 'Licitante #A1B2C3',
    amountCents: 110_000,
    createdAt: '2026-10-28T20:10:00.000Z',
  },
];
const now = new Date('2026-10-28T20:30:00.000Z');

describe('buildLiveRoom', () => {
  it('gives a visitor without a standing neutral defaults', () => {
    const room = buildLiveRoom({ lot, bids, myStanding: undefined, extendedAt: null, now });
    expect(room).toMatchObject({
      phase: LotPhase.LIVE,
      myPseudonym: undefined,
      standing: BidStanding.NONE,
      position: null,
      totalBidders: 0,
      receiptToken: null,
    });
  });

  it('knows the user is winning from the live history', () => {
    const myStanding = {
      pseudonym: 'Licitante #A1B2C3',
      standing: BidStanding.WINNING,
      position: 1,
      totalBidders: 1,
      myHighestBidCents: 110_000,
      receiptToken: null,
    };
    const room = buildLiveRoom({ lot, bids, myStanding, extendedAt: null, now });
    expect(room.standing).toBe(BidStanding.WINNING);
    expect(room.position).toBe(1);
  });

  it('announces an extension only for a few seconds', () => {
    const justExtended = buildLiveRoom({
      lot,
      bids,
      myStanding: undefined,
      extendedAt: new Date(now.getTime() - 3_000),
      now,
    });
    const longAgo = buildLiveRoom({
      lot,
      bids,
      myStanding: undefined,
      extendedAt: new Date(now.getTime() - 60_000),
      now,
    });
    expect(justExtended.call).not.toBe(longAgo.call);
  });
});
