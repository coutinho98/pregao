import type { LotSummary } from '@pregao/shared';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { apiUrl } from '@/lib/env';
import { EASE } from '@/lib/motion';

const SPREAD = 66;
const TILT = 6;

/** A hand of lot cards fanned out on the table; hovering one lifts it out of the hand. */
export function LotFan({ lots }: { lots: LotSummary[] }) {
  const reduce = useReducedMotion();
  const middle = (lots.length - 1) / 2;

  return (
    <div className="relative flex h-[190px] items-center justify-center">
      {lots.map((lot, index) => {
        const offset = index - middle;
        const rest = { x: offset * SPREAD, y: Math.abs(offset) * 9, rotate: offset * TILT };
        return (
          <motion.div
            key={lot.id}
            className="absolute"
            style={{ zIndex: lots.length - Math.ceil(Math.abs(offset)) }}
            initial={reduce ? false : { x: 0, y: 12, rotate: 0, opacity: 0 }}
            animate={{ ...rest, opacity: 1 }}
            whileHover={{ y: rest.y - 14, rotate: 0, zIndex: lots.length }}
            transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : 0.2 + index * 0.06 }}
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
    </div>
  );
}
