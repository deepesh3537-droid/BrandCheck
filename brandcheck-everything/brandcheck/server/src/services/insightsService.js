import { pool } from '../db/pool.js';

export const insightsService = {
  /**
   * Retrieves repeated-mistake insights derived strictly from recorded human decisions.
   * Per TASK-083 & PRD §Non-Functional: Analytics derived only from real recorded data.
   * 
   * @param {string} workspaceId
   * @returns {Promise<Object>}
   */
  async getWorkspaceInsights(workspaceId) {
    // 1. Decision distribution across all reviews in workspace
    const decisionsRes = await pool.query(
      `SELECT 
         f.decision,
         COUNT(f.id)::int as count
       FROM findings f
       JOIN reviews r ON f.review_id = r.id
       JOIN content_versions cv ON r.content_version_id = cv.id
       JOIN contents c ON cv.content_id = c.id
       WHERE c.workspace_id = $1
       GROUP BY f.decision`,
      [workspaceId]
    );

    const decisions = {
      pending: 0,
      accepted: 0,
      edited: 0,
      rejected: 0,
      deferred: 0,
      challenged: 0,
    };

    let totalDecided = 0;
    let totalFindings = 0;

    for (const row of decisionsRes.rows) {
      const dec = row.decision;
      const count = row.count;
      decisions[dec] = count;
      totalFindings += count;
      if (dec !== 'pending') {
        totalDecided += count;
      }
    }

    const acceptanceRate = totalDecided > 0 
      ? Number((((decisions.accepted + decisions.edited) / totalDecided) * 100).toFixed(1))
      : 0;

    // 2. Top repeated mistakes (flagged items that were accepted or edited by creators)
    const mistakesRes = await pool.query(
      `SELECT 
         LOWER(f.flagged_text) as term,
         f.category,
         si.title as source_title,
         COUNT(f.id)::int as occurrences,
         MAX(f.suggested_text) as suggested_text
       FROM findings f
       JOIN reviews r ON f.review_id = r.id
       JOIN content_versions cv ON r.content_version_id = cv.id
       JOIN contents c ON cv.content_id = c.id
       LEFT JOIN source_items si ON f.source_item_id = si.id
       WHERE c.workspace_id = $1
         AND f.decision IN ('accepted', 'edited')
         AND f.flagged_text != ''
       GROUP BY LOWER(f.flagged_text), f.category, si.title
       ORDER BY occurrences DESC
       LIMIT 10`,
      [workspaceId]
    );

    // 3. Category performance breakdown
    const categoryRes = await pool.query(
      `SELECT 
         f.category,
         COUNT(f.id)::int as total,
         COUNT(CASE WHEN f.decision IN ('accepted', 'edited') THEN 1 END)::int as accepted_count,
         COUNT(CASE WHEN f.decision = 'rejected' THEN 1 END)::int as rejected_count
       FROM findings f
       JOIN reviews r ON f.review_id = r.id
       JOIN content_versions cv ON r.content_version_id = cv.id
       JOIN contents c ON cv.content_id = c.id
       WHERE c.workspace_id = $1
       GROUP BY f.category
       ORDER BY total DESC`,
      [workspaceId]
    );

    return {
      workspaceId,
      totalFindings,
      totalDecided,
      acceptanceRate,
      decisions,
      topRepeatedMistakes: mistakesRes.rows,
      categoryBreakdown: categoryRes.rows.map((row) => ({
        category: row.category,
        total: row.total,
        accepted: row.accepted_count,
        rejected: row.rejected_count,
        acceptanceRate: row.total > 0 ? Number(((row.accepted_count / row.total) * 100).toFixed(1)) : 0,
      })),
    };
  },
};
