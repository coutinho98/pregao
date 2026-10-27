import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './common/config/env.js';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter.js';
import { validationErrorFactory } from './common/errors/validation-error.factory.js';

/** Browsers send the Origin header without a trailing slash, so "https://site.com/" would never match. */
export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/** Global pipes, filters and CORS, shared by the server and the e2e tests. */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.enableCors({ origin: parseCorsOrigins(config.get('CORS_ORIGINS', { infer: true })) });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationErrorFactory,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
}
