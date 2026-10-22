import { computeEmbedding, cosineSimilarity } from './models/embeddings.js';

/**
 * Semantic source retriever
 * Compares content segment vectors against workspace source item embeddings in Node.
 * Per ADR-017: No pgvector required; computed efficiently in memory.
 * 
 * @param {string} segmentText - Text to match
 * @param {Array<{ id: string, title: string, body: string, embedding?: number[] }>} sourceItems
 * @param {{ minSimilarity?: number, topK?: number }} [options]
 * @returns {Promise<Array<{ source: Object, similarity: number }>>}
 */
export async function retrieveRelevantSources(segmentText, sourceItems = [], { minSimilarity = 0.45, topK = 3 } = {}) {
  if (!segmentText || !sourceItems || sourceItems.length === 0) {
    return [];
  }

  // Filter sources that have precomputed embeddings
  const validSources = sourceItems.filter((s) => Array.isArray(s.embedding) && s.embedding.length > 0);
  if (validSources.length === 0) {
    return [];
  }

  const segmentVector = await computeEmbedding(segmentText);

  const scored = validSources.map((source) => {
    const similarity = cosineSimilarity(segmentVector, source.embedding);
    return {
      source,
      similarity: Number(similarity.toFixed(4)),
    };
  });

  return scored
    .filter((item) => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
