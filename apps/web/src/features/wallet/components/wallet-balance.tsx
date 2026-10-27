import { ErrorState } from '@/components/feedback/error-state';
import { errorMessage } from '@/lib/errors';
import { useWallet } from '../hooks/use-wallet';
import { BalanceFigures } from './balance-figures';

export function WalletBalance() {
  const { data, isPending, isError, error, refetch } = useWallet();

  if (isPending) return <div className="tile h-[78px] rounded-[18px] motion-safe:animate-pulse" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  return <BalanceFigures summary={data} />;
}
