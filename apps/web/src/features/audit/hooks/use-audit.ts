import { type AuditResult, type AuditTrail, verifyAuditTrail } from '@pregao/shared';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchAuditTrail } from '../api';
import { browserCrypto } from '../browser-crypto';

export interface Audit {
  trail: AuditTrail;
  result: AuditResult;
}

/** Downloads the trail and verifies it here, in the browser; the server is not trusted. */
export function useAudit(lotId: string) {
  return useQuery({
    queryKey: queryKeys.audit(lotId),
    queryFn: async (): Promise<Audit> => {
      const trail = await fetchAuditTrail(lotId);
      return { trail, result: await verifyAuditTrail(trail, browserCrypto) };
    },
    refetchOnWindowFocus: true,
  });
}
