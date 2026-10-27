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
