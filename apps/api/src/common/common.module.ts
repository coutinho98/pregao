import { Global, Module } from '@nestjs/common';
import { AuditSigner } from './crypto/audit-signer.js';
import { Clock } from './time/clock.js';

@Global()
@Module({
  providers: [Clock, AuditSigner],
  exports: [Clock, AuditSigner],
})
export class CommonModule {}
