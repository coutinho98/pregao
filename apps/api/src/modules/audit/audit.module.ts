import { Module } from '@nestjs/common';
import { AuditChainService } from './audit-chain.service.js';

@Module({
  providers: [AuditChainService],
  exports: [AuditChainService],
})
export class AuditModule {}
