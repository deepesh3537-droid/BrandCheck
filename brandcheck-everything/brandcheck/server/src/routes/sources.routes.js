import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { validate } from '../middleware/validate.js';
import { createSourceSchema, updateSourceSchema } from '../schemas/source.schemas.js';
import { sourceService } from '../services/sourceService.js';

export const sourcesRouter = Router({ mergeParams: true });

// Require authentication and workspace membership on all source routes
sourcesRouter.use(requireAuth);
sourcesRouter.use(requireWorkspaceRole());

/**
 * GET /api/workspaces/:workspaceId/sources
 * List all sources in workspace
 */
sourcesRouter.get('/', async (req, res, next) => {
  try {
    const { type, activeOnly } = req.query;
    const sources = await sourceService.getWorkspaceSources(req.params.workspaceId, {
      type,
      activeOnly: activeOnly !== 'false',
    });
    res.json({ sources });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:workspaceId/sources
 * Create a new source item in workspace
 */
sourcesRouter.post('/', validate(createSourceSchema), async (req, res, next) => {
  try {
    const source = await sourceService.createSource({
      workspaceId: req.params.workspaceId,
      type: req.body.type,
      title: req.body.title,
      body: req.body.body,
      structured: req.body.structured,
      userId: req.user.id,
    });
    res.status(201).json({ source });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:workspaceId/sources/seed
 * Seed workspace with default Verdant Botanicals rules & guidelines
 */
sourcesRouter.post('/seed', async (req, res, next) => {
  try {
    const seeded = await sourceService.seedWorkspaceSources(req.params.workspaceId, req.user.id);
    res.status(201).json({
      message: `Seeded ${seeded.length} brand sources successfully`,
      count: seeded.length,
      sources: seeded,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId/sources/:sourceId
 * Get single source item
 */
sourcesRouter.get('/:sourceId', async (req, res, next) => {
  try {
    const source = await sourceService.getSourceById(req.params.workspaceId, req.params.sourceId);
    if (!source) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brand source item not found in this workspace',
        },
      });
    }
    res.json({ source });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/workspaces/:workspaceId/sources/:sourceId
 * Update brand source item
 */
sourcesRouter.patch('/:sourceId', validate(updateSourceSchema), async (req, res, next) => {
  try {
    const updated = await sourceService.updateSource(
      req.params.workspaceId,
      req.params.sourceId,
      req.body,
      req.user.id
    );

    if (!updated) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brand source item not found in this workspace',
        },
      });
    }

    res.json({ source: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workspaces/:workspaceId/sources/:sourceId
 * Delete brand source item
 */
sourcesRouter.delete('/:sourceId', async (req, res, next) => {
  try {
    const deleted = await sourceService.deleteSource(req.params.workspaceId, req.params.sourceId);
    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brand source item not found in this workspace',
        },
      });
    }

    res.json({ message: 'Source item deleted successfully' });
  } catch (err) {
    next(err);
  }
});
