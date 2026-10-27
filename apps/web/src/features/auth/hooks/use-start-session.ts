import type { AuthResponse } from '@pregao/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { queryKeys } from '@/lib/query-keys';
import { setToken } from '@/lib/session';
import { homePathByRole } from '../home-path';

/** Stores the token, primes the session cache and sends the user where they were going. */
export function useStartSession(): (response: AuthResponse) => void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return ({ accessToken, user }) => {
    queryClient.setQueryData(queryKeys.session(accessToken), user);
    setToken(accessToken);
    navigate(searchParams.get('next') ?? homePathByRole[user.role], { replace: true });
  };
}
