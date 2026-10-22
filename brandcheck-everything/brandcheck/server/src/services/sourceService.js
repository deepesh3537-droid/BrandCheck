import { pool } from '../db/pool.js';
import { computeEmbedding } from '../review/models/embeddings.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.resolve(__dirname, '../../../seed/sources');

export const sourceService = {
  /**
   * Create a new brand source item and compute its embedding vector
   */
  async createSource({ workspaceId, type, title, body, structured = {}, userId }) {
    const textToEmbed = `${title} - ${body}`;
    const embedding = await computeEmbedding(textToEmbed);

    const res = await pool.query(
      `INSERT INTO source_items 
         (workspace_id, type, title, body, structured, embedding, version, active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 1, true, $7)
       RETURNING id, workspace_id, type, title, body, structured, embedding, version, active, created_by, created_at`,
      [workspaceId, type, title, body, JSON.stringify(structured), embedding, userId]
    );

    return res.rows[0];
  },

  /**
   * List all sources belonging to a workspace, optionally filtered by type
   */
  async getWorkspaceSources(workspaceId, { type, activeOnly = true, includeEmbedding = false } = {}) {
    const conditions = ['workspace_id = $1'];
    const values = [workspaceId];

    if (activeOnly) {
      conditions.push('active = true');
    }

    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }

    const selectCols = includeEmbedding
      ? 'id, workspace_id, type, title, body, structured, embedding, version, active, created_by, created_at'
      : 'id, workspace_id, type, title, body, structured, version, active, created_by, created_at';

    const query = `
      SELECT ${selectCols}
      FROM source_items
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `;

    const res = await pool.query(query, values);
    return res.rows;
  },

  /**
   * Get single source item by ID scoped to workspace
   */
  async getSourceById(workspaceId, sourceId) {
    const res = await pool.query(
      `SELECT id, workspace_id, type, title, body, structured, embedding, version, active, created_by, created_at
       FROM source_items
       WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, sourceId]
    );

    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  },

  /**
   * Update an existing source item (increments version and recomputes embedding if text changed)
   */
  async updateSource(workspaceId, sourceId, updates, userId) {
    const existing = await this.getSourceById(workspaceId, sourceId);
    if (!existing) {
      return null;
    }

    const type = updates.type || existing.type;
    const title = updates.title || existing.title;
    const body = updates.body || existing.body;
    const structured = updates.structured !== undefined ? updates.structured : existing.structured;
    const active = updates.active !== undefined ? updates.active : existing.active;

    let embedding = existing.embedding;
    if (updates.title || updates.body) {
      embedding = await computeEmbedding(`${title} - ${body}`);
    }

    const newVersion = existing.version + 1;

    const res = await pool.query(
      `UPDATE source_items
       SET type = $1,
           title = $2,
           body = $3,
           structured = $4,
           embedding = $5,
           version = $6,
           active = $7
       WHERE workspace_id = $8 AND id = $9
       RETURNING id, workspace_id, type, title, body, structured, version, active, created_by, created_at`,
      [type, title, body, JSON.stringify(structured), embedding, newVersion, active, workspaceId, sourceId]
    );

    return res.rows[0];
  },

  /**
   * Delete or deactivate source item scoped to workspace
   */
  async deleteSource(workspaceId, sourceId) {
    const res = await pool.query(
      `DELETE FROM source_items
       WHERE workspace_id = $1 AND id = $2
       RETURNING id`,
      [workspaceId, sourceId]
    );

    return res.rows.length > 0;
  },

  /**
   * Seed a workspace with Verdant Botanicals brand sources from seed/
   */
  async seedWorkspaceSources(workspaceId, userId) {
    const createdSources = [];

    // 1. Seed Terms
    try {
      const termsPath = path.join(seedDir, 'terms.json');
      if (fs.existsSync(termsPath)) {
        const terms = JSON.parse(fs.readFileSync(termsPath, 'utf-8'));
        for (const t of terms) {
          const item = await this.createSource({
            workspaceId,
            type: 'term',
            title: t.title,
            body: t.body,
            structured: t.structured || {},
            userId,
          });
          createdSources.push(item);
        }
      }
    } catch (e) {
      console.warn('[Seed] Could not load terms.json:', e.message);
    }

    // 2. Seed Facts
    try {
      const factsPath = path.join(seedDir, 'facts.json');
      if (fs.existsSync(factsPath)) {
        const facts = JSON.parse(fs.readFileSync(factsPath, 'utf-8'));
        for (const f of facts) {
          const item = await this.createSource({
            workspaceId,
            type: 'fact',
            title: f.title,
            body: f.body,
            structured: f.structured || {},
            userId,
          });
          createdSources.push(item);
        }
      }
    } catch (e) {
      console.warn('[Seed] Could not load facts.json:', e.message);
    }

    // 3. Seed Claims
    try {
      const claimsPath = path.join(seedDir, 'claims.json');
      if (fs.existsSync(claimsPath)) {
        const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf-8'));
        for (const c of claims) {
          const item = await this.createSource({
            workspaceId,
            type: 'claim',
            title: c.title,
            body: c.body,
            structured: c.structured || {},
            userId,
          });
          createdSources.push(item);
        }
      }
    } catch (e) {
      console.warn('[Seed] Could not load claims.json:', e.message);
    }

    // 4. Seed Tone Guide
    try {
      const tonePath = path.join(seedDir, 'tone-guide.md');
      if (fs.existsSync(tonePath)) {
        const toneMd = fs.readFileSync(tonePath, 'utf-8');
        const item = await this.createSource({
          workspaceId,
          type: 'tone',
          title: 'Verdant Botanicals Brand Voice & Tone Guidelines',
          body: toneMd,
          structured: {
            persona: ['Warm & Grounded', 'Evidence-Based', 'Transparent'],
            desired_tone: ['Informative', 'Measured', 'Empowering', 'Clean', 'Transparent'],
            off_brand_tone: ['Sensationalist', 'Hyped', 'Urgent', 'Fear-mongering', 'Miracle-promising'],
          },
          userId,
        });
        createdSources.push(item);
      }
    } catch (e) {
      console.warn('[Seed] Could not load tone-guide.md:', e.message);
    }

    return createdSources;
  },
};
