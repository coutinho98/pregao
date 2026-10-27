import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { HandNote } from '@/components/ui/hand-note';
import { EASE } from '@/lib/motion';

const CALLS = ['Bata o martelo', 'Dou-lhe uma…', 'Dou-lhe duas…', 'Vendido!'];
const RAISED = 26;

/**
 * A small toy for the showcase: each click strikes the gavel on its block and the
 * auctioneer calls the next line, until "Vendido!".
 */
export function GavelCall() {
  const [strikes, setStrikes] = useState(0);
  const reduce = useReducedMotion();
  const call = CALLS[strikes % CALLS.length];

  return (
    <button
      type="button"
      onClick={() => setStrikes((count) => count + 1)}
      aria-label={`Martelo do leiloeiro: ${call}`}
      className="tile group flex w-full flex-col items-center gap-2 px-6 pt-7 pb-5 transition-colors hover:bg-surface-2"
    >
      <svg viewBox="0 0 160 120" className="h-[110px] w-auto text-ink" aria-hidden="true">
        <ellipse cx="80" cy="110" rx="46" ry="5" fill="currentColor" opacity="0.08" />
        <rect x="38" y="92" width="84" height="14" rx="3" fill="currentColor" opacity="0.85" />
        <rect x="44" y="88" width="72" height="6" rx="2" fill="currentColor" />
        {!reduce && strikes > 0 && (
          <motion.g
            key={`impact-${strikes}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.45, times: [0, 0.35, 1] }}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M30 80 L22 74" />
            <path d="M28 90 L18 90" />
            <path d="M84 80 L92 72" />
          </motion.g>
        )}
        <motion.g
          key={`gavel-${strikes}`}
          style={{ originX: 1, originY: 0.5 }}
          initial={{ rotate: RAISED }}
          animate={reduce || strikes === 0 ? { rotate: RAISED } : { rotate: [RAISED, -2, RAISED] }}
          transition={{ duration: 0.5, times: [0, 0.32, 1], ease: EASE }}
        >
          <rect x="66" y="62" width="74" height="8" rx="4" fill="currentColor" opacity="0.75" />
          <rect x="40" y="44" width="32" height="44" rx="7" fill="currentColor" />
          <rect x="40" y="52" width="32" height="5" fill="var(--bg)" opacity="0.25" />
          <rect x="40" y="75" width="32" height="5" fill="var(--bg)" opacity="0.25" />
        </motion.g>
      </svg>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={call}
          aria-live="polite"
          initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(6px)', y: 4 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <HandNote className={call === 'Vendido!' ? 'text-ink' : undefined}>{call}</HandNote>
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
