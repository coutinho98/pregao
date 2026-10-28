import type { LotSummary } from '@pregao/shared';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { ArtworkImage } from '@/components/artwork/artwork-image';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { formatCents } from '@/utils/money';
import { formatLotNumber } from '../format';
import { lotStatus } from '../lot-status';

export function LotCard({ lot, now }: { lot: LotSummary; now: Date }) {
  const status = lotStatus(lot, now);
  return (
    <Link to={paths.lot(lot.id)} className="group block">
      <ArtworkImage
        src={apiUrl(lot.image.thumbnailUrl)}
        alt={lot.image.altText ?? lot.title}
        dimmed={status.kind === 'ended' || status.kind === 'hammered'}
      />
      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <div className="min-w-0">
          <h2 className="artwork-title truncate text-[16px]">{lot.title}</h2>
          <p className="truncate text-[12.5px] text-ink-3">
            {formatLotNumber(lot.number)}
            {lot.artist && ` · ${lot.artist}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular text-[14px] font-medium">{formatCents(status.amountCents)}</p>
          <p
            className={cn(
              'inline-flex items-center gap-1.5 text-[12px]',
              status.kind === 'live' ? 'text-up' : 'text-ink-3',
            )}
          >
            {status.kind === 'live' && <span className="live-dot" aria-hidden="true" />}
            {status.note}
          </p>
        </div>
      </div>
    </Link>
  );
}
