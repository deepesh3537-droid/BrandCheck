import { pool } from '../db/pool.js';

export const contentService = {
  /**
   * Submit new draft content, creating the immutable initial version (v1)
   */
  async createContent({ workspaceId, title, body, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const contentRes = await client.query(
        `INSERT INTO contents (workspace_id, title, created_by)
         VALUES ($1, $2, $3)
         RETURNING id, workspace_id, title, created_by, created_at`,
        [workspaceId, title, userId]
      );
      const content = contentRes.rows[0];

      const versionRes = await client.query(
        `INSERT INTO content_versions (content_id, version_no, body, created_by)
         VALUES ($1, 1, $2, $3)
         RETURNING id, content_id, version_no, body, created_by, created_at`,
        [content.id, body, userId]
      );
      const version = versionRes.rows[0];

      await client.query('COMMIT');
      return {
        ...content,
        version,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * List all content submissions in workspace
   */
  async listWorkspaceContents(workspaceId) {
    const res = await pool.query(
      `SELECT 
         c.id,
         c.workspace_id,
         c.title,
         c.created_by,
         c.created_at,
         cv.id AS latest_version_id,
         cv.version_no,
         cv.body,
         cv.created_at AS version_created_at
       FROM contents c
       JOIN content_versions cv ON cv.content_id = c.id
       WHERE c.workspace_id = $1
       ORDER BY cv.version_no DESC`,
      [workspaceId]
    );
    return res.rows;
  },

  /**
   * Get single content by ID with its latest version
   */
  async getContentById(workspaceId, contentId) {
    const res = await pool.query(
      `SELECT 
         c.id,
         c.workspace_id,
         c.title,
         c.created_by,
         c.created_at,
         cv.id AS current_version_id,
         cv.version_no,
         cv.body,
         cv.created_at AS version_created_at
       FROM contents c
       JOIN content_versions cv ON cv.content_id = c.id
       WHERE c.workspace_id = $1 AND c.id = $2
       ORDER BY cv.version_no DESC
       LIMIT 1`,
      [workspaceId, contentId]
    );

    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    return {
      ...row,
      current_version: {
        id: row.current_version_id,
        version_no: row.version_no,
        body: row.body,
        created_at: row.version_created_at,
      },
    };
  },

  /**
   * Get all revision versions for a content item
   */
  async getContentVersions(workspaceId, contentId) {
    // Check workspace ownership first
    const contentCheck = await pool.query(
      `SELECT id FROM contents WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, contentId]
    );
    if (contentCheck.rows.length === 0) {
      return null;
    }

    const res = await pool.query(
      `SELECT cv.id, cv.content_id, cv.version_no, cv.body, cv.created_by, cv.created_at, u.display_name AS author_name
       FROM content_versions cv
       LEFT JOIN users u ON cv.created_by = u.id
       WHERE cv.content_id = $1
       ORDER BY cv.version_no ASC`,
      [contentId]
    );
    return res.rows;
  },

  /**
   * Create next revision version (v2, v3, etc.) preserving original v1
   */
  async createNextVersion({ workspaceId, contentId, body, userId }) {
    const content = await this.getContentById(workspaceId, contentId);
    if (!content) {
      return null;
    }

    const nextVersionNo = content.version_no + 1;

    const res = await pool.query(
      `INSERT INTO content_versions (content_id, version_no, body, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content_id, version_no, body, created_by, created_at`,
      [contentId, nextVersionNo, body, userId]
    );

    return res.rows[0];
  },
};
