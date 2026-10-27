import type { AuditTrail } from '@pregao/shared';
import { http } from '@/lib/http';

export const fetchAuditTrail = (lotId: string) =>
  http<AuditTrail>(`/audit/${encodeURIComponent(lotId)}`);
