import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE } from '@/lib/motion';

interface BlurInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'p' | 'span' | 'h1';
}

/**
 * Comes into focus: from blurred, slightly enlarged and transparent to crisp. With reduced
 * motion it only fades.
 */
export function BlurIn({ children, delay = 0, className, as = 'div' }: BlurInProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(14px)', scale: 1.06 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}
