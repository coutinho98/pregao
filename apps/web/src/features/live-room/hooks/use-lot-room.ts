import {
  type BidNewPayload,
  type JoinLotAck,
  type LotClosedPayload,
  type LotDetail,
  type LotExtendedPayload,
  type MyLotStanding,
  type PublicBid,
  SocketEvent,
} from '@pregao/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { syncServerClock } from '@/lib/server-clock';
import { getSocket } from '@/lib/socket';
import { playSound } from '@/lib/sound';
import { withBid } from '../bid-history';
import { ticksForRoomBid } from '../bid-sounds';

/**
 * Joins the lot's room and keeps the TanStack Query cache in step with the server.
 * After a reconnect it refetches everything, since events may have been missed.
 * Returns when the last anti-sniping extension happened (server time).
 */
export function useLotRoom(lotId: string): { extendedAt: Date | null } {
  const queryClient = useQueryClient();
  const [extendedAt, setExtendedAt] = useState<Date | null>(null);

  useEffect(() => {
    const socket = getSocket();
    const detailKey = queryKeys.lots.detail(lotId);
    let joinedBefore = false;

    const refetchRoom = () => {
      for (const queryKey of [
        detailKey,
        queryKeys.lots.bids(lotId),
        queryKeys.lots.standing(lotId),
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    };
    const updateLot = (changes: Partial<LotDetail>) =>
      queryClient.setQueryData<LotDetail>(detailKey, (lot) => lot && { ...lot, ...changes });

    const join = () => {
      socket.emit(SocketEvent.JOIN_LOT, lotId, (ack: JoinLotAck) => syncServerClock(ack.serverNow));
      if (joinedBefore) refetchRoom();
      joinedBefore = true;
    };
    const onBid = (payload: BidNewPayload) => {
      if (payload.lotId !== lotId) return;
      syncServerClock(payload.serverNow);
      const tick = ticksForRoomBid({
        bidder: payload.bid.bidderPseudonym,
        previousLeader: queryClient.getQueryData<PublicBid[]>(queryKeys.lots.bids(lotId))?.[0]
          ?.bidderPseudonym,
        me: queryClient.getQueryData<MyLotStanding>(queryKeys.lots.standing(lotId))?.pseudonym,
      });
      if (tick) playSound('bid');
      updateLot({
        currentBidCents: payload.currentBidCents,
        minNextBidCents: payload.minNextBidCents,
        bidCount: payload.bidCount,
        endsAt: payload.endsAt,
      });
      queryClient.setQueryData<PublicBid[]>(queryKeys.lots.bids(lotId), (history) =>
        withBid(history, payload.bid),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.lots.standing(lotId) });
    };
    const onExtended = (payload: LotExtendedPayload) => {
      if (payload.lotId !== lotId) return;
      syncServerClock(payload.serverNow);
      updateLot({ endsAt: payload.endsAt });
      setExtendedAt(new Date(payload.serverNow));
    };
    const onClosed = (payload: LotClosedPayload) => {
      if (payload.lotId !== lotId) return;
      syncServerClock(payload.serverNow);
      refetchRoom();
      // The winner was just charged and the receipt exists now.
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBids });
    };

    socket.on('connect', join);
    socket.on(SocketEvent.BID_NEW, onBid);
    socket.on(SocketEvent.LOT_EXTENDED, onExtended);
    socket.on(SocketEvent.LOT_CLOSED, onClosed);
    if (socket.connected) join();

    return () => {
      socket.emit(SocketEvent.LEAVE_LOT, lotId);
      socket.off('connect', join);
      socket.off(SocketEvent.BID_NEW, onBid);
      socket.off(SocketEvent.LOT_EXTENDED, onExtended);
      socket.off(SocketEvent.LOT_CLOSED, onClosed);
    };
  }, [lotId, queryClient]);

  return { extendedAt };
}
