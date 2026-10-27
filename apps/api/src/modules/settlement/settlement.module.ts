import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { SettlementRepository } from './settlement.repository.js';
import { SettlementService } from './settlement.service.js';
import { SettlementWorker } from './settlement.worker.js';

@Module({
  imports: [WalletModule, RealtimeModule],
  providers: [SettlementService, SettlementRepository, SettlementWorker],
  exports: [SettlementService],
})
export class SettlementModule {}
