import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { BidsController } from './bids.controller.js';
import { BidsRepository } from './bids.repository.js';
import { BidsService } from './bids.service.js';

@Module({
  imports: [WalletModule, AuditModule, RealtimeModule],
  controllers: [BidsController],
  providers: [BidsService, BidsRepository],
})
export class BidsModule {}
