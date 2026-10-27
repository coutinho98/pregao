import { Injectable } from '@nestjs/common';
import { ErrorCode, type ReceiptView } from '@pregao/shared';
import { DomainError } from '../../common/errors/domain-error.js';
import { toReceiptView } from './receipts.mapper.js';
import { ReceiptsRepository } from './receipts.repository.js';

@Injectable()
export class ReceiptsService {
  constructor(private readonly receipts: ReceiptsRepository) {}

  async getByToken(token: string): Promise<ReceiptView> {
    const receipt = await this.receipts.findByToken(token);
    if (!receipt) throw new DomainError(ErrorCode.NOT_FOUND, 'Comprovante não encontrado.');
    return toReceiptView(receipt);
  }
}
