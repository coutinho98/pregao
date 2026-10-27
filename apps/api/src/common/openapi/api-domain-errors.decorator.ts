import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { ErrorCode } from '@pregao/shared';
import { ERROR_HTTP_STATUS } from '../errors/error-http-status.js';
import { ApiErrorDto } from './api-error.dto.js';

/** Documents the domain error codes an endpoint can return, grouped by HTTP status. */
export function ApiDomainErrors(...codes: ErrorCode[]) {
  const codesByStatus = new Map<number, ErrorCode[]>();
  for (const code of codes) {
    const status = ERROR_HTTP_STATUS[code];
    codesByStatus.set(status, [...(codesByStatus.get(status) ?? []), code]);
  }
  return applyDecorators(
    ...[...codesByStatus].map(([status, grouped]) =>
      ApiResponse({ status, type: ApiErrorDto, description: `code: ${grouped.join(' | ')}` }),
    ),
  );
}
