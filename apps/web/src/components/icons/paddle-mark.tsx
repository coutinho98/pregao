import type { ComponentProps } from 'react';

/** The house mark: a bidder paddle, in the current text colour. */
export function PaddleMark(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 22" aria-hidden="true" {...props}>
      <circle cx="8" cy="7.5" r="7" fill="currentColor" />
      <circle cx="8" cy="7.5" r="3" fill="var(--bg)" />
      <rect x="6.6" y="13.5" width="2.8" height="8" rx="1.4" fill="currentColor" />
    </svg>
  );
}
