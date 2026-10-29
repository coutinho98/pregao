import { LOT_SORTS, LotPhase, LotSort, type PublicLotPhase } from '@pregao/shared';

export interface ShowcaseSection {
  phase: PublicLotPhase;
  slug: string;
  label: string;
  empty: string;
}

/** Tabs of the showcase, in order; the first one is the default. */
export const showcaseSections: [ShowcaseSection, ...ShowcaseSection[]] = [
  {
    phase: LotPhase.LIVE,
    slug: 'pregao',
    label: 'Em pregão',
    empty: 'Nenhum lote em pregão agora. Veja as próximas sessões.',
  },
  {
    phase: LotPhase.SCHEDULED,
    slug: 'proximos',
    label: 'Próximos',
    empty: 'Nenhuma sessão marcada por enquanto.',
  },
  {
    phase: LotPhase.ENDED,
    slug: 'encerrados',
    label: 'Encerrados',
    empty: 'Nenhum lote encerrado ainda.',
  },
];

export const PHASE_PARAM = 'fase';
export const QUERY_PARAM = 'q';
export const SORT_PARAM = 'ordem';

export const sortLabel: Record<LotSort, string> = {
  [LotSort.SOON]: 'Encerrando antes',
  [LotSort.NEWEST]: 'Mais recentes',
  [LotSort.MOST_BIDS]: 'Mais disputados',
  [LotSort.HIGHEST_BID]: 'Maior lance',
};

export function sortFromParam(value: string | null): LotSort {
  return LOT_SORTS.find((sort) => sort === value) ?? LotSort.SOON;
}

/** Section for the ?fase= value; unknown or missing values open the default tab. */
export function sectionForSlug(slug: string | null): ShowcaseSection {
  return showcaseSections.find((section) => section.slug === slug) ?? showcaseSections[0];
}

/** Showcase URL opened on a tab, optionally with a search. */
export function showcaseUrl(phase: PublicLotPhase, query = ''): string {
  const slug = showcaseSections.find((section) => section.phase === phase)?.slug ?? '';
  const params = new URLSearchParams({ [PHASE_PARAM]: slug });
  if (query) params.set(QUERY_PARAM, query);
  return `/?${params}`;
}
