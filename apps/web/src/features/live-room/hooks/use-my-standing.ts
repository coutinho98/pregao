import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchMyStanding } from '../api';

/** Only bidders have a standing; spectators and auctioneers skip the request. */
export function useMyStanding(lotId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.lots.standing(lotId),
    queryFn: () => fetchMyStanding(lotId),
    enabled,
  });
}
