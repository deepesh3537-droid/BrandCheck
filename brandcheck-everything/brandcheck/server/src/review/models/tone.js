import { env } from '../../config/env.js';

let classifierPromise = null;

async function getClassifier() {
  if (process.env.NODE_ENV === 'test') {
    return null; // In unit test mode, use heuristic tone scorer
  }

  if (!classifierPromise) {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const timeoutMs = env.MODEL_TIMEOUT_MS || 60000;
      classifierPromise = Promise.race([
        pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-small', { quantized: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model download timeout')), timeoutMs)),
      ]);
    } catch (err) {
      console.warn('[Tone] Zero-shot classifier unavailable, using heuristic fallback:', err.message);
      classifierPromise = null;
    }
  }
  return classifierPromise;
}

/**
 * Classifies text against target tone labels (e.g. ['professional', 'sensational', 'unsupported', 'friendly']).
 * Per ADR-014, tone findings are ALWAYS marked uncertain unless backed by a deterministic rule.
 * @param {string} text
 * @param {string[]} candidateLabels
 * @returns {Promise<{ scores: Record<string, number>, topLabel: string, topScore: number, evidence_status: 'uncertain' }>}
 */
export async function classifyTone(text, candidateLabels = ['professional', 'sensational', 'casual', 'authoritative']) {
  if (!text || candidateLabels.length === 0) {
    return {
      scores: {},
      topLabel: candidateLabels[0] || 'neutral',
      topScore: 0,
      evidence_status: 'uncertain',
    };
  }

  try {
    const classifier = await getClassifier();
    if (classifier) {
      const res = await classifier(text, candidateLabels);
      const scores = {};
      res.labels.forEach((label, idx) => {
        scores[label] = Number(res.scores[idx].toFixed(4));
      });

      return {
        scores,
        topLabel: res.labels[0],
        topScore: Number(res.scores[0].toFixed(4)),
        evidence_status: 'uncertain',
      };
    }
  } catch (err) {
    console.warn('[Tone] Inference error, falling back to heuristic:', err.message);
  }

  // Heuristic rule-assisted fallback for tone scoring
  return heuristicToneScoring(text, candidateLabels);
}

function heuristicToneScoring(text, candidateLabels) {
  const lower = text.toLowerCase();
  const scores = {};

  const sensationalKeywords = ['revolutionary', 'shocking', 'insane', 'miracle', 'unbelievable', 'guaranteed', 'best ever', 'magic'];
  const professionalKeywords = ['measured', 'verified', 'standard', 'complies', 'demonstrates', 'consistent', 'reported'];

  let sensationalCount = 0;
  for (const word of sensationalKeywords) {
    if (lower.includes(word)) sensationalCount++;
  }

  let professionalCount = 0;
  for (const word of professionalKeywords) {
    if (lower.includes(word)) professionalCount++;
  }

  candidateLabels.forEach((label) => {
    if (label.toLowerCase().includes('sensational') || label.toLowerCase().includes('hyped')) {
      scores[label] = sensationalCount > 0 ? 0.85 : 0.15;
    } else if (label.toLowerCase().includes('professional') || label.toLowerCase().includes('formal')) {
      scores[label] = professionalCount >= sensationalCount ? 0.75 : 0.25;
    } else {
      scores[label] = 0.5;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return {
    scores,
    topLabel: sorted[0][0],
    topScore: sorted[0][1],
    evidence_status: 'uncertain',
  };
}
