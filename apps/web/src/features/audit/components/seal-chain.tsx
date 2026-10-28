import { motion } from 'motion/react';
import { WaxSeal } from '@/components/icons/wax-seal';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';
import type { ChainLink, LinkStatus } from '../chain-links';

const sealTone: Record<LinkStatus, string> = {
  ok: 'text-up',
  broken: 'text-danger',
  unchecked: 'text-ink-3/50',
};

/** One seal per link, tied by a thread; seals appear one after the other as if checked. */
export function SealChain({ links }: { links: ChainLink[] }) {
  return (
    <ol className="relative flex flex-col">
      {links.map((link, index) => (
        <motion.li
          key={link.key}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: EASE, delay: Math.min(index, 20) * 0.06 }}
          className="relative flex gap-4 pb-5 last:pb-0"
        >
          {index < links.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-11 bottom-0 left-[21px] w-px',
                link.status === 'ok' ? 'bg-up/40' : 'bg-line-strong',
              )}
            />
          )}
          <WaxSeal
            mark={link.hash.slice(0, 4).toUpperCase()}
            broken={link.status === 'broken'}
            className={cn('size-11 shrink-0', sealTone[link.status])}
          />
          <div className={cn('min-w-0 pt-1.5', link.status === 'unchecked' && 'text-ink-3')}>
            <p
              className={cn('text-[14.5px] font-[560]', link.status === 'broken' && 'text-danger')}
            >
              {link.title}
            </p>
            <p className="text-[12.5px] text-ink-3">{link.detail}</p>
            <p className="tabular mt-0.5 truncate text-[12px] text-ink-3">{link.hash}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
