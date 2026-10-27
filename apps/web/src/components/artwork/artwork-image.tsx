import type { PointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const sizes = {
  sm: 'h-[140px]',
  md: 'h-[260px]',
  lg: 'h-[min(52vh,440px)]',
};

interface ArtworkImageProps {
  src: string;
  alt: string;
  size?: keyof typeof sizes;
  /** Ended lots fade out a little. */
  dimmed?: boolean;
  priority?: boolean;
  /** Small round button pinned to the bottom-right corner (e.g. select in the catalogue). */
  corner?: ReactNode;
  className?: string;
}

/** Moves the gallery spotlight (--px/--py, 0..1) to where the pointer is over the artwork. */
function followPointer(event: PointerEvent<HTMLElement>): void {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--px', String((event.clientX - box.left) / box.width));
  event.currentTarget.style.setProperty('--py', String((event.clientY - box.top) / box.height));
}

/**
 * The artwork straight on the page, catalogue style: never cropped, with a soft shadow,
 * resting on the bottom of its slot so a row of works shares one baseline. A gallery
 * spotlight follows the pointer over it.
 */
export function ArtworkImage({
  src,
  alt,
  size = 'md',
  dimmed = false,
  priority = false,
  corner,
  className,
}: ArtworkImageProps) {
  return (
    <div className={cn('relative flex items-end justify-center', sizes[size], className)}>
      <span
        onPointerMove={followPointer}
        className="gallery-light flex h-full max-w-full items-end justify-center"
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'h-auto max-h-full w-auto max-w-full object-contain shadow-[0_18px_32px_-14px_rgb(0_0_0/0.45),0_2px_6px_rgb(0_0_0/0.08)] transition-transform duration-500 ease-ios group-hover:-translate-y-1',
            dimmed && 'opacity-60 grayscale-[0.6]',
          )}
        />
      </span>
      {corner && (
        <span className="absolute right-2 bottom-2 z-10 grid size-[30px] place-items-center rounded-full bg-card text-ink shadow-pill transition-transform duration-300 ease-ios group-hover:scale-110">
          {corner}
        </span>
      )}
    </div>
  );
}
