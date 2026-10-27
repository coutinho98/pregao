import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-[550] transition-[background-color,opacity,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-ink shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)] hover:opacity-90',
        secondary: 'bg-chip text-ink hover:bg-surface-2',
        ghost: 'bg-transparent text-ink-2 hover:bg-surface hover:text-ink',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 rounded-[10px] px-3 text-[13px]',
        md: 'h-[46px] rounded-[14px] px-[18px] text-[14.5px]',
        pill: 'h-[46px] rounded-full px-5 text-[14.5px]',
        icon: 'size-[34px] rounded-full',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
