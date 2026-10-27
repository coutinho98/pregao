import { cn } from '@/lib/cn';
import type { CountdownView } from '../room-clock';

const TICKS = 40;

/** Mono clock with a row of ticks that switch off as time runs out. */
export function RoomCountdown({ view }: { view: CountdownView }) {
  const lit = Math.round(view.fraction * TICKS);
  const litColor = view.finalStretch ? 'bg-danger' : 'bg-ink';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-ink-3">{view.label}</span>
        <span
          className={cn(
            'tabular text-[28px] leading-none font-[560] tracking-[-0.03em]',
            view.finalStretch && 'text-danger',
          )}
        >
          {view.remaining}
        </span>
      </div>
      <div className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, index) => (
          <i
            key={index}
            className={cn(
              'h-1 flex-1 rounded-[2px] transition-colors duration-300',
              index < lit ? litColor : 'bg-line-strong',
            )}
          />
        ))}
      </div>
    </div>
  );
}
