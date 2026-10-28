import { useSearchParams } from 'react-router';
import { Page } from '@/components/layout/page';
import { PhaseFilter } from '../components/phase-filter';
import { ShowcaseIntro } from '../components/showcase-intro';
import { ShowcaseSearch } from '../components/showcase-search';
import { WallSection } from '../components/wall-section';
import { SortSelect } from '../components/sort-select';
import {
  PHASE_PARAM,
  QUERY_PARAM,
  SORT_PARAM,
  sectionForSlug,
  sortFromParam,
} from '../showcase-filters';

export function ShowcasePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';
  const section = sectionForSlug(searchParams.get(PHASE_PARAM));
  const sort = sortFromParam(searchParams.get(SORT_PARAM));

  return (
    <Page width="wide">
      <h1 className="sr-only">Vitrine de lotes</h1>
      <ShowcaseIntro />
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PhaseFilter />
        <div className="flex gap-2">
          <ShowcaseSearch />
          <SortSelect />
        </div>
      </div>
      <WallSection section={section} query={query} sort={sort} />
    </Page>
  );
}
