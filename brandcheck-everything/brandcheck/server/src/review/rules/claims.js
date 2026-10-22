import { findMatchesWithOffsets } from '../segmenter.js';

// Common unverified health / superiority claim patterns
const GENERAL_CLAIM_PATTERNS = [
  { pattern: /\bboosts?\s+immunity\b/i, label: 'Immunity claim without clinical qualification' },
  { pattern: /\beliminates?\s+all\s+\w+\b/i, label: 'Absolute eradication claim' },
  { pattern: /\bcures?\s+\w+\b/i, label: 'Unsubstantiated curative medical claim' },
  { pattern: /\b100%\s+guaranteed\b/i, label: 'Unsubstantiated absolute guarantee' },
  { pattern: /\bbest-in-class\b/i, label: 'Unsubstantiated superiority claim' },
];

/**
 * Unsupported claim checker
 * Detects absolute, curative, or promotional claims and verifies against approved claim sources.
 * @param {string} content - Draft content string
 * @param {Array} claimSources - Brand sources of type 'claim'
 * @returns {Array<Object>} List of claim findings
 */
export function checkClaims(content, claimSources = []) {
  if (!content) return [];

  const findings = [];
  const processedSpans = new Set();

  // 1. Check specific source-defined unsupported variants
  for (const source of claimSources) {
    const variants = source.structured?.unsupported_variants || [];
    const approvedPhrase = source.structured?.approved_phrase || null;

    for (const variant of variants) {
      const matches = findMatchesWithOffsets(content, variant, { caseInsensitive: true });

      for (const match of matches) {
        const spanKey = `${match.start}-${match.end}`;
        processedSpans.add(spanKey);

        findings.push({
          category: 'claim',
          severity: 'error',
          evidence_status: 'source_backed',
          span_start: match.start,
          span_end: match.end,
          flagged_text: match.text,
          explanation: `Unsubstantiated claim variant "${match.text}". Guideline requires approved phrasing: "${approvedPhrase || source.body}".`,
          source_item_id: source.id,
          suggested_text: approvedPhrase,
          confidence: 0.95,
          origin: 'rule',
        });
      }
    }
  }

  // 2. Scan for general promotional / superiority claim patterns not covered by approved claims
  for (const item of GENERAL_CLAIM_PATTERNS) {
    const matches = findMatchesWithOffsets(content, item.pattern);

    for (const match of matches) {
      const spanKey = `${match.start}-${match.end}`;
      if (processedSpans.has(spanKey)) continue; // already source-backed

      // Check if any approved claim source supports this
      const supportingSource = claimSources.find((s) => {
        const approved = s.structured?.approved_phrase || s.title;
        return content.toLowerCase().includes(approved.toLowerCase());
      });

      findings.push({
        category: 'claim',
        severity: 'warning',
        evidence_status: supportingSource ? 'source_backed' : 'uncertain',
        span_start: match.start,
        span_end: match.end,
        flagged_text: match.text,
        explanation: `${item.label}: Promotional statements require verifiable clinical or third-party certification.`,
        source_item_id: supportingSource ? supportingSource.id : null,
        suggested_text: supportingSource?.structured?.approved_phrase || null,
        confidence: 0.85,
        origin: 'rule',
      });
    }
  }

  return findings;
}
