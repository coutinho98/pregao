import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLotBids } from '../api';

export function useLotBids(lotId: string) {
  return useQuery({ queryKey: queryKeys.lots.bids(lotId), queryFn: () => fetchLotBids(lotId) });
}
