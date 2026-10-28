import { DropdownMenu } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Dropdown menu in the house style (same card as the Select list); Radix handles focus and keys. */
export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({ className, ...props }: ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          'menu-in z-[60] min-w-56 rounded-[16px] bg-card p-1.5 shadow-card',
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

export function MenuItem({ className, ...props }: ComponentProps<typeof DropdownMenu.Item>) {
  return (
    <DropdownMenu.Item
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13.5px] text-ink-2 outline-none select-none data-[disabled]:cursor-default data-[disabled]:opacity-50 data-[highlighted]:bg-surface data-[highlighted]:text-ink',
        className,
      )}
      {...props}
    />
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="mx-1 my-1.5 h-px bg-line" />;
}
