import type { PublicBid } from '@pregao/shared';
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
