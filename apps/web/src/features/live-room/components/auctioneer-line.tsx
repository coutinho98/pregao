import { Gavel } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';

/** The auctioneer's voice: one line that changes as the lot unfolds. */
export function AuctioneerLine({ call }: { call: string }) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[52px] items-center gap-3 rounded-[16px] bg-surface px-3.5 py-2.5"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card text-ink shadow-pill">
        <Gavel size={14} strokeWidth={2} />
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={call}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="text-[13.5px] leading-snug text-ink-2"
        >
          {call}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
