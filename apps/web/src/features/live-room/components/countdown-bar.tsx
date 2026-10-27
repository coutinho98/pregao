import { cn } from '@/lib/cn';
import type { CountdownView } from '../room-clock';

interface CountdownBarProps {
  view: CountdownView;
  extendedRecently: boolean;
}

/** A bar that empties toward the end; in the last 2 minutes it measures only that window. */
export function CountdownBar({ view, extendedRecently }: CountdownBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between font-label">
        <span className="text-lg font-semibold">{view.label}</span>
        <span className="tabular font-display text-3xl font-bold">{view.remaining}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-xs bg-tinta/15">
        <div
          className={cn(
            'h-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none',
            view.finalStretch ? 'bg-lacre' : 'bg-latao',
          )}
          style={{ width: `${view.fraction * 100}%` }}
        />
      </div>
      {view.finalStretch && !extendedRecently && (
        <p className="text-sm">Um lance agora prorroga o fim em 2 minutos.</p>
      )}
      {extendedRecently && (
        <p className="font-semibold text-latao">Prazo estendido em 2 minutos por lance no fim.</p>
      )}
    </div>
  );
}
