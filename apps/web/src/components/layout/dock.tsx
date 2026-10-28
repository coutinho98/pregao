import { AnimatePresence, motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';
import type { NavItem } from './nav-items';

const MOVE = { duration: 0.34, ease: EASE };
const MotionLink = motion.create(NavLink);

/** Floating navigation capsule: the active item grows and shows its name. */
export function Dock({ items, className }: { items: NavItem[]; className?: string }) {
  const { pathname } = useLocation();
  return (
    <motion.nav
      layout
      transition={MOVE}
      aria-label="Navegação"
      style={{ borderRadius: 999 }}
      className={cn(
        'glass fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 mx-auto flex w-max gap-0.5 p-[5px]',
        className,
      )}
    >
      {items.map(({ to, label, icon: Icon, matches }) => {
        const active = matches(pathname);
        return (
          <MotionLink
            key={to}
            to={to}
            layout="position"
            transition={MOVE}
            aria-label={label}
            className={cn(
              'relative flex h-[42px] min-w-[46px] items-center justify-center rounded-full px-[13px] text-[13.5px] font-[560] transition-colors',
              active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {active && (
              <motion.span
                layoutId="dock-pill"
                transition={MOVE}
                style={{ borderRadius: 999 }}
                className="absolute inset-0 bg-chip"
              />
            )}
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className="relative z-10" />
            <AnimatePresence initial={false}>
              {active && (
                <motion.span
                  className="relative z-10 overflow-hidden whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ ...MOVE, opacity: { duration: 0.2 } }}
                >
                  <span className="inline-block pl-[7px]">{label}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </MotionLink>
        );
      })}
    </motion.nav>
  );
}
