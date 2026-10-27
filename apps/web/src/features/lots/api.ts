import type { LotDetail, LotPage, PublicLotPhase } from '@pregao/shared';
import { http } from '@/lib/http';
import { syncServerClock } from '@/lib/server-clock';

export function fetchLotPage(phase: PublicLotPhase, q: string): Promise<LotPage> {
  const params = new URLSearchParams({ phase });
  if (q) params.set('q', q);
  return http<LotPage>(`/lots?${params}`);
}

export async function fetchLot(id: string): Promise<LotDetail> {
  const lot = await http<LotDetail>(`/lots/${encodeURIComponent(id)}`);
  syncServerClock(lot.serverNow);
  return lot;
}
