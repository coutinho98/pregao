import type { BidStanding, LotDetail, LotPhase, MyLotStanding, PublicBid } from '@pregao/shared';
import { auctioneerCall } from './auctioneer-call';
import { type CountdownView, countdownView, livePhase } from './room-clock';
import { liveStanding } from './standing';

/** How long after an anti-sniping extension the auctioneer keeps announcing it. */
const EXTENSION_NOTICE_MS = 10_000;

/** Everything the room shows, derived from the lot, its bids and the user's standing. */
export interface LiveRoom {
  lot: LotDetail;
  phase: LotPhase;
  countdown: CountdownView | null;
  bids: PublicBid[];
  call: string;
  myPseudonym: string | undefined;
  standing: BidStanding;
  position: number | null;
  totalBidders: number;
  receiptToken: string | null;
}

interface LiveRoomInput {
  lot: LotDetail;
  bids: PublicBid[];
  myStanding: MyLotStanding | undefined;
  extendedAt: Date | null;
  now: Date;
}

export function buildLiveRoom({ lot, bids, myStanding, extendedAt, now }: LiveRoomInput): LiveRoom {
  const phase = livePhase(lot, now);
  const myPseudonym = myStanding?.pseudonym;
  const extendedRecently =
    extendedAt !== null && now.getTime() - extendedAt.getTime() < EXTENSION_NOTICE_MS;
  return {
    lot,
    phase,
    countdown: countdownView(lot, phase, now),
    bids,
    call: auctioneerCall({
      phase,
      bids,
      remainingMs: new Date(lot.endsAt).getTime() - now.getTime(),
      extendedRecently,
      myPseudonym,
      startingPriceCents: lot.startingPriceCents,
      minNextBidCents: lot.minNextBidCents,
    }),
    myPseudonym,
    standing: liveStanding(myPseudonym, bids),
    position: myStanding?.position ?? null,
    totalBidders: myStanding?.totalBidders ?? 0,
    receiptToken: myStanding?.receiptToken ?? null,
  };
}
