import { LOT_SORTS, LotSort } from '@pregao/shared';
import { ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Select } from '@/components/ui/select';
import { SORT_PARAM, sortFromParam, sortLabel } from '../showcase-filters';

const options = LOT_SORTS.map((value) => ({ value, label: sortLabel[value] }));

/** Showcase ordering, kept in the URL (?ordem=) like the phase and the search. */
export function SortSelect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = sortFromParam(searchParams.get(SORT_PARAM));

  const select = (value: LotSort) => {
    const next = new URLSearchParams(searchParams);
    if (value === LotSort.SOON) next.delete(SORT_PARAM);
    else next.set(SORT_PARAM, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <Select
      label="Ordenar lotes"
      value={sort}
      options={options}
      onChange={select}
      icon={<ArrowUpDown size={14} />}
    />
  );
}
