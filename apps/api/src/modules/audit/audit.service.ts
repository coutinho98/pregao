import { Injectable } from '@nestjs/common';
import { type AuditTrail, ErrorCode } from '@pregao/shared';
import { AuditSigner } from '../../common/crypto/audit-signer.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { Clock } from '../../common/time/clock.js';
import { SettlementService } from '../settlement/settlement.service.js';
import { toAuditTrail } from './audit.mapper.js';
import { AuditRepository } from './audit.repository.js';

@Injectable()
export class AuditService {
  constructor(
    private readonly audit: AuditRepository,
    private readonly signer: AuditSigner,
    private readonly settlement: SettlementService,
    private readonly clock: Clock,
  ) {}

  /** An ended lot is settled first, so its trail already shows the receipt's final hash. */
  async getTrail(lotId: string): Promise<AuditTrail> {
    await this.settlement.settleIfDue(lotId);
    const lot = await this.audit.findLotForAudit(lotId);
    if (!lot) throw new DomainError(ErrorCode.NOT_FOUND, 'Lote não encontrado.');
    return toAuditTrail(lot, await this.signer.publicKeyHex(), this.clock.now());
  }
}
