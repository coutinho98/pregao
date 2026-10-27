import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A handwritten aside, like the auctioneer's pencil note in the margin of the catalogue. */
export function HandNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block font-[family-name:var(--font-hand)] text-[1.35em] leading-none text-ink-2',
        className,
      )}
    >
      {children}
    </span>
  );
}
