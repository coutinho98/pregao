import type { LotPhase, PublicLotPhase } from './lot-phase';

export interface LotImage {
  /** Paths on the API (prefix with the API base URL). */
  url: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
  altText: string | null;
}

export interface LotSummary {
  id: string;
  number: number;
  title: string;
  artist: string | null;
  dateDisplay: string | null;
  phase: LotPhase;
  startsAt: string;
  endsAt: string;
  startingPriceCents: number;
  currentBidCents: number | null;
  bidCount: number;
  image: LotImage;
}

export interface LotDetail extends LotSummary {
  medium: string | null;
  dimensions: string | null;
  placeOfOrigin: string | null;
  sourceUrl: string;
  minIncrementCents: number;
  minNextBidCents: number;
  serverNow: string;
}

export interface LotPage {
  items: LotSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LotListQuery {
  phase: PublicLotPhase;
  q?: string;
  page?: number;
}

export interface CreateLotInput {
  externalId: string;
  startingPriceCents: number;
  minIncrementCents: number;
  startsAt: string;
  endsAt: string;
}

export const LOT_PAGE_SIZE = 24;

/** Outcome of an auctioneer's lot once the hammer falls. */
export const LotResult = {
  SOLD: 'SOLD',
  UNSOLD: 'UNSOLD',
} as const;

export type LotResult = (typeof LotResult)[keyof typeof LotResult];

export interface AuctioneerLot extends LotSummary {
  /** Null while the lot is scheduled, live or waiting to be settled. */
  result: LotResult | null;
}

export interface AuctioneerLots {
  lots: AuctioneerLot[];
  /** Sum of the hammer prices of sold lots, credited to the auctioneer's wallet. */
  totalReceivedCents: number;
}
