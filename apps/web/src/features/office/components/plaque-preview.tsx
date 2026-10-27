import { type CatalogItem, LotPhase } from '@pregao/shared';
import { type Control, useWatch } from 'react-hook-form';
import { LotPlaque } from '@/features/lots/components/lot-plaque';
import { plaqueStatus } from '@/features/lots/plaque-status';
import { parseBrlToCents } from '@/utils/money';
import type { LotFormInput, LotFormValues } from '../schemas';

interface PlaquePreviewProps {
  item: CatalogItem;
  control: Control<LotFormInput, unknown, LotFormValues>;
}

/** The plaque as it will hang on the wall, updated while the auctioneer types. */
export function PlaquePreview({ item, control }: PlaquePreviewProps) {
  const [startingPrice, startsAt, endsAt] = useWatch({
    control,
    name: ['startingPrice', 'startsAt', 'endsAt'],
  });
  const opensLater = startsAt !== '' && new Date(startsAt) > new Date();
  const status = plaqueStatus({
    phase: opensLater ? LotPhase.SCHEDULED : LotPhase.LIVE,
    startsAt: startsAt || new Date().toISOString(),
    endsAt: endsAt || new Date().toISOString(),
    startingPriceCents: parseBrlToCents(startingPrice) ?? 0,
    currentBidCents: null,
  });

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-label text-sm font-semibold text-nevoa-texto">
        Prévia da plaquinha
      </figcaption>
      <LotPlaque
        lotLabel="Novo lote"
        title={item.title}
        artist={item.artist}
        status={status}
        className="self-start"
      />
    </figure>
  );
}
