import type { LedgerEntry } from '@pregao/shared';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { formatLotNumber } from '@/features/lots/format';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { useLedger } from '../hooks/use-ledger';
import { ledgerEntryStyle } from '../ledger-labels';

export function LedgerBook() {
  const ledger = useLedger();

  if (ledger.isPending) return <p className="text-[14px] text-ink-3">Abrindo o extrato…</p>;
  if (ledger.isError) {
    return (
      <ErrorState message={errorMessage(ledger.error)} onRetry={() => void ledger.refetch()} />
    );
  }
  const entries = ledger.data.pages.flatMap((page) => page.entries);
  if (entries.length === 0) {
    return (
      <EmptyState>
        Nenhuma movimentação ainda. Faça um depósito para dar seu primeiro lance.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="border-t border-line">
        {entries.map((entry) => (
          <LedgerLine key={entry.id} entry={entry} />
        ))}
      </ol>
      {ledger.hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          className="self-center"
          disabled={ledger.isFetchingNextPage}
          onClick={() => void ledger.fetchNextPage()}
        >
          {ledger.isFetchingNextPage ? 'Carregando…' : 'Movimentações anteriores'}
        </Button>
      )}
    </div>
  );
}

function LedgerLine({ entry }: { entry: LedgerEntry }) {
  const { label, sign } = ledgerEntryStyle[entry.type];
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line px-0.5 py-3.5 transition-[padding] duration-300 ease-ios hover:pl-2">
      <div className="flex min-w-0 flex-col gap-px">
        <b className="truncate text-[14.5px] font-[560]">{label}</b>
        <span className="truncate text-[12.5px] text-ink-3">
          {formatDayTime(entry.createdAt)}
          {entry.lotId && entry.lotNumber !== null && (
            <>
              {' · '}
              <Link to={paths.lot(entry.lotId)} className="hover:text-ink">
                {formatLotNumber(entry.lotNumber)}, {entry.lotTitle}
              </Link>
            </>
          )}
        </span>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'tabular text-[14.5px] font-medium',
            sign === '+' && 'text-up',
            !sign && 'text-ink-2',
          )}
        >
          {sign && `${sign} `}
          {formatCents(entry.amountCents)}
        </p>
        <p className="tabular text-[11.5px] text-ink-3">
          saldo {formatCents(entry.totalAfterCents)}
        </p>
      </div>
    </li>
  );
}
