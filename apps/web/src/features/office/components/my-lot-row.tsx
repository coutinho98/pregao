import { type AuctioneerLot, LotPhase } from '@pregao/shared';
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

/** Artwork, phase, end, amount and the cancel action, shared by the rows and their heading. */
export const LOT_ROW_COLUMNS = 'sm:grid-cols-[minmax(0,1fr)_8rem_8.5rem_7.5rem_2.75rem] sm:gap-4';

export function MyLotRow({ lot }: { lot: AuctioneerLot }) {
  const note = lotNote(lot);
  const live = lot.phase === LotPhase.LIVE;
  return (
    <li
      className={cn(
        'flex items-center gap-2 border-b border-line sm:grid sm:items-center',
        LOT_ROW_COLUMNS,
      )}
    >
      <Link
        to={paths.lot(lot.id)}
        className="flex min-w-0 grow items-center gap-3 py-3 transition-opacity hover:opacity-75 sm:col-span-4 sm:grid sm:grid-cols-subgrid sm:items-center"
      >
        <span className="flex min-w-0 items-center gap-3">
          <img
            src={apiUrl(lot.image.thumbnailUrl)}
            alt=""
            className="size-11 shrink-0 rounded-[10px] bg-surface object-cover"
          />
          <span className="flex min-w-0 flex-col gap-px">
            <b className="artwork-title truncate text-[16px]">{lot.title}</b>
            <span className="truncate text-[12.5px] text-ink-3">
              {formatLotNumber(lot.number)}
              <span className="sm:hidden"> · {phaseLabel[lot.phase]}</span>
            </span>
          </span>
        </span>
        <span
          className={cn(
            'hidden items-center gap-1.5 text-[13px] sm:inline-flex',
            live ? 'text-up' : 'text-ink-2',
          )}
        >
          {live && <span className="live-dot" aria-hidden="true" />}
          {phaseLabel[lot.phase]}
        </span>
        <span className="tabular hidden text-[13px] text-ink-2 sm:block">
          {formatDayTime(lot.endsAt)}
        </span>
        <span className="ml-auto shrink-0 text-right">
          <span className="tabular block text-[14px] font-medium">
            {formatCents(lot.currentBidCents ?? lot.startingPriceCents)}
          </span>
          <span className={cn('block text-[11.5px]', note.tone)}>{note.text}</span>
        </span>
      </Link>
      <span className="flex w-9 shrink-0 justify-end">
        {canCancel(lot) && <CancelLotButton lot={lot} />}
      </span>
    </li>
  );
}
