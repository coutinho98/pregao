import { useParams } from 'react-router';
import { ArtworkFrame } from '@/components/artwork/artwork-frame';
import { ErrorState } from '@/components/feedback/error-state';
import { apiUrl } from '@/lib/env';
import { errorMessage } from '@/lib/errors';
import { LotFacts } from '../components/lot-facts';
import { LotPlaque } from '../components/lot-plaque';
import { LotTerms } from '../components/lot-terms';
import { formatLotNumber } from '../format';
import { useLot } from '../hooks/use-lot';
import { plaqueStatus } from '../plaque-status';

export function LotPage() {
  const { id = '' } = useParams();
  const { data: lot, isPending, isError, error, refetch } = useLot(id);

  if (isPending)
    return <p className="mx-auto max-w-6xl px-4 py-10 text-nevoa-texto">Carregando lote…</p>;
  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <ArtworkFrame
        src={apiUrl(lot.image.url)}
        alt={lot.image.altText ?? lot.title}
        width={lot.image.width}
        height={lot.image.height}
        priority
        className="self-start"
      />
      <div className="flex flex-col gap-6">
        <LotPlaque
          lotLabel={formatLotNumber(lot.number)}
          title={lot.title}
          artist={lot.artist}
          status={plaqueStatus(lot)}
          className="self-start"
        />
        <h1 className="text-3xl">{lot.title}</h1>
        <LotFacts lot={lot} />
        <LotTerms lot={lot} />
        <a
          href={lot.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start font-semibold text-latao-texto underline underline-offset-4"
        >
          Ver a obra no Art Institute of Chicago
        </a>
      </div>
    </article>
  );
}
