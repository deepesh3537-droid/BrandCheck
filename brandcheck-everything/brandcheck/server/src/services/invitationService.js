import crypto from 'crypto';
import { pool } from '../db/pool.js';

export const invitationService = {
  /**
   * Create a new invitation token for a workspace
   */
  async createInvitation({ workspaceId, role = 'reviewer', createdBy, expiresInHours = 72 }) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const res = await pool.query(
      `INSERT INTO invitations (workspace_id, role, token_hash, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, workspace_id, role, expires_at, created_at`,
      [workspaceId, role, tokenHash, expiresAt, createdBy]
    );

    return {
      ...res.rows[0],
      token: rawToken,
    };
  },

  /**
   * Lookup invitation by raw token
   */
  async getInvitationByToken(rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const res = await pool.query(
      `SELECT i.id, i.workspace_id, i.role, i.expires_at, i.used_at, i.created_at,
              w.name AS workspace_name, u.display_name AS inviter_name
       FROM invitations i
       JOIN workspaces w ON i.workspace_id = w.id
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.token_hash = $1`,
      [tokenHash]
    );

    if (res.rows.length === 0) return null;

    const inv = res.rows[0];
    const isExpired = new Date(inv.expires_at) < new Date();
    const isUsed = !!inv.used_at;

    return {
      ...inv,
      isExpired,
      isUsed,
      isValid: !isExpired && !isUsed,
    };
  },

  /**
   * Accept invitation and add user to workspace
   */
  async acceptInvitation({ rawToken, userId }) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const invRes = await client.query(
        `SELECT id, workspace_id, role, expires_at, used_at
         FROM invitations
         WHERE token_hash = $1
         FOR UPDATE`,
        [tokenHash]
      );

      if (invRes.rows.length === 0) {
        throw new Error('Invitation not found');
      }

      const inv = invRes.rows[0];
      if (inv.used_at) {
        throw new Error('This invitation has already been accepted');
      }
      if (new Date(inv.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Add user to workspace_members (or update role if already member)
      await client.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (workspace_id, user_id)
         DO UPDATE SET role = EXCLUDED.role`,
        [inv.workspace_id, userId, inv.role]
      );

      // Mark invitation as used
      await client.query(
        `UPDATE invitations SET used_at = NOW() WHERE id = $1`,
        [inv.id]
      );

      await client.query('COMMIT');

      return {
        workspaceId: inv.workspace_id,
        role: inv.role,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
