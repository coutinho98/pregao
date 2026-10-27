import type { LotSummary } from '@pregao/shared';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { formatLotNumber } from '@/features/lots/format';
import { phaseLabel } from '@/features/lots/phase-labels';
import { errorMessage } from '@/lib/errors';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { useMyLots } from '../hooks/use-my-lots';

export function MyLots() {
  const { data, isPending, isError, error, refetch } = useMyLots();

  if (isPending) return <p className="text-nevoa-texto">Carregando seus lotes…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (data.length === 0) return <EmptyState>Você ainda não montou nenhum lote.</EmptyState>;
  return <MyLotsTable lots={data} />;
}

function MyLotsTable({ lots }: { lots: LotSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <thead className="font-label text-base text-nevoa-texto">
          <tr className="border-b border-nevoa">
            <th scope="col" className="py-2 pr-4 font-semibold">
              Lote
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Obra
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Situação
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              Lance inicial
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-semibold">
              Lance atual
            </th>
            <th scope="col" className="py-2 font-semibold">
              Encerramento
            </th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-b border-nevoa/40">
              <td className="tabular py-3 pr-4 font-display text-lg font-bold">
                <Link to={paths.lot(lot.id)} className="underline-offset-4 hover:underline">
                  {formatLotNumber(lot.number)}
                </Link>
              </td>
              <td className="py-3 pr-4 italic">{lot.title}</td>
              <td className="py-3 pr-4 font-label">{phaseLabel[lot.phase]}</td>
              <td className="tabular py-3 pr-4 text-right">
                {formatCents(lot.startingPriceCents)}
              </td>
              <td className="tabular py-3 pr-4 text-right">
                {lot.currentBidCents === null ? '—' : formatCents(lot.currentBidCents)}
              </td>
              <td className="tabular py-3">{formatDayTime(lot.endsAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
