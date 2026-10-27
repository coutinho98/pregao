import { BidStanding } from '@pregao/shared';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';

interface StandingBannerProps {
  standing: BidStanding;
  position: number | null;
  totalBidders: number;
}

const bannerByStanding: Partial<Record<BidStanding, { text: string; dot: string }>> = {
  [BidStanding.WINNING]: { text: 'Você está ganhando', dot: 'text-up' },
  [BidStanding.OUTBID]: { text: 'Você foi superado', dot: 'text-danger' },
};

export function StandingBanner({ standing, position, totalBidders }: StandingBannerProps) {
  const banner = bannerByStanding[standing];
  return (
    <AnimatePresence mode="wait" initial={false}>
      {banner && (
        <motion.div
          key={standing}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex items-center gap-3 rounded-[18px] bg-card px-4 py-3.5 shadow-pill"
        >
          <span className={cn('live-dot', banner.dot)} aria-hidden="true" />
          <b className={cn('grow font-semibold', standing === BidStanding.OUTBID && 'text-danger')}>
            {banner.text}
          </b>
          {position !== null && (
            <span className="tabular text-[13px] text-ink-2">
              {position}º de {totalBidders}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
