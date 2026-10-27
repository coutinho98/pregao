import type { LotDetail, LotPage, PublicLotPhase } from '@pregao/shared';
import { http } from '@/lib/http';

export function fetchLotPage(phase: PublicLotPhase, q: string): Promise<LotPage> {
  const params = new URLSearchParams({ phase });
  if (q) params.set('q', q);
  return http<LotPage>(`/lots?${params}`);
}

export const fetchLot = (id: string) => http<LotDetail>(`/lots/${encodeURIComponent(id)}`);
