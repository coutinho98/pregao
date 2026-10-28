import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { Env } from './common/config/env.js';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter.js';
import { validationErrorFactory } from './common/errors/validation-error.factory.js';
import { CorsIoAdapter } from './modules/realtime/cors-io.adapter.js';

/** Browsers send the Origin header without a trailing slash, so "https://site.com/" would never match. */
export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/** Global pipes, filters, CORS and the Socket.IO adapter, shared by the server and the e2e tests. */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const origins = parseCorsOrigins(config.get('CORS_ORIGINS', { infer: true }));
  // Behind a reverse proxy the client IP (used by the login rate limit) comes in
  // X-Forwarded-For; only proxies on private networks are trusted to set it.
  const http = app.getHttpAdapter().getInstance() as Express;
  http.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.enableCors({ origin: origins });
  app.useWebSocketAdapter(new CorsIoAdapter(app, origins));
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
