import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { contentService } from '../services/contentService.js';
import { reviewOrchestrator } from '../review/orchestrator.js';
import { collaborationService } from '../services/collaborationService.js';
import { pool } from '../db/pool.js';

export const reviewsRouter = Router();

reviewsRouter.use(requireAuth);

/**
 * POST /api/contents/:contentId/reviews
 * Trigger automated brand governance review for content
 */
reviewsRouter.post('/contents/:contentId/reviews', async (req, res, next) => {
  try {
    const { contentId } = req.params;

    // 1. Fetch content and current version
    const contentRes = await pool.query(
      `SELECT c.id, c.workspace_id, c.title, cv.id AS version_id, cv.body
       FROM contents c
       JOIN content_versions cv ON cv.content_id = c.id
       WHERE c.id = $1
       ORDER BY cv.version_no DESC
       LIMIT 1`,
      [contentId]
    );

    if (contentRes.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Content not found' },
      });
    }

    const content = contentRes.rows[0];

    // Check workspace membership
    const memberRole = await pool.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [content.workspace_id, req.user.id]
    );

    if (memberRole.rows.length === 0) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have access to this workspace' },
      });
    }

    // Run review pipeline
    const review = await reviewOrchestrator.runReview({
      workspaceId: content.workspace_id,
      contentVersionId: content.version_id,
      contentBody: content.body,
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reviews/:reviewId
 * Retrieve review with all findings and cited brand sources
 */
reviewsRouter.get('/reviews/:reviewId', async (req, res, next) => {
  try {
    const review = await reviewOrchestrator.getReviewById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Review not found' },
      });
    }

    // Verify workspace membership
    const memberRole = await pool.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [review.workspace_id, req.user.id]
    );

    if (memberRole.rows.length === 0) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have access to this workspace' },
      });
    }

    res.json({ review });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/findings/:findingId/decision
 * Creator decision on finding: accept | edit | reject | defer | challenge
 */
reviewsRouter.patch('/findings/:findingId/decision', async (req, res, next) => {
  try {
    const { findingId } = req.params;
    const { decision, decision_text, decision_note } = req.body;

    const validDecisions = ['pending', 'accepted', 'edited', 'rejected', 'deferred', 'challenged'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        error: { code: 'INVALID_DECISION', message: `Decision must be one of: ${validDecisions.join(', ')}` },
      });
    }

    const findingRes = await pool.query(
      `UPDATE findings
       SET decision = $1,
           decision_text = $2,
           decision_note = $3,
           decided_by = $4,
           decided_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [decision, decision_text || null, decision_note || null, req.user.id, findingId]
    );

    if (findingRes.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Finding not found' },
      });
    }

    const enrichedFindingRes = await pool.query(
      `SELECT f.*, si.title AS source_title, si.body AS source_body, si.type AS source_type
       FROM findings f
       LEFT JOIN source_items si ON f.source_item_id = si.id
       WHERE f.id = $1`,
      [findingId]
    );

    // Record audit event
    await collaborationService.recordEvent({
      reviewId: findingRes.rows[0].review_id,
      actorId: req.user.id,
      type: 'finding_decision_recorded',
      payload: {
        findingId,
        decision,
        decisionText: decision_text || null,
        decisionNote: decision_note || null,
      },
    });

    res.json({ finding: enrichedFindingRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reviews/:reviewId/comments
 * Add comment to review or finding
 */
reviewsRouter.post('/reviews/:reviewId/comments', async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { findingId, body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        error: { code: 'INVALID_BODY', message: 'Comment body cannot be empty' },
      });
    }

    const comment = await collaborationService.addComment({
      reviewId,
      findingId: findingId || null,
      authorId: req.user.id,
      body: body.trim(),
    });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reviews/:reviewId/comments
 * List comments for a review
 */
reviewsRouter.get('/reviews/:reviewId/comments', async (req, res, next) => {
  try {
    const comments = await collaborationService.getComments(req.params.reviewId);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reviews/:reviewId/status
 * Reviewer sign-off: approve or request changes (enforcing ADR-020)
 */
reviewsRouter.post('/reviews/:reviewId/status', async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status, note } = req.body;

    const updatedReview = await collaborationService.updateStatus({
      reviewId,
      actorId: req.user.id,
      status,
      note,
    });

    res.json({ review: updatedReview });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reviews/:reviewId/events
 * List append-only audit trail events
 */
reviewsRouter.get('/reviews/:reviewId/events', async (req, res, next) => {
  try {
    const events = await collaborationService.getEvents(req.params.reviewId);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});
