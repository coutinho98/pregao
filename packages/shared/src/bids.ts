import type { LotDetail } from './lots';

/** Window at the end of a lot in which an accepted bid pushes the end to now + this. */
export const ANTI_SNIPING_WINDOW_MS = 2 * 60_000;

export interface PlaceBidInput {
  amountCents: number;
}

export interface PublicBid {
  seq: number;
  bidderPseudonym: string;
  amountCents: number;
  createdAt: string;
}

export interface PlaceBidResult {
  bid: PublicBid;
  lot: LotDetail;
  /** True when this bid triggered the anti-sniping extension. */
  extended: boolean;
}
