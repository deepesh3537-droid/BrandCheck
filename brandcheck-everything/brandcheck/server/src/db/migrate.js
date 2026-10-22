import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

export async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('[Migrations] Connecting to database...');

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Fetch already applied migrations
    const { rows: appliedRows } = await client.query(
      `SELECT name FROM schema_migrations ORDER BY id ASC`
    );
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 3. Read migration files
    if (!fs.existsSync(migrationsDir)) {
      console.log('[Migrations] No migrations directory found. Skipping.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      console.log(`[Migrations] Applying ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(`INSERT INTO schema_migrations (name) VALUES ($1)`, [file]);
        await client.query('COMMIT');
        console.log(`[Migrations] Successfully applied ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Migrations] Error applying migration ${file}:`, err.message);
        throw err;
      }
    }

    if (count === 0) {
      console.log('[Migrations] Database is up to date. No pending migrations.');
    } else {
      console.log(`[Migrations] Successfully applied ${count} migration(s).`);
    }
  } finally {
    client.release();
  }
}

// Allow direct CLI execution: node src/db/migrate.js
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('[Migrations] Complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migrations] Failed:', err);
      process.exit(1);
    });
}
