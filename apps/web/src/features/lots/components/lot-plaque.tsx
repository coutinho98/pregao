import { cn } from '@/lib/cn';
import { formatCents } from '@/utils/money';
import type { PlaqueStatus } from '../plaque-status';
import { LiveDot } from './live-dot';

interface LotPlaqueProps {
  lotLabel: string;
  title: string;
  artist: string | null;
  status: PlaqueStatus;
  className?: string;
}

/** The brass plaque hung under each artwork: lot number, title and the amount that matters now. */
export function LotPlaque({ lotLabel, title, artist, status, className }: LotPlaqueProps) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full flex-col rounded-xs bg-latao px-3 py-2 text-tinta',
        className,
      )}
    >
      <span className="font-display text-lg font-bold leading-none">{lotLabel}</span>
      <span className="mt-1 line-clamp-2 font-serif text-sm italic leading-snug">
        {title}
        {artist && <span className="not-italic">, {artist}</span>}
      </span>
      <span className="mt-2 font-label text-xs font-semibold">{status.amountLabel}</span>
      <span className="tabular font-display text-2xl font-bold leading-none">
        {formatCents(status.amountCents)}
      </span>
      <span className="mt-1 flex items-center gap-1.5 font-label text-sm">
        {status.live && <LiveDot />}
        {status.note}
      </span>
    </div>
  );
}
