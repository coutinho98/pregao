import { type AuctioneerLot, LotPhase, LotResult } from '@pregao/shared';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { formatLotNumber } from '@/features/lots/format';
import { phaseLabel } from '@/features/lots/phase-labels';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { errorMessage } from '@/lib/errors';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { useMyLots } from '../hooks/use-my-lots';

const resultLabel: Record<LotResult, { text: string; tone: string }> = {
  [LotResult.SOLD]: { text: 'Arrematado', tone: 'text-up' },
  [LotResult.UNSOLD]: { text: 'Sem lances', tone: 'text-ink-3' },
};

export function MyLots() {
  const { data, isPending, isError, error, refetch } = useMyLots();

  if (isPending) return <p className="text-[14px] text-ink-3">Carregando seus lotes…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (data.lots.length === 0) return <EmptyState>Você ainda não montou nenhum lote.</EmptyState>;

  const sold = data.lots.filter((lot) => lot.result === LotResult.SOLD).length;
  const unsold = data.lots.filter((lot) => lot.result === LotResult.UNSOLD).length;
  const figures = [
    { label: 'recebido', value: formatCents(data.totalReceivedCents) },
    { label: 'arrematados', value: String(sold) },
    { label: 'sem lances', value: String(unsold) },
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

function MyLotRow({ lot }: { lot: AuctioneerLot }) {
  const amount = lot.currentBidCents ?? lot.startingPriceCents;
  const result = lot.result && resultLabel[lot.result];
  return (
    <li className="border-b border-line">
      <Link
        to={paths.lot(lot.id)}
        className="flex items-center gap-3 px-0.5 py-3 transition-[padding] duration-300 ease-ios hover:pl-2"
      >
        <img
          src={apiUrl(lot.image.thumbnailUrl)}
          alt=""
          className="size-11 shrink-0 rounded-[10px] bg-surface object-cover"
        />
        <span className="flex min-w-0 grow flex-col gap-px">
          <b className="truncate text-[14.5px] font-[560]">{lot.title}</b>
          <span className="truncate text-[12.5px] text-ink-3">
            {formatLotNumber(lot.number)} · {phaseLabel[lot.phase]} · termina{' '}
            {formatDayTime(lot.endsAt)}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="tabular block text-[14px] font-medium">{formatCents(amount)}</span>
          <span className={cn('block text-[11.5px]', result ? result.tone : 'text-ink-3')}>
            {result?.text ??
              (lot.phase === LotPhase.SCHEDULED ? 'inicial' : `${lot.bidCount} lances`)}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-ink-3" />
      </Link>
    </li>
  );
}
