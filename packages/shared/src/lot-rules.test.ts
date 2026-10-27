import { describe, expect, it } from 'vitest';
import { minNextBidCents } from './lot-rules';

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
