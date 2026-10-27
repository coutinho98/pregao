import { type MyBidEntry, MyBidResult } from '@pregao/shared';
import { Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { Button } from '@/components/ui/button';
import { formatLotNumber } from '@/features/lots/format';
import { useCopyLink } from '@/features/receipts/hooks/use-copy-link';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { resultStyle } from '../my-bid-filters';

export function MyBidRow({ entry }: { entry: MyBidEntry }) {
  const { lot, result, myHighestBidCents, receiptToken } = entry;
  const style = resultStyle[result];
  const copyLink = useCopyLink();

  return (
    <li className="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center">
      <Link to={paths.lot(lot.id)} className="flex min-w-0 grow items-center gap-3">
        <img
          src={apiUrl(lot.image.thumbnailUrl)}
          alt=""
          className="size-14 shrink-0 rounded-[10px] bg-surface object-cover"
        />
        <span className="flex min-w-0 flex-col gap-px">
          <b className="truncate text-[14.5px] font-[560]">{lot.title}</b>
          <span className="truncate text-[12.5px] text-ink-3">
            {formatLotNumber(lot.number)} · encerra {formatDayTime(lot.endsAt)}
          </span>
          <span className={cn('text-[12.5px] font-medium', style.tone)}>{style.label}</span>
        </span>
      </Link>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-right">
          <span className="tabular block text-[14.5px] font-medium">
            {formatCents(lot.currentBidCents ?? myHighestBidCents)}
          </span>
          <span className="tabular block text-[11.5px] text-ink-3">
            seu maior: {formatCents(myHighestBidCents)}
          </span>
        </span>
        <RowAction
          entry={entry}
          onCopy={() => receiptToken && copyLink(paths.receipt(receiptToken))}
        />
      </div>
    </li>
  );
}

function RowAction({ entry, onCopy }: { entry: MyBidEntry; onCopy: () => void }) {
  if (entry.result === MyBidResult.WON && entry.receiptToken) {
    return (
      <span className="flex gap-1.5">
        <Button asChild variant="secondary" size="sm">
          <Link to={paths.receipt(entry.receiptToken)}>Comprovante</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Copiar link do comprovante"
          onClick={onCopy}
        >
          <LinkIcon size={15} />
        </Button>
      </span>
    );
  }
  if (entry.result === MyBidResult.OUTBID) {
    return (
      <Button asChild variant="primary" size="sm">
        <Link to={paths.lot(entry.lot.id)}>Cobrir</Link>
      </Button>
    );
  }
  return null;
}
