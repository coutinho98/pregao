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
  medium: string | null;
  /** Nationality and life of the artist, as the museum writes it: "French, 1859–1891". */
  artistBio: string | null;
  /** Movement or period, as the museum names it: "Pointillism". */
  style: string | null;
  dimensions: string | null;
  placeOfOrigin: string | null;
  /** A few sentences about the work, from the museum's catalogue (in English). */
  story: string | null;
}

export interface LotDetail extends LotSummary {
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

/** Showcase ordering. SOON follows the phase: ending first, opening first, latest ended. */
export const LotSort = {
  SOON: 'SOON',
  NEWEST: 'NEWEST',
  MOST_BIDS: 'MOST_BIDS',
  HIGHEST_BID: 'HIGHEST_BID',
} as const;

export type LotSort = (typeof LotSort)[keyof typeof LotSort];

export const LOT_SORTS = Object.values(LotSort);

export interface LotListQuery {
  phase: PublicLotPhase;
  q?: string;
  sort?: LotSort;
  page?: number;
}

/** "7", "007", "lote 7" or "Lote 007" → 7; anything else → null. */
export function parseLotNumber(query: string): number | null {
  const match = /^(?:lote\s*)?0*(\d{1,9})$/i.exec(query.trim());
  return match ? Number(match[1]) : null;
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
