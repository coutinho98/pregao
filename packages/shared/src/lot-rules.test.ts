import { describe, expect, it } from 'vitest';
import { minNextBidCents } from './lot-rules';
import { parseLotNumber } from './lots';

describe('minNextBidCents', () => {
  it('is the starting price before any bid', () => {
    expect(
      minNextBidCents({
        startingPriceCents: 10_000,
        minIncrementCents: 500,
        currentBidCents: null,
      }),
    ).toBe(10_000);
  });

  it('is the current bid plus the increment after a bid', () => {
    expect(
      minNextBidCents({
        startingPriceCents: 10_000,
        minIncrementCents: 500,
        currentBidCents: 12_000,
      }),
    ).toBe(12_500);
  });
});

describe('parseLotNumber', () => {
  it.each([
    ['7', 7],
    ['007', 7],
    ['lote 7', 7],
    ['Lote 012', 12],
  ])('reads %s as lot %d', (query, number) => {
    expect(parseLotNumber(query)).toBe(number);
  });

  it.each(['monet', 'lote', '7b', ''])('ignores %s', (query) => {
    expect(parseLotNumber(query)).toBeNull();
  });
});
