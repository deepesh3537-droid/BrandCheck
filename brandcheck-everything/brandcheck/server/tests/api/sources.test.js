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

vi.mock('../../src/db/pool.js', () => {
  return {
    query: (text, params = []) => memPool.query(text, params),
    pool: memPool,
  };
});

describe('Brand Sources API & Isolation (/api/workspaces/:id/sources)', () => {
  let app;
  let user1Cookie;
  let user2Cookie;
  let ws1Id;
  let ws2Id;
  let createdSourceId;

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

    // User 1
    const u1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@brandcheck.ai', password: 'Password123!', displayName: 'Owner' });
    user1Cookie = u1.headers['set-cookie'];

    // User 2
    const u2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'other@brandcheck.ai', password: 'Password123!', displayName: 'Other' });
    user2Cookie = u2.headers['set-cookie'];

    // Create WS 1 for User 1
    const ws1 = await request(app)
      .post('/api/workspaces')
      .set('Cookie', user1Cookie)
      .send({ name: 'Workspace One' });
    ws1Id = ws1.body.workspace.id;

    // Create WS 2 for User 2
    const ws2 = await request(app)
      .post('/api/workspaces')
      .set('Cookie', user2Cookie)
      .send({ name: 'Workspace Two' });
    ws2Id = ws2.body.workspace.id;
  });

  it('rejects unauthenticated requests to sources', async () => {
    const res = await request(app).get(`/api/workspaces/${ws1Id}/sources`);
    expect(res.status).toBe(401);
  });

  it('creates a new prohibited term source and computes 384-dim embedding', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${ws1Id}/sources`)
      .set('Cookie', user1Cookie)
      .send({
        type: 'term',
        title: "Prohibited: 'revolutionary'",
        body: "Guideline: do not use the buzzword 'revolutionary'.",
        structured: { prohibited: 'revolutionary', preferred: 'innovative' },
      });

    expect(res.status).toBe(201);
    expect(res.body.source).toHaveProperty('id');
    expect(res.body.source.type).toBe('term');
    expect(res.body.source.version).toBe(1);
    expect(res.body.source.embedding).toBeDefined();
    expect(res.body.source.embedding.length).toBe(384);
    createdSourceId = res.body.source.id;
  });

  it('lists sources for Workspace 1', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${ws1Id}/sources`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.sources.length).toBe(1);
    expect(res.body.sources[0].id).toBe(createdSourceId);
  });

  it('seeds workspace with Verdant Botanicals rules', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${ws1Id}/sources/seed`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(201);
    expect(res.body.count).toBeGreaterThan(5);

    const listRes = await request(app)
      .get(`/api/workspaces/${ws1Id}/sources`)
      .set('Cookie', user1Cookie);

    expect(listRes.body.sources.length).toBeGreaterThan(6);
  });

  it('filters sources by type=fact', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${ws1Id}/sources?type=fact`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.sources.length).toBeGreaterThan(0);
    for (const src of res.body.sources) {
      expect(src.type).toBe('fact');
    }
  });

  it('updates a source and increments version to 2', async () => {
    const res = await request(app)
      .patch(`/api/workspaces/${ws1Id}/sources/${createdSourceId}`)
      .set('Cookie', user1Cookie)
      .send({
        title: "Prohibited: 'revolutionary' and 'groundbreaking'",
      });

    expect(res.status).toBe(200);
    expect(res.body.source.version).toBe(2);
    expect(res.body.source.title).toContain('groundbreaking');
  });

  it('enforces workspace isolation: User 2 cannot access Workspace 1 sources', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${ws1Id}/sources`)
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('User 2 sees 0 sources in Workspace 2', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${ws2Id}/sources`)
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(200);
    expect(res.body.sources.length).toBe(0);
  });

  it('deletes a source item', async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${ws1Id}/sources/${createdSourceId}`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
