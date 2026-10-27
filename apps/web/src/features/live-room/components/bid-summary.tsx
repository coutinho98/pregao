import { type LotDetail, LotPhase } from '@pregao/shared';
import type { ReactNode } from 'react';
import { Chip } from '@/components/ui/chip';
import { formatCents } from '@/utils/money';
import { paddleCode } from '../bid-history';

interface BidSummaryProps {
  lot: LotDetail;
  phase: LotPhase;
  leaderPseudonym: string | undefined;
  leaderIsMe: boolean;
}

/** The state of the lot in one sentence, with the numbers in chips. */
export function BidSummary({ lot, phase, leaderPseudonym, leaderIsMe }: BidSummaryProps) {
  const leader = leaderIsMe
    ? 'você'
    : leaderPseudonym && `Licitante ${paddleCode(leaderPseudonym)}`;
  const amount = (
    <Chip className="tabular">{formatCents(lot.currentBidCents ?? lot.startingPriceCents)}</Chip>
  );

  if (lot.currentBidCents === null) {
    if (phase === LotPhase.ENDED) return <Sentence>Encerrado sem lances.</Sentence>;
    return <Sentence>Ainda sem lances. O primeiro precisa ser de pelo menos {amount}.</Sentence>;
  }
  if (phase === LotPhase.ENDED) {
    return (
      <Sentence>
        Arrematado por {amount}, com a raquete de <Chip className="tabular">{leader}</Chip>.
      </Sentence>
    );
  }
  return (
    <Sentence>
      Lance atual de {amount}, de <Chip className="tabular">{leader}</Chip>. São{' '}
      <b className="font-[560] text-ink">{lot.bidCount}</b>{' '}
      {lot.bidCount === 1 ? 'lance' : 'lances'} até agora.
    </Sentence>
  );
}

function Sentence({ children }: { children: ReactNode }) {
  return <p className="text-[15.5px] leading-[1.7] text-ink-2">{children}</p>;
}
