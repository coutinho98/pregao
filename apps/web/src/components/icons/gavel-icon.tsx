import type { ComponentProps } from 'react';

/** Martelo do leiloeiro. */
export function GavelIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <g fill="currentColor">
        <rect x="6" y="6" width="18" height="10" rx="1.5" transform="rotate(-40 15 11)" />
        <rect x="17" y="15" width="4" height="20" rx="1" transform="rotate(-40 19 25)" />
        <rect x="4" y="34" width="18" height="4" rx="1" />
      </g>
    </svg>
  );
}
