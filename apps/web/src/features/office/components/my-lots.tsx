import { LotResult } from '@pregao/shared';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { errorMessage } from '@/lib/errors';
import { formatCents } from '@/utils/money';
import { useMyLots } from '../hooks/use-my-lots';
import { countResults } from '../my-lot-status';
import { MyLotRow } from './my-lot-row';

export function MyLots() {
  const { data, isPending, isError, error, refetch } = useMyLots();

  if (isPending) return <p className="text-[14px] text-ink-3">Carregando seus lotes…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (data.lots.length === 0) return <EmptyState>Você ainda não montou nenhum lote.</EmptyState>;

  const results = countResults(data.lots);
  const figures = [
    { label: 'recebido', value: formatCents(data.totalReceivedCents) },
    { label: 'arrematados', value: String(results[LotResult.SOLD]) },
    { label: 'sem lances', value: String(results[LotResult.UNSOLD]) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-2.5">
        {figures.map(({ label, value }) => (
          <div key={label} className="tile rounded-[18px] p-3.5">
            <dd className="tabular truncate text-[18px] font-semibold tracking-[-0.02em] sm:text-[20px]">
              {value}
            </dd>
            <dt className="text-[12px] text-ink-3">{label}</dt>
          </div>
        ))}
      </dl>
      <ul className="border-t border-line">
        {data.lots.map((lot) => (
          <MyLotRow key={lot.id} lot={lot} />
        ))}
      </ul>
    </div>
  );
}
