import type { PublicBid } from '@pregao/shared';
import { cn } from '@/lib/cn';
import { formatClockTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { paddleCode } from '../bid-history';
import { Paddle } from './paddle';

interface PaddleHistoryProps {
  bids: PublicBid[];
  myPseudonym: string | undefined;
}

/** "Raquetes levantadas": every bid, newest on top; the top one rises in when it arrives. */
export function PaddleHistory({ bids, myPseudonym }: PaddleHistoryProps) {
  if (bids.length === 0) {
    return (
      <p className="text-nevoa-texto">
        Nenhuma raquete levantada ainda. O primeiro lance abre o pregão.
      </p>
    );
  }
  return (
    <ol className="flex flex-col divide-y divide-sobre-parede/15">
      {bids.map((bid, index) => {
        const mine = bid.bidderPseudonym === myPseudonym;
        return (
          <li
            key={bid.seq}
            className={cn(
              'grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-2',
              index === 0 && 'animate-paddle-raise',
              index > 0 && 'opacity-75',
            )}
          >
            <Paddle pseudonym={bid.bidderPseudonym} size="sm" label={mine ? 'Você' : undefined} />
            <span className="font-label text-lg font-semibold">
              {mine ? 'Você' : paddleCode(bid.bidderPseudonym)}
              <span className="tabular ml-3 font-serif text-sm font-normal text-nevoa-texto">
                {formatClockTime(bid.createdAt)}
              </span>
            </span>
            <span className="tabular font-display text-xl font-bold">
              {formatCents(bid.amountCents)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
