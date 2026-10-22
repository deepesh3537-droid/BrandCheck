import { findMatchesWithOffsets } from '../segmenter.js';

/**
 * Common vague link phrases violating WCAG 2.4.4 (Link Purpose in Context).
 */
const VAGUE_LINK_PATTERNS = [
  /\[(click here|here|read more|learn more|more|link|this link|details)\]\((.*?)\)/gi,
];

/**
 * Content Accessibility Checker (WCAG 2.1 AA Alignment)
 * Per TASK-082:
 * 1. Ambiguous link text (WCAG 2.4.4)
 * 2. Missing/placeholder alt text on images (WCAG 1.1.1)
 * 3. Screen-reader all-caps acronym trap (WCAG 3.1.2)
 *
 * @param {string} content - Full text of the draft content
 * @returns {Array<Object>} List of accessibility findings
 */
export function checkAccessibility(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const findings = [];

  // 1. Ambiguous / Vague Link Text Check (e.g. [click here](url))
  for (const regex of VAGUE_LINK_PATTERNS) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      const start = match.index;
      const end = start + match[0].length;

      findings.push({
        category: 'accessibility',
        severity: 'warning',
        evidence_status: 'uncertain', // heuristic accessibility rule without a custom workspace source
        span_start: start,
        span_end: end,
        flagged_text: match[0],
        explanation: `Vague link text "${linkText}" violates WCAG 2.4.4. Screen readers need descriptive anchor text indicating the destination rather than "${linkText}".`,
        suggested_text: `[Explore destination details](${linkUrl})`,
        confidence: 0.95,
        origin: 'rule',
      });
    }
  }

  // 2. Missing or Placeholder Alt Text on Images (![]() or ![image]())
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const altText = (imgMatch[1] || '').trim().toLowerCase();
    const isPlaceholder =
      altText.length === 0 ||
      altText === 'image' ||
      altText === 'photo' ||
      altText === 'picture' ||
      altText === 'graphic';

    if (isPlaceholder) {
      const start = imgMatch.index;
      const end = start + imgMatch[0].length;
      findings.push({
        category: 'accessibility',
        severity: 'warning',
        evidence_status: 'uncertain',
        span_start: start,
        span_end: end,
        flagged_text: imgMatch[0],
        explanation: `Image is missing descriptive alternative text (WCAG 1.1.1). Screen readers will read the raw URL or skip the asset.`,
        suggested_text: `![Descriptive caption of image](${imgMatch[2]})`,
        confidence: 0.95,
        origin: 'rule',
      });
    }
  }

  // 3. Screen Reader Acronym Trap / Excessive All-Caps Words (>4 characters)
  // Flags words in all-caps that aren't common technical acronyms
  const commonAcronyms = new Set([
    'HTML', 'CSS', 'HTTP', 'HTTPS', 'JSON', 'REST', 'SaaS', 'API', 'APIS',
    'RAM', 'VRAM', 'CPU', 'GPU', 'ONNX', 'CUDA', 'OFL', 'MIT', 'UUID', 'URL', 'W3C',
    'WCAG', 'ANC', 'USB', 'WiFi', 'CEO', 'CTO', 'CFO', 'FAQ', 'B2B', 'B2C'
  ]);

  const allCapsRegex = /\b[A-Z]{5,}\b/g;
  let capsMatch;
  while ((capsMatch = allCapsRegex.exec(content)) !== null) {
    const word = capsMatch[0];
    if (!commonAcronyms.has(word)) {
      const start = capsMatch.index;
      const end = start + word.length;
      const titleCased = word.charAt(0) + word.slice(1).toLowerCase();

      findings.push({
        category: 'accessibility',
        severity: 'suggestion',
        evidence_status: 'uncertain',
        span_start: start,
        span_end: end,
        flagged_text: word,
        explanation: `All-caps word "${word}" may be spelled out letter-by-letter by screen readers and reduces reading comfort. Consider title casing.`,
        suggested_text: titleCased,
        confidence: 0.85,
        origin: 'rule',
      });
    }
  }

  return findings;
}
