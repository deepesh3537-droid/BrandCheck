import { describe, it, expect } from 'vitest';
import { checkAccessibility } from '../../src/review/rules/accessibility.js';
import { checkRequiredPhrases } from '../../src/review/rules/requiredPhrase.js';

describe('Phase 8 Advanced Brand Rules', () => {
  describe('TASK-082: Content Accessibility Checker', () => {
    it('flags ambiguous link anchor text (WCAG 2.4.4)', () => {
      const draft = 'To view our newest beverage lineup, [click here](https://example.com/drinks).';
      const findings = checkAccessibility(draft);

      expect(findings.length).toBeGreaterThan(0);
      const linkFinding = findings.find((f) => f.category === 'accessibility' && f.flagged_text.includes('click here'));
      expect(linkFinding).toBeDefined();
      expect(linkFinding.explanation).toContain('WCAG 2.4.4');
      expect(linkFinding.severity).toBe('warning');
    });

    it('flags images missing descriptive alt text (WCAG 1.1.1)', () => {
      const draftWithEmptyAlt = 'Check out the product image: ![](https://example.com/bottle.png)';
      const findings = checkAccessibility(draftWithEmptyAlt);

      const altFinding = findings.find((f) => f.category === 'accessibility' && f.flagged_text.includes('![]'));
      expect(altFinding).toBeDefined();
      expect(altFinding.explanation).toContain('WCAG 1.1.1');
    });

    it('flags excessive all-caps words while exempting valid technical acronyms', () => {
      const draft = 'Our new formula is UNBELIEVABLE and integrates seamlessly with our REST API over HTTPS.';
      const findings = checkAccessibility(draft);

      const capsFinding = findings.find((f) => f.flagged_text === 'UNBELIEVABLE');
      expect(capsFinding).toBeDefined();
      expect(capsFinding.category).toBe('accessibility');
      expect(capsFinding.suggested_text).toBe('Unbelievable');

      // Valid acronyms API and HTTPS should NOT be flagged
      const apiFinding = findings.find((f) => f.flagged_text === 'API' || f.flagged_text === 'HTTPS');
      expect(apiFinding).toBeUndefined();
    });
  });

  describe('TASK-084: Required Phrase Checker', () => {
    const requiredSources = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Mandatory Legal Disclaimer',
        type: 'required_phrase',
        structured: {
          phrase: 'Terms and conditions apply. 18+ only.',
          severity: 'warning',
        },
        body: 'All marketing promotional communications must conclude with terms statement.',
      },
    ];

    it('flags a finding when a mandatory phrase is missing from the draft', () => {
      const draftWithoutTerms = 'Enjoy our summer botanical special available all month.';
      const findings = checkRequiredPhrases(draftWithoutTerms, requiredSources);

      expect(findings.length).toBe(1);
      expect(findings[0].category).toBe('required_phrase');
      expect(findings[0].evidence_status).toBe('source_backed');
      expect(findings[0].source_item_id).toBe('22222222-2222-2222-2222-222222222222');
      expect(findings[0].explanation).toBe(requiredSources[0].body);
    });

    it('produces 0 findings when the mandatory phrase is present in the draft', () => {
      const draftWithTerms = 'Enjoy our summer botanical special. Terms and conditions apply. 18+ only.';
      const findings = checkRequiredPhrases(draftWithTerms, requiredSources);

      expect(findings.length).toBe(0);
    });
  });
});
