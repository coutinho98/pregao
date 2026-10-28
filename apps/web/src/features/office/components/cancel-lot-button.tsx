import type { AuctioneerLot } from '@pregao/shared';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatLotNumber } from '@/features/lots/format';
import { formatCents } from '@/utils/money';
import { useCancelLot } from '../hooks/use-cancel-lot';

function consequence(lot: AuctioneerLot): string {
  if (lot.currentBidCents === null) return 'O lote sai da vitrine e não recebe mais lances.';
  return `O lote sai da vitrine e o lance líder de ${formatCents(lot.currentBidCents)} volta para o saldo disponível do licitante.`;
}

/** Cancels a lot after a confirmation that says what happens to the leading bid. */
export function CancelLotButton({ lot }: { lot: AuctioneerLot }) {
  const { cancelLot, isPending } = useCancelLot();
  return (
    <ConfirmDialog
      danger
      title={`Cancelar o ${formatLotNumber(lot.number)}?`}
      description={consequence(lot)}
      confirmLabel="Cancelar lote"
      onConfirm={() => cancelLot(lot)}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label={`Cancelar ${formatLotNumber(lot.number)}`}
        >
          <X size={16} />
        </Button>
      }
    />
  );
}
