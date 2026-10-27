import type { MyBidEntry } from '@pregao/shared';
import { http } from '@/lib/http';

export const fetchMyBids = () => http<MyBidEntry[]>('/me/bids');
