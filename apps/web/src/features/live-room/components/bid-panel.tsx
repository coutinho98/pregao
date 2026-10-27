import { BidStanding, LotPhase, Role } from '@pregao/shared';
import { ChevronRight } from 'lucide-react';
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

/**
 * The floating bar at the bottom of the room: the bid field, or why the visitor
 * cannot bid right now, in the house's voice.
 */
export function BidPanel(props: BidPanelProps) {
  return (
    <div className="fixed inset-x-3 bottom-[calc(14px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-[480px]">
      <BidPanelContent {...props} />
    </div>
  );
}

function BidPanelContent({ lotId, phase, startsAt, minNextBidCents, standing }: BidPanelProps) {
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
      <Notice
        action={
          <Link
            to={`${paths.login}?next=${next}`}
            className="inline-flex h-[40px] items-center gap-1 rounded-full bg-primary px-4 text-[14px] font-[550] text-primary-ink"
          >
            Entrar <ChevronRight size={15} />
          </Link>
        }
      >
        Entre como licitante para dar lances.
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

function Notice({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="glass flex min-h-[58px] items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 text-[14px] text-ink-2">
      <span className="grow">{children}</span>
      {action}
    </div>
  );
}
