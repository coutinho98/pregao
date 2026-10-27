import { LedgerEntryType } from '@pregao/shared';

interface LedgerEntryStyle {
  label: string;
  /** How the entry reads in the ledger: money in, money out, or a reservation. */
  sign: '+' | '−' | '';
}

export const ledgerEntryStyle: Record<LedgerEntryType, LedgerEntryStyle> = {
  [LedgerEntryType.DEPOSIT]: { label: 'Depósito', sign: '+' },
  [LedgerEntryType.HOLD]: { label: 'Lance reservado', sign: '' },
  [LedgerEntryType.RELEASE]: { label: 'Lance superado, reserva liberada', sign: '' },
  [LedgerEntryType.DEBIT]: { label: 'Arremate pago', sign: '−' },
  [LedgerEntryType.CREDIT]: { label: 'Venda recebida', sign: '+' },
  [LedgerEntryType.REFUND]: { label: 'Lote cancelado, reserva estornada', sign: '' },
};
