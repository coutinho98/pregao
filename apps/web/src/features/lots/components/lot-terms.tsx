import type { LotDetail } from '@pregao/shared';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';

export function LotTerms({ lot }: { lot: LotDetail }) {
  const terms = [
    { label: 'Lance inicial', value: formatCents(lot.startingPriceCents) },
    { label: 'Incremento mínimo', value: formatCents(lot.minIncrementCents) },
    { label: 'Abertura', value: formatDayTime(lot.startsAt) },
    { label: 'Encerramento', value: formatDayTime(lot.endsAt) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-nevoa/40 py-4">
      {terms.map(({ label, value }) => (
        <div key={label}>
          <dt className="font-label text-sm font-semibold text-nevoa-texto">{label}</dt>
          <dd className="tabular font-display text-xl font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
