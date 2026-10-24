import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { workspaceRouter } from './routes/workspaces.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { invitationsRouter } from './routes/invitations.routes.js';

export const app = express();


// Security headers
app.use(helmet());

// CORS configuration allowing production Vercel frontend and local development
const configuredOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());
const staticAllowed = [
  'https://brandcheck-two.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, postman, health checks, cron)
      if (!origin) return callback(null, true);

      const isAllowed =
        staticAllowed.includes(origin) ||
        configuredOrigins.includes(origin) ||
        configuredOrigins.includes('*') ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: `${env.MAX_UPLOAD_MB}mb` }));
app.use(cookieParser());

// Base API healthcheck — checks DB connectivity and model status
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'brandcheck-server',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check database
  try {
    const { pool } = await import('./db/pool.js');
    await pool.query('SELECT 1');
    health.checks.database = 'ok';
  } catch {
    health.checks.database = 'error';
    health.status = 'degraded';
    res.status(503);
  }

  // Report inference mode without leaking keys
  health.checks.inference = env.LLM_API_KEY
    ? 'hosted-api'
    : 'rules-only-fallback';

  res.json(health);
});

// Authentication routes
app.use('/api/auth', authRouter);

// Workspace routes
app.use('/api/workspaces', workspaceRouter);

// Invitation routes (includes public invitation lookup)
app.use('/api', invitationsRouter);

// Review and findings routes
app.use('/api', reviewsRouter);


// Centralized error handler per ARCHITECTURE.md (never leak internal stack traces)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 && env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'An unexpected error occurred';

  if (status >= 500) {
    console.error(`[Server Error] ${req.method} ${req.url}:`, err);
  }

  res.status(status).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});
