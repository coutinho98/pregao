import { DEMO_PASSWORD } from '@pregao/shared';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { login } from '../api';
import type { DemoAccount } from '../demo-accounts';
import { roleLabel } from '../role-labels';
import { useStartSession } from './use-start-session';

/** Signs into a seeded test account in one click, like the regular login without typing. */
export function useDemoLogin() {
  const startSession = useStartSession();
  const mutation = useMutation({
    mutationFn: (account: DemoAccount) => login({ email: account.email, password: DEMO_PASSWORD }),
    onSuccess: (response) => {
      startSession(response);
      const { name, role } = response.user;
      toast.success(`Você entrou como ${name} (${roleLabel[role].toLowerCase()}).`);
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    loginAs: mutation.mutate,
    pendingEmail: mutation.isPending ? mutation.variables.email : null,
  };
}
