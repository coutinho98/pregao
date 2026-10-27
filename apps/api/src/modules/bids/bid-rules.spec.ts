import { ErrorCode, Role } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { LotStatus } from '../../generated/prisma/client.js';
import {
  type BidAttempt,
  bidRejection,
  extendedEndsAt,
  myBidResult,
  nextMinimumBid,
  standingOf,
} from './bid-rules.js';

const now = new Date('2026-10-28T20:00:00.000Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);

const attempt = (overrides: Partial<BidAttempt> = {}, lot: Partial<BidAttempt['lot']> = {}) => ({
  bidderId: 'bidder',
  bidderRole: Role.BIDDER,
  amountCents: 100_000n,
  availableCents: 1_000_000n,
  now,
  ...overrides,
  lot: {
    status: LotStatus.ACTIVE,
    startsAt: minutes(-60),
    endsAt: minutes(60),
    startingPriceCents: 100_000n,
    minIncrementCents: 5_000n,
    currentBidCents: null,
    leaderId: null,
    ...lot,
  },
});

const codeOf = (input: BidAttempt) => bidRejection(input)?.code ?? null;

describe('bidRejection', () => {
  it('accepts a first bid at the starting price', () => {
    expect(codeOf(attempt())).toBeNull();
  });

  it('refuses auctioneers', () => {
    expect(codeOf(attempt({ bidderRole: Role.AUCTIONEER }))).toBe(ErrorCode.AUCTIONEER_CANNOT_BID);
  });

  it('refuses before the lot opens (startsAt is inclusive)', () => {
    expect(codeOf(attempt({}, { startsAt: minutes(1) }))).toBe(ErrorCode.NOT_STARTED);
    expect(codeOf(attempt({}, { startsAt: now }))).toBeNull();
  });

  it('refuses at and after endsAt, and on settled or cancelled lots', () => {
    expect(codeOf(attempt({}, { endsAt: now }))).toBe(ErrorCode.LOT_ENDED);
    expect(codeOf(attempt({}, { status: LotStatus.SETTLED }))).toBe(ErrorCode.LOT_ENDED);
    expect(codeOf(attempt({}, { status: LotStatus.CANCELLED }))).toBe(ErrorCode.LOT_ENDED);
  });

  it('refuses the current leader', () => {
    const lot = { leaderId: 'bidder', currentBidCents: 100_000n };
    expect(codeOf(attempt({ amountCents: 200_000n }, lot))).toBe(ErrorCode.ALREADY_WINNING);
  });

  it('requires the starting price on the first bid', () => {
    expect(codeOf(attempt({ amountCents: 99_999n }))).toBe(ErrorCode.BELOW_MINIMUM);
  });

  it('requires current bid plus increment afterwards', () => {
    const lot = { leaderId: 'other', currentBidCents: 120_000n };
    expect(codeOf(attempt({ amountCents: 124_999n }, lot))).toBe(ErrorCode.BELOW_MINIMUM);
    expect(codeOf(attempt({ amountCents: 125_000n }, lot))).toBeNull();
  });

  it('requires the amount to fit in the available balance', () => {
    expect(codeOf(attempt({ availableCents: 99_999n }))).toBe(ErrorCode.INSUFFICIENT_FUNDS);
    expect(codeOf(attempt({ availableCents: 100_000n }))).toBeNull();
  });
});

describe('nextMinimumBid', () => {
  it('is the starting price, then current plus increment', () => {
    expect(nextMinimumBid(attempt().lot)).toBe(100_000n);
    expect(nextMinimumBid(attempt({}, { currentBidCents: 120_000n }).lot)).toBe(125_000n);
  });
});

describe('extendedEndsAt (anti-sniping)', () => {
  it('extends to now + 2 min when less than 2 min are left', () => {
    expect(extendedEndsAt(minutes(0.5), now)).toEqual(minutes(2));
    expect(extendedEndsAt(new Date(minutes(2).getTime() - 1), now)).toEqual(minutes(2));
  });

  it('keeps the end when 2 min or more are left (exactly 2 min already ends at now + 2 min)', () => {
    expect(extendedEndsAt(minutes(2), now)).toBeNull();
    expect(extendedEndsAt(minutes(5), now)).toBeNull();
  });
});

describe('standingOf', () => {
  const highest = [
    { bidderId: 'ana', amountCents: 110_000n },
    { bidderId: 'leader', amountCents: 130_000n },
    { bidderId: 'bia', amountCents: 120_000n },
  ];

  it('marks the leader as winning in first place', () => {
    expect(standingOf('leader', 'leader', highest)).toEqual({
      standing: 'WINNING',
      position: 1,
      totalBidders: 3,
      myHighestBidCents: 130_000,
    });
  });

  it('ranks an outbid bidder by their highest bid', () => {
    expect(standingOf('ana', 'leader', highest)).toMatchObject({ standing: 'OUTBID', position: 3 });
  });

  it('has no position for someone who has not bid', () => {
    expect(standingOf('newcomer', 'leader', highest)).toEqual({
      standing: 'NONE',
      position: null,
      totalBidders: 3,
      myHighestBidCents: null,
    });
  });
});

describe('myBidResult', () => {
  const timing = { status: LotStatus.ACTIVE, startsAt: minutes(-60), endsAt: minutes(60) };

  it('is leading or outbid while the lot is live', () => {
    expect(myBidResult({ ...timing, leaderId: 'ana' }, 'ana', now)).toBe('LEADING');
    expect(myBidResult({ ...timing, leaderId: 'bia' }, 'ana', now)).toBe('OUTBID');
  });

  it('is won or lost once the lot ends, settled or not yet', () => {
    const ended = { ...timing, endsAt: minutes(-1) };
    expect(myBidResult({ ...ended, leaderId: 'ana' }, 'ana', now)).toBe('WON');
    expect(myBidResult({ ...ended, leaderId: 'bia' }, 'ana', now)).toBe('LOST');
    expect(myBidResult({ ...timing, status: LotStatus.SETTLED, leaderId: 'ana' }, 'ana', now)).toBe(
      'WON',
    );
  });
});
