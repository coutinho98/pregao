import type { WalletSummary } from '@pregao/shared';
import { formatCents } from '@/utils/money';

const figures: { key: keyof WalletSummary; label: string }[] = [
  { key: 'availableCents', label: 'disponível' },
  { key: 'committedCents', label: 'comprometido' },
  { key: 'totalCents', label: 'total' },
];

/** Three stat tiles and a thin bar split into committed and free balance. */
export function BalanceFigures({ summary }: { summary: WalletSummary }) {
  const committedShare =
    summary.totalCents > 0 ? (summary.committedCents / summary.totalCents) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 gap-2.5">
        {figures.map(({ key, label }) => (
          <div key={key} className="tile rounded-[18px] p-3.5">
            <dd className="tabular truncate text-[17px] font-semibold tracking-[-0.02em] sm:text-[20px]">
              {formatCents(summary[key])}
            </dd>
            <dt className="text-[12px] text-ink-3">{label}</dt>
          </div>
        ))}
      </dl>
      <div
        role="img"
        aria-label={`${Math.round(committedShare)}% do saldo está comprometido em lances`}
        className="h-1 overflow-hidden rounded-full bg-line-strong"
      >
        <div className="h-full rounded-full bg-ink" style={{ width: `${committedShare}%` }} />
      </div>
    </div>
  );
}
