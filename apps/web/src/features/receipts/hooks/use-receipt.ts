import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchReceipt } from '../api';

export function useReceipt(token: string) {
  return useQuery({
    queryKey: queryKeys.receipt(token),
    queryFn: () => fetchReceipt(token),
    // A receipt never changes once issued.
    staleTime: Infinity,
  });
}
