import { type CatalogItem, LotPhase } from '@pregao/shared';
import { type Control, useWatch } from 'react-hook-form';
import { ArtworkImage } from '@/components/artwork/artwork-image';
import { lotStatus } from '@/features/lots/lot-status';
import { formatCents, parseBrlToCents } from '@/utils/money';
import { catalogThumbnailUrl } from '../api';
import type { LotFormInput, LotFormValues } from '../schemas';

interface LotPreviewProps {
  item: CatalogItem;
  control: Control<LotFormInput, unknown, LotFormValues>;
}

/** The lot as it will look in the showcase, updated while the auctioneer types. */
export function LotPreview({ item, control }: LotPreviewProps) {
  const [startingPrice, startsAt, endsAt] = useWatch({
    control,
    name: ['startingPrice', 'startsAt', 'endsAt'],
  });
  const opensLater = startsAt !== '' && new Date(startsAt) > new Date();
  const status = lotStatus({
    phase: opensLater ? LotPhase.SCHEDULED : LotPhase.LIVE,
    startsAt: startsAt || new Date().toISOString(),
    endsAt: endsAt || new Date().toISOString(),
    startingPriceCents: parseBrlToCents(startingPrice) ?? 0,
    currentBidCents: null,
  });

  return (
    <figure>
      <ArtworkImage
        src={catalogThumbnailUrl(item.externalId)}
        alt={item.altText ?? item.title}
        size="sm"
      />
      <figcaption className="flex items-start justify-between gap-3 px-1 pt-3">
        <span className="min-w-0">
          <b className="block truncate text-[14px] font-semibold">{item.title}</b>
          <span className="block truncate text-[12px] text-ink-3">
            Novo lote{item.artist && ` · ${item.artist}`}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="tabular block text-[13.5px] font-medium">
            {formatCents(status.amountCents)}
          </span>
          <span className="block text-[12px] text-ink-3">{status.note}</span>
        </span>
      </figcaption>
    </figure>
  );
}
