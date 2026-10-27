import type { DepositInput, LedgerPage, WalletSummary } from '@pregao/shared';
import { http } from '@/lib/http';

export const fetchWallet = () => http<WalletSummary>('/wallet');

export const deposit = (input: DepositInput) =>
  http<WalletSummary>('/wallet/deposits', { method: 'POST', body: input });

export function fetchLedger(cursor: string | null): Promise<LedgerPage> {
  const query = cursor ? `?${new URLSearchParams({ cursor })}` : '';
  return http<LedgerPage>(`/wallet/ledger${query}`);
}
