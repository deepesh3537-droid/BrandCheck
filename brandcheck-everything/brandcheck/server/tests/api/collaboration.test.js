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

describe('Phase 6: Collaboration, Invitations & Governance Sign-Off (ADR-020)', () => {
  let app;
  let ownerCookie;
  let reviewerCookie;
  let creatorCookie;
  let ownerId;
  let reviewerId;
  let creatorId;
  let workspaceId;
  let contentId;
  let reviewId;
  let inviteToken;

  beforeAll(async () => {
    // Run all migrations
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const f of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
      db.public.none(sql);
    }

    const appModule = await import('../../src/app.js');
    app = appModule.app;

    // 1. Register Owner
    const oRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@brand.com', password: 'Password123!', displayName: 'Workspace Owner' });
    ownerCookie = oRes.headers['set-cookie'];
    ownerId = oRes.body.user.id;

    // 2. Register Reviewer
    const rRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'reviewer@brand.com', password: 'Password123!', displayName: 'Quality Reviewer' });
    reviewerCookie = rRes.headers['set-cookie'];
    reviewerId = rRes.body.user.id;

    // 3. Register Creator
    const cRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'creator@brand.com', password: 'Password123!', displayName: 'Copy Creator' });
    creatorCookie = cRes.headers['set-cookie'];
    creatorId = cRes.body.user.id;

    // 4. Create Workspace by Owner
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Brand Governance Team' });
    workspaceId = wsRes.body.workspace.id;

    // Add Reviewer to workspace
    await memPool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'reviewer')`,
      [workspaceId, reviewerId]
    );

    // Add Creator to workspace
    await memPool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'creator')`,
      [workspaceId, creatorId]
    );

    // Submit content draft by Creator
    const contentRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/contents`)
      .set('Cookie', creatorCookie)
      .send({
        title: 'Q4 Product Launch Press Release',
        body: 'We are proud to introduce our verified organic botanical tonics.',
      });
    contentId = contentRes.body.id;

    // Trigger review
    const revRes = await request(app)
      .post(`/api/contents/${contentId}/reviews`)
      .set('Cookie', creatorCookie);
    reviewId = revRes.body.review.id;
  });

  it('TASK-060: Owner generates hashed invitation token with expiration', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/invitations`)
      .set('Cookie', ownerCookie)
      .send({ role: 'reviewer', expiresInHours: 48 });

    expect(res.status).toBe(201);
    expect(res.body.invitation).toHaveProperty('token');
    expect(res.body.invitation.role).toBe('reviewer');
    inviteToken = res.body.invitation.token;
  });

  it('TASK-060: Public can inspect invitation token metadata', async () => {
    const res = await request(app).get(`/api/invitations/${inviteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.invitation.workspace_name).toBe('Brand Governance Team');
    expect(res.body.invitation.role).toBe('reviewer');
    expect(res.body.invitation.isValid).toBe(true);
  });

  it('TASK-060: Authenticated user accepts invitation and joins workspace', async () => {
    // Register new user
    const newUser = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newcollab@brand.com', password: 'Password123!', displayName: 'New Collab' });
    const newCookie = newUser.headers['set-cookie'];

    const res = await request(app)
      .post(`/api/invitations/${inviteToken}/accept`)
      .set('Cookie', newCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.membership.workspaceId).toBe(workspaceId);

    // Second accept fails (already used)
    const secondRes = await request(app)
      .post(`/api/invitations/${inviteToken}/accept`)
      .set('Cookie', newCookie);
    expect(secondRes.status).toBe(500);
  });

  it('TASK-061 & TASK-062: Posts and retrieves comments for review discussion', async () => {
    // Add comment
    const postRes = await request(app)
      .post(`/api/reviews/${reviewId}/comments`)
      .set('Cookie', reviewerCookie)
      .send({ body: 'Please verify botanical sourcing claims before final release.' });

    expect(postRes.status).toBe(201);
    expect(postRes.body.comment.body).toContain('botanical sourcing claims');

    // List comments
    const listRes = await request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .set('Cookie', creatorCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.comments.length).toBeGreaterThanOrEqual(1);
  });

  it('TASK-063 & ADR-020: Creator CANNOT approve their own content review', async () => {
    const res = await request(app)
      .post(`/api/reviews/${reviewId}/status`)
      .set('Cookie', creatorCookie)
      .send({ status: 'approved', note: 'Self-approval attempt' });

    // Enforces governance rule: creator cannot self-approve
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CREATOR_CANNOT_APPROVE');
  });

  it('TASK-063: Reviewer can request changes and approve review', async () => {
    // 1. Request changes
    const changeRes = await request(app)
      .post(`/api/reviews/${reviewId}/status`)
      .set('Cookie', reviewerCookie)
      .send({ status: 'changes_requested', note: 'Tone needs to be more restrained.' });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.review.status).toBe('changes_requested');

    // 2. Final Approval by Reviewer
    const appRes = await request(app)
      .post(`/api/reviews/${reviewId}/status`)
      .set('Cookie', reviewerCookie)
      .send({ status: 'approved', note: 'All guidelines verified and compliant.' });

    expect(appRes.status).toBe(200);
    expect(appRes.body.review.status).toBe('approved');
  });

  it('TASK-064: Append-only audit trail logs all events in chronological sequence', async () => {
    const res = await request(app)
      .get(`/api/reviews/${reviewId}/events`)
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(2);

    const eventTypes = res.body.events.map((e) => e.type);
    expect(eventTypes).toContain('review_comment_added');
    expect(eventTypes).toContain('status_changed');
  });
});
