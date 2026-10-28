import { cn } from '@/lib/cn';
import { paddleCode } from '../bid-history';

interface PaddleProps {
  pseudonym: string;
  mine?: boolean;
  className?: string;
}

/** A bidder's paddle, as a small mono object: the only identity a bidder has in the room. */
export function Paddle({ pseudonym, mine = false, className }: PaddleProps) {
  return (
    <span
      role="img"
      aria-label={mine ? 'Você' : pseudonym}
      className={cn('inline-flex flex-col items-center', className)}
    >
      <span
        className={cn(
          'grid size-8 place-items-center rounded-full font-mono text-[9.5px] font-bold tracking-tight',
          mine ? 'bg-ink text-bg' : 'bg-chip text-ink-2',
        )}
      >
        {mine ? 'você' : paddleCode(pseudonym).slice(1, 5)}
      </span>
      <span className={cn('h-2 w-1 rounded-b-[2px]', mine ? 'bg-ink' : 'bg-chip')} />
    </span>
  );
}
