import type { LotDetail } from '@pregao/shared';

type ArtworkFacts = Pick<
  LotDetail,
  'artist' | 'dateDisplay' | 'medium' | 'dimensions' | 'placeOfOrigin'
>;

const factLabels: { key: keyof ArtworkFacts; label: string }[] = [
  { key: 'artist', label: 'Artista' },
  { key: 'dateDisplay', label: 'Data' },
  { key: 'medium', label: 'Técnica' },
  { key: 'dimensions', label: 'Dimensões' },
  { key: 'placeOfOrigin', label: 'Origem' },
];

/** Catalogue entry of the artwork, as recorded when the lot was created. */
export function LotFacts({ lot }: { lot: ArtworkFacts }) {
  const facts = factLabels.filter(({ key }) => lot[key]);
  return (
    <dl className="grid max-w-[70ch] grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      {facts.map(({ key, label }) => (
        <div key={key} className="contents">
          <dt className="font-label text-base font-semibold text-nevoa-texto">{label}</dt>
          <dd>{lot[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
