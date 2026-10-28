import { useSearchParams } from 'react-router';
import { DEFAULT_TAB, type OfficeTab, officeTabFromParam, TAB_PARAM } from '../office-tabs';

/** The office tab kept in the URL, so a reload or a shared link opens the same tab. */
export function useOfficeTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = officeTabFromParam(searchParams.get(TAB_PARAM));

  const setTab = (next: OfficeTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === DEFAULT_TAB) params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    setSearchParams(params, { replace: true });
  };

  return { tab, setTab };
}
