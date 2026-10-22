import { verifyToken, COOKIE_NAME } from '../services/authService.js';

/**
 * Server-side authentication guard middleware.
 * Verifies JWT token from httpOnly cookie or Authorization header.
 */
export function requireAuth(req, res, next) {
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.',
      },
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Your session has expired or is invalid. Please sign in again.',
      },
    });
  }
}
