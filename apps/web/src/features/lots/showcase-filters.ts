import { LOT_SORTS, LotPhase, LotSort, type PublicLotPhase } from '@pregao/shared';

export interface ShowcaseSection {
  phase: PublicLotPhase;
  slug: string;
  /** Short label for the segmented control. */
  label: string;
  title: string;
  empty: string;
}

/** Order on the page: in auction first, then upcoming, then ended. */
export const showcaseSections: ShowcaseSection[] = [
  {
    phase: LotPhase.LIVE,
    slug: 'pregao',
    label: 'Em pregão',
    title: 'Em pregão',
    empty: 'Nenhum lote em pregão agora. Veja as próximas sessões.',
  },
  {
    phase: LotPhase.SCHEDULED,
    slug: 'proximos',
    label: 'Próximos',
    title: 'Próximas sessões',
    empty: 'Nenhuma sessão marcada por enquanto.',
  },
  {
    phase: LotPhase.ENDED,
    slug: 'encerrados',
    label: 'Encerrados',
    title: 'Encerrados',
    empty: 'Nenhum lote encerrado ainda.',
  },
];

export const ALL_SLUG = 'todos';
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

/** Sections to show for the ?fase= value: one when it matches, all otherwise. */
export function sectionsForSlug(slug: string | null): ShowcaseSection[] {
  const match = showcaseSections.find((section) => section.slug === slug);
  return match ? [match] : showcaseSections;
}
