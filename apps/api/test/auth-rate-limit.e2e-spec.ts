import type { INestApplication } from '@nestjs/common';
import { ErrorCode } from '@pregao/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createTestApp, resetDatabase } from './test-app.js';

// Before the app module is imported, which reads and validates the environment.
vi.hoisted(() => {
  process.env.AUTH_ATTEMPTS_PER_MINUTE = '3';
});

describe('Auth rate limit (e2e)', () => {
  let app: INestApplication;
  const login = () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ninguem@exemplo.com', password: 'tentativa123' });

  beforeAll(async () => {
    app = await createTestApp();
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuses login attempts past the limit with a clear code', async () => {
    for (let attempt = 0; attempt < 3; attempt++) await login().expect(401);

    const blocked = await login().expect(429);
    expect(blocked.body).toMatchObject({
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: expect.stringContaining('Aguarde') as string,
    });
  });
});
