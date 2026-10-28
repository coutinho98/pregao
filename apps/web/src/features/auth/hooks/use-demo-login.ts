import { DEMO_PASSWORD } from '@pregao/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { paths } from '@/app/paths';
import { queryKeys } from '@/lib/query-keys';
import { setToken } from '@/lib/session';
import { login } from '../api';
import type { DemoAccount } from '../demo-accounts';
import { homePathByRole } from '../home-path';
import { roleLabel } from '../role-labels';

const AUTH_PAGES = new Set<string>([paths.login, paths.register]);

/**
 * Signs into a seeded test account in one click, from any screen. The previous account's
 * cached data is dropped, and the user stays on the page they are testing (only the login
 * and sign-up pages move on, to ?next= or the account's home).
 */
export function useDemoLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const mutation = useMutation({
    mutationFn: (account: DemoAccount) => login({ email: account.email, password: DEMO_PASSWORD }),
    onSuccess: ({ accessToken, user }) => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session(accessToken), user);
      setToken(accessToken);
      if (AUTH_PAGES.has(pathname)) {
        navigate(searchParams.get('next') ?? homePathByRole[user.role], { replace: true });
      }
      toast.success(`Você entrou como ${user.name} (${roleLabel[user.role].toLowerCase()}).`);
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    loginAs: mutation.mutate,
    pendingEmail: mutation.isPending ? mutation.variables.email : null,
  };
}
