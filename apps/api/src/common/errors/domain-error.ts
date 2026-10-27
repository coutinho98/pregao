import type { ApiErrorBody, ErrorCode } from '@pregao/shared';

export type DomainErrorMeta = Omit<ApiErrorBody, 'code' | 'message'>;

export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly meta: DomainErrorMeta = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
