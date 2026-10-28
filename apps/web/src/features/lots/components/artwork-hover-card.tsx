import type { LotSummary } from '@pregao/shared';
import { AnimatePresence, motion, type MotionValue } from 'motion/react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';
import { formatDimensions } from '../format';

export const HOVER_CARD_WIDTH = 288;
/** Used to decide when to open upwards; the card is usually shorter. */
export const HOVER_CARD_HEIGHT = 320;

interface ArtworkHoverCardProps {
  lot: LotSummary;
  open: boolean;
  flipY: boolean;
  position: { x: MotionValue<number>; y: MotionValue<number> };
}

/**
 * The catalogue note of an artwork, shown beside the pointer while it is over the work: who
 * made it and when, what it is made of, its movement, origin and size, and a few lines from the
 * museum about its story.
 */
export function ArtworkHoverCard({ lot, open, flipY, position }: ArtworkHoverCardProps) {
  const making = [lot.dateDisplay, lot.medium].filter(Boolean).join(' · ');
  const context = [
    lot.style,
    lot.placeOfOrigin,
    lot.dimensions && formatDimensions(lot.dimensions),
  ].filter(Boolean);
  return (
    <motion.div
      aria-hidden="true"
      style={{ ...position, width: HOVER_CARD_WIDTH }}
      className="pointer-events-none absolute top-0 left-0 z-30"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className={cn(
              'glass rounded-[18px] p-4 text-left',
              flipY ? 'origin-bottom -translate-y-full' : 'origin-top',
            )}
          >
            <p className="artwork-title text-[17px] leading-snug text-ink">{lot.title}</p>
            {lot.artist && (
              <p className="mt-0.5 text-[12.5px] text-ink-2">
                {lot.artist}
                {lot.artistBio && <span className="text-ink-3"> ({lot.artistBio})</span>}
              </p>
            )}
            {making && <p className="text-[12.5px] text-ink-3">{making}</p>}
            {context.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1">
                {context.map((fact) => (
                  <span
                    key={fact}
                    className="rounded-full bg-chip px-2 py-0.5 text-[11.5px] text-ink-2"
                  >
                    {fact}
                  </span>
                ))}
              </p>
            )}
            {lot.story && (
              <>
                <p className="mt-3 line-clamp-6 text-[13px] leading-relaxed text-ink-2">
                  {lot.story}
                </p>
                <p className="mt-2 text-[11.5px] text-ink-3">
                  Do catálogo do Art Institute of Chicago
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
