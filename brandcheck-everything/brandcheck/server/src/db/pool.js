import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const poolConfig = {
  connectionString: env.DATABASE_URL,
};

if (env.DATABASE_SSL) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

export const pool = new Pool(poolConfig);

/**
 * Execute parameterized query safely
 * Never concatenate unescaped user input into query string
 * @param {string} text - SQL query with $1, $2 parameters
 * @param {Array} [params] - Parameter values
 */
export async function query(text, params = []) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.NODE_ENV === 'development' && duration > 500) {
    console.warn(`[Slow Query ${duration}ms]`, text.replace(/\s+/g, ' ').slice(0, 100));
  }

  return res;
}
