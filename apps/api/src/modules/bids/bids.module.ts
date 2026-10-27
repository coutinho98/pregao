import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { SettlementModule } from '../settlement/settlement.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { BidsController } from './bids.controller.js';
import { BidsRepository } from './bids.repository.js';
import { BidsService } from './bids.service.js';
import { MyBidsController } from './my-bids.controller.js';
import { MyBidsService } from './my-bids.service.js';

@Module({
  imports: [WalletModule, AuditModule, RealtimeModule, SettlementModule],
  controllers: [BidsController, MyBidsController],
  providers: [BidsService, MyBidsService, BidsRepository],
})
export class BidsModule {}
