import { type LotDetail, LotPhase } from '@pregao/shared';
import { formatCents } from '@/utils/money';
import { Paddle } from './paddle';

interface CurrentBidProps {
  lot: LotDetail;
  phase: LotPhase;
  leaderPseudonym: string | undefined;
  leaderIsMe: boolean;
}

function amountLabel(phase: LotPhase, hasBids: boolean): string {
  if (!hasBids) return phase === LotPhase.ENDED ? 'Encerrado sem lances' : 'Lance inicial';
  return phase === LotPhase.ENDED ? 'Martelo batido em' : 'Lance atual';
}

export function CurrentBid({ lot, phase, leaderPseudonym, leaderIsMe }: CurrentBidProps) {
  const amount = lot.currentBidCents ?? lot.startingPriceCents;
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="font-label text-lg font-semibold">
          {amountLabel(phase, lot.currentBidCents !== null)}
        </p>
        <p className="tabular font-display text-4xl font-extrabold leading-none text-latao md:text-5xl">
          {formatCents(amount)}
        </p>
      </div>
      {leaderPseudonym && (
        <Paddle
          key={lot.bidCount}
          pseudonym={leaderPseudonym}
          label={leaderIsMe ? 'Você' : undefined}
          className="animate-paddle-raise"
        />
      )}
    </div>
  );
}
