import type { ComponentProps } from 'react';

const POINTS = 28;

/** Wavy outline of a wax seal: a circle whose radius ripples around the edge. */
function sealOutline(radius: number, ripple: number): string {
  const steps = POINTS * 4;
  return Array.from({ length: steps }, (_, step) => {
    const angle = (step / steps) * Math.PI * 2;
    const r = radius + Math.sin(angle * POINTS) * ripple;
    return `${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

const OUTLINE = sealOutline(44, 2.4);

interface WaxSealProps extends ComponentProps<'svg'> {
  /** Short text pressed into the seal, e.g. the first characters of a hash. */
  mark: string;
  broken?: boolean;
}

/** Monochrome wax seal: closes a receipt, and in the audit shows a link of the chain. */
export function WaxSeal({ mark, broken = false, ...props }: WaxSealProps) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`Lacre ${mark}`} {...props}>
      <polygon points={OUTLINE} fill="currentColor" />
      <circle
        cx="50"
        cy="50"
        r="33"
        fill="none"
        stroke="var(--bg)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <circle
        cx="50"
        cy="50"
        r="29"
        fill="none"
        stroke="var(--bg)"
        strokeOpacity="0.2"
        strokeWidth="0.8"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fill="var(--bg)"
        fontFamily="'Geist Mono Variable', monospace"
        fontSize="11"
        fontWeight="700"
        letterSpacing="1"
      >
        {mark}
      </text>
      {broken && (
        <path
          d="M30 12 L46 40 L38 52 L58 64 L50 88"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
