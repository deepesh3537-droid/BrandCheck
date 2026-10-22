import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { validate } from '../middleware/validate.js';
import { createWorkspaceSchema } from '../schemas/workspace.schemas.js';
import { workspaceService } from '../services/workspaceService.js';
import { sourcesRouter } from './sources.routes.js';
import { contentsRouter } from './contents.routes.js';

export const workspaceRouter = Router();

// All workspace routes require an authenticated user
workspaceRouter.use(requireAuth);

// Mount child routers
workspaceRouter.use('/:workspaceId/sources', sourcesRouter);
workspaceRouter.use('/:workspaceId/contents', contentsRouter);



/**
 * POST /api/workspaces
 * Create a new workspace and make user the owner
 */
workspaceRouter.post('/', validate(createWorkspaceSchema), async (req, res, next) => {
  try {
    const workspace = await workspaceService.createWorkspace({
      name: req.body.name,
      userId: req.user.id,
    });
    res.status(201).json({ workspace });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces
 * List all workspaces the current user belongs to
 */
workspaceRouter.get('/', async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId
 * Get workspace details
 */
workspaceRouter.get('/:workspaceId', requireWorkspaceRole(), async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId, req.user.id);
    if (!workspace) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        },
      });
    }
    res.json({ workspace });
  } catch (err) {
    next(err);
  }
});

import { insightsService } from '../services/insightsService.js';

/**
 * GET /api/workspaces/:workspaceId/members
 * List members of workspace
 */
workspaceRouter.get('/:workspaceId/members', requireWorkspaceRole(), async (req, res, next) => {
  try {
    const members = await workspaceService.getWorkspaceMembers(req.params.workspaceId);
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId/insights
 * Repeated mistake insights derived from recorded decisions (TASK-083)
 */
workspaceRouter.get('/:workspaceId/insights', requireWorkspaceRole(), async (req, res, next) => {
  try {
    const insights = await insightsService.getWorkspaceInsights(req.params.workspaceId);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
});

