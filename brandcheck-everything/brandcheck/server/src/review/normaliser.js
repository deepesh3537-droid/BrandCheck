/**
 * Normaliser enforcing the BrandCheck Evidence Rule
 * 
 * Rules:
 * 1. A finding is 'source_backed' ONLY if it cites a valid source_item_id from the current workspace.
 * 2. If the citation is missing, invalid, or belongs to another workspace, it is downgraded to 'uncertain'.
 * 3. Per ADR-014, tone findings are ALWAYS 'uncertain' because zero-shot models cannot guarantee voice.
 * 4. Never invent confidence scores or citations.
 */

const VALID_CATEGORIES = new Set(['terminology', 'fact', 'claim', 'tone', 'visual', 'accessibility']);
const VALID_SEVERITIES = new Set(['error', 'warning', 'suggestion']);

/**
 * Normalise raw findings from rule and model checks
 * @param {Array<Object>} findings - Raw finding objects
 * @param {Set<string>|Array<string>} validSourceIds - Set of valid source_items IDs in this workspace
 * @returns {Array<Object>} Normalised findings conforming to ARCHITECTURE.md finding schema
 */
export function normaliseFindings(findings = [], validSourceIds = new Set()) {
  if (!Array.isArray(findings)) return [];

  const sourceIdSet = validSourceIds instanceof Set ? validSourceIds : new Set(validSourceIds);
  const normalised = [];
  const seenSpans = new Set();

  for (const raw of findings) {
    if (!raw || typeof raw.span_start !== 'number' || typeof raw.span_end !== 'number') {
      continue;
    }

    // Deduplicate overlapping checks for the identical span and category
    const spanKey = `${raw.span_start}-${raw.span_end}-${raw.category}-${raw.flagged_text}`;
    if (seenSpans.has(spanKey)) {
      continue;
    }
    seenSpans.add(spanKey);

    const category = VALID_CATEGORIES.has(raw.category) ? raw.category : 'terminology';
    const severity = VALID_SEVERITIES.has(raw.severity) ? raw.severity : 'warning';

    // Enforce Evidence Rule
    let evidenceStatus = 'uncertain';
    let sourceItemId = null;

    if (raw.source_item_id && sourceIdSet.has(raw.source_item_id)) {
      sourceItemId = raw.source_item_id;
      evidenceStatus = 'source_backed';
    }

    // Tone is ALWAYS uncertain per ADR-014
    if (category === 'tone') {
      evidenceStatus = 'uncertain';
    }

    normalised.push({
      category,
      severity,
      evidence_status: evidenceStatus,
      span_start: Math.max(0, raw.span_start),
      span_end: Math.max(raw.span_start, raw.span_end),
      flagged_text: String(raw.flagged_text || ''),
      explanation: String(raw.explanation || 'Brand governance rule match'),
      source_item_id: sourceItemId,
      suggested_text: raw.suggested_text ? String(raw.suggested_text) : null,
      confidence: typeof raw.confidence === 'number' ? Math.min(1, Math.max(0, raw.confidence)) : null,
      origin: raw.origin === 'model' ? 'model' : 'rule',
      decision: 'pending',
      decision_text: null,
      decision_note: null,
      decided_by: null,
      decided_at: null,
    });
  }

  // Sort findings by document appearance (span_start ASC)
  return normalised.sort((a, b) => a.span_start - b.span_start);
}
