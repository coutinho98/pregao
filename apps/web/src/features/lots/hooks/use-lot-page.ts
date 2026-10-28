import { LotSort, type PublicLotPhase } from '@pregao/shared';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLotPage } from '../api';

export function useLotPage(phase: PublicLotPhase, q: string, sort: LotSort = LotSort.SOON) {
  return useQuery({
    queryKey: queryKeys.lots.page(phase, q, sort),
    queryFn: () => fetchLotPage(phase, q, sort),
    // While a new search loads, keep the current results on screen (same tab and order only).
    placeholderData: (previous, previousQuery) => {
      const [, , previousPhase, , previousSort] = previousQuery?.queryKey ?? [];
      return previousPhase === phase && previousSort === sort ? previous : undefined;
    },
  });
}
