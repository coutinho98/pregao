import { Injectable } from '@nestjs/common';
import {
  deriveLotPhase,
  ErrorCode,
  LedgerEntryType,
  type LotDetail,
  LotPhase,
  LotStatus,
} from '@pregao/shared';
import type { RequestUser } from '../../common/auth/request-user.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { TransactionRunner } from '../../common/prisma/transaction-runner.js';
import { Clock } from '../../common/time/clock.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { WalletService } from '../wallet/wallet.service.js';
import { toLotDetail } from './lots.mapper.js';
import { LotsRepository } from './lots.repository.js';

/**
 * The auctioneer withdraws one of their open lots. If someone was leading, their committed
 * amount goes back to their available balance (REFUND), in the same transaction.
 */
@Injectable()
export class LotCancellationService {
  constructor(
    private readonly lots: LotsRepository,
    private readonly wallet: WalletService,
    private readonly realtime: RealtimeGateway,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  async cancel(user: RequestUser, lotId: string): Promise<LotDetail> {
    const detail = await this.transactions.run(async (tx) => {
      const lot = await this.lots.lockLot(tx, lotId);
      if (!lot) throw new DomainError(ErrorCode.NOT_FOUND, 'Lote não encontrado.');
      if (lot.auctioneerId !== user.id) {
        throw new DomainError(ErrorCode.FORBIDDEN, 'Só o leiloeiro dono pode cancelar este lote.');
      }
      const now = this.clock.now();
      const phase = deriveLotPhase(lot, now);
      if (phase === LotPhase.ENDED || phase === LotPhase.CANCELLED) {
        throw new DomainError(
          ErrorCode.LOT_ENDED,
          'Este lote já foi encerrado e não pode ser cancelado.',
        );
      }

      if (lot.leaderId && lot.currentBidCents !== null) {
        const [leaderWallet] = await this.wallet.lockWallets(tx, [lot.leaderId]);
        if (leaderWallet) {
          await this.wallet.move(tx, leaderWallet, {
            type: LedgerEntryType.REFUND,
            amountCents: lot.currentBidCents,
            lotId: lot.id,
          });
        }
      }
      return toLotDetail(await this.lots.markCancelled(tx, lot.id, now), now);
    });

    this.realtime.publishClosed({
      lotId: detail.id,
      status: LotStatus.CANCELLED,
      winnerPseudonym: null,
      finalPriceCents: null,
      serverNow: this.clock.now().toISOString(),
    });
    return detail;
  }
}
