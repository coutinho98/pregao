import type { ComponentProps } from 'react';

/** Raquete de licitante: oval com cabo. */
export function PaddleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 40" aria-hidden="true" {...props}>
      <ellipse cx="16" cy="14" rx="13" ry="13" fill="currentColor" />
      <rect x="13.5" y="25" width="5" height="14" rx="1" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
