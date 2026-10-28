interface RoomBid {
  /** Paddle that placed the new bid. */
  bidder: string;
  /** Paddle that led before it, if any. */
  previousLeader: string | undefined;
  /** The user's own paddle in this lot, unknown for visitors. */
  me: string | undefined;
}

/**
 * Whether a bid arriving in the room should tick. Your own bid already has its confirmation
 * sound, and losing the lead has the outbid one, so neither ticks on top of it.
 */
export function ticksForRoomBid({ bidder, previousLeader, me }: RoomBid): boolean {
  if (me === undefined) return true;
  return bidder !== me && previousLeader !== me;
}
