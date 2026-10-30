import { Module } from '@nestjs/common';
import { SettlementModule } from '../settlement/settlement.module.js';
import { AuditChainService } from './audit-chain.service.js';
import { AuditController } from './audit.controller.js';
import { AuditRepository } from './audit.repository.js';
import { AuditService } from './audit.service.js';

@Module({
  imports: [SettlementModule],
  controllers: [AuditController],
  providers: [AuditChainService, AuditService, AuditRepository],
  exports: [AuditChainService],
})
export class AuditModule {}
