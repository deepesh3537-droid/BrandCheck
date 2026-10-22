import { findMatchesWithOffsets } from '../segmenter.js';

/**
 * Fact consistency checker
 * Identifies numerical, historical, and factual statements conflicting with verified brand facts.
 * @param {string} content - Draft content string
 * @param {Array} factSources - Brand sources of type 'fact'
 * @returns {Array<Object>} List of fact conflict findings
 */
export function checkFacts(content, factSources = []) {
  if (!content || !factSources || factSources.length === 0) {
    return [];
  }

  const findings = [];

  for (const source of factSources) {
    const conflictPatterns = source.structured?.conflict_patterns || [];
    const correctValue = source.structured?.correct_value || source.title;

    for (const pattern of conflictPatterns) {
      const matches = findMatchesWithOffsets(content, pattern, { caseInsensitive: true });

      for (const match of matches) {
        findings.push({
          category: 'fact',
          severity: 'error',
          evidence_status: 'source_backed',
          span_start: match.start,
          span_end: match.end,
          flagged_text: match.text,
          explanation: `Factual conflict with brand records: "${correctValue}". Content claims "${match.text}". Reference: ${source.body}`,
          source_item_id: source.id,
          suggested_text: correctValue,
          confidence: 1.0,
          origin: 'rule',
        });
      }
    }
  }

  return findings;
}
