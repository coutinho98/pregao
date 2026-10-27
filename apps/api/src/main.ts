import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { Env } from './common/config/env.js';
import { setupApiDocs } from './common/openapi/api-docs.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  configureApp(app);
  setupApiDocs(app);
  await app.listen(app.get<ConfigService<Env, true>>(ConfigService).get('PORT', { infer: true }));
}

void bootstrap();
