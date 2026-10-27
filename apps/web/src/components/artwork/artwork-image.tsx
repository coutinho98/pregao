import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useArtworkZoom } from './use-artwork-zoom';

/**
 * Slot height and image cap per size. sm/md give a fixed slot so a row of works shares one
 * baseline; lg (the lot page) has no slot, so the box follows the painting and starts at the top.
 */
const sizes = {
  sm: { slot: 'h-[140px]', image: 'max-h-full' },
  md: { slot: 'h-[260px]', image: 'max-h-full' },
  lg: { slot: '', image: 'max-h-[min(56vh,440px)] lg:max-h-[min(72vh,620px)]' },
};

const IMG = 'h-auto w-auto max-w-full object-contain';
const SHADOW = 'shadow-[0_18px_32px_-14px_rgb(0_0_0/0.45),0_2px_6px_rgb(0_0_0/0.08)]';
const DROP_SHADOW =
  '[filter:drop-shadow(0_16px_18px_rgb(0_0_0/0.28))_drop-shadow(0_2px_4px_rgb(0_0_0/0.08))]';

interface ArtworkImageProps {
  src: string;
  alt: string;
  size?: keyof typeof sizes;
  /** Ended lots fade out a little. */
  dimmed?: boolean;
  priority?: boolean;
  /** Magnifier that follows the mouse, for the one artwork a page is about. */
  zoom?: boolean;
  /** Small round button pinned to the bottom-right corner (e.g. select in the catalogue). */
  corner?: ReactNode;
  className?: string;
}

/**
 * The artwork straight on the page, catalogue style: never cropped, with a soft shadow,
 * resting on the bottom of its slot so a row of works shares one baseline.
 */
export function ArtworkImage({
  src,
  alt,
  size = 'md',
  dimmed = false,
  priority = false,
  zoom = false,
  corner,
  className,
}: ArtworkImageProps) {
  return (
    <div
      className={cn(
        'relative flex items-end justify-center',
        sizes[size].slot,
        zoom && DROP_SHADOW,
        className,
      )}
    >
      {zoom ? (
        <ZoomImg src={src} alt={alt} priority={priority} className={sizes[size].image} />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            IMG,
            sizes[size].image,
            SHADOW,
            'transition-transform duration-500 ease-ios group-hover:-translate-y-1',
            dimmed && 'opacity-60 grayscale-[0.6]',
          )}
        />
      )}
      {corner && (
        <span className="absolute right-2 bottom-2 z-10 grid size-[30px] place-items-center rounded-full bg-card text-ink shadow-pill transition-transform duration-300 ease-ios group-hover:scale-110">
          {corner}
        </span>
      )}
    </div>
  );
}

interface ZoomImgProps {
  src: string;
  alt: string;
  priority: boolean;
  className: string;
}

function ZoomImg({ src, alt, priority, className }: ZoomImgProps) {
  const { style, handlers } = useArtworkZoom();
  return (
    <motion.img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={style}
      {...handlers}
      className={cn(IMG, className, 'cursor-zoom-in')}
    />
  );
}
