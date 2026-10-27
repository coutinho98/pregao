import type { PublicLotPhase } from '@pregao/shared';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLotPage } from '../api';

export function useLotPage(phase: PublicLotPhase, q: string) {
  return useQuery({
    queryKey: queryKeys.lots.page(phase, q),
    queryFn: () => fetchLotPage(phase, q),
  });
}
