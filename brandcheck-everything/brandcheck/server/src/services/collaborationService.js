import { pool } from '../db/pool.js';

export const collaborationService = {
  /**
   * Add a discussion comment to a review or specific finding
   */
  async addComment({ reviewId, findingId = null, authorId, body }) {
    const res = await pool.query(
      `INSERT INTO comments (review_id, finding_id, author_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, review_id, finding_id, author_id, body, created_at`,
      [reviewId, findingId || null, authorId, body]
    );

    // Fetch with author metadata
    const commentRes = await pool.query(
      `SELECT c.*, u.display_name AS author_name, u.email AS author_email
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [res.rows[0].id]
    );

    // Record audit event
    await this.recordEvent({
      reviewId,
      actorId: authorId,
      type: findingId ? 'finding_comment_added' : 'review_comment_added',
      payload: {
        commentId: res.rows[0].id,
        findingId: findingId || null,
        bodyPreview: body.slice(0, 100),
      },
    });

    return commentRes.rows[0];
  },

  /**
   * Get all comments for a review
   */
  async getComments(reviewId) {
    const res = await pool.query(
      `SELECT c.*, u.display_name AS author_name, u.email AS author_email
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.review_id = $1
       ORDER BY c.created_at ASC`,
      [reviewId]
    );
    return res.rows;
  },

  /**
   * Record append-only audit trail event
   */
  async recordEvent({ reviewId, actorId, type, payload = {} }) {
    const res = await pool.query(
      `INSERT INTO review_events (review_id, actor_id, type, payload)
       VALUES ($1, $2, $3, $4)
       RETURNING id, review_id, actor_id, type, payload, created_at`,
      [reviewId, actorId || null, type, JSON.stringify(payload)]
    );
    return res.rows[0];
  },

  /**
   * Get append-only audit trail events
   */
  async getEvents(reviewId) {
    const res = await pool.query(
      `SELECT re.*, u.display_name AS actor_name, u.email AS actor_email
       FROM review_events re
       LEFT JOIN users u ON re.actor_id = u.id
       WHERE re.review_id = $1
       ORDER BY re.created_at ASC`,
      [reviewId]
    );
    return res.rows;
  },

  /**
   * Update review status (approve or request changes) with ADR-020 governance rule
   */
  async updateStatus({ reviewId, actorId, status, note }) {
    const validStatuses = ['in_review', 'changes_requested', 'approved'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid review status. Must be one of: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    // 1. Fetch review, workspace, and content creator
    const reviewRes = await pool.query(
      `SELECT r.id, r.status, c.workspace_id, c.created_by AS content_author_id, c.title AS content_title
       FROM reviews r
       JOIN content_versions cv ON r.content_version_id = cv.id
       JOIN contents c ON cv.content_id = c.id
       WHERE r.id = $1`,
      [reviewId]
    );

    if (reviewRes.rows.length === 0) {
      const err = new Error('Review not found');
      err.status = 404;
      throw err;
    }

    const review = reviewRes.rows[0];

    // 2. Fetch actor role in this workspace
    const memberRes = await pool.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [review.workspace_id, actorId]
    );

    if (memberRes.rows.length === 0) {
      const err = new Error('You do not belong to this workspace');
      err.status = 403;
      throw err;
    }

    const actorRole = memberRes.rows[0].role;

    // 3. ADR-020 ENFORCEMENT: Content creator CANNOT approve their own review
    if (status === 'approved' && (review.content_author_id === actorId || actorRole === 'creator')) {
      const err = new Error('Brand Governance Rule Violation (ADR-020): Content creators cannot approve their own work. Independent reviewer sign-off is required.');
      err.status = 403;
      err.code = 'CREATOR_CANNOT_APPROVE';
      throw err;
    }

    // Only reviewer or owner can approve or request changes
    if (status === 'approved' || status === 'changes_requested') {
      if (actorRole !== 'reviewer' && actorRole !== 'owner') {
        const err = new Error('Only a designated Reviewer or Workspace Owner can approve or request changes');
        err.status = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }
    }

    // 4. Update review status
    const updatedRes = await pool.query(
      `UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *`,
      [status, reviewId]
    );

    // 5. Append audit event
    await this.recordEvent({
      reviewId,
      actorId,
      type: 'status_changed',
      payload: {
        previousStatus: review.status,
        newStatus: status,
        note: note || null,
      },
    });

    // 6. If note is attached, save as comment too
    if (note && note.trim()) {
      await pool.query(
        `INSERT INTO comments (review_id, author_id, body)
         VALUES ($1, $2, $3)`,
        [reviewId, actorId, `[${status.toUpperCase().replace('_', ' ')}] ${note.trim()}`]
      );
    }

    return updatedRes.rows[0];
  },
};
