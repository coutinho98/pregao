import { type AuctioneerLot, LotPhase, LotResult } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { canCancel, lotNote, lotTotals } from './my-lot-status';

const lot = (overrides: Partial<AuctioneerLot>): AuctioneerLot => ({
  id: 'lot-1',
  number: 1,
  title: 'Water Lilies',
  artist: 'Claude Monet',
  dateDisplay: '1906',
  phase: LotPhase.LIVE,
  startsAt: '2026-10-01T12:00:00.000Z',
  endsAt: '2026-10-02T12:00:00.000Z',
  startingPriceCents: 100_000,
  currentBidCents: null,
  bidCount: 0,
  image: {
    url: '/images/1',
    thumbnailUrl: '/images/1?size=thumb',
    width: null,
    height: null,
    altText: null,
  },
  result: null,
  ...overrides,
});

describe('lotNote', () => {
  it('shows the result of a settled lot', () => {
    expect(lotNote(lot({ phase: LotPhase.ENDED, result: LotResult.SOLD })).text).toBe('Arrematado');
    expect(lotNote(lot({ phase: LotPhase.ENDED, result: LotResult.UNSOLD })).text).toBe(
      'Sem lances',
    );
  });

  it('marks the starting price of a scheduled lot', () => {
    expect(lotNote(lot({ phase: LotPhase.SCHEDULED })).text).toBe('inicial');
  });

  it('counts the bids of a live lot in the right number', () => {
    expect(lotNote(lot({ bidCount: 1 })).text).toBe('1 lance');
    expect(lotNote(lot({ bidCount: 3 })).text).toBe('3 lances');
  });
});

describe('canCancel', () => {
  it('allows cancelling only before the hammer', () => {
    expect(canCancel(lot({ phase: LotPhase.SCHEDULED }))).toBe(true);
    expect(canCancel(lot({ phase: LotPhase.LIVE }))).toBe(true);
    expect(canCancel(lot({ phase: LotPhase.ENDED }))).toBe(false);
    expect(canCancel(lot({ phase: LotPhase.CANCELLED }))).toBe(false);
  });
});

describe('lotTotals', () => {
  it('counts running lots by phase and finished ones by result', () => {
    const lots = [
      lot({ phase: LotPhase.LIVE }),
      lot({ phase: LotPhase.LIVE }),
      lot({ phase: LotPhase.SCHEDULED }),
      lot({ phase: LotPhase.ENDED, result: LotResult.SOLD }),
      lot({ phase: LotPhase.ENDED, result: LotResult.UNSOLD }),
      lot({ phase: LotPhase.CANCELLED }),
    ];
    expect(lotTotals(lots)).toEqual({ live: 2, scheduled: 1, sold: 1, unsold: 1 });
  });
});
