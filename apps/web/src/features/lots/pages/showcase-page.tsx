import { useSearchParams } from 'react-router';
import { Page } from '@/components/layout/page';
import { PhaseFilter } from '../components/phase-filter';
import { ShowcaseIntro } from '../components/showcase-intro';
import { ShowcaseSearch } from '../components/showcase-search';
import { WallSection } from '../components/wall-section';
import { PHASE_PARAM, QUERY_PARAM, sectionsForSlug } from '../showcase-filters';

export function ShowcasePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';
  const sections = sectionsForSlug(searchParams.get(PHASE_PARAM));

  return (
    <Page width="wide">
      <h1 className="sr-only">Vitrine de lotes</h1>
      <ShowcaseIntro />
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PhaseFilter />
        <ShowcaseSearch />
      </div>
      <div className="flex flex-col gap-12">
        {sections.map((section) => (
          <WallSection key={section.phase} section={section} query={query} />
        ))}
      </div>
    </Page>
  );
}
