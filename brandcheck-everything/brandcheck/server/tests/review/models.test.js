import { describe, it, expect } from 'vitest';
import { computeEmbedding, cosineSimilarity, generateDeterministicVector } from '../../src/review/models/embeddings.js';
import { classifyTone } from '../../src/review/models/tone.js';
import { generateExplanationAndFix, generateRuleBasedExplanation } from '../../src/review/models/explain.js';
import { getModelSubsystemStatus } from '../../src/review/models/availability.js';

describe('Model Subsystem & Spike (TASK-015)', () => {
  it('computes 384-dimensional embeddings and calculates cosine similarity correctly', async () => {
    const textA = '100% organic cold-pressed beverage';
    const textB = 'organic cold pressed fruit juice';
    const textC = 'heavy industrial steel manufacturing equipment';

    const [embA, embB, embC] = await Promise.all([
      computeEmbedding(textA),
      computeEmbedding(textB),
      computeEmbedding(textC),
    ]);

    expect(embA.length).toBe(384);
    expect(embB.length).toBe(384);
    expect(embC.length).toBe(384);

    const simSimilar = cosineSimilarity(embA, embB);
    const simDifferent = cosineSimilarity(embA, embC);

    expect(simSimilar).toBeGreaterThan(0);
    expect(simSimilar).toBeGreaterThan(simDifferent);
  });

  it('classifies tone and flags evidence_status as uncertain per ADR-014', async () => {
    const text = 'This revolutionary breakthrough will blow your mind with miracle results!';
    const res = await classifyTone(text, ['sensational', 'professional', 'neutral']);

    expect(res).toHaveProperty('scores');
    expect(res).toHaveProperty('topLabel');
    expect(res.topLabel).toBe('sensational');
    expect(res.evidence_status).toBe('uncertain');
  });

  it('generates rule-grounded explanations with suggested diffs', async () => {
    const res = await generateExplanationAndFix({
      flaggedText: 'revolutionary',
      contextSentence: 'Our revolutionary drink is here.',
      category: 'terminology',
      sourceItem: {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Brand Vocabulary Guide',
        body: 'Do not use hype terms like revolutionary.',
        structured: {
          preferred: 'innovative',
        },
      },
    });

    expect(res).toHaveProperty('explanation');
    expect(res.explanation.toLowerCase()).toContain('revolutionary');
    if (res.origin === 'grounded_rule') {
      expect(res.suggestedText).toBe('innovative');
    } else {
      expect(typeof res.suggestedText).toBe('string');
      expect(res.origin).toBe('model');
    }
  }, 15000);

  it('reports subsystem status and graceful degradation availability', async () => {
    const status = await getModelSubsystemStatus();

    expect(status).toHaveProperty('allowFallback');
    expect(status.allowFallback).toBe(true);
    expect(status.embeddings.model).toBe('all-MiniLM-L6-v2');
    expect(status.tone.model).toBe('DeBERTa-v3-base-mnli');
    expect(status.generation.provider).toBe('ollama');
  });
});
