const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** A lot may "start now": startsAt can be up to this far in the past when created. */
export const LOT_START_TOLERANCE_MS = MINUTE_MS;
export const LOT_MIN_DURATION_MS = 5 * MINUTE_MS;
export const LOT_MAX_DURATION_MS = 60 * DAY_MS;
/** R$ 100 milhões: generous for art, far below Number.MAX_SAFE_INTEGER. */
export const MAX_PRICE_CENTS = 10_000_000_000;

export interface PricedLot {
  startingPriceCents: number;
  minIncrementCents: number;
  currentBidCents: number | null;
}

export function minNextBidCents({
  startingPriceCents,
  minIncrementCents,
  currentBidCents,
}: PricedLot): number {
  return currentBidCents === null ? startingPriceCents : currentBidCents + minIncrementCents;
}
