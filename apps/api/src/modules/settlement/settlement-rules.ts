import type { Bid, Lot } from '../../generated/prisma/client.js';

/**
 * Why the lot's leader cannot be charged safely, or null when the lot, its last bid and the
 * chain agree. Guards against rows changed directly in the database (e.g. swapping the
 * leader to make someone else pay): the paddle number is recomputed from the server secret.
 */
export function settlementProblem(
  lot: Pick<Lot, 'leaderId' | 'currentBidCents' | 'lastHash'>,
  lastBid: Pick<Bid, 'bidderId' | 'amountCents' | 'hash' | 'bidderPseudonym'> | null,
  expectedPseudonym: string,
): string | null {
  if (!lastBid) return 'last bid is missing';
  if (lastBid.bidderId !== lot.leaderId) return 'last bidder is not the leader';
  if (lastBid.amountCents !== lot.currentBidCents)
    return 'last bid amount differs from the current bid';
  if (lastBid.hash !== lot.lastHash) return 'last bid hash differs from the chain head';
  if (lastBid.bidderPseudonym !== expectedPseudonym)
    return 'paddle number does not match the bidder';
  return null;
}
