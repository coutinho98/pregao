import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiErrorBody, ErrorCode } from '@pregao/shared';
import type { Response } from 'express';
import { DomainError } from './domain-error.js';
import { ERROR_HTTP_STATUS, errorCodeForHttpStatus } from './error-http-status.js';

interface ErrorResponse {
  status: number;
  body: ApiErrorBody;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, body } = this.toErrorResponse(exception);
    host.switchToHttp().getResponse<Response>().status(status).json(body);
  }

  private toErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof DomainError) {
      return {
        status: ERROR_HTTP_STATUS[exception.code],
        body: { code: exception.code, message: exception.message, ...exception.meta },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return { status, body: { code: errorCodeForHttpStatus(status), message: exception.message } };
    }
    this.logger.error(exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { code: ErrorCode.INTERNAL_ERROR, message: 'Erro inesperado. Tente novamente.' },
    };
  }
}
