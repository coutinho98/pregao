import { describe, expect, it } from 'vitest';
import { ticksForRoomBid } from './bid-sounds';

describe('ticksForRoomBid', () => {
  it('ticks for a visitor watching the room', () => {
    expect(ticksForRoomBid({ bidder: '#A', previousLeader: undefined, me: undefined })).toBe(true);
  });

  it('ticks when two other bidders trade the lead', () => {
    expect(ticksForRoomBid({ bidder: '#B', previousLeader: '#A', me: '#C' })).toBe(true);
  });

  it('stays quiet for your own bid, which has its own sound', () => {
    expect(ticksForRoomBid({ bidder: '#C', previousLeader: '#A', me: '#C' })).toBe(false);
  });

  it('stays quiet when you were just outbid, which has its own sound', () => {
    expect(ticksForRoomBid({ bidder: '#B', previousLeader: '#C', me: '#C' })).toBe(false);
  });
});
