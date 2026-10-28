import type { PublicBid } from '@pregao/shared';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';
import { formatClockTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { pluralize } from '@/utils/plural';
import { paddleCode } from '../bid-history';
import { Paddle } from './paddle';

/** The room shows the latest paddles; the rest unfold on request (the audit has them all). */
const RECENT = 5;

const olderLabel = (count: number) =>
  pluralize(count, 'o lance anterior', `os ${count} lances anteriores`);

interface PaddleHistoryProps {
  bids: PublicBid[];
  myPseudonym: string | undefined;
}

/** Paddles raised in the lot, newest on top; a new one slides in. */
export function PaddleHistory({ bids, myPseudonym }: PaddleHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  if (bids.length === 0) {
    return (
      <p className="border-y border-line py-4 text-[14px] text-ink-3">
        Nenhuma raquete levantada ainda. O primeiro lance abre o pregão.
      </p>
    );
  }
  const hidden = bids.length - RECENT;
  const shown = expanded ? bids : bids.slice(0, RECENT);
  return (
    <div>
      <ol className="border-t border-line">
        <AnimatePresence initial={false}>
          {shown.map((bid, index) => {
            const mine = bid.bidderPseudonym === myPseudonym;
            return (
              <motion.li
                key={bid.seq}
                layout="position"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  'flex items-center gap-3 border-b border-line py-2.5',
                  index > 0 && 'text-ink-2',
                )}
              >
                <Paddle pseudonym={bid.bidderPseudonym} mine={mine} />
                <span className="flex grow flex-col">
                  <b className={cn('text-[14.5px] font-[560]', index === 0 && 'text-ink')}>
                    {mine ? 'Você' : `Licitante ${paddleCode(bid.bidderPseudonym)}`}
                  </b>
                  <small className="tabular text-[11.5px] text-ink-3">
                    #{bid.seq} · {formatClockTime(bid.createdAt)}
                  </small>
                </span>
                <span className={cn('tabular text-[15px] font-medium', index === 0 && 'text-ink')}>
                  {formatCents(bid.amountCents)}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="w-full py-3 text-[13px] text-ink-3 transition-colors hover:text-ink"
        >
          {expanded ? 'Mostrar só os recentes' : `Ver ${olderLabel(hidden)}`}
        </button>
      )}
    </div>
  );
}
