import type { INestApplication } from '@nestjs/common';
import type { LotDetail, PlaceBidResult, WalletSummary } from '@pregao/shared';
import request from 'supertest';
import type { Clock } from '../src/common/time/clock.js';

const MINUTE = 60_000;

/** Small DSL over the HTTP API so scenarios read like the business rules. */
export function scenario(app: INestApplication, clock: Clock) {
  const http = () => request(app.getHttpServer());
  const at = (offsetMs: number) => new Date(clock.now().getTime() + offsetMs).toISOString();

  return {
    http,

    async createLot(
      auctioneerToken: string,
      externalId: string,
      overrides: Partial<Record<string, unknown>> = {},
    ): Promise<LotDetail> {
      const response = await http()
        .post('/lots')
        .set('Authorization', `Bearer ${auctioneerToken}`)
        .send({
          externalId,
          startingPriceCents: 100_000,
          minIncrementCents: 5_000,
          startsAt: at(0),
          endsAt: at(60 * MINUTE),
          ...overrides,
        })
        .expect(201);
      return response.body as LotDetail;
    },

    async deposit(token: string, amountCents: number): Promise<WalletSummary> {
      const response = await http()
        .post('/wallet/deposits')
        .set('Authorization', `Bearer ${token}`)
        .send({ amountCents })
        .expect(201);
      return response.body as WalletSummary;
    },

    bid(token: string, lotId: string, amountCents: number) {
      return http()
        .post(`/lots/${lotId}/bids`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amountCents });
    },

    async acceptedBid(token: string, lotId: string, amountCents: number): Promise<PlaceBidResult> {
      const response = await this.bid(token, lotId, amountCents).expect(201);
      return response.body as PlaceBidResult;
    },

    async wallet(token: string): Promise<WalletSummary> {
      const response = await http()
        .get('/wallet')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      return response.body as WalletSummary;
    },
  };
}
