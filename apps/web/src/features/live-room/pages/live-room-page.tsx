import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/app/paths';
import { ArtworkImage } from '@/components/artwork/artwork-image';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { apiUrl } from '@/lib/env';
import { errorMessage } from '@/lib/errors';
import { BidBox } from '../components/bid-box';
import { RoomTabs } from '../components/room-tabs';
import { useLiveRoom } from '../hooks/use-live-room';

export function LiveRoomPage() {
  const { id = '' } = useParams();
  const { lot, room } = useLiveRoom(id);

  if (lot.isError) {
    return (
      <Page width="wide">
        <BackToShowcase />
        <ErrorState message={errorMessage(lot.error)} onRetry={() => void lot.refetch()} />
      </Page>
    );
  }
  if (!room) {
    return (
      <Page width="wide">
        <p className="mt-10 text-center text-ink-3">Abrindo a sala…</p>
      </Page>
    );
  }

  return (
    <Page width="wide" className="max-lg:pb-56">
      <BackToShowcase />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] lg:gap-10">
        <div className="flex flex-col gap-8">
          <ArtworkImage
            src={apiUrl(room.lot.image.url)}
            alt={room.lot.image.altText ?? room.lot.title}
            size="lg"
            priority
            zoom
          />
          <div className="max-lg:order-last">
            <RoomTabs lot={room.lot} bids={room.bids} myPseudonym={room.myPseudonym} />
          </div>
        </div>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <BidBox room={room} />
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
