import { findMatchesWithOffsets } from '../segmenter.js';

/**
 * Terminology rule checker
 * Scans content for prohibited brand terms, mapping to active source guidelines.
 * @param {string} content - Full text of the draft content
 * @param {Array} termSources - Workspace source items of type 'term'
 * @returns {Array<Object>} List of terminology findings
 */
export function checkTerminology(content, termSources = []) {
  if (!content || !termSources || termSources.length === 0) {
    return [];
  }

  const findings = [];

  for (const source of termSources) {
    const prohibited =
      source.structured?.prohibited ||
      source.title.match(/['"](.*?)['"]/)?.[1];

    if (!prohibited) continue;

    const preferred = source.structured?.preferred || null;
    const severity = source.structured?.severity || 'error';

    const matches = findMatchesWithOffsets(content, prohibited, { caseInsensitive: true });

    for (const match of matches) {
      findings.push({
        category: 'terminology',
        severity,
        evidence_status: 'source_backed',
        span_start: match.start,
        span_end: match.end,
        flagged_text: match.text,
        explanation: source.body || `Brand guideline prohibits "${match.text}". Prefer "${preferred || 'approved alternative'}".`,
        source_item_id: source.id,
        suggested_text: preferred,
        confidence: 1.0,
        origin: 'rule',
      });
    }
  }

  return findings;
}
