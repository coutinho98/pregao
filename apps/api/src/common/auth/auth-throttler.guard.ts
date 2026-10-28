import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ErrorCode } from '@pregao/shared';
import { DomainError } from '../errors/domain-error.js';

/** The throttler's refusal in the house's voice and error format. */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected override throwThrottlingException(): Promise<void> {
    throw new DomainError(
      ErrorCode.TOO_MANY_REQUESTS,
      'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
    );
  }
}
