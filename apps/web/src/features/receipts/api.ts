import type { ReceiptView } from '@pregao/shared';
import { http } from '@/lib/http';

export const fetchReceipt = (token: string) =>
  http<ReceiptView>(`/receipts/${encodeURIComponent(token)}`);
