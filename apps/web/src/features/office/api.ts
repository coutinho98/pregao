import type { CatalogSearchResult, CreateLotInput, LotDetail, LotSummary } from '@pregao/shared';
import { apiUrl } from '@/lib/env';
import { http } from '@/lib/http';

export function searchCatalog(q: string, page: number): Promise<CatalogSearchResult> {
  const params = new URLSearchParams({ q, page: String(page) });
  return http<CatalogSearchResult>(`/catalog/search?${params}`);
}

export const createLot = (input: CreateLotInput) =>
  http<LotDetail>('/lots', { method: 'POST', body: input });

export const fetchMyLots = () => http<LotSummary[]>('/lots/mine');

/** Thumbnail served by our API (the museum's CDN refuses browser hotlinks). */
export const catalogThumbnailUrl = (externalId: string) =>
  apiUrl(`/catalog/items/${encodeURIComponent(externalId)}/thumbnail`);
