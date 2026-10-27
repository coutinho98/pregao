import type { LotDetail } from '@pregao/shared';
import { ArtworkFrame } from '@/components/artwork/artwork-frame';
import { LotFacts } from '@/features/lots/components/lot-facts';
import { apiUrl } from '@/lib/env';

/** The artwork, lit on the wall, with its catalogue entry underneath. */
export function ArtworkSpotlight({ lot }: { lot: LotDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <ArtworkFrame
        src={apiUrl(lot.image.url)}
        alt={lot.image.altText ?? lot.title}
        width={lot.image.width}
        height={lot.image.height}
        priority
        className="mx-auto max-h-[40vh] w-auto max-w-full md:max-h-none [&_img]:max-h-[36vh] [&_img]:w-auto md:[&_img]:max-h-[70vh]"
      />
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-2xl font-semibold leading-tight md:text-3xl">{lot.title}</h1>
        <LotFacts lot={lot} />
        <a
          href={lot.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start font-semibold text-latao underline underline-offset-4"
        >
          Ver a obra no Art Institute of Chicago
        </a>
      </div>
    </div>
  );
}
