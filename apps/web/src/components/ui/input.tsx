import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-[42px] w-full rounded-[12px] border-0 bg-chip px-3.5 text-[14.5px] text-ink outline-none transition-[background-color,box-shadow]',
        'focus:bg-card focus:shadow-[0_0_0_2px_var(--ink)] aria-invalid:shadow-[0_0_0_1.5px_var(--danger)]',
        className,
      )}
      {...props}
    />
  );
}
