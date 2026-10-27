import { Role } from '@pregao/shared';
import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/app/paths';
import { ArtworkImage } from '@/components/artwork/artwork-image';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { useSession } from '@/features/auth/hooks/use-session';
import { useLot } from '@/features/lots/hooks/use-lot';
import { apiUrl } from '@/lib/env';
import { errorMessage } from '@/lib/errors';
import { useServerNow } from '@/lib/server-clock';
import { auctioneerCall } from '../auctioneer-call';
import { BidBox } from '../components/bid-box';
import { RoomTabs } from '../components/room-tabs';
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
      <Page width="wide">
        <p className="mt-10 text-center text-ink-3">Abrindo a sala…</p>
      </Page>
    );
  }
  if (lot.isError) {
    return (
      <Page width="wide">
        <BackToShowcase />
        <ErrorState message={errorMessage(lot.error)} onRetry={() => void lot.refetch()} />
      </Page>
    );
  }

  const phase = livePhase(lot.data, now);
  const myPseudonym = standing.data?.pseudonym;
  const history = bids.data ?? [];
  const extendedRecently =
    extendedAt !== null && now.getTime() - extendedAt.getTime() < EXTENSION_NOTICE_MS;
  const call = auctioneerCall({
    phase,
    bids: history,
    remainingMs: new Date(lot.data.endsAt).getTime() - now.getTime(),
    extendedRecently,
    myPseudonym,
    startingPriceCents: lot.data.startingPriceCents,
    minNextBidCents: lot.data.minNextBidCents,
  });

  return (
    <Page width="wide" className="max-lg:pb-56">
      <BackToShowcase />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] lg:gap-10">
        <div className="flex flex-col gap-8">
          <ArtworkImage
            src={apiUrl(lot.data.image.url)}
            alt={lot.data.image.altText ?? lot.data.title}
            size="lg"
            priority
            zoom
          />
          <div className="max-lg:order-last">
            <RoomTabs lot={lot.data} bids={history} myPseudonym={myPseudonym} />
          </div>
        </div>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <BidBox
            lot={lot.data}
            phase={phase}
            countdown={countdownView(lot.data, phase, now)}
            bids={history}
            call={call}
            standing={liveStanding(myPseudonym, history)}
            position={standing.data?.position ?? null}
            totalBidders={standing.data?.totalBidders ?? 0}
            receiptToken={standing.data?.receiptToken ?? null}
          />
        </aside>
      </div>
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
