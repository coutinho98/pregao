import { useParams } from 'react-router';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { errorMessage } from '@/lib/errors';
import { ReceiptDocument } from '../components/receipt-document';
import { useReceipt } from '../hooks/use-receipt';

/** Public page: anyone with the link sees the receipt, no login needed. */
export function ReceiptPage() {
  const { token = '' } = useParams();
  const receipt = useReceipt(token);

  return (
    <Page className="max-w-[680px]">
      <div className="mt-6">
        {receipt.isPending && (
          <div className="h-[520px] rounded-[26px] bg-surface motion-safe:animate-pulse" />
        )}
        {receipt.isError && (
          <ErrorState
            message={errorMessage(receipt.error)}
            onRetry={() => void receipt.refetch()}
          />
        )}
        {receipt.data && <ReceiptDocument receipt={receipt.data} />}
      </div>
    </Page>
  );
}
