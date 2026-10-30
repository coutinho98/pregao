import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@pregao/shared';

export const ERROR_HTTP_STATUS: Record<ErrorCode, HttpStatus> = {
  VALIDATION_FAILED: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  EMAIL_TAKEN: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  TOO_MANY_REQUESTS: HttpStatus.TOO_MANY_REQUESTS,
  NOT_STARTED: HttpStatus.CONFLICT,
  LOT_ENDED: HttpStatus.CONFLICT,
  ALREADY_WINNING: HttpStatus.CONFLICT,
  BELOW_MINIMUM: HttpStatus.UNPROCESSABLE_ENTITY,
  INSUFFICIENT_FUNDS: HttpStatus.UNPROCESSABLE_ENTITY,
  BALANCE_LIMIT_REACHED: HttpStatus.UNPROCESSABLE_ENTITY,
  AUCTIONEER_CANNOT_BID: HttpStatus.FORBIDDEN,
  EXTERNAL_API_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  ARTWORK_NOT_FOUND: HttpStatus.NOT_FOUND,
  ARTWORK_ALREADY_LISTED: HttpStatus.CONFLICT,
  INVALID_LOT_SCHEDULE: HttpStatus.UNPROCESSABLE_ENTITY,
};

export function errorCodeForHttpStatus(status: number): ErrorCode {
  if (status === HttpStatus.UNAUTHORIZED) return ErrorCode.UNAUTHORIZED;
  if (status === HttpStatus.FORBIDDEN) return ErrorCode.FORBIDDEN;
  if (status === HttpStatus.NOT_FOUND) return ErrorCode.NOT_FOUND;
  if (status === HttpStatus.TOO_MANY_REQUESTS) return ErrorCode.TOO_MANY_REQUESTS;
  if (status < HttpStatus.INTERNAL_SERVER_ERROR) return ErrorCode.VALIDATION_FAILED;
  return ErrorCode.INTERNAL_ERROR;
}
