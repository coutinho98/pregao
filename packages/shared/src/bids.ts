import type { LotDetail, LotSummary } from './lots';

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
  /** Public token of the receipt, only when the user won the lot and it is settled. */
  receiptToken: string | null;
}

/** How one of the user's lots stands for them. */
export const MyBidResult = {
  LEADING: 'LEADING',
  OUTBID: 'OUTBID',
  WON: 'WON',
  LOST: 'LOST',
} as const;

export type MyBidResult = (typeof MyBidResult)[keyof typeof MyBidResult];

export interface MyBidEntry {
  lot: LotSummary;
  result: MyBidResult;
  myHighestBidCents: number;
  receiptToken: string | null;
}
