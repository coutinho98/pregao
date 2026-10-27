import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xs border border-nevoa bg-transparent px-3 font-serif text-base text-tinta',
        'placeholder:text-nevoa-texto aria-invalid:border-lacre',
        className,
      )}
      {...props}
    />
  );
}
