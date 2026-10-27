import type { ReceiptView } from '@pregao/shared';
import { Link as LinkIcon } from 'lucide-react';
import { ArtworkImage } from '@/components/artwork/artwork-image';
import { PaddleMark } from '@/components/icons/paddle-mark';
import { WaxSeal } from '@/components/icons/wax-seal';
import { Button } from '@/components/ui/button';
import { paths } from '@/app/paths';
import { formatLotNumber } from '@/features/lots/format';
import { apiUrl } from '@/lib/env';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import { useCopyLink } from '../hooks/use-copy-link';

/** The sale note: what was sold, for how much, to which paddle, sealed with the final hash. */
export function ReceiptDocument({ receipt }: { receipt: ReceiptView }) {
  const copyLink = useCopyLink();
  const rows = [
    { label: 'Lote', value: formatLotNumber(receipt.lotNumber) },
    { label: 'Raquete vencedora', value: receipt.winnerPseudonym, mono: true },
    { label: 'Lances no lote', value: String(receipt.bidCount), mono: true },
    { label: 'Liquidado em', value: formatDayTime(receipt.settledAt) },
  ];

  return (
    <article className="relative overflow-hidden rounded-[26px] bg-card p-6 shadow-card sm:p-8">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <span className="inline-flex items-center gap-2">
          <PaddleMark className="h-[19px] w-[14px]" />
          <span className="font-mono text-[13px] font-bold tracking-[0.08em]">PREGÃO</span>
        </span>
        <span className="text-[12.5px] text-ink-3">Comprovante de arremate</span>
      </header>

      <div className="grid gap-6 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-end">
        <ArtworkImage
          src={apiUrl(receipt.image.thumbnailUrl)}
          alt={receipt.image.altText ?? receipt.title}
          size="md"
          priority
        />
        <div>
          <h1 className="text-[26px] leading-tight">{receipt.title}</h1>
          {receipt.artist && <p className="mt-1 text-[14px] text-ink-3">{receipt.artist}</p>}
          <p className="mt-5 text-[13px] text-ink-3">Arrematado por</p>
          <p className="tabular text-[40px] leading-[1.1] font-semibold tracking-[-0.03em]">
            {formatCents(receipt.amountCents)}
          </p>
        </div>
      </div>

      <dl className="border-t border-line">
        {rows.map(({ label, value, mono }) => (
          <div
            key={label}
            className="flex justify-between gap-6 border-b border-line py-3 text-[14px]"
          >
            <dt className="text-ink-3">{label}</dt>
            <dd className={mono ? 'tabular' : undefined}>{value}</dd>
          </div>
        ))}
      </dl>

      <footer className="mt-6 flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 text-[12.5px] text-ink-3">
          <p>Hash final da cadeia de lances</p>
          <p className="tabular mt-1 break-all text-ink-2">{receipt.finalHash}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyLink(paths.receipt(receipt.token))}
            >
              <LinkIcon size={14} /> Copiar link
            </Button>
          </div>
        </div>
        <WaxSeal
          mark={receipt.finalHash.slice(0, 6).toUpperCase()}
          className="size-24 shrink-0 text-danger"
        />
      </footer>
    </article>
  );
}
