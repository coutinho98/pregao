import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatLotNumber } from '@/features/lots/format';
import { queryKeys } from '@/lib/query-keys';
import { createLot } from '../api';

export function useCreateLot({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createLot,
    onSuccess: (lot) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lots.all });
      toast.success(`${formatLotNumber(lot.number)} criado: ${lot.title}.`);
      onCreated();
    },
    onError: (error) => toast.error(error.message),
  });
  return { createLot: mutation.mutate, isPending: mutation.isPending };
}
