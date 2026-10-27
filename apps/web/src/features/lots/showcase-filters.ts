import { LotPhase, type PublicLotPhase } from '@pregao/shared';

export interface ShowcaseSection {
  phase: PublicLotPhase;
  slug: string;
  title: string;
  empty: string;
}

/** Order on the wall: in auction first, then upcoming, then hammered. */
export const showcaseSections: ShowcaseSection[] = [
  {
    phase: LotPhase.LIVE,
    slug: 'pregao',
    title: 'Em pregão',
    empty: 'Nenhum lote em pregão agora. Veja as próximas sessões.',
  },
  {
    phase: LotPhase.SCHEDULED,
    slug: 'proximas',
    title: 'Próximas sessões',
    empty: 'Nenhuma sessão marcada por enquanto.',
  },
  {
    phase: LotPhase.ENDED,
    slug: 'martelo',
    title: 'Martelo batido',
    empty: 'Nenhum lote encerrado ainda.',
  },
];

export const PHASE_PARAM = 'fase';
export const QUERY_PARAM = 'q';

/** Sections to show for the ?fase= value: one when it matches, all otherwise. */
export function sectionsForSlug(slug: string | null): ShowcaseSection[] {
  const match = showcaseSections.find((section) => section.slug === slug);
  return match ? [match] : showcaseSections;
}
