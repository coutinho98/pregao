import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchCatalog } from '../api';

export const MIN_CATALOG_QUERY_LENGTH = 2;

export function useCatalogSearch(q: string, page: number) {
  return useQuery({
    queryKey: queryKeys.catalog.search(q, page),
    queryFn: () => searchCatalog(q, page),
    enabled: q.length >= MIN_CATALOG_QUERY_LENGTH,
    staleTime: 5 * 60_000,
    // While the next search loads, keep the current results on screen instead of a skeleton.
    placeholderData: (previous) => previous,
  });
}
