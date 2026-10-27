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

export const BidStanding = {
  WINNING: 'WINNING',
  OUTBID: 'OUTBID',
  NONE: 'NONE',
} as const;

export type BidStanding = (typeof BidStanding)[keyof typeof BidStanding];

/** Where the authenticated user stands in one lot. Only the user sees their own standing. */
export interface MyLotStanding {
  /** The user's paddle number in this lot, so the room can show "Você". */
  pseudonym: string;
  standing: BidStanding;
  /** 1-based rank among distinct bidders by their highest bid; null without bids. */
  position: number | null;
  totalBidders: number;
  myHighestBidCents: number | null;
}
