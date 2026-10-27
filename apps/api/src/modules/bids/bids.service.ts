import { Injectable } from '@nestjs/common';
import { ErrorCode, LedgerEntryType, type PlaceBidResult, type PublicBid } from '@pregao/shared';
import { randomUUID } from 'node:crypto';
import type { Lot } from '../../generated/prisma/client.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { Pseudonyms } from '../../common/crypto/pseudonyms.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { centsToNumber } from '../../common/money.js';
import { TransactionRunner } from '../../common/prisma/transaction-runner.js';
import { Clock } from '../../common/time/clock.js';
import { AuditChainService } from '../audit/audit-chain.service.js';
import { toLotDetail } from '../lots/lots.mapper.js';
import { availableCents } from '../wallet/wallet-rules.js';
import { WalletService } from '../wallet/wallet.service.js';
import { bidRejection, extendedEndsAt, nextMinimumBid } from './bid-rules.js';
import { toPublicBid } from './bids.mapper.js';
import { BidsRepository } from './bids.repository.js';

const LOT_NOT_FOUND = 'Lote não encontrado.';

@Injectable()
export class BidsService {
  constructor(
    private readonly bids: BidsRepository,
    private readonly wallet: WalletService,
    private readonly auditChain: AuditChainService,
    private readonly pseudonyms: Pseudonyms,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  /**
   * One transaction: lock the lot, then the wallets involved (ascending id), validate,
   * record the chained bid, release the previous leader, hold the new amount, and apply
   * anti-sniping. Any failure rolls everything back.
   */
  placeBid(user: RequestUser, lotId: string, amountCents: number): Promise<PlaceBidResult> {
    return this.transactions.run(async (tx) => {
      const lot = await this.bids.lockLot(tx, lotId);
      if (!lot) throw new DomainError(ErrorCode.NOT_FOUND, LOT_NOT_FOUND);
      const now = this.clock.now();

      const wallets = await this.wallet.lockWallets(tx, [
        user.id,
        ...(lot.leaderId ? [lot.leaderId] : []),
      ]);
      const bidderWallet = wallets.find((wallet) => wallet.userId === user.id);
      if (!bidderWallet) throw new DomainError(ErrorCode.NOT_FOUND, 'Carteira não encontrada.');
      const previousLeaderWallet = wallets.find((wallet) => wallet.userId === lot.leaderId);

      const amount = BigInt(amountCents);
      this.ensureAcceptable(lot, user, amount, availableCents(bidderWallet), now);

      const seq = lot.bidCount + 1;
      const bidderPseudonym = this.pseudonyms.forLot(user.id, lot.id);
      const seal = await this.auditChain.sealBid({
        prevHash: lot.lastHash,
        lotId: lot.id,
        seq,
        bidderPseudonym,
        amountCents,
        createdAt: now,
      });
      const bid = await this.bids.createBid(tx, {
        id: randomUUID(),
        lotId: lot.id,
        seq,
        bidderId: user.id,
        bidderPseudonym,
        amountCents: amount,
        prevHash: lot.lastHash,
        hash: seal.hash,
        signature: seal.signature,
        createdAt: now,
      });

      if (previousLeaderWallet && lot.currentBidCents !== null) {
        await this.wallet.move(tx, previousLeaderWallet, {
          type: LedgerEntryType.RELEASE,
          amountCents: lot.currentBidCents,
          lotId: lot.id,
        });
      }
      await this.wallet.move(tx, bidderWallet, {
        type: LedgerEntryType.HOLD,
        amountCents: amount,
        lotId: lot.id,
        bidId: bid.id,
      });

      const newEndsAt = extendedEndsAt(lot.endsAt, now);
      const updatedLot = await this.bids.updateLotAfterBid(tx, lot.id, {
        currentBidCents: amount,
        leaderId: user.id,
        bidCount: seq,
        lastHash: seal.hash,
        headSignature: seal.headSignature,
        endsAt: newEndsAt ?? lot.endsAt,
      });
      return {
        bid: toPublicBid(bid),
        lot: toLotDetail(updatedLot, now),
        extended: newEndsAt !== null,
      };
    });
  }

  async listForLot(lotId: string): Promise<PublicBid[]> {
    if (!(await this.bids.lotExists(lotId)))
      throw new DomainError(ErrorCode.NOT_FOUND, LOT_NOT_FOUND);
    return (await this.bids.findByLot(lotId)).map(toPublicBid);
  }

  private ensureAcceptable(
    lot: Lot,
    user: RequestUser,
    amount: bigint,
    available: bigint,
    now: Date,
  ): void {
    const rejection = bidRejection({
      bidderId: user.id,
      bidderRole: user.role,
      amountCents: amount,
      availableCents: available,
      now,
      lot,
    });
    if (rejection) {
      throw new DomainError(rejection.code, rejection.message, {
        minNextBidCents: centsToNumber(nextMinimumBid(lot)),
      });
    }
  }
}
