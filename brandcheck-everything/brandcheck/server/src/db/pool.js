import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

const poolConfig = {
  connectionString: env.DATABASE_URL,
};

const isLocal = env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');
const shouldEnableSsl =
  env.DATABASE_SSL ||
  (!isLocal && (
    env.DATABASE_URL.includes('sslmode=require') ||
    env.DATABASE_URL.includes('render.com') ||
    env.DATABASE_URL.includes('neon.tech') ||
    env.DATABASE_URL.includes('supabase.co') ||
    env.NODE_ENV === 'production'
  ));

if (shouldEnableSsl) {
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
