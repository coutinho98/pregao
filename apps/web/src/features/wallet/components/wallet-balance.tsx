import { ErrorState } from '@/components/feedback/error-state';
import { errorMessage } from '@/lib/errors';
import { useWallet } from '../hooks/use-wallet';
import { BalanceFigures } from './balance-figures';

export function WalletBalance() {
  const { data, isPending, isError, error, refetch } = useWallet();

  if (isPending) return <p className="text-nevoa-texto">Somando o saldo…</p>;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  return <BalanceFigures summary={data} />;
}
