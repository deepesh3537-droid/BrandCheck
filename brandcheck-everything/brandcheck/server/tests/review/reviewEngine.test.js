import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { segmentText } from '../../src/review/segmenter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');
const seedDir = path.resolve(__dirname, '../../../seed');

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

describe('Phase 4: Content & Review Engine Integration', () => {
  let app;
  let userCookie;
  let workspaceId;
  let contentWithIssuesId;
  let cleanContentId;

  const contentWithIssuesText = fs
    .readFileSync(path.join(seedDir, 'content/with-issues/sample-product-launch.txt'), 'utf-8')
    .trim();
  const cleanContentText = fs
    .readFileSync(path.join(seedDir, 'content/clean/sample-compliant-post.txt'), 'utf-8')
    .trim();

  beforeAll(async () => {
    // Apply all core migrations
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

    // Register user
    const uRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'creator@verdant.com',
        password: 'Password123!',
        displayName: 'Som Reviewer',
      });
    userCookie = uRes.headers['set-cookie'];

    // Create Workspace
    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', userCookie)
      .send({ name: 'Verdant Botanicals' });
    workspaceId = wsRes.body.workspace.id;

    // Seed brand rules (terms, facts, claims, tone guide)
    await request(app)
      .post(`/api/workspaces/${workspaceId}/sources/seed`)
      .set('Cookie', userCookie);
  });

  it('TASK-041: Segmenter accurately extracts sentence offsets', () => {
    const text = 'First sentence. Second sentence! Third one?';
    const segments = segmentText(text);

    expect(segments.length).toBe(3);
    for (const seg of segments) {
      expect(text.slice(seg.start, seg.end)).toBe(seg.text);
    }
  });

  it('TASK-040: Submits content with issues creating immutable version 1', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/contents`)
      .set('Cookie', userCookie)
      .send({
        title: 'Verdant Product Launch',
        body: contentWithIssuesText,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.version.version_no).toBe(1);
    expect(res.body.version.body).toBe(contentWithIssuesText);
    contentWithIssuesId = res.body.id;
  });

  it('TASK-048 & TASK-049: Runs complete review on problematic content detecting seeded violations', async () => {
    const res = await request(app)
      .post(`/api/contents/${contentWithIssuesId}/reviews`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(201);
    expect(res.body.review).toHaveProperty('id');
    expect(res.body.review.status).toBe('ready');

    const findings = res.body.review.findings;
    expect(findings.length).toBeGreaterThanOrEqual(4);

    // Verify Terminology Checks
    const termFindings = findings.filter((f) => f.category === 'terminology');
    const flaggedTerms = termFindings.map((f) => f.flagged_text.toLowerCase());
    expect(flaggedTerms).toContain('revolutionary');
    expect(flaggedTerms).toContain('miracle');

    // Verify Fact Consistency Checks
    const factFindings = findings.filter((f) => f.category === 'fact');
    const flaggedFacts = factFindings.map((f) => f.flagged_text.toLowerCase());
    expect(flaggedFacts.some((t) => t.includes('founded in 2018'))).toBe(true);
    expect(flaggedFacts.some((t) => t.includes('25g protein'))).toBe(true);

    // Verify Exact Character Offset Slicing
    for (const f of findings) {
      const sliced = contentWithIssuesText.slice(f.span_start, f.span_end);
      expect(sliced.toLowerCase()).toBe(f.flagged_text.toLowerCase());
    }

    // Verify Evidence Rule: All term and fact findings are source_backed
    for (const tf of [...termFindings, ...factFindings]) {
      expect(tf.evidence_status).toBe('source_backed');
      expect(tf.source_item_id).toBeDefined();
    }
  });

  it('TASK-049 Clean Content: Produces zero terminology or fact errors on clean post', async () => {
    const contentRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/contents`)
      .set('Cookie', userCookie)
      .send({
        title: 'Compliant Social Post',
        body: cleanContentText,
      });

    cleanContentId = contentRes.body.id;

    const reviewRes = await request(app)
      .post(`/api/contents/${cleanContentId}/reviews`)
      .set('Cookie', userCookie);

    expect(reviewRes.status).toBe(201);
    const findings = reviewRes.body.review.findings;

    const blockingErrors = findings.filter(
      (f) => f.severity === 'error' && (f.category === 'terminology' || f.category === 'fact')
    );
    expect(blockingErrors.length).toBe(0);
  });

  it('TASK-053: Records creator decision on finding (accept, edit, reject, challenge)', async () => {
    // Get review
    const listRes = await request(app)
      .get(`/api/workspaces/${workspaceId}/contents/${contentWithIssuesId}`)
      .set('Cookie', userCookie);

    const revRes = await request(app)
      .post(`/api/contents/${contentWithIssuesId}/reviews`)
      .set('Cookie', userCookie);

    const firstFinding = revRes.body.review.findings[0];

    const decisionRes = await request(app)
      .patch(`/api/findings/${firstFinding.id}/decision`)
      .set('Cookie', userCookie)
      .send({
        decision: 'accepted',
        decision_note: 'Applied approved brand replacement phrase',
      });

    expect(decisionRes.status).toBe(200);
    expect(decisionRes.body.finding.decision).toBe('accepted');
    expect(decisionRes.body.finding.decision_note).toBe('Applied approved brand replacement phrase');
  });
});
