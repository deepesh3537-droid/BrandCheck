/**
 * Computes cosine similarity between two float vectors in Node.
 * Per ADR-017: No pgvector required; computed in Node over workspace source items.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

import { env } from '../../config/env.js';

let pipelinePromise = null;

async function getExtractor() {
  if (process.env.NODE_ENV === 'test') {
    return null; // In unit test mode, use deterministic fast vector generator
  }

  if (!pipelinePromise) {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const timeoutMs = env.MODEL_TIMEOUT_MS || 60000;
      pipelinePromise = Promise.race([
        pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model download timeout')), timeoutMs)),
      ]);
    } catch (err) {
      console.warn('[Embeddings] @huggingface/transformers ONNX pipeline unavailable, using deterministic fallback:', err.message);
      pipelinePromise = null;
    }
  }
  return pipelinePromise;
}

/**
 * Generate 384-dimensional vector embedding for text.
 * Falls back to deterministic normalized character-frequency vector if ONNX pipeline is cold/offline.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function computeEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return new Array(384).fill(0);
  }

  try {
    const extractor = await getExtractor();
    if (extractor) {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (err) {
    console.warn('[Embeddings] Inference error, falling back:', err.message);
  }

  // Deterministic fallback vector (384 dimensions) for test/offline environments
  return generateDeterministicVector(text, 384);
}

/**
 * Deterministic pseudo-semantic vector generator for fallback
 * Ensures exact reproducibility without network or model weights
 */
export function generateDeterministicVector(text, dimensions = 384) {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  for (const word of tokens) {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Normalize vector to unit length
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < dimensions; i++) {
    vector[i] = Number((vector[i] / norm).toFixed(6));
  }

  return vector;
}
