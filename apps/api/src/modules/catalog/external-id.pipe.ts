import { Injectable, PipeTransform } from '@nestjs/common';
import { ErrorCode } from '@pregao/shared';
import { DomainError } from '../../common/errors/domain-error.js';

export const EXTERNAL_ID_PATTERN = /^\d{1,10}$/;

@Injectable()
export class ExternalIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!EXTERNAL_ID_PATTERN.test(value)) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, 'Identificador de obra inválido.');
    }
    return value;
  }
}
