import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { login } from '../api';
import { useStartSession } from './use-start-session';

export function useLogin() {
  const startSession = useStartSession();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      startSession(response);
      toast.success(`Bem-vindo de volta, ${response.user.name}.`);
    },
    onError: (error) => toast.error(error.message),
  });
  return { login: mutation.mutate, isPending: mutation.isPending };
}
