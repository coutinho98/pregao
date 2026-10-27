import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const sizes = {
  sm: 'h-[140px] rounded-[22px] p-4',
  md: 'h-[260px] p-7',
  lg: 'h-[min(52vh,440px)] p-8',
};

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

/** The artwork as an object resting in a grey tile: never cropped, with a soft shadow. */
export function ArtworkTile({
  src,
  alt,
  size = 'md',
  dimmed = false,
  priority = false,
  corner,
  className,
}: ArtworkTileProps) {
  return (
    <div
      className={cn(
        'tile relative grid place-items-center overflow-hidden',
        sizes[size],
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'h-full w-full object-contain drop-shadow-[0_16px_20px_rgb(0_0_0/0.25)] transition-transform duration-500 ease-ios',
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
