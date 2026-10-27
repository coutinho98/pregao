import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { formatCents } from '@/utils/money';
import { deposit } from '../api';

export function useDeposit({ onDeposited }: { onDeposited: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deposit,
    onSuccess: (summary, { amountCents }) => {
      queryClient.setQueryData(queryKeys.wallet.summary, summary);
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.ledger });
      toast.success(
        `Depósito de ${formatCents(amountCents)} feito. Disponível: ${formatCents(summary.availableCents)}.`,
      );
      onDeposited();
    },
    onError: (error) => toast.error(error.message),
  });
  return { deposit: mutation.mutate, isPending: mutation.isPending };
}
