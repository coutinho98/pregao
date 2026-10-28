import type { AuctioneerLot } from '@pregao/shared';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { formatLotNumber } from '@/features/lots/format';
import { phaseLabel } from '@/features/lots/phase-labels';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { canCancel, lotNote } from '../my-lot-status';
import { CancelLotButton } from './cancel-lot-button';

export function MyLotRow({ lot }: { lot: AuctioneerLot }) {
  const note = lotNote(lot);
  return (
    <li className="flex items-center gap-2 border-b border-line">
      <Link
        to={paths.lot(lot.id)}
        className="flex min-w-0 grow items-center gap-3 px-0.5 py-3 transition-[padding] duration-300 ease-ios hover:pl-2"
      >
        <img
          src={apiUrl(lot.image.thumbnailUrl)}
          alt=""
          className="size-11 shrink-0 rounded-[10px] bg-surface object-cover"
        />
        <span className="flex min-w-0 grow flex-col gap-px">
          <b className="artwork-title truncate text-[16px]">{lot.title}</b>
          <span className="truncate text-[12.5px] text-ink-3">
            {formatLotNumber(lot.number)} · {phaseLabel[lot.phase]} · termina{' '}
            {formatDayTime(lot.endsAt)}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="tabular block text-[14px] font-medium">
            {formatCents(lot.currentBidCents ?? lot.startingPriceCents)}
          </span>
          <span className={cn('block text-[11.5px]', note.tone)}>{note.text}</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-ink-3" />
      </Link>
      {canCancel(lot) && <CancelLotButton lot={lot} />}
    </li>
  );
}
