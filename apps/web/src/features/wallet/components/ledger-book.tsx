import type { LedgerEntry } from '@pregao/shared';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { formatLotNumber } from '@/features/lots/format';
import { errorMessage } from '@/lib/errors';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { useLedger } from '../hooks/use-ledger';
import { ledgerEntryStyle } from '../ledger-labels';

export function LedgerBook() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLedger();

  if (isPending) return <p className="text-nevoa-texto">Abrindo o livro-caixa…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  const entries = data.pages.flatMap((page) => page.entries);
  if (entries.length === 0) {
    return (
      <EmptyState>
        Nenhuma movimentação ainda. Faça um depósito para dar seu primeiro lance.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="divide-y divide-nevoa/40 border-y border-nevoa/40">
        {entries.map((entry) => (
          <LedgerLine key={entry.id} entry={entry} />
        ))}
      </ol>
      {hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? 'Carregando…' : 'Movimentações anteriores'}
        </Button>
      )}
    </div>
  );
}

function LedgerLine({ entry }: { entry: LedgerEntry }) {
  const { label, sign } = ledgerEntryStyle[entry.type];
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-3 sm:grid-cols-[8rem_1fr_auto_auto]">
      <span className="tabular text-sm text-nevoa-texto sm:text-base">
        {formatDayTime(entry.createdAt)}
      </span>
      <span className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
        {label}
        {entry.lotId && entry.lotNumber !== null && (
          <>
            {' · '}
            <Link to={paths.lot(entry.lotId)} className="italic underline-offset-4 hover:underline">
              {formatLotNumber(entry.lotNumber)}, {entry.lotTitle}
            </Link>
          </>
        )}
      </span>
      <span className="tabular row-start-1 text-right font-semibold sm:row-start-auto">
        {sign && <span aria-hidden="true">{sign} </span>}
        {formatCents(entry.amountCents)}
      </span>
      <span className="tabular hidden text-right text-sm text-nevoa-texto sm:block">
        saldo {formatCents(entry.totalAfterCents)}
      </span>
    </li>
  );
}
