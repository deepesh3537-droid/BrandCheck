import { workspaceService } from '../services/workspaceService.js';

/**
 * Middleware factory enforcing workspace membership and role-based permissions
 * @param {string[]|string} [allowedRoles] Optional array of roles permitted to access route
 */
export function requireWorkspaceRole(allowedRoles) {
  const roles = allowedRoles 
    ? (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
    : ['owner', 'creator', 'reviewer'];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const workspaceId =
        req.params.workspaceId ||
        req.body?.workspaceId ||
        req.query?.workspaceId ||
        req.headers['x-workspace-id'];

      if (!workspaceId) {
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: 'workspaceId is required',
          },
        });
      }

      const memberRole = await workspaceService.getMemberRole(workspaceId, req.user.id);

      if (!memberRole) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a member of this workspace',
          },
        });
      }

      if (!roles.includes(memberRole)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: `Requires ${roles.join(' or ')} role in this workspace`,
          },
        });
      }

      req.workspaceId = workspaceId;
      req.workspaceRole = memberRole;
      next();
    } catch (err) {
      next(err);
    }
  };
}
