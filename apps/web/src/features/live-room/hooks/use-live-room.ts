import { Role } from '@pregao/shared';
import { useSession } from '@/features/auth/hooks/use-session';
import { useLot } from '@/features/lots/hooks/use-lot';
import { useServerNow } from '@/lib/server-clock';
import { buildLiveRoom } from '../live-room';
import { useLotBids } from './use-lot-bids';
import { useLotRoom } from './use-lot-room';
import { useMyStanding } from './use-my-standing';

/**
 * The live room for a lot: its queries, the realtime subscription and the server clock,
 * put together. `room` is null until the lot loads; `lot` carries its loading/error state.
 */
export function useLiveRoom(lotId: string) {
  const { user } = useSession();
  const lot = useLot(lotId);
  const bids = useLotBids(lotId);
  const standing = useMyStanding(lotId, user?.role === Role.BIDDER);
  const { extendedAt } = useLotRoom(lotId);
  const now = useServerNow();

  const room = lot.data
    ? buildLiveRoom({
        lot: lot.data,
        bids: bids.data ?? [],
        myStanding: standing.data,
        extendedAt,
        now,
      })
    : null;
  return { lot, room };
}
