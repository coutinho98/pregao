import { LotSort, type PublicLotPhase } from '@pregao/shared';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLotPage } from '../api';

export function useLotPage(phase: PublicLotPhase, q: string, sort: LotSort = LotSort.SOON) {
  return useQuery({
    queryKey: queryKeys.lots.page(phase, q, sort),
    queryFn: () => fetchLotPage(phase, q, sort),
  });
}
