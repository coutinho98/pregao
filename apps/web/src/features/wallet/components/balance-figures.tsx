import type { WalletSummary } from '@pregao/shared';
import { formatCents } from '@/utils/money';

const figures: { key: keyof WalletSummary; label: string; hint: string }[] = [
  { key: 'totalCents', label: 'Saldo total', hint: 'Tudo o que você depositou' },
  { key: 'committedCents', label: 'Comprometido', hint: 'Reservado nos lotes que você lidera' },
  { key: 'availableCents', label: 'Disponível', hint: 'Livre para novos lances' },
];

/** The three numbers of the ledger, with the balance bar split in committed (brass) and free. */
export function BalanceFigures({ summary }: { summary: WalletSummary }) {
  const committedShare =
    summary.totalCents > 0 ? (summary.committedCents / summary.totalCents) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid gap-6 sm:grid-cols-3">
        {figures.map(({ key, label, hint }) => (
          <div key={key}>
            <dt className="font-label text-lg font-semibold">{label}</dt>
            <dd className="tabular font-display text-3xl font-bold leading-tight md:text-4xl">
              {formatCents(summary[key])}
            </dd>
            <dd className="text-sm text-nevoa-texto">{hint}</dd>
          </div>
        ))}
      </dl>
      <div
        role="img"
        aria-label={`${Math.round(committedShare)}% do saldo está comprometido`}
        className="flex h-3 w-full overflow-hidden rounded-xs bg-selo/25"
      >
        <div className="h-full bg-latao" style={{ width: `${committedShare}%` }} />
      </div>
    </div>
  );
}
