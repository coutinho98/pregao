import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLot } from '../api';

export function useLot(id: string) {
  return useQuery({ queryKey: queryKeys.lots.detail(id), queryFn: () => fetchLot(id) });
}
