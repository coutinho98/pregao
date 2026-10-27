import type { PublicBid } from './bids';
import type { LotStatus } from './lot-phase';

export const lotRoom = (lotId: string) => `lot:${lotId}`;
export const userRoom = (userId: string) => `user:${userId}`;

export const SocketEvent = {
  JOIN_LOT: 'lot:join',
  LEAVE_LOT: 'lot:leave',
  BID_NEW: 'bid:new',
  LOT_EXTENDED: 'lot:extended',
  LOT_CLOSED: 'lot:closed',
  YOU_OUTBID: 'you:outbid',
} as const;

/** Every server payload carries the server clock so clients can correct their countdowns. */
interface Timestamped {
  serverNow: string;
}

export interface BidNewPayload extends Timestamped {
  lotId: string;
  bid: PublicBid;
  currentBidCents: number;
  minNextBidCents: number;
  bidCount: number;
  endsAt: string;
}

export interface LotExtendedPayload extends Timestamped {
  lotId: string;
  endsAt: string;
}

export interface LotClosedPayload extends Timestamped {
  lotId: string;
  status: LotStatus;
  winnerPseudonym: string | null;
  finalPriceCents: number | null;
}

export interface YouOutbidPayload extends Timestamped {
  lotId: string;
  lotNumber: number;
  title: string;
  currentBidCents: number;
  minNextBidCents: number;
}

export interface JoinLotAck extends Timestamped {
  ok: boolean;
}

export interface ServerToClientEvents {
  [SocketEvent.BID_NEW]: (payload: BidNewPayload) => void;
  [SocketEvent.LOT_EXTENDED]: (payload: LotExtendedPayload) => void;
  [SocketEvent.LOT_CLOSED]: (payload: LotClosedPayload) => void;
  [SocketEvent.YOU_OUTBID]: (payload: YouOutbidPayload) => void;
}

export interface ClientToServerEvents {
  [SocketEvent.JOIN_LOT]: (lotId: string, ack: (ack: JoinLotAck) => void) => void;
  [SocketEvent.LEAVE_LOT]: (lotId: string) => void;
}
