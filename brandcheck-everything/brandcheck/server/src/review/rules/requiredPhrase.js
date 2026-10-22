/**
 * Required Phrase Checker
 * Per TASK-084: Validates that mandatory brand disclaimers, trademark notices,
 * or legal phrases are present in the submitted draft.
 * 
 * @param {string} content - Full text of the draft content
 * @param {Array<Object>} requiredSources - Sources specifying mandatory phrases
 * @returns {Array<Object>} List of missing required-phrase findings
 */
export function checkRequiredPhrases(content, requiredSources = []) {
  if (!content || !requiredSources || requiredSources.length === 0) {
    return [];
  }

  const findings = [];
  const normalizedContent = content.toLowerCase();

  for (const source of requiredSources) {
    const requiredPhrase =
      source.structured?.phrase ||
      source.structured?.required_phrase ||
      source.structured?.required ||
      (source.type === 'required_phrase' ? source.title : null);

    if (!requiredPhrase || typeof requiredPhrase !== 'string') {
      continue;
    }

    const phraseClean = requiredPhrase.trim().toLowerCase();
    const isPresent = normalizedContent.includes(phraseClean);

    if (!isPresent) {
      const severity = source.structured?.severity || 'warning';
      const contentLength = content.length;

      findings.push({
        category: 'required_phrase',
        severity,
        evidence_status: 'source_backed',
        span_start: contentLength,
        span_end: contentLength,
        flagged_text: '',
        explanation:
          source.body ||
          `Mandatory brand phrase "${requiredPhrase}" was not found in this draft. Guidelines require this disclosure before publication.`,
        source_item_id: source.id,
        suggested_text: `\n\n${requiredPhrase}`,
        confidence: 1.0,
        origin: 'rule',
      });
    }
  }

  return findings;
}
