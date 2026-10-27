import type { LotSummary } from '@pregao/shared';
import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { useServerNow } from '@/lib/server-clock';
import { LotCard } from './lot-card';

const grid = 'grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3';

export function LotGrid({ lots }: { lots: LotSummary[] }) {
  const now = useServerNow(30_000);
  return (
    <ul className={grid}>
      {lots.map((lot, index) => (
        <motion.li
          key={lot.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: Math.min(index, 8) * 0.04 }}
        >
          <LotCard lot={lot} now={now} />
        </motion.li>
      ))}
    </ul>
  );
}

export function LotGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando lotes" className={grid}>
      {[0, 1, 2].map((key) => (
        <div key={key}>
          <div className="tile h-[260px] motion-safe:animate-pulse" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-chip" />
          <div className="mt-2 h-3 w-1/3 rounded-full bg-chip" />
        </div>
      ))}
    </div>
  );
}
