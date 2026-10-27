import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './common/config/env.js';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter.js';
import { validationErrorFactory } from './common/errors/validation-error.factory.js';

/** Global pipes, filters and CORS, shared by the server and the e2e tests. */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.enableCors({
    origin: config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim()),
  });
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
