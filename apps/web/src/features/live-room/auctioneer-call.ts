import { LotPhase, type PublicBid } from '@pregao/shared';
import { formatCents } from '@/utils/money';
import { paddleCode } from './bid-history';

export interface CallInput {
  phase: LotPhase;
  /** Newest first. */
  bids: PublicBid[];
  remainingMs: number;
  extendedRecently: boolean;
  myPseudonym: string | undefined;
  startingPriceCents: number;
  minNextBidCents: number;
}

/** Final seconds in which the auctioneer starts calling "going once, going twice". */
const GOING_ONCE_MS = 30_000;
const GOING_TWICE_MS = 10_000;

/** What the auctioneer would be saying right now, from the room's live state. */
export function auctioneerCall({
  phase,
  bids,
  remainingMs,
  extendedRecently,
  myPseudonym,
  startingPriceCents,
  minNextBidCents,
}: CallInput): string {
  const leader = bids[0];
  const holder = (bid: PublicBid) =>
    bid.bidderPseudonym === myPseudonym ? 'você' : `a raquete ${paddleCode(bid.bidderPseudonym)}`;

  if (phase === LotPhase.CANCELLED) return 'Lote retirado do pregão.';
  if (phase === LotPhase.SCHEDULED) return 'O pregão deste lote ainda não começou.';
  if (phase === LotPhase.ENDED) {
    if (!leader) return 'Encerrado sem lances. O lote não foi vendido.';
    return `Vendido! Martelo batido em ${formatCents(leader.amountCents)} para ${holder(leader)}.`;
  }
  if (!leader) return `Abrimos com ${formatCents(startingPriceCents)}. Quem dá o primeiro lance?`;
  if (extendedRecently) return 'Lance no fim! Prazo prorrogado em 2 minutos.';

  const amount = formatCents(leader.amountCents);
  if (remainingMs <= GOING_TWICE_MS) return `Dou-lhe duas… ${amount} para ${holder(leader)}.`;
  if (remainingMs <= GOING_ONCE_MS) return `Dou-lhe uma… ${amount} para ${holder(leader)}.`;
  return `${amount} com ${holder(leader)}. Quem dá mais? Próximo lance: ${formatCents(minNextBidCents)}.`;
}
