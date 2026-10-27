import { useSearchParams } from 'react-router';
import { Segmented } from '@/components/ui/segmented';
import { PHASE_PARAM, sectionForSlug, showcaseSections } from '../showcase-filters';

const options = showcaseSections.map(({ slug, label }) => ({ value: slug, label }));
const defaultSlug = showcaseSections[0].slug;

/** Phase filter kept in the URL (?fase=), so it survives reloads and can be shared. */
export function PhaseFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = sectionForSlug(searchParams.get(PHASE_PARAM)).slug;

  const select = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === defaultSlug) next.delete(PHASE_PARAM);
    else next.set(PHASE_PARAM, slug);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
      <Segmented
        id="phase"
        label="Filtrar por fase"
        options={options}
        value={current}
        onChange={select}
      />
    </div>
  );
}
