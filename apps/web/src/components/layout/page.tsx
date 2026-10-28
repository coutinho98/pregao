import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';
import { useServerNow } from '@/lib/server-clock';
import { formatClockTime } from '@/utils/date';

interface PageProps {
  children: ReactNode;
  /** Narrow column for text, forms and the room; wide for grids. */
  width?: 'narrow' | 'wide';
  className?: string;
}

/** Every screen enters with a short fade and slide, and ends with the house clock. */
export function Page({ children, width = 'narrow', className }: PageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className={cn(
        'mx-auto w-full px-5 pt-6 pb-36',
        width === 'narrow' ? 'max-w-[560px]' : 'max-w-[1080px]',
        className,
      )}
    >
      {children}
      <Footer />
    </motion.div>
  );
}

function Footer() {
  const now = useServerNow();
  return (
    <footer className="mt-16 flex justify-between text-[12.5px] text-ink-3">
      <span>Verzeilão · bons lances</span>
      <span className="tabular">{formatClockTime(now)}</span>
    </footer>
  );
}
