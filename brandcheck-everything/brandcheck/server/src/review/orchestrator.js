import { pool } from '../db/pool.js';
import { segmentText } from './segmenter.js';
import { checkTerminology } from './rules/terminology.js';
import { checkFacts } from './rules/facts.js';
import { checkClaims } from './rules/claims.js';
import { checkToneWithModel } from './rules/toneCheck.js';
import { checkAccessibility } from './rules/accessibility.js';
import { checkRequiredPhrases } from './rules/requiredPhrase.js';
import { normaliseFindings } from './normaliser.js';
import { checkOllamaAvailability } from './models/availability.js';

export const reviewOrchestrator = {
  /**
   * Run complete review on a content version
   * @param {Object} params
   * @param {string} params.workspaceId
   * @param {string} params.contentVersionId
   * @param {string} params.contentBody
   * @returns {Promise<Object>} Review object with findings
   */
  async runReview({ workspaceId, contentVersionId, contentBody }) {
    const rawFindings = [];
    const modelsUsed = {};
    const skippedChecks = [];

    // 1. Fetch all active sources in workspace
    const sourcesRes = await pool.query(
      `SELECT id, workspace_id, type, title, body, structured, embedding, version, active
       FROM source_items
       WHERE workspace_id = $1 AND active = true`,
      [workspaceId]
    );
    const sources = sourcesRes.rows;
    const validSourceIds = new Set(sources.map((s) => s.id));

    const termSources = sources.filter((s) => s.type === 'term');
    const factSources = sources.filter((s) => s.type === 'fact');
    const claimSources = sources.filter((s) => s.type === 'claim');
    const requiredPhraseSources = sources.filter(
      (s) => s.type === 'required_phrase' || Boolean(s.structured?.phrase || s.structured?.required_phrase || s.structured?.required)
    );
    const toneSource = sources.find((s) => s.type === 'tone') || null;

    // 2. Segment content with precise character offsets
    const segments = segmentText(contentBody);

    // 3. Deterministic Rule Checks (Always run fast and reliably)
    try {
      const termFindings = checkTerminology(contentBody, termSources);
      rawFindings.push(...termFindings);
      modelsUsed.terminology_rule = 'v1.0';
    } catch (e) {
      console.error('[Orchestrator] Terminology check error:', e);
      skippedChecks.push({ check: 'terminology', reason: e.message });
    }

    try {
      const factFindings = checkFacts(contentBody, factSources);
      rawFindings.push(...factFindings);
      modelsUsed.facts_rule = 'v1.0';
    } catch (e) {
      console.error('[Orchestrator] Fact check error:', e);
      skippedChecks.push({ check: 'facts', reason: e.message });
    }

    try {
      const claimFindings = checkClaims(contentBody, claimSources);
      rawFindings.push(...claimFindings);
      modelsUsed.claims_rule = 'v1.0';
    } catch (e) {
      console.error('[Orchestrator] Claims check error:', e);
      skippedChecks.push({ check: 'claims', reason: e.message });
    }

    // Required Phrase Checks (TASK-084)
    try {
      const requiredFindings = checkRequiredPhrases(contentBody, requiredPhraseSources);
      rawFindings.push(...requiredFindings);
      modelsUsed.required_phrase_rule = 'v1.0';
    } catch (e) {
      console.error('[Orchestrator] Required phrase check error:', e);
      skippedChecks.push({ check: 'required_phrase', reason: e.message });
    }

    // Accessibility Checks (TASK-082)
    try {
      const a11yFindings = checkAccessibility(contentBody);
      rawFindings.push(...a11yFindings);
      modelsUsed.accessibility_rule = 'v1.0';
    } catch (e) {
      console.error('[Orchestrator] Accessibility check error:', e);
      skippedChecks.push({ check: 'accessibility', reason: e.message });
    }

    // 4. Model-Assisted Tone Check (Graceful degradation)
    try {
      const toneFindings = await checkToneWithModel(segments, toneSource);
      rawFindings.push(...toneFindings);
      modelsUsed.deberta_tone = 'v3-small';
    } catch (e) {
      console.warn('[Orchestrator] Tone model check skipped:', e.message);
      skippedChecks.push({ check: 'tone', reason: e.message });
    }

    // 5. Normalise findings and enforce evidence rule
    const normalised = normaliseFindings(rawFindings, validSourceIds);

    // 6. Persist review and findings to database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reviewRes = await client.query(
        `INSERT INTO reviews (content_version_id, status, models_used, skipped_checks)
         VALUES ($1, 'ready', $2, $3)
         RETURNING id, content_version_id, status, models_used, skipped_checks, created_at`,
        [contentVersionId, JSON.stringify(modelsUsed), JSON.stringify(skippedChecks)]
      );
      const review = reviewRes.rows[0];

      const insertedFindings = [];
      for (const f of normalised) {
        const findRes = await client.query(
          `INSERT INTO findings 
             (review_id, category, severity, evidence_status, span_start, span_end, 
              flagged_text, explanation, source_item_id, suggested_text, confidence, 
              origin, decision)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
           RETURNING *`,
          [
            review.id,
            f.category,
            f.severity,
            f.evidence_status,
            f.span_start,
            f.span_end,
            f.flagged_text,
            f.explanation,
            f.source_item_id,
            f.suggested_text,
            f.confidence,
            f.origin,
          ]
        );
        insertedFindings.push(findRes.rows[0]);
      }

      await client.query('COMMIT');

      return await this.getReviewById(review.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Fetch review by ID with all its findings and source citations
   */
  async getReviewById(reviewId) {
    const reviewRes = await pool.query(
      `SELECT r.id, r.content_version_id, r.status, r.models_used, r.skipped_checks, r.created_at,
              cv.version_no, cv.body AS content_body, cv.content_id, c.title AS content_title,
              c.workspace_id
       FROM reviews r
       JOIN content_versions cv ON r.content_version_id = cv.id
       JOIN contents c ON cv.content_id = c.id
       WHERE r.id = $1`,
      [reviewId]
    );

    if (reviewRes.rows.length === 0) return null;
    const review = reviewRes.rows[0];

    const findingsRes = await pool.query(
      `SELECT f.*, si.title AS source_title, si.body AS source_body, si.type AS source_type
       FROM findings f
       LEFT JOIN source_items si ON f.source_item_id = si.id
       WHERE f.review_id = $1
       ORDER BY f.span_start ASC`,
      [reviewId]
    );

    return {
      ...review,
      findings: findingsRes.rows,
    };
  },
};
