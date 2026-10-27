import { cn } from '@/lib/cn';
import type { CountdownView } from '../room-clock';

const TICKS = 32;

interface RoomCountdownProps {
  view: CountdownView;
  extendedRecently: boolean;
}

/** Big mono clock with a row of ticks that switch off as time runs out. */
export function RoomCountdown({ view, extendedRecently }: RoomCountdownProps) {
  const lit = Math.round(view.fraction * TICKS);
  const litColor = view.finalStretch ? 'bg-danger' : 'bg-ink';
  return (
    <div className="flex flex-col items-center">
      <p className="text-[13px] text-ink-3">{view.label}</p>
      <p
        className={cn(
          'tabular my-1 text-[48px] leading-[1.1] font-[560] tracking-[-0.03em]',
          view.finalStretch && 'text-danger',
        )}
      >
        {view.remaining}
      </p>
      <div className="flex max-w-[340px] flex-wrap justify-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, index) => (
          <i
            key={index}
            className={cn(
              'h-1 w-[9px] rounded-[2px] transition-colors duration-300',
              index < lit ? litColor : 'bg-line-strong',
            )}
          />
        ))}
      </div>
      <p className="mt-3 min-h-5 text-[13px] text-ink-2">
        {extendedRecently && 'Prazo estendido em 2 minutos por lance no fim.'}
        {!extendedRecently && view.finalStretch && 'Um lance agora prorroga o fim em 2 minutos.'}
      </p>
    </div>
  );
}
