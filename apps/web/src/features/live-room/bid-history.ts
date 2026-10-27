import type { PublicBid } from '@pregao/shared';

/**
 * Adds a bid to the history, newest first. The same bid can arrive twice (the HTTP response
 * and the socket broadcast), so bids are unique by their sequence number.
 */
export function withBid(history: PublicBid[] | undefined, bid: PublicBid): PublicBid[] {
  const others = (history ?? []).filter((existing) => existing.seq !== bid.seq);
  return [bid, ...others].sort((a, b) => b.seq - a.seq);
}

/** "#A3F9C2" from "Licitante #A3F9C2": what fits on a paddle. */
export const paddleCode = (pseudonym: string) => pseudonym.replace(/^Licitante\s*/, '');
