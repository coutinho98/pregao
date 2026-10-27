import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Grey pill that sits inside a sentence and holds the data: "Há [3 lotes] em pregão". */
export function Chip({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-[8px] bg-chip px-[9px] align-baseline text-[0.92em] leading-[1.6] text-ink',
        className,
      )}
      {...props}
    />
  );
}
