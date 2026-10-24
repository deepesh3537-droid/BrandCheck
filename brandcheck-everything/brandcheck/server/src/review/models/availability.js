import { env } from '../../config/env.js';

/**
 * Checks availability of Ollama daemon and configured model
 * @returns {Promise<{ available: boolean, modelFound: boolean, error?: string }>}
 */
export async function checkOllamaAvailability() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${env.OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { available: false, modelFound: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m) => m.name) : [];
    const modelFound = models.some(
      (name) => name === env.OLLAMA_MODEL || name.startsWith(env.OLLAMA_MODEL.split(':')[0])
    );

    return { available: true, modelFound, models };
  } catch (err) {
    return {
      available: false,
      modelFound: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message,
    };
  }
}

/**
 * Check overall model subsystem status
 * Per ADR-018: if any model is unavailable, gracefully degrade to rules-only
 */
export async function getModelSubsystemStatus() {
  const ollama = await checkOllamaAvailability();
  const hasHostedLlm = Boolean(env.LLM_API_KEY);

  return {
    allowFallback: env.ALLOW_RULES_ONLY_FALLBACK,
    embeddings: {
      provider: 'transformers-onnx',
      model: 'all-MiniLM-L6-v2',
      available: true,
    },
    tone: {
      provider: 'transformers-onnx',
      model: 'DeBERTa-v3-base-mnli',
      available: true,
    },
    generation: hasHostedLlm
      ? {
          provider: 'hosted-api',
          model: env.LLM_MODEL,
          available: true,
          status: 'ready',
        }
      : {
          provider: 'ollama',
          model: env.OLLAMA_MODEL,
          available: ollama.available,
          modelFound: ollama.modelFound,
          status: ollama.available ? (ollama.modelFound ? 'ready' : 'model_missing') : 'offline',
          error: ollama.error,
        },
  };
}
