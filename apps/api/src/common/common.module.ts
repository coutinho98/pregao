import { Global, Module } from '@nestjs/common';
import { AuditSigner } from './crypto/audit-signer.js';
import { Pseudonyms } from './crypto/pseudonyms.js';
import { Clock } from './time/clock.js';

@Global()
@Module({
  providers: [Clock, AuditSigner, Pseudonyms],
  exports: [Clock, AuditSigner, Pseudonyms],
})
export class CommonModule {}
