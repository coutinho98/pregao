import type { BidNewPayload, PlaceBidResult, PublicBid, YouOutbidPayload } from '@pregao/shared';
import type { Bid } from '../../generated/prisma/client.js';
import { centsToNumber } from '../../common/money.js';

/** What anyone may see of a bid: the paddle number, never who holds it. */
export function toPublicBid(bid: Bid): PublicBid {
  return {
    seq: bid.seq,
    bidderPseudonym: bid.bidderPseudonym,
    amountCents: centsToNumber(bid.amountCents),
    createdAt: bid.createdAt.toISOString(),
  };
}

export function toBidNewPayload({ bid, lot }: PlaceBidResult, serverNow: string): BidNewPayload {
  return {
    lotId: lot.id,
    bid,
    currentBidCents: bid.amountCents,
    minNextBidCents: lot.minNextBidCents,
    bidCount: lot.bidCount,
    endsAt: lot.endsAt,
    serverNow,
  };
}

export function toOutbidPayload({ lot }: PlaceBidResult, serverNow: string): YouOutbidPayload {
  return {
    lotId: lot.id,
    lotNumber: lot.number,
    title: lot.title,
    currentBidCents: lot.currentBidCents ?? lot.startingPriceCents,
    minNextBidCents: lot.minNextBidCents,
    serverNow,
  };
}
