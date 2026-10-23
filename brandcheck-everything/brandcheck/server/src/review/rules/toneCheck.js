import { classifyTone } from '../models/tone.js';

/**
 * Tone checker analyzing segments against brand voice directives
 * Per ADR-014, tone findings are ALWAYS classified as 'uncertain' evidence_status
 * because zero-shot models cannot guarantee subjective voice without human oversight.
 * 
 * @param {Array<{ index: number, text: string, start: number, end: number }>} segments
 * @param {Object} [toneSource] - Brand source of type 'tone'
 * @returns {Promise<Array<Object>>} List of tone findings
 */
export function checkToneRules(segments, toneSource = null) {
  const offBrandLabels = toneSource?.structured?.off_brand_tone || [
    'Sensationalist',
    'Hyped',
    'Urgent',
    'Miracle-promising',
  ];

  const findings = [];

  for (const seg of segments) {
    // Check if segment has strong sensationalist / off-brand language
    const lower = seg.text.toLowerCase();
    const sensationalTrigger = offBrandLabels.find((label) =>
      lower.includes(label.toLowerCase().replace(/-promising/g, ''))
    ) || (lower.includes('miracle') || lower.includes('revolutionary') || lower.includes('guaranteed') ? 'Sensationalist' : null);

    if (sensationalTrigger) {
      let improved = seg.text
        .replace(/\brevolutionary\b/gi, 'innovative')
        .replace(/\bmiracle\b/gi, 'restorative')
        .replace(/\bguaranteed\b/gi, 'tested')
        .replace(/\bhyped\b/gi, 'focused')
        .replace(/\bworld-changing\b/gi, 'high-quality');
      if (improved === seg.text) {
        improved = seg.text.replace(/!+/g, '.');
      }

      findings.push({
        category: 'tone',
        severity: 'suggestion',
        evidence_status: 'uncertain',
        span_start: seg.start,
        span_end: seg.end,
        flagged_text: seg.text,
        explanation: `Potential tone mismatch: Language appears "${sensationalTrigger}". Brand tone guide recommends: ${toneSource?.body ? 'refer to voice guidelines.' : 'informative, measured, transparent voice.'}`,
        source_item_id: toneSource ? toneSource.id : null,
        suggested_text: improved,
        confidence: 0.82,
        origin: 'model',
      });
    }
  }

  return findings;
}

/**
 * Async tone check using zero-shot DeBERTa model
 * @param {Array} segments
 * @param {Object} [toneSource]
 * @returns {Promise<Array<Object>>}
 */
export async function checkToneWithModel(segments, toneSource = null) {
  const offBrand = toneSource?.structured?.off_brand_tone || ['sensational', 'hyped'];
  const desired = toneSource?.structured?.desired_tone || ['informative', 'measured'];
  const labels = [...offBrand, ...desired];

  const findings = [];

  for (const seg of segments) {
    if (seg.text.length < 15) continue; // Skip very short phrases

    const result = await classifyTone(seg.text, labels);
    const isOffBrand = offBrand.some((ob) => ob.toLowerCase() === result.topLabel.toLowerCase());

    if (isOffBrand && result.topScore >= 0.65) {
      let improved = seg.text
        .replace(/\brevolutionary\b/gi, 'innovative')
        .replace(/\bmiracle\b/gi, 'restorative')
        .replace(/\bguaranteed\b/gi, 'tested')
        .replace(/\bhyped\b/gi, 'focused')
        .replace(/\bworld-changing\b/gi, 'high-quality');
      if (improved === seg.text) {
        improved = seg.text.replace(/!+/g, '.');
      }

      findings.push({
        category: 'tone',
        severity: 'suggestion',
        evidence_status: 'uncertain', // Enforced per ADR-014
        span_start: seg.start,
        span_end: seg.end,
        flagged_text: seg.text,
        explanation: `Zero-shot tone analysis flagged potential "${result.topLabel}" voice (${(result.topScore * 100).toFixed(0)}% confidence). Brand guidelines recommend measured, transparent language.`,
        source_item_id: toneSource ? toneSource.id : null,
        suggested_text: improved,
        confidence: result.topScore,
        origin: 'model',
      });
    }
  }

  // Combine with deterministic checks
  const ruleFindings = checkToneRules(segments, toneSource);
  // Avoid duplicate spans
  const existingSpans = new Set(findings.map((f) => `${f.span_start}-${f.span_end}`));
  for (const rf of ruleFindings) {
    if (!existingSpans.has(`${rf.span_start}-${rf.span_end}`)) {
      findings.push(rf);
    }
  }

  return findings;
}
