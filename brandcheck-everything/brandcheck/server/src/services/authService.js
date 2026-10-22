import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'brandcheck_auth';

export const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
  path: '/',
};

/**
 * Generate signed JWT token
 * @param {Object} payload - { id, email }
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object} payload
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/**
 * Register a new user
 */
export async function registerUser({ email, password, displayName }) {
  // 1. Check if user already exists
  const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (existing.rows.length > 0) {
    const error = new Error('An account with this email already exists.');
    error.status = 409;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // 2. Hash password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Insert user record
  const result = await query(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, display_name, created_at`,
    [email, passwordHash, displayName]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    },
    token,
  };
}

/**
 * Authenticate existing user
 */
export async function loginUser({ email, password }) {
  const result = await query(
    `SELECT id, email, password_hash, display_name, created_at FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    },
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  const result = await query(
    `SELECT id, email, display_name, created_at FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    createdAt: user.created_at,
  };
}
