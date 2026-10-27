import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const HANDLES = [
  '-top-[3px] -left-[3px]',
  '-top-[3px] -right-[3px]',
  '-bottom-[3px] -left-[3px]',
  '-bottom-[3px] -right-[3px]',
];

/**
 * Wraps a word in an editor-style selection box with four corner handles, the way a
 * design tool marks the selected layer. Purely decorative emphasis.
 */
export function SelectionMark({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative mx-0.5 inline-block px-1.5 align-baseline outline outline-1 -outline-offset-1 outline-[var(--focus)] [background:color-mix(in_srgb,var(--focus)_7%,transparent)]',
        className,
      )}
    >
      {children}
      {HANDLES.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={cn('absolute size-[6px] border border-[var(--focus)] bg-bg', position)}
        />
      ))}
    </span>
  );
}
