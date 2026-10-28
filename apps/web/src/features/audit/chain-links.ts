import type { AuditLocation, AuditResult, AuditTrail } from '@pregao/shared';
import { formatCents } from '@/utils/money';
import { formatDayTime } from '@/utils/date';
import { countLabel } from '@/utils/plural';

export type LinkStatus = 'ok' | 'broken' | 'unchecked';

export interface ChainLink {
  key: string;
  title: string;
  detail: string;
  hash: string;
  status: LinkStatus;
}

/**
 * The chain as the page draws it: genesis, each bid, the signed head and the receipt.
 * Links before the failure are verified, the failing one is broken, the rest unchecked.
 */
export function chainLinks(trail: AuditTrail, result: AuditResult): ChainLink[] {
  const order: AuditLocation[] = [
    'genesis',
    ...trail.bids.map((bid) => bid.seq),
    'head',
    ...(trail.receipt ? (['receipt'] as const) : []),
  ];
  const failedAt = result.ok ? -1 : order.findIndex((location) => location === result.at);
  const statusOf = (index: number): LinkStatus => {
    if (failedAt === -1 || index < failedAt) return 'ok';
    return index === failedAt ? 'broken' : 'unchecked';
  };

  const links: Omit<ChainLink, 'status'>[] = [
    {
      key: 'genesis',
      title: 'Abertura do lote',
      detail: `Lance inicial ${formatCents(trail.genesis.startingPriceCents)} · abre ${formatDayTime(trail.genesis.startsAt)}`,
      hash: trail.genesis.hash,
    },
    ...trail.bids.map((bid) => ({
      key: `bid-${bid.seq}`,
      title: `Lance ${bid.seq} · ${formatCents(bid.amountCents)}`,
      detail: `${bid.bidderPseudonym} · ${formatDayTime(bid.createdAt)}`,
      hash: bid.hash,
    })),
    {
      key: 'head',
      title: 'Fechamento assinado',
      detail: `${countLabel(trail.head.bidCount, 'lance', 'lances')} no histórico`,
      hash: trail.head.lastHash,
    },
    ...(trail.receipt
      ? [
          {
            key: 'receipt',
            title: 'Comprovante de arremate',
            detail: `Arrematado por ${formatCents(trail.receipt.amountCents)}`,
            hash: trail.receipt.finalHash,
          },
        ]
      : []),
  ];
  return links.map((link, index) => ({ ...link, status: statusOf(index) }));
}
