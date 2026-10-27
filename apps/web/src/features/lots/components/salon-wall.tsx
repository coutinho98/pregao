import { LotPhase, type LotSummary } from '@pregao/shared';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { ArtworkFrame } from '@/components/artwork/artwork-frame';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { formatLotNumber } from '../format';
import { plaqueStatus } from '../plaque-status';
import { LotPlaque } from './lot-plaque';

// Salon hang: works hang at slightly different heights instead of a rigid grid.
const HANG_OFFSETS = ['mt-0', 'mt-6', 'mt-2', 'mt-10'];

export function SalonWall({ lots }: { lots: LotSummary[] }) {
  const now = new Date();
  return (
    <ul className="columns-1 gap-10 sm:columns-2 lg:columns-3 xl:columns-4">
      {lots.map((lot, index) => (
        <li
          key={lot.id}
          className={cn('mb-12 break-inside-avoid', HANG_OFFSETS[index % HANG_OFFSETS.length])}
        >
          <Link to={paths.lot(lot.id)} className="group block">
            <ArtworkFrame
              src={apiUrl(lot.image.thumbnailUrl)}
              alt={lot.image.altText ?? lot.title}
              width={lot.image.width}
              height={lot.image.height}
              className={cn(
                'transition-transform group-hover:-translate-y-0.5',
                lot.phase === LotPhase.ENDED && 'opacity-70 saturate-50',
              )}
            />
            <LotPlaque
              className="mt-3"
              lotLabel={formatLotNumber(lot.number)}
              title={lot.title}
              artist={lot.artist}
              status={plaqueStatus(lot, now)}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
