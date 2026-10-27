import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { SettlementModule } from '../settlement/settlement.module.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { ImagesController } from './images.controller.js';
import { LotCancellationService } from './lot-cancellation.service.js';
import { LotsController } from './lots.controller.js';
import { LotsRepository } from './lots.repository.js';
import { LotsService } from './lots.service.js';

@Module({
  imports: [CatalogModule, AuditModule, SettlementModule, WalletModule, RealtimeModule],
  controllers: [LotsController, ImagesController],
  providers: [LotsService, LotCancellationService, LotsRepository],
})
export class LotsModule {}
