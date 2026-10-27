import { type MyBidEntry, MyBidResult } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { ALL, filterMyBids } from './my-bid-filters';

const entry = (result: MyBidResult) => ({ result }) as MyBidEntry;
const entries = [
  entry(MyBidResult.LEADING),
  entry(MyBidResult.OUTBID),
  entry(MyBidResult.WON),
  entry(MyBidResult.LOST),
];

describe('filterMyBids', () => {
  it('keeps everything for "todos" or an unknown filter', () => {
    expect(filterMyBids(entries, ALL)).toHaveLength(4);
    expect(filterMyBids(entries, 'qualquer')).toHaveLength(4);
  });

  it('keeps only the matching results', () => {
    expect(filterMyBids(entries, 'arrematados').map((e) => e.result)).toEqual([MyBidResult.WON]);
    expect(filterMyBids(entries, 'superado').map((e) => e.result)).toEqual([MyBidResult.OUTBID]);
  });
});
