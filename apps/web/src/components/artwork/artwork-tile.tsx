import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Tile size, and the moulding (--frame) and mat (--mat) of the gilded frame at that size. */
const sizes = {
  sm: { tile: 'h-[140px] rounded-[22px] p-4', frame: { '--frame': '3px', '--mat': '4px' } },
  md: { tile: 'h-[260px] p-7', frame: { '--frame': '5px', '--mat': '8px' } },
  lg: { tile: 'h-[min(52vh,440px)] p-8', frame: { '--frame': '9px', '--mat': '16px' } },
} satisfies Record<string, { tile: string; frame: Record<string, string> }>;

interface ArtworkTileProps {
  src: string;
  alt: string;
  size?: keyof typeof sizes;
  /** Ended lots fade out a little. */
  dimmed?: boolean;
  priority?: boolean;
  /** Round button pinned to the bottom-right corner (e.g. an arrow on clickable tiles). */
  corner?: ReactNode;
  className?: string;
}

/** The artwork hanging in a grey tile, in a gilded frame that follows its real proportions. */
export function ArtworkTile({
  src,
  alt,
  size = 'md',
  dimmed = false,
  priority = false,
  corner,
  className,
}: ArtworkTileProps) {
  const { tile, frame } = sizes[size];
  return (
    <div
      className={cn(
        'tile relative flex items-center justify-center overflow-hidden',
        tile,
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={frame as CSSProperties}
        className={cn(
          'gilded-frame h-auto max-h-full w-auto max-w-full object-contain transition-transform duration-500 ease-ios group-hover:-translate-y-0.5',
          dimmed && 'opacity-60 grayscale-[0.6]',
        )}
      />
      {corner && (
        <span className="absolute right-3.5 bottom-3.5 grid size-[34px] place-items-center rounded-full bg-card text-ink shadow-pill transition-transform duration-300 ease-ios group-hover:scale-110">
          {corner}
        </span>
      )}
    </div>
  );
}
