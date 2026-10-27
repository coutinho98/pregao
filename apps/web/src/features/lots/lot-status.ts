import { LotPhase, type LotSummary } from '@pregao/shared';
import { formatWhen } from '@/utils/date';

export type LotStatusKind = 'live' | 'scheduled' | 'ended' | 'hammered';

export interface LotStatus {
  /** What the amount means right now. */
  amountLabel: string;
  amountCents: number;
  kind: LotStatusKind;
  /** Short note in the house's vocabulary: "ao vivo · termina 17:30". */
  note: string;
}

type StatusLot = Pick<
  LotSummary,
  'phase' | 'startsAt' | 'endsAt' | 'startingPriceCents' | 'currentBidCents'
>;

export function lotStatus(lot: StatusLot, now: Date = new Date()): LotStatus {
  const opening = { amountLabel: 'Lance inicial', amountCents: lot.startingPriceCents };

  if (lot.phase === LotPhase.SCHEDULED) {
    return { ...opening, kind: 'scheduled', note: `abre ${formatWhen(lot.startsAt, now)}` };
  }
  if (lot.phase === LotPhase.LIVE) {
    const note = `ao vivo · termina ${formatWhen(lot.endsAt, now)}`;
    if (lot.currentBidCents === null) return { ...opening, kind: 'live', note };
    return { amountLabel: 'Lance atual', amountCents: lot.currentBidCents, kind: 'live', note };
  }
  if (lot.currentBidCents === null)
    return { ...opening, kind: 'ended', note: 'encerrado sem lances' };
  return {
    amountLabel: 'Arrematado',
    amountCents: lot.currentBidCents,
    kind: 'hammered',
    note: 'martelo batido',
  };
}
