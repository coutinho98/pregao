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
    <dl className="border-t border-line">
      {facts.map(({ key, label }) => (
        <div key={key} className="flex justify-between gap-6 border-b border-line py-3 text-[14px]">
          <dt className="shrink-0 text-ink-3">{label}</dt>
          <dd className="text-right">{lot[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
