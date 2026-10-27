import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Role } from '@pregao/shared';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { Clock } from '../src/common/time/clock.js';
import { CATALOG_PROVIDER, type CatalogProvider } from '../src/modules/catalog/catalog-provider.js';
import { FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';

interface TestAppOptions {
  catalog?: CatalogProvider;
  clock?: Clock;
}

/** The real app wired to a fake museum and a controllable clock. */
export async function createTestApp({
  catalog = new FakeCatalogProvider(),
  clock = new FakeClock(),
}: TestAppOptions = {}): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CATALOG_PROVIDER)
    .useValue(catalog)
    .overrideProvider(Clock)
    .useValue(clock)
    .compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export async function resetDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = tables.map(({ tablename }) => `"${tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}

let userCounter = 0;

export async function registerUser(app: INestApplication, role: Role): Promise<AuthResponse> {
  userCounter += 1;
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      name: `User ${userCounter}`,
      email: `user${userCounter}@test.com`,
      password: 'segredo123',
      role,
    })
    .expect(201);
  return response.body as AuthResponse;
}
