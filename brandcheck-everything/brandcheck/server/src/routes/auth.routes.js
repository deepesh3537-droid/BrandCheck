import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import {
  registerUser,
  loginUser,
  getUserById,
  COOKIE_NAME,
  cookieOptions,
} from '../services/authService.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});
