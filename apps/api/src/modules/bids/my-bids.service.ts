import { Injectable } from '@nestjs/common';
import { ErrorCode, type MyBidEntry, MyBidResult, type MyLotStanding } from '@pregao/shared';
import type { RequestUser } from '../../common/auth/request-user.js';
import { Pseudonyms } from '../../common/crypto/pseudonyms.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { centsToNumber } from '../../common/money.js';
import { Clock } from '../../common/time/clock.js';
import { toLotSummary } from '../lots/lots.mapper.js';
import { SettlementService } from '../settlement/settlement.service.js';
import { myBidResult, standingOf } from './bid-rules.js';
import { BidsRepository } from './bids.repository.js';

/** What a bidder sees about their own bids: never anyone else's identity. */
@Injectable()
export class MyBidsService {
  constructor(
    private readonly bids: BidsRepository,
    private readonly settlement: SettlementService,
    private readonly pseudonyms: Pseudonyms,
    private readonly clock: Clock,
  ) {}

  async standingFor(user: RequestUser, lotId: string): Promise<MyLotStanding> {
    await this.settlement.settleIfDue(lotId);
    const leaderId = await this.bids.findLeaderId(lotId);
    if (leaderId === undefined) throw new DomainError(ErrorCode.NOT_FOUND, 'Lote não encontrado.');
    const highestBids = await this.bids.findHighestBidPerBidder(lotId);
    const receiptToken =
      leaderId === user.id ? await this.bids.findReceiptToken(lotId, user.id) : null;
    return {
      pseudonym: this.pseudonyms.forLot(user.id, lotId),
      ...standingOf(user.id, leaderId, highestBids),
      receiptToken,
    };
  }

  /** Every lot the user bid on; ended ones are settled first so the receipt is there. */
  async list(userId: string): Promise<MyBidEntry[]> {
    await this.settlement.settleDueWhere({ bids: { some: { bidderId: userId } } });
    const [lots, highest] = await Promise.all([
      this.bids.findLotsBidBy(userId),
      this.bids.findHighestBidPerLot(userId),
    ]);
    const now = this.clock.now();
    return lots.map((lot) => {
      const result = myBidResult(lot, userId, now);
      const wonReceipt = result === MyBidResult.WON && lot.receipt?.winnerId === userId;
      return {
        lot: toLotSummary(lot, now),
        result,
        myHighestBidCents: centsToNumber(highest.get(lot.id) ?? 0n),
        receiptToken: wonReceipt ? (lot.receipt?.publicToken ?? null) : null,
      };
    });
  }
}
