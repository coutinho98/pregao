import {
  type AuctioneerLot,
  type CatalogItem,
  deriveLotPhase,
  type LotDetail,
  type LotImage,
  LotResult,
  type LotSummary,
  minNextBidCents,
} from '@pregao/shared';
import { type ItemSnapshot, LotStatus } from '../../generated/prisma/client.js';
import { centsToNumber } from '../../common/money.js';
import { CATALOG_SOURCE } from '../catalog/catalog-provider.js';
import type { LotWithSnapshot, NewLot } from './lots.repository.js';

export function toLotSummary(lot: LotWithSnapshot, now: Date): LotSummary {
  const { itemSnapshot: snapshot } = lot;
  return {
    id: lot.id,
    number: lot.number,
    title: snapshot.title,
    artist: snapshot.artist,
    dateDisplay: snapshot.dateDisplay,
    phase: deriveLotPhase(lot, now),
    startsAt: lot.startsAt.toISOString(),
    endsAt: lot.endsAt.toISOString(),
    startingPriceCents: centsToNumber(lot.startingPriceCents),
    currentBidCents: lot.currentBidCents === null ? null : centsToNumber(lot.currentBidCents),
    bidCount: lot.bidCount,
    image: toLotImage(snapshot),
  };
}

/** Image paths served by the API from the snapshot (never the museum's URLs). */
export function toLotImage(snapshot: ItemSnapshot): LotImage {
  return {
    url: `/images/${snapshot.id}`,
    thumbnailUrl: `/images/${snapshot.id}?size=thumb`,
    width: snapshot.imageWidth,
    height: snapshot.imageHeight,
    altText: snapshot.altText,
  };
}

/** Sold or unsold once settled; null while the hammer has not fallen yet. */
export function toAuctioneerLot(lot: LotWithSnapshot, now: Date): AuctioneerLot {
  let result: AuctioneerLot['result'] = null;
  if (lot.status === LotStatus.SETTLED) result = lot.leaderId ? LotResult.SOLD : LotResult.UNSOLD;
  return { ...toLotSummary(lot, now), result };
}

export function toLotDetail(lot: LotWithSnapshot, now: Date): LotDetail {
  const summary = toLotSummary(lot, now);
  const minIncrementCents = centsToNumber(lot.minIncrementCents);
  return {
    ...summary,
    medium: lot.itemSnapshot.medium,
    dimensions: lot.itemSnapshot.dimensions,
    placeOfOrigin: lot.itemSnapshot.placeOfOrigin,
    sourceUrl: lot.itemSnapshot.sourceUrl,
    minIncrementCents,
    minNextBidCents: minNextBidCents({
      startingPriceCents: summary.startingPriceCents,
      minIncrementCents,
      currentBidCents: summary.currentBidCents,
    }),
    serverNow: now.toISOString(),
  };
}

/** What we keep of the museum's record, so the lot never needs the museum again. */
export function snapshotFromCatalogItem(item: CatalogItem): NewLot['snapshot'] {
  return {
    source: CATALOG_SOURCE,
    externalId: item.externalId,
    title: item.title,
    artist: item.artist,
    dateDisplay: item.dateDisplay,
    medium: item.medium,
    dimensions: item.dimensions,
    placeOfOrigin: item.placeOfOrigin,
    sourceUrl: item.sourceUrl,
    imageWidth: item.imageWidth,
    imageHeight: item.imageHeight,
    altText: item.altText,
  };
}
