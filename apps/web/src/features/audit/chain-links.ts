import {
  AuditFailure,
  type AuditLocation,
  type AuditResult,
  type AuditTrail,
} from '@pregao/shared';
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
 * A deleted bid has no link of its own, so a placeholder takes its place in the chain.
 */
export function chainLinks(trail: AuditTrail, result: AuditResult): ChainLink[] {
  const missingSeq =
    !result.ok && result.failure === AuditFailure.BID_MISSING && typeof result.at === 'number'
      ? result.at
      : null;
  const bidLinks = trail.bids.map((bid) => ({
    location: bid.seq as AuditLocation,
    key: `bid-${bid.seq}`,
    title: `Lance ${bid.seq} · ${formatCents(bid.amountCents)}`,
    detail: `${bid.bidderPseudonym} · ${formatDayTime(bid.createdAt)}`,
    hash: bid.hash,
  }));
  if (missingSeq !== null) {
    const after = bidLinks.findIndex(({ location }) => (location as number) > missingSeq);
    bidLinks.splice(after === -1 ? bidLinks.length : after, 0, {
      location: missingSeq,
      key: `bid-${missingSeq}-missing`,
      title: `Lance ${missingSeq} · ausente`,
      detail: 'Removido do histórico depois de registrado',
      hash: '—',
    });
  }

  const links: (Omit<ChainLink, 'status'> & { location: AuditLocation })[] = [
    {
      location: 'genesis',
      key: 'genesis',
      title: 'Abertura do lote',
      detail: `Lance inicial ${formatCents(trail.genesis.startingPriceCents)} · abre ${formatDayTime(trail.genesis.startsAt)}`,
      hash: trail.genesis.hash,
    },
    ...bidLinks,
    {
      location: 'head',
      key: 'head',
      title: 'Fechamento assinado',
      detail: `${countLabel(trail.head.bidCount, 'lance', 'lances')} no histórico`,
      hash: trail.head.lastHash,
    },
    ...(trail.receipt
      ? [
          {
            location: 'receipt' as const,
            key: 'receipt',
            title: 'Comprovante de arremate',
            detail: `Arrematado por ${formatCents(trail.receipt.amountCents)}`,
            hash: trail.receipt.finalHash,
          },
        ]
      : []),
  ];
  const failedAt = result.ok ? -1 : links.findIndex(({ location }) => location === result.at);
  const statusOf = (index: number): LinkStatus => {
    if (failedAt === -1 || index < failedAt) return 'ok';
    return index === failedAt ? 'broken' : 'unchecked';
  };
  return links.map(({ location: _location, ...link }, index) => ({
    ...link,
    status: statusOf(index),
  }));
}
