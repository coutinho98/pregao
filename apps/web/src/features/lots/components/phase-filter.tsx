import { useSearchParams } from 'react-router';
import { Segmented } from '@/components/ui/segmented';
import { ALL_SLUG, PHASE_PARAM, showcaseSections } from '../showcase-filters';

const options = [
  { value: ALL_SLUG, label: 'Todos' },
  ...showcaseSections.map(({ slug, label }) => ({ value: slug, label })),
];

/** Phase filter kept in the URL (?fase=), so it survives reloads and can be shared. */
export function PhaseFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get(PHASE_PARAM) ?? ALL_SLUG;

  const select = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === ALL_SLUG) next.delete(PHASE_PARAM);
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
