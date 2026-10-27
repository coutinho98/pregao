import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchMyBids } from '../api';

export function useMyBids() {
  return useQuery({ queryKey: queryKeys.myBids, queryFn: fetchMyBids });
}
