import { cn } from '@/lib/cn';
import { paddleCode } from '../bid-history';

interface PaddleProps {
  pseudonym: string;
  label?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

/** The numbered bidder paddle: the only identity a bidder has in the room. */
export function Paddle({ pseudonym, label, size = 'lg', className }: PaddleProps) {
  const large = size === 'lg';
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        large && 'drop-shadow-[0_8px_14px_rgb(0_0_0/0.35)]',
        className,
      )}
      aria-label={label ?? pseudonym}
      role="img"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-latao font-display font-bold text-sobre-latao',
          large ? 'h-20 w-20 text-lg' : 'h-9 w-9 text-[0.6rem]',
        )}
      >
        {label ?? paddleCode(pseudonym)}
      </div>
      <div className={cn('rounded-b-xs bg-latao/80', large ? 'h-9 w-3' : 'h-3 w-1.5')} />
    </div>
  );
}
