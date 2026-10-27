import type { AuctioneerLot } from '@pregao/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatLotNumber } from '@/features/lots/format';
import { queryKeys } from '@/lib/query-keys';
import { cancelLot } from '../api';

export function useCancelLot() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (lot: AuctioneerLot) => cancelLot(lot.id),
    onSuccess: (_detail, lot) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lots.all });
      toast.success(
        lot.currentBidCents === null
          ? `${formatLotNumber(lot.number)} cancelado.`
          : `${formatLotNumber(lot.number)} cancelado. O lance líder foi estornado ao licitante.`,
      );
    },
    onError: (error) => toast.error(error.message),
  });
  return { cancelLot: mutation.mutate, isPending: mutation.isPending };
}
