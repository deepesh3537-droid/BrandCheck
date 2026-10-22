import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

// Setup in-memory pg database for integration test
const db = newDb();
db.registerExtension('pgcrypto', (schema) => {
  schema.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => '11111111-1111-1111-1111-111111111111',
  });
});

const memPg = db.adapters.createPg();
const memPool = new memPg.Pool();

// Mock pool.js to point to in-memory database
vi.mock('../../src/db/pool.js', () => {
  return {
    query: (text, params = []) => memPool.query(text, params),
    pool: memPool,
  };
});

describe('Authentication API (/api/auth)', () => {
  let app;

  beforeAll(async () => {
    // Apply users migration
    const userSql = fs.readFileSync(path.join(migrationsDir, '001_users.sql'), 'utf-8');
    db.public.none(userSql);

    const appModule = await import('../../src/app.js');
    app = appModule.app;
  });

  it('rejects registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123', displayName: 'A' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('successfully registers a new user and sets auth cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'creator@brandcheck.ai',
        password: 'Password123!',
        displayName: 'Deepesh Kumar',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('creator@brandcheck.ai');
    expect(res.body.user.displayName).toBe('Deepesh Kumar');
    expect(res.body.user).not.toHaveProperty('password_hash');

    // Cookie verification
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('brandcheck_auth=');
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'creator@brandcheck.ai',
        password: 'Password123!',
        displayName: 'Deepesh Kumar',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('authenticates user with valid credentials and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator@brandcheck.ai',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('creator@brandcheck.ai');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator@brandcheck.ai',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects /api/auth/me when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows access to /api/auth/me with valid session cookie', async () => {
    // Login to obtain cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator@brandcheck.ai',
        password: 'Password123!',
      });

    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('creator@brandcheck.ai');
    expect(meRes.body.user.displayName).toBe('Deepesh Kumar');
  });

  it('clears session cookie on logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});
