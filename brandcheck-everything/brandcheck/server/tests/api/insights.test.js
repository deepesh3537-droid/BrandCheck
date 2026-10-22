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

describe('Workspace Insights API (TASK-083)', () => {
  let app;
  let ownerCookie;
  let otherUserCookie;
  let workspaceId;

  beforeAll(async () => {
    // Apply migrations
    const files = [
      '001_users.sql',
      '002_workspaces_members.sql',
      '004_source_items.sql',
      '005_contents_versions.sql',
      '006_reviews_findings.sql',
    ];

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      db.public.none(sql);
    }

    const appModule = await import('../../src/app.js');
    app = appModule.app;

    // Register Workspace Owner
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'insights.owner@brandcheck.ai',
        password: 'Password123!',
        displayName: 'Insights Owner',
      });
    ownerCookie = regRes.headers['set-cookie'];

    // Register Outsider User
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'outsider@brandcheck.ai',
        password: 'Password123!',
        displayName: 'Outsider User',
      });
    otherUserCookie = otherRes.headers['set-cookie'];

    // Create Workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Insights Test Workspace' });
    workspaceId = wsRes.body.workspace.id;

    // Seed content, version, review, and findings with decisions
    const contentRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/contents`)
      .set('Cookie', ownerCookie)
      .send({
        title: 'Q3 Press Release',
        body: 'Our revolutionary drink eliminates fatigue.',
      });
    const contentVersionId = contentRes.body.version.id;

    // Create Review
    const revRow = await memPool.query(
      `INSERT INTO reviews (content_version_id, status)
       VALUES ($1, 'ready') RETURNING id`,
      [contentVersionId]
    );
    const reviewId = revRow.rows[0].id;

    // Insert 2 accepted findings, 1 rejected finding
    await memPool.query(
      `INSERT INTO findings 
         (review_id, category, severity, evidence_status, span_start, span_end, 
          flagged_text, explanation, suggested_text, confidence, origin, decision)
       VALUES 
         ($1, 'terminology', 'warning', 'uncertain', 4, 17, 'revolutionary', 'Hype term', 'innovative', 0.9, 'rule', 'accepted'),
         ($1, 'terminology', 'warning', 'uncertain', 4, 17, 'revolutionary', 'Hype term', 'innovative', 0.9, 'rule', 'accepted'),
         ($1, 'tone', 'suggestion', 'uncertain', 18, 30, 'fatigue', 'Casual tone', 'tiredness', 0.8, 'model', 'rejected')`,
      [reviewId]
    );
  });

  it('rejects access from non-members with 403', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/insights`)
      .set('Cookie', otherUserCookie);

    expect(res.status).toBe(403);
  });

  it('calculates real decision distribution and repeated mistakes', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/insights`)
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('insights');

    const insights = res.body.insights;
    expect(insights.totalFindings).toBe(3);
    expect(insights.totalDecided).toBe(3);
    expect(insights.decisions.accepted).toBe(2);
    expect(insights.decisions.rejected).toBe(1);
    expect(insights.acceptanceRate).toBe(66.7);

    // Repeated mistake: 'revolutionary' was accepted twice
    expect(insights.topRepeatedMistakes.length).toBeGreaterThan(0);
    expect(insights.topRepeatedMistakes[0].term).toBe('revolutionary');
    expect(insights.topRepeatedMistakes[0].occurrences).toBe(2);

    // Category breakdown
    expect(insights.categoryBreakdown.length).toBe(2);
    const termCategory = insights.categoryBreakdown.find((c) => c.category === 'terminology');
    expect(termCategory).toBeDefined();
    expect(termCategory.accepted).toBe(2);
    expect(termCategory.acceptanceRate).toBe(100);
  });
});
