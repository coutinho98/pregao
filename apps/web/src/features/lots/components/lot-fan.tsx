import type { LotSummary } from '@pregao/shared';
import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { apiUrl } from '@/lib/env';
import { EASE } from '@/lib/motion';

const SPREAD = 66;
const TILT = 6;
const MOTION = { duration: 0.6, ease: EASE };

/** The hand deals its cards one after another on mount only; hover is never delayed. */
const hand = {
  dealt: { transition: { delayChildren: 0.2, staggerChildren: 0.06 } },
};

/** A hand of lot cards fanned out on the table; hovering one lifts it out of the hand. */
export function LotFan({ lots }: { lots: LotSummary[] }) {
  const reduce = useReducedMotion();
  const middle = (lots.length - 1) / 2;

  return (
    <motion.div
      className="relative flex h-[190px] items-center justify-center"
      initial={reduce ? false : 'stacked'}
      animate="dealt"
      variants={hand}
    >
      {lots.map((lot, index) => {
        const offset = index - middle;
        const rest = { x: offset * SPREAD, y: Math.abs(offset) * 9, rotate: offset * TILT };
        return (
          <motion.div
            key={lot.id}
            className="absolute z-(--depth) hover:z-50"
            style={{ '--depth': lots.length - Math.ceil(Math.abs(offset)) } as CSSProperties}
            variants={{
              stacked: { x: 0, y: 12, rotate: 0, opacity: 0 },
              dealt: { ...rest, opacity: 1, transition: MOTION },
            }}
            whileHover={{ y: rest.y - 14, rotate: 0, transition: MOTION }}
          >
            <Link
              to={paths.lot(lot.id)}
              aria-label={lot.title}
              className="block overflow-hidden rounded-[10px] bg-card p-1 shadow-card"
            >
              <img
                src={apiUrl(lot.image.thumbnailUrl)}
                alt=""
                className="h-[132px] w-[104px] rounded-[7px] object-cover"
              />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
