import { pool } from '../db/pool.js';

export const workspaceService = {
  /**
   * Create a new workspace and assign creating user as 'owner'
   */
  async createWorkspace({ name, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const wsRes = await client.query(
        `INSERT INTO workspaces (name, created_by)
         VALUES ($1, $2)
         RETURNING id, name, created_by, created_at`,
        [name, userId]
      );
      const workspace = wsRes.rows[0];

      await client.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [workspace.id, userId]
      );

      await client.query('COMMIT');
      return {
        ...workspace,
        role: 'owner',
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * List all workspaces where user is a member
   */
  async getUserWorkspaces(userId) {
    const res = await pool.query(
      `SELECT 
         w.id,
         w.name,
         w.created_by,
         w.created_at,
         wm.role,
         wm.joined_at,
         COUNT(si.id)::int AS source_count
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       LEFT JOIN source_items si ON si.workspace_id = w.id AND si.active = true
       WHERE wm.user_id = $1
       GROUP BY w.id, w.name, w.created_by, w.created_at, wm.role, wm.joined_at
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  /**
   * Get workspace details by ID if user has membership
   */
  async getWorkspaceById(workspaceId, userId) {
    const res = await pool.query(
      `SELECT 
         w.id,
         w.name,
         w.created_by,
         w.created_at,
         wm.role,
         wm.joined_at
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.id = $1 AND wm.user_id = $2`,
      [workspaceId, userId]
    );

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  },

  /**
   * Get membership role for a user in a specific workspace
   */
  async getMemberRole(workspaceId, userId) {
    const res = await pool.query(
      `SELECT role FROM workspace_members
       WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].role;
  },

  /**
   * List all members of a workspace
   */
  async getWorkspaceMembers(workspaceId) {
    const res = await pool.query(
      `SELECT 
         u.id,
         u.email,
         u.display_name,
         wm.role,
         wm.joined_at
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1
       ORDER BY wm.joined_at ASC`,
      [workspaceId]
    );
    return res.rows;
  },
};
