import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';
import { formatCents } from '@/utils/money';
import { useMyLots } from '../hooks/use-my-lots';
import { lotTotals } from '../my-lot-status';
import { LOT_ROW_COLUMNS, MyLotRow } from './my-lot-row';

const COLUMN_HEADINGS = ['Obra', 'Fase', 'Encerra', 'Valor'];

/** The auctioneer's lots: totals on top, then one row per lot with its phase and result. */
export function MyLots({ onNewLot }: { onNewLot: () => void }) {
  const { data, isPending, isError, error, refetch } = useMyLots();

  if (isPending) return <p className="text-[14px] text-ink-3">Carregando seus lotes…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (data.lots.length === 0) {
    return (
      <EmptyState>
        Você ainda não montou nenhum lote.{' '}
        <button type="button" onClick={onNewLot} className="font-medium text-ink underline">
          Montar o primeiro
        </button>
      </EmptyState>
    );
  }

  const totals = lotTotals(data.lots);
  const figures = [
    { label: 'recebido', value: formatCents(data.totalReceivedCents) },
    { label: 'em pregão', value: String(totals.live) },
    { label: 'agendados', value: String(totals.scheduled) },
    { label: 'arrematados', value: String(totals.sold) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {figures.map(({ label, value }) => (
          <div key={label} className="tile rounded-[18px] p-4">
            <dd className="tabular truncate text-[20px] font-semibold tracking-[-0.02em]">
              {value}
            </dd>
            <dt className="text-[12.5px] text-ink-3">{label}</dt>
          </div>
        ))}
      </dl>
      <div>
        <div
          aria-hidden="true"
          className={cn(
            'hidden border-b border-line pb-2 text-[12px] text-ink-3 sm:grid',
            LOT_ROW_COLUMNS,
          )}
        >
          {COLUMN_HEADINGS.map((heading) => (
            <span key={heading} className={heading === 'Valor' ? 'text-right' : undefined}>
              {heading}
            </span>
          ))}
        </div>
        <ul>
          {data.lots.map((lot) => (
            <MyLotRow key={lot.id} lot={lot} />
          ))}
        </ul>
      </div>
    </div>
  );
}
