import { SocketEvent, type YouOutbidPayload } from '@pregao/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { paths } from '@/app/paths';
import { formatLotNumber } from '@/features/lots/format';
import { queryKeys } from '@/lib/query-keys';
import { getSocket } from '@/lib/socket';
import { formatCents } from '@/utils/money';

/** Wherever the bidder is in the app, tells them right away when they lose the lead. */
export function useOutbidAlerts(): void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    const onOutbid = (payload: YouOutbidPayload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lots.standing(payload.lotId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      toast.error(`Você foi superado no ${formatLotNumber(payload.lotNumber)}, ${payload.title}.`, {
        description: `O lance mínimo agora é ${formatCents(payload.minNextBidCents)}.`,
        action: { label: 'Ver lote', onClick: () => navigate(paths.lot(payload.lotId)) },
      });
    };
    socket.on(SocketEvent.YOU_OUTBID, onOutbid);
    return () => {
      socket.off(SocketEvent.YOU_OUTBID, onOutbid);
    };
  }, [queryClient, navigate]);
}
