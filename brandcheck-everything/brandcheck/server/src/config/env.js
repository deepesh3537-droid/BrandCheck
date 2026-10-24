import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root .env is located two levels up from server/src/config -> brandcheck/.env
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

// Fallback to process.cwd()/.env or server/.env if needed
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/brandcheck'),
  DATABASE_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Auth
  JWT_SECRET: z.string().min(16).default('brandcheck_super_secret_development_key_min_32_characters_12345'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  INVITE_EXPIRY_HOURS: z.coerce.number().default(168),

  // Upload limits
  MAX_UPLOAD_MB: z.coerce.number().default(2),
  ALLOWED_UPLOAD_EXTENSIONS: z.string().default('.txt,.md'),

  // Local Ollama Models
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('qwen2.5:3b'),
  MODEL_TIMEOUT_MS: z.coerce.number().default(60000),
  MODEL_CACHE_DIR: z.string().default('./.model-cache'),
  ALLOW_RULES_ONLY_FALLBACK: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),

  // Optional Hosted LLM API (e.g. Groq / OpenRouter / Together / OpenAI)
  LLM_API_KEY: z.string().optional().default(''),
  LLM_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),
  LLM_MODEL: z.string().default('llama-3.1-8b-instant'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables detected in root .env:', parsed.error.format());
  throw new Error('Environment variable configuration failed. Inspect .env against .env.example.');
}

export const env = parsed.data;
