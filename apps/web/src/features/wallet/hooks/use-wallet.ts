import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchWallet } from '../api';

export function useWallet() {
  return useQuery({ queryKey: queryKeys.wallet.summary, queryFn: fetchWallet });
}
