import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xs font-label font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-parede text-sobre-parede hover:bg-tinta',
        brass: 'bg-latao text-sobre-latao hover:brightness-95',
        outline: 'border border-nevoa bg-transparent hover:border-tinta',
        ghost: 'bg-transparent hover:bg-tinta/5',
        onWall: 'border border-sobre-parede/30 text-sobre-parede hover:border-latao',
      },
      size: {
        sm: 'h-9 px-3 text-base',
        md: 'h-11 px-5 text-lg',
        lg: 'h-14 px-6 text-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
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
