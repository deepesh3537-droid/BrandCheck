import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

describe('Database Migrations (001 to 007)', () => {
  it('applies all SQL migrations sequentially without syntax errors', () => {
    const db = newDb();

    // Register pgcrypto extension and functions for pg-mem
    db.registerExtension('pgcrypto', (schema) => {
      schema.registerFunction({
        name: 'gen_random_uuid',
        implementation: () => '11111111-1111-1111-1111-111111111111',
      });
    });

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    expect(files.length).toBe(7);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      expect(() => db.public.none(sql)).not.toThrow();
    }

    // Verify all core tables exist in the database
    const tables = db.public
      .many(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`)
      .map((t) => t.table_name);

    expect(tables).toContain('users');
    expect(tables).toContain('workspaces');
    expect(tables).toContain('workspace_members');
    expect(tables).toContain('invitations');
    expect(tables).toContain('source_items');
    expect(tables).toContain('contents');
    expect(tables).toContain('content_versions');
    expect(tables).toContain('reviews');
    expect(tables).toContain('findings');
    expect(tables).toContain('comments');
    expect(tables).toContain('review_events');
  });
});
