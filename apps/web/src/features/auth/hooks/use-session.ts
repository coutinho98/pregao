import type { AuthUser } from '@pregao/shared';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useToken } from '@/lib/session';
import { fetchMe } from '../api';

interface Session {
  user: AuthUser | null;
  isLoading: boolean;
}

export function useSession(): Session {
  const token = useToken();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.session(token),
    queryFn: fetchMe,
    enabled: token !== null,
    staleTime: Infinity,
  });
  return { user: token ? (data ?? null) : null, isLoading: token !== null && isLoading };
}
