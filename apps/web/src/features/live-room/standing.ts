import { BidStanding, type PublicBid } from '@pregao/shared';

/**
 * Winning/outbid straight from the live history, so the indicator flips the instant a
 * `bid:new` arrives instead of waiting for the standing request.
 */
export function liveStanding(
  myPseudonym: string | undefined,
  bids: PublicBid[] | undefined,
): BidStanding {
  if (!myPseudonym || !bids?.length) return BidStanding.NONE;
  if (bids[0]?.bidderPseudonym === myPseudonym) return BidStanding.WINNING;
  if (bids.some((bid) => bid.bidderPseudonym === myPseudonym)) return BidStanding.OUTBID;
  return BidStanding.NONE;
}
