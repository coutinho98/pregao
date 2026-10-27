import { LOT_SORTS, LotSort } from '@pregao/shared';
import { ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { SORT_PARAM, sortFromParam, sortLabel } from '../showcase-filters';

/** Showcase ordering, kept in the URL (?ordem=) like the phase and the search. */
export function SortSelect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = sortFromParam(searchParams.get(SORT_PARAM));

  const select = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === LotSort.SOON) next.delete(SORT_PARAM);
    else next.set(SORT_PARAM, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <label className="relative inline-flex shrink-0 items-center">
      <span className="sr-only">Ordenar lotes</span>
      <ArrowUpDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 text-ink-3"
      />
      <select
        value={sort}
        onChange={(event) => select(event.target.value)}
        className="h-[42px] appearance-none rounded-[12px] bg-chip pr-3.5 pl-8 text-[13.5px] text-ink outline-none focus-visible:shadow-[0_0_0_2px_var(--ink)]"
      >
        {LOT_SORTS.map((value) => (
          <option key={value} value={value}>
            {sortLabel[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
