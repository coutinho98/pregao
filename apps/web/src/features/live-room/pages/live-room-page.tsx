import { Role } from '@pregao/shared';
import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/app/paths';
import { ArtworkTile } from '@/components/artwork/artwork-tile';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { useSession } from '@/features/auth/hooks/use-session';
import { LotFacts } from '@/features/lots/components/lot-facts';
import { formatLotNumber } from '@/features/lots/format';
import { useLot } from '@/features/lots/hooks/use-lot';
import { apiUrl } from '@/lib/env';
import { errorMessage } from '@/lib/errors';
import { useServerNow } from '@/lib/server-clock';
import { BidPanel } from '../components/bid-panel';
import { BidSummary } from '../components/bid-summary';
import { PaddleHistory } from '../components/paddle-history';
import { RoomCountdown } from '../components/room-countdown';
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

  if (lot.isPending) {
    return (
      <Page>
        <p className="mt-10 text-center text-ink-3">Abrindo a sala…</p>
      </Page>
    );
  }
  if (lot.isError) {
    return (
      <Page>
        <BackToShowcase />
        <ErrorState message={errorMessage(lot.error)} onRetry={() => void lot.refetch()} />
      </Page>
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
    <Page className="pb-44">
      <BackToShowcase />
      <header className="mb-6 text-center">
        <h1 className="text-[15px] font-[550] tracking-normal text-ink-2">
          {formatLotNumber(lot.data.number)}
        </h1>
        {countdown && <RoomCountdown view={countdown} extendedRecently={extendedRecently} />}
      </header>

      <ArtworkTile
        src={apiUrl(lot.data.image.url)}
        alt={lot.data.image.altText ?? lot.data.title}
        size="lg"
        priority
      />
      <div className="mt-4 mb-5 px-1">
        <h2 className="text-[24px]">{lot.data.title}</h2>
        {lot.data.artist && <p className="text-[14px] text-ink-3">{lot.data.artist}</p>}
      </div>

      <div aria-live="polite" className="flex flex-col gap-4">
        <BidSummary
          lot={lot.data}
          phase={phase}
          leaderPseudonym={leaderPseudonym}
          leaderIsMe={leaderPseudonym !== undefined && leaderPseudonym === myPseudonym}
        />
        <StandingBanner
          standing={myStanding}
          position={standing.data?.position ?? null}
          totalBidders={standing.data?.totalBidders ?? 0}
        />
      </div>

      <SectionLabel>Raquetes levantadas</SectionLabel>
      <PaddleHistory bids={history} myPseudonym={myPseudonym} />

      <SectionLabel>Sobre a obra</SectionLabel>
      <LotFacts lot={lot.data} />
      <a
        href={lot.data.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block px-1 text-[13.5px] text-ink-2 underline-offset-4 hover:text-ink hover:underline"
      >
        Ver no Art Institute of Chicago ↗
      </a>

      <BidPanel
        lotId={lot.data.id}
        phase={phase}
        startsAt={lot.data.startsAt}
        minNextBidCents={lot.data.minNextBidCents}
        standing={myStanding}
      />
    </Page>
  );
}

function BackToShowcase() {
  return (
    <Link
      to={paths.home}
      className="mb-4 -ml-1 inline-flex items-center gap-0.5 text-[13.5px] text-ink-3 transition-colors hover:text-ink"
    >
      <ChevronLeft size={16} /> Vitrine
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mt-8 mb-3 px-1 text-[13px] font-medium tracking-normal text-ink-3">
      {children}
    </h2>
  );
}
