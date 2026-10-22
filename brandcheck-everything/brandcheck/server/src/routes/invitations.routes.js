import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { invitationService } from '../services/invitationService.js';

export const invitationsRouter = Router();

/**
 * POST /api/workspaces/:workspaceId/invitations
 * Generate workspace invitation token (Owner only)
 */
invitationsRouter.post(
  '/workspaces/:workspaceId/invitations',
  requireAuth,
  requireWorkspaceRole(['owner']),
  async (req, res, next) => {
    try {
      const { role = 'reviewer', expiresInHours = 72 } = req.body;
      const validRoles = ['reviewer', 'creator', 'owner'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: { code: 'INVALID_ROLE', message: `Role must be one of: ${validRoles.join(', ')}` },
        });
      }

      const invitation = await invitationService.createInvitation({
        workspaceId: req.params.workspaceId,
        role,
        createdBy: req.user.id,
        expiresInHours: Number(expiresInHours),
      });

      res.status(201).json({ invitation });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/invitations/:token
 * Public inspection of invitation token
 */
invitationsRouter.get('/invitations/:token', async (req, res, next) => {
  try {
    const inv = await invitationService.getInvitationByToken(req.params.token);
    if (!inv) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Invitation link not found or invalid' },
      });
    }

    res.json({ invitation: inv });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/invitations/:token/accept
 * Accept invitation and join workspace (requires authenticated user)
 */
invitationsRouter.post('/invitations/:token/accept', requireAuth, async (req, res, next) => {
  try {
    const result = await invitationService.acceptInvitation({
      rawToken: req.params.token,
      userId: req.user.id,
    });

    res.json({
      success: true,
      membership: result,
      message: 'Successfully joined workspace',
    });
  } catch (err) {
    next(err);
  }
});
