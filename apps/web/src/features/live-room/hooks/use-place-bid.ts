import type { PublicBid } from '@pregao/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { syncServerClock } from '@/lib/server-clock';
import { formatCents } from '@/utils/money';
import { placeBid } from '../api';
import { withBid } from '../bid-history';
import { bidRefusalMessage } from '../bid-refusal';

export function usePlaceBid(lotId: string) {
  const queryClient = useQueryClient();
  const refreshRoom = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.lots.detail(lotId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.lots.bids(lotId) });
  };

  const mutation = useMutation({
    mutationFn: (amountCents: number) => placeBid(lotId, amountCents),
    onSuccess: ({ bid, lot }) => {
      syncServerClock(lot.serverNow);
      queryClient.setQueryData(queryKeys.lots.detail(lotId), lot);
      queryClient.setQueryData<PublicBid[]>(queryKeys.lots.bids(lotId), (history) =>
        withBid(history, bid),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.lots.standing(lotId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      toast.success(`Lance de ${formatCents(bid.amountCents)} aceito. Você está ganhando.`);
    },
    // A refusal usually means the room was behind (someone bid first): catch up.
    onError: refreshRoom,
  });

  return {
    placeBid: mutation.mutate,
    isPending: mutation.isPending,
    refusal: mutation.isError ? bidRefusalMessage(mutation.error) : null,
  };
}
