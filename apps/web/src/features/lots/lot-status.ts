import { LotPhase, type LotSummary } from '@pregao/shared';
import { formatWhen } from '@/utils/date';
import { formatCents } from '@/utils/money';

export interface PlaqueStatus {
  /** The amount shown big on the plaque. */
  amountLabel: string;
  amountCents: number;
  /** Short line under the amount, in the house's vocabulary. */
  note: string;
  live: boolean;
}

type PlaqueLot = Pick<
  LotSummary,
  'phase' | 'startsAt' | 'endsAt' | 'startingPriceCents' | 'currentBidCents'
>;

export function plaqueStatus(lot: PlaqueLot, now: Date = new Date()): PlaqueStatus {
  const opening = { amountLabel: 'Lance inicial', amountCents: lot.startingPriceCents };

  if (lot.phase === LotPhase.SCHEDULED) {
    return { ...opening, note: `Abre ${formatWhen(lot.startsAt, now)}`, live: false };
  }
  if (lot.phase === LotPhase.LIVE) {
    if (lot.currentBidCents === null) {
      return { ...opening, note: `Em pregão · termina ${formatWhen(lot.endsAt, now)}`, live: true };
    }
    return {
      amountLabel: 'Lance atual',
      amountCents: lot.currentBidCents,
      note: `Em pregão · termina ${formatWhen(lot.endsAt, now)}`,
      live: true,
    };
  }
  if (lot.currentBidCents === null)
    return { ...opening, note: 'Encerrado sem lances', live: false };
  return {
    amountLabel: 'Martelo batido',
    amountCents: lot.currentBidCents,
    note: `Arrematado por ${formatCents(lot.currentBidCents)}`,
    live: false,
  };
}
