import { BidStanding, LotPhase, Role } from '@pregao/shared';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { paths } from '@/app/paths';
import { useSession } from '@/features/auth/hooks/use-session';
import { formatDayTime } from '@/utils/date';
import { BidForm } from './bid-form';

interface BidPanelProps {
  lotId: string;
  phase: LotPhase;
  startsAt: string;
  minNextBidCents: number;
  standing: BidStanding;
}

/** What the visitor can do right now: bid, or why not, in the house's voice. */
export function BidPanel({ lotId, phase, startsAt, minNextBidCents, standing }: BidPanelProps) {
  const { user } = useSession();
  const location = useLocation();

  if (phase === LotPhase.CANCELLED) return <Notice>Este lote foi cancelado.</Notice>;
  if (phase === LotPhase.ENDED) {
    return (
      <Notice>
        {standing === BidStanding.WINNING ? 'Você arrematou este lote.' : 'O martelo foi batido.'}
      </Notice>
    );
  }
  if (phase === LotPhase.SCHEDULED) {
    return <Notice>Os lances abrem em {formatDayTime(startsAt)}.</Notice>;
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return (
      <Notice>
        <Link
          to={`${paths.login}?next=${next}`}
          className="font-semibold text-latao underline underline-offset-4"
        >
          Entre como licitante
        </Link>{' '}
        para dar lances.
      </Notice>
    );
  }
  if (user.role === Role.AUCTIONEER) {
    return <Notice>Leiloeiros acompanham o pregão, mas não dão lances.</Notice>;
  }
  if (standing === BidStanding.WINNING) {
    return <Notice>Seu lance lidera. Aguarde outro lance para cobrir.</Notice>;
  }
  return <BidForm key={minNextBidCents} lotId={lotId} minNextBidCents={minNextBidCents} />;
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-latao py-2 pl-4 text-lg">{children}</p>;
}
