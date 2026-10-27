import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  /** Unique per page: the sliding knob is shared between the options through it. */
  id: string;
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  wide?: boolean;
}

/** Segmented control whose white knob slides to the selected option. */
export function Segmented<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  wide = false,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('gap-0.5 rounded-full bg-chip p-[3px]', wide ? 'flex w-full' : 'inline-flex')}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative inline-flex h-[34px] items-center justify-center rounded-full px-3.5 text-[13.5px] font-medium transition-colors',
              wide && 'flex-1',
              selected ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${id}`}
                className="absolute inset-0 rounded-full bg-card shadow-pill"
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
