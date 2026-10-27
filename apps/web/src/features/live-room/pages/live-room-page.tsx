import { Role } from '@pregao/shared';
import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { ErrorState } from '@/components/feedback/error-state';
import { useSession } from '@/features/auth/hooks/use-session';
import { formatLotNumber } from '@/features/lots/format';
import { useLot } from '@/features/lots/hooks/use-lot';
import { errorMessage } from '@/lib/errors';
import { useServerNow } from '@/lib/server-clock';
import { ArtworkSpotlight } from '../components/artwork-spotlight';
import { BidPanel } from '../components/bid-panel';
import { CountdownBar } from '../components/countdown-bar';
import { CurrentBid } from '../components/current-bid';
import { PaddleHistory } from '../components/paddle-history';
import { StandingBanner } from '../components/standing-banner';
import { useLotBids } from '../hooks/use-lot-bids';
import { useLotRoom } from '../hooks/use-lot-room';
import { useMyStanding } from '../hooks/use-my-standing';
import { countdownView, livePhase } from '../room-clock';
import { liveStanding } from '../standing';

const EXTENSION_NOTICE_MS = 10_000;

export function LiveRoomPage() {
  const { id = '' } = useParams();
  const { user } = useSession();
  const lot = useLot(id);
  const bids = useLotBids(id);
  const standing = useMyStanding(id, user?.role === Role.BIDDER);
  const { extendedAt } = useLotRoom(id);
  const now = useServerNow();

  if (lot.isPending) return <RoomMessage>Abrindo a sala…</RoomMessage>;
  if (lot.isError) {
    return (
      <RoomMessage>
        <ErrorState message={errorMessage(lot.error)} onRetry={() => void lot.refetch()} />
      </RoomMessage>
    );
  }

  const phase = livePhase(lot.data, now);
  const countdown = countdownView(lot.data, phase, now);
  const myPseudonym = standing.data?.pseudonym;
  const history = bids.data ?? [];
  const leaderPseudonym = history[0]?.bidderPseudonym;
  const myStanding = liveStanding(myPseudonym, history);
  const extendedRecently =
    extendedAt !== null && now.getTime() - extendedAt.getTime() < EXTENSION_NOTICE_MS;

  return (
    <div data-theme="dark" className="min-h-[calc(100dvh-4rem)] bg-parede text-tinta">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 pb-40 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:pb-10">
        <ArtworkSpotlight lot={lot.data} />
        <section aria-label="Pódio do lote" className="flex flex-col gap-6">
          <p className="font-display text-xl font-bold text-latao">
            {formatLotNumber(lot.data.number)}
          </p>
          <div aria-live="polite" className="flex flex-col gap-6">
            <CurrentBid
              lot={lot.data}
              phase={phase}
              leaderPseudonym={leaderPseudonym}
              leaderIsMe={leaderPseudonym !== undefined && leaderPseudonym === myPseudonym}
            />
            {countdown && <CountdownBar view={countdown} extendedRecently={extendedRecently} />}
            <StandingBanner
              standing={myStanding}
              position={standing.data?.position ?? null}
              totalBidders={standing.data?.totalBidders ?? 0}
            />
          </div>
          <div className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-20 max-md:border-t max-md:border-sobre-parede/20 max-md:bg-parede max-md:px-4 max-md:pt-3">
            <BidPanel
              lotId={lot.data.id}
              phase={phase}
              startsAt={lot.data.startsAt}
              minNextBidCents={lot.data.minNextBidCents}
              standing={myStanding}
            />
          </div>
          <section aria-labelledby="history-heading" className="flex flex-col gap-3">
            <h2 id="history-heading" className="text-xl">
              Raquetes levantadas
            </h2>
            <PaddleHistory bids={history} myPseudonym={myPseudonym} />
          </section>
        </section>
      </div>
    </div>
  );
}

function RoomMessage({ children }: { children: ReactNode }) {
  return (
    <div data-theme="dark" className="min-h-[calc(100dvh-4rem)] bg-parede text-tinta">
      <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
    </div>
  );
}
