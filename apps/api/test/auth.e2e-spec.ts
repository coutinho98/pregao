import type { INestApplication } from '@nestjs/common';
import { ErrorCode, Role } from '@pregao/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/common/prisma/prisma.service.js';
import { createTestApp, resetDatabase } from './test-app.js';

const bidder = {
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  password: 'segredo123',
  role: Role.BIDDER,
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user with an empty wallet and returns a token', async () => {
    const response = await http().post('/auth/register').send(bidder).expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: expect.any(String),
      name: bidder.name,
      email: bidder.email,
      role: Role.BIDDER,
    });
    const wallet = await app.get(PrismaService).wallet.findUnique({
      where: { userId: response.body.user.id },
    });
    expect(wallet).toMatchObject({ totalCents: 0n, committedCents: 0n });
  });

  it('normalizes the e-mail and rejects a duplicate with EMAIL_TAKEN', async () => {
    await http().post('/auth/register').send(bidder).expect(201);
    const response = await http()
      .post('/auth/register')
      .send({ ...bidder, email: '  ANA@exemplo.com ' })
      .expect(409);

    expect(response.body.code).toBe(ErrorCode.EMAIL_TAKEN);
  });

  it('rejects invalid input with field details', async () => {
    const response = await http()
      .post('/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123', role: 'ADMIN' })
      .expect(400);

    expect(response.body.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(Object.keys(response.body.details.fields)).toEqual(
      expect.arrayContaining(['name', 'email', 'password', 'role']),
    );
  });

  it('logs in and reads the current user', async () => {
    await http().post('/auth/register').send(bidder).expect(201);
    const login = await http()
      .post('/auth/login')
      .send({ email: bidder.email, password: bidder.password })
      .expect(200);

    const me = await http()
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(me.body).toMatchObject({ email: bidder.email, role: Role.BIDDER });
    expect(me.body).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password and an unknown e-mail the same way', async () => {
    await http().post('/auth/register').send(bidder).expect(201);
    const wrongPassword = await http()
      .post('/auth/login')
      .send({ email: bidder.email, password: 'outra-senha' })
      .expect(401);
    const unknownEmail = await http()
      .post('/auth/login')
      .send({ email: 'ninguem@exemplo.com', password: bidder.password })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.code).toBe(ErrorCode.INVALID_CREDENTIALS);
  });

  it('rejects /auth/me without a valid token', async () => {
    await http().get('/auth/me').expect(401);
    const response = await http().get('/auth/me').set('Authorization', 'Bearer forged').expect(401);
    expect(response.body.code).toBe(ErrorCode.UNAUTHORIZED);
  });
});
