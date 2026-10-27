import { Injectable } from '@nestjs/common';
import { type AuditTrail, ErrorCode } from '@pregao/shared';
import { AuditSigner } from '../../common/crypto/audit-signer.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { Clock } from '../../common/time/clock.js';
import { toAuditTrail } from './audit.mapper.js';
import { AuditRepository } from './audit.repository.js';

@Injectable()
export class AuditService {
  constructor(
    private readonly audit: AuditRepository,
    private readonly signer: AuditSigner,
    private readonly clock: Clock,
  ) {}

  async getTrail(lotId: string): Promise<AuditTrail> {
    const lot = await this.audit.findLotForAudit(lotId);
    if (!lot) throw new DomainError(ErrorCode.NOT_FOUND, 'Lote não encontrado.');
    return toAuditTrail(lot, await this.signer.publicKeyHex(), this.clock.now());
  }
}
