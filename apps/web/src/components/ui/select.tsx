import { Check, ChevronDown } from 'lucide-react';
import { Select as RadixSelect } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  /** Accessible name of the control (the visible text is the chosen option). */
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  icon?: ReactNode;
  className?: string;
}

/**
 * A select in the house style: the field looks like the other chips, and the list opens as
 * a card instead of the browser's native menu. Radix keeps keyboard and screen-reader use.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  className,
}: SelectProps<T>) {
  return (
    <RadixSelect.Root value={value} onValueChange={(next) => onChange(next as T)}>
      <RadixSelect.Trigger
        aria-label={label}
        className={cn(
          'group inline-flex h-[42px] shrink-0 items-center gap-2 rounded-[12px] bg-chip px-3.5 text-[13.5px] text-ink transition-colors hover:bg-surface-2 data-[state=open]:bg-surface-2',
          className,
        )}
      >
        {icon && (
          <span aria-hidden="true" className="text-ink-3">
            {icon}
          </span>
        )}
        <RadixSelect.Value />
        <RadixSelect.Icon className="text-ink-3 transition-transform duration-200 ease-ios group-data-[state=open]:rotate-180">
          <ChevronDown size={15} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          align="end"
          sideOffset={6}
          className="menu-in z-[60] min-w-[var(--radix-select-trigger-width)] rounded-[16px] bg-card p-1.5 shadow-card"
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex h-9 cursor-pointer items-center justify-between gap-6 rounded-[10px] px-2.5 text-[13.5px] text-ink-2 outline-none select-none data-[highlighted]:bg-surface data-[highlighted]:text-ink data-[state=checked]:font-medium data-[state=checked]:text-ink"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
