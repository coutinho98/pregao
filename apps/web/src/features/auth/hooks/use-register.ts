import { Role } from '@pregao/shared';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { register } from '../api';
import { useStartSession } from './use-start-session';

const welcomeByRole: Record<Role, string> = {
  [Role.BIDDER]: 'Conta criada. Deposite na carteira para dar seu primeiro lance.',
  [Role.AUCTIONEER]: 'Conta criada. Seu escritório está pronto para montar lotes.',
};

export function useRegister() {
  const startSession = useStartSession();
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      startSession(response);
      toast.success(welcomeByRole[response.user.role]);
    },
    onError: (error) => toast.error(error.message),
  });
  return { register: mutation.mutate, isPending: mutation.isPending };
}
