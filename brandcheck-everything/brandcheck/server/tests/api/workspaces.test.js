import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

// Setup in-memory pg database
const db = newDb();
db.registerExtension('pgcrypto', (schema) => {
  schema.registerFunction({
    name: 'gen_random_uuid',
    impure: true,
    implementation: () => crypto.randomUUID(),
  });
});


const memPg = db.adapters.createPg();
const memPool = new memPg.Pool();

// Mock pool.js
vi.mock('../../src/db/pool.js', () => {
  return {
    query: (text, params = []) => memPool.query(text, params),
    pool: memPool,
  };
});

describe('Workspaces API & Isolation (/api/workspaces)', () => {
  let app;
  let user1Cookie;
  let user2Cookie;
  let workspace1Id;

  beforeAll(async () => {
    // Apply migrations
    const userSql = fs.readFileSync(path.join(migrationsDir, '001_users.sql'), 'utf-8');
    const wsSql = fs.readFileSync(path.join(migrationsDir, '002_workspaces_members.sql'), 'utf-8');
    const srcSql = fs.readFileSync(path.join(migrationsDir, '004_source_items.sql'), 'utf-8');

    db.public.none(userSql);
    db.public.none(wsSql);
    db.public.none(srcSql);

    const appModule = await import('../../src/app.js');
    app = appModule.app;

    // Register User 1
    const u1Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user1@brandcheck.ai',
        password: 'Password123!',
        displayName: 'User One',
      });
    user1Cookie = u1Res.headers['set-cookie'];

    // Register User 2
    const u2Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user2@brandcheck.ai',
        password: 'Password123!',
        displayName: 'User Two',
      });
    user2Cookie = u2Res.headers['set-cookie'];
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/workspaces');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('validates workspace name on creation (rejects empty name)', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Cookie', user1Cookie)
      .send({ name: ' ' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('allows User 1 to create a workspace and assigns owner role', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Cookie', user1Cookie)
      .send({ name: 'Acme Brand' });

    expect(res.status).toBe(201);
    expect(res.body.workspace).toHaveProperty('id');
    expect(res.body.workspace.name).toBe('Acme Brand');
    expect(res.body.workspace.role).toBe('owner');
    workspace1Id = res.body.workspace.id;
  });

  it('lists workspaces belonging to User 1', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.workspaces.length).toBe(1);
    expect(res.body.workspaces[0].name).toBe('Acme Brand');
    expect(res.body.workspaces[0].role).toBe('owner');
  });

  it('isolates workspaces: User 2 sees 0 workspaces initially', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(200);
    expect(res.body.workspaces.length).toBe(0);
  });

  it('denies User 2 access to User 1 workspace (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspace1Id}`)
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows User 1 to access their own workspace by ID', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspace1Id}`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.workspace.id).toBe(workspace1Id);
    expect(res.body.workspace.name).toBe('Acme Brand');
  });

  it('lists workspace members for authorized user', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspace1Id}/members`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.members.length).toBe(1);
    expect(res.body.members[0].email).toBe('user1@brandcheck.ai');
    expect(res.body.members[0].role).toBe('owner');
  });
});
