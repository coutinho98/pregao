import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchMyLots } from '../api';

export function useMyLots() {
  return useQuery({ queryKey: queryKeys.lots.mine, queryFn: fetchMyLots });
}
