import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

// --- Startup validation ---
if (env.NODE_ENV === 'production') {
  const isLocalDb =
    env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');
  if (isLocalDb) {
    console.error(
      '[BrandCheck] FATAL: DATABASE_URL points to localhost in production mode.\n' +
      '  Set DATABASE_URL to your hosted PostgreSQL connection string in the Render dashboard.\n' +
      '  The server will not start with a local database URL in production.'
    );
    process.exit(1);
  }

  const defaultJwt = 'brandcheck_super_secret_development_key_min_32_characters_12345';
  if (env.JWT_SECRET === defaultJwt) {
    console.error(
      '[BrandCheck] FATAL: JWT_SECRET is using the insecure development default in production.\n' +
      '  Set a unique, random JWT_SECRET (32+ characters) in the Render dashboard.'
    );
    process.exit(1);
  }
}

// --- Verify database connectivity before accepting traffic ---
async function verifyDatabaseConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('[BrandCheck] Database connection verified.');
  } catch (err) {
    console.error('[BrandCheck] FATAL: Cannot connect to database:', err.message);
    console.error(
      '  Ensure DATABASE_URL is set correctly in the Render dashboard.\n' +
      '  If using Neon/Supabase, also set DATABASE_SSL=true.'
    );
    process.exit(1);
  }
}

// --- Start server ---
async function start() {
  await verifyDatabaseConnection();

  // Run migrations automatically — safe to call on every startup.
  // migrate.js tracks applied files in schema_migrations and skips already-applied ones.
  // This removes the need for Render Shell (paid feature) or manual migration steps.
  console.log('[BrandCheck] Running database migrations...');
  await runMigrations();
  console.log('[BrandCheck] Migrations complete.');

  const server = app.listen(env.PORT, () => {
    console.log(`[BrandCheck] Server listening on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[BrandCheck] Health: http://localhost:${env.PORT}/api/health`);
    if (env.NODE_ENV === 'production') {
      console.log(`[BrandCheck] CORS allows: ${env.CLIENT_ORIGIN} + *.vercel.app`);
    }
  });

  // Graceful shutdown on SIGTERM (Render sends this before stopping the container)
  process.on('SIGTERM', () => {
    console.log('[BrandCheck] SIGTERM received — shutting down gracefully...');
    server.close(async () => {
      await pool.end();
      console.log('[BrandCheck] Server stopped. Database pool closed.');
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('[BrandCheck] Startup failed:', err);
  process.exit(1);
});

