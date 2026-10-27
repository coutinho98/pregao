import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchLedger } from '../api';

export function useLedger() {
  return useInfiniteQuery({
    queryKey: queryKeys.wallet.ledger,
    queryFn: ({ pageParam }) => fetchLedger(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
