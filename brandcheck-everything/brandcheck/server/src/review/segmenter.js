/**
 * Segmenter with character offsets
 * Splits draft content into sentence and paragraph units while preserving
 * exact 0-indexed character offsets for UI highlight mapping.
 */

/**
 * @typedef {Object} TextSegment
 * @property {number} index - 0-based segment index
 * @property {string} text - Segment content
 * @property {number} start - Character offset start in original text
 * @property {number} end - Character offset end in original text
 */

/**
 * Segment raw text into sentences/clauses with exact character offsets
 * @param {string} fullText
 * @returns {TextSegment[]}
 */
export function segmentText(fullText) {
  if (!fullText || typeof fullText !== 'string') {
    return [];
  }

  const segments = [];
  // Regex splitting on sentence terminators (. ! ?) followed by whitespace or line breaks
  // or double line breaks (paragraphs)
  const regex = /[^.!?\n]+(?:[.!?]+|\n+|$)/g;
  let match;

  while ((match = regex.exec(fullText)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      // Find the exact start offset of the trimmed content within the raw match
      const trimStartOffset = raw.indexOf(trimmed);
      const start = match.index + trimStartOffset;
      const end = start + trimmed.length;

      segments.push({
        index: segments.length,
        text: trimmed,
        start,
        end,
      });
    }
  }

  // Fallback if regex produced no segments but text is non-empty
  if (segments.length === 0 && fullText.trim().length > 0) {
    const trimmed = fullText.trim();
    const start = fullText.indexOf(trimmed);
    segments.push({
      index: 0,
      text: trimmed,
      start,
      end: start + trimmed.length,
    });
  }

  return segments;
}

/**
 * Locate all exact or regex occurrences of a term in text with character offsets
 * @param {string} fullText
 * @param {string|RegExp} pattern
 * @param {{ caseInsensitive?: boolean }} [options]
 * @returns {Array<{ text: string, start: number, end: number }>}
 */
export function findMatchesWithOffsets(fullText, pattern, { caseInsensitive = true } = {}) {
  if (!fullText || !pattern) return [];

  const matches = [];
  let regex;

  if (pattern instanceof RegExp) {
    regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  } else {
    // Escape special regex characters for literal word search with boundary checks
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flags = caseInsensitive ? 'gi' : 'g';
    // Use word boundaries \b if pattern is alphanumeric
    const hasWordBoundaries = /^\w+$/.test(pattern);
    const regexPattern = hasWordBoundaries ? `\\b${escaped}\\b` : escaped;
    regex = new RegExp(regexPattern, flags);
  }

  let m;
  while ((m = regex.exec(fullText)) !== null) {
    matches.push({
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
    });
  }

  return matches;
}
