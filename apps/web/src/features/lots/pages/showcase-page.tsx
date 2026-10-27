import { useSearchParams } from 'react-router';
import { PhaseFilter } from '../components/phase-filter';
import { ShowcaseSearch } from '../components/showcase-search';
import { WallSection } from '../components/wall-section';
import { PHASE_PARAM, QUERY_PARAM, sectionsForSlug } from '../showcase-filters';

export function ShowcasePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';
  const sections = sectionsForSlug(searchParams.get(PHASE_PARAM));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10">
      <h1 className="sr-only">Vitrine de lotes</h1>
      <div className="flex flex-col gap-4 border-b border-nevoa/40 pb-6 md:flex-row md:items-center md:justify-between">
        <PhaseFilter />
        <ShowcaseSearch />
      </div>
      {sections.map((section) => (
        <WallSection key={section.phase} section={section} query={query} />
      ))}
    </div>
  );
}
