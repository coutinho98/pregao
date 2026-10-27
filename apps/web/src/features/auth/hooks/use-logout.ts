import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { paths } from '@/app/paths';
import { setToken } from '@/lib/session';

export function useLogout(): () => void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    setToken(null);
    queryClient.clear();
    navigate(paths.home);
    toast.info('Você saiu da sua conta.');
  };
}
