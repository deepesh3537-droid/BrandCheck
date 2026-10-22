/**
 * Fictional company sample data for the public product preview.
 * Per ADR-026, ADR-032: Visibly labelled "Sample". No invented metrics or real customer data.
 */

export const SAMPLE_DISCLAIMER = 'Sample Demonstration Data (Fictional Company: Novacore Audio)';

export const SAMPLE_SOURCES = [
  {
    id: 'src-1',
    title: 'Brand Vocabulary Guide',
    type: 'guideline',
    summary: 'Restricts hyperbolic claims. Forbids "revolutionary"; recommends "innovative" or "groundbreaking".',
    verified: true,
  },
  {
    id: 'src-2',
    title: 'Aura Technical Specs v1.4',
    type: 'fact',
    summary: 'Confirmed specifications: Battery life rated for 32 hours playback (ANC enabled).',
    verified: true,
  },
  {
    id: 'src-3',
    title: 'Approved Messaging Pillars',
    type: 'messaging',
    summary: 'Focus on precision acoustic engineering and everyday ergonomic comfort.',
    verified: true,
  },
];

export const SAMPLE_FINDINGS = [
  {
    id: 'find-1',
    flaggedText: 'revolutionary',
    severity: 'warning',
    category: 'Forbidden Terminology',
    sourceTitle: 'Brand Vocabulary Guide',
    explanation: 'Guideline restricts hyperbolic hype phrases. Replace "revolutionary" with approved terminology.',
    diff: {
      original: 'revolutionary',
      suggested: 'innovative',
    },
    status: 'pending',
  },
  {
    id: 'find-2',
    flaggedText: '48 hours',
    severity: 'error',
    category: 'Factual Discrepancy',
    sourceTitle: 'Aura Technical Specs v1.4',
    explanation: 'Battery life rating contradicts certified laboratory benchmark of 32 hours.',
    diff: {
      original: '48 hours',
      suggested: '32 hours',
    },
    status: 'pending',
  },
];

export const SAMPLE_DRAFT = {
  title: 'Novacore Aura Launch Announcement.md',
  originalText:
    'Experience sound redefined. The all-new Novacore Aura headphones deliver revolutionary noise isolation engineered with studio-grade precision and an astonishing 48 hours of uninterrupted wireless playback.',
  acceptedText:
    'Experience sound redefined. The all-new Novacore Aura headphones deliver innovative noise isolation engineered with studio-grade precision and an astonishing 32 hours of uninterrupted wireless playback.',
};
