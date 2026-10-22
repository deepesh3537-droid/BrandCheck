import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { validate } from '../middleware/validate.js';
import { createContentSchema, createContentVersionSchema } from '../schemas/content.schemas.js';
import { contentService } from '../services/contentService.js';

export const contentsRouter = Router({ mergeParams: true });

contentsRouter.use(requireAuth);
contentsRouter.use(requireWorkspaceRole());

/**
 * POST /api/workspaces/:workspaceId/contents
 * Submit draft content (paste or file content) creating immutable version 1
 */
contentsRouter.post('/', validate(createContentSchema), async (req, res, next) => {
  try {
    const result = await contentService.createContent({
      workspaceId: req.params.workspaceId,
      title: req.body.title,
      body: req.body.body,
      userId: req.user.id,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId/contents
 * List all contents in workspace
 */
contentsRouter.get('/', async (req, res, next) => {
  try {
    const contents = await contentService.listWorkspaceContents(req.params.workspaceId);
    res.json({ contents });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId/contents/:contentId
 * Get specific content and current version
 */
contentsRouter.get('/:contentId', async (req, res, next) => {
  try {
    const content = await contentService.getContentById(
      req.params.workspaceId,
      req.params.contentId
    );
    if (!content) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Content not found in this workspace',
        },
      });
    }
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:workspaceId/contents/:contentId/versions
 * Get all revision versions for content
 */
contentsRouter.get('/:contentId/versions', async (req, res, next) => {
  try {
    const versions = await contentService.getContentVersions(
      req.params.workspaceId,
      req.params.contentId
    );
    if (!versions) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Content not found in this workspace',
        },
      });
    }
    res.json({ versions });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:workspaceId/contents/:contentId/versions
 * Create an updated version on explicit user action
 */
contentsRouter.post(
  '/:contentId/versions',
  validate(createContentVersionSchema),
  async (req, res, next) => {
    try {
      const version = await contentService.createNextVersion({
        workspaceId: req.params.workspaceId,
        contentId: req.params.contentId,
        body: req.body.body,
        userId: req.user.id,
      });

      if (!version) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found in this workspace',
          },
        });
      }

      res.status(201).json({ version });
    } catch (err) {
      next(err);
    }
  }
);
