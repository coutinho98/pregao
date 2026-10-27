import type { MyLotStanding, PlaceBidResult, PublicBid } from '@pregao/shared';
import { http } from '@/lib/http';

const bidsPath = (lotId: string) => `/lots/${encodeURIComponent(lotId)}/bids`;

export const fetchLotBids = (lotId: string) => http<PublicBid[]>(bidsPath(lotId));

export const fetchMyStanding = (lotId: string) => http<MyLotStanding>(`${bidsPath(lotId)}/me`);

export const placeBid = (lotId: string, amountCents: number) =>
  http<PlaceBidResult>(bidsPath(lotId), { method: 'POST', body: { amountCents } });
