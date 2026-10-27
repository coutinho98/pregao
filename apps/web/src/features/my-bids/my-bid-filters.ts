import { type MyBidEntry, MyBidResult } from '@pregao/shared';

export const ALL = 'todos';

export interface MyBidFilter {
  slug: string;
  label: string;
  results: MyBidResult[];
}

export const myBidFilters: MyBidFilter[] = [
  { slug: 'liderando', label: 'Liderando', results: [MyBidResult.LEADING] },
  { slug: 'superado', label: 'Superado', results: [MyBidResult.OUTBID] },
  { slug: 'arrematados', label: 'Arrematados', results: [MyBidResult.WON] },
];

export function filterMyBids(entries: MyBidEntry[], slug: string): MyBidEntry[] {
  const filter = myBidFilters.find((candidate) => candidate.slug === slug);
  return filter ? entries.filter((entry) => filter.results.includes(entry.result)) : entries;
}

export const resultStyle: Record<MyBidResult, { label: string; tone: string }> = {
  [MyBidResult.LEADING]: { label: 'Liderando', tone: 'text-up' },
  [MyBidResult.OUTBID]: { label: 'Superado', tone: 'text-danger' },
  [MyBidResult.WON]: { label: 'Arrematado', tone: 'text-gold' },
  [MyBidResult.LOST]: { label: 'Não arrematado', tone: 'text-ink-3' },
};
