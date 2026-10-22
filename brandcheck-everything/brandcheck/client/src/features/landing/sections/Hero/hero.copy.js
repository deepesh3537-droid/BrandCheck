/**
 * Approved hero section copy for BrandCheck landing page.
 * Per TASK-008, TASK-071, and ADR-032 (Honesty & Integrity Policy):
 * Mentions only implemented, verified capabilities. No invented statistics or fictitious client logos.
 */

export const HERO_COPY = {
  eyebrow: {
    status: 'Ready',
    label: 'Local-first brand governance before publication',
  },
  headline: {
    lead: 'Brand governance',
    accent: 'before you hit publish.',
    sub: 'Review drafts from any source against your approved brand guidelines, facts, terminology, and voice before they reach the public.',
  },
  cta: {
    primaryGuest: 'Get Started Free',
    primaryAuth: 'Open Workspace',
    secondary: 'Sign In',
    demo: 'Explore Sample Review',
  },
  capabilities: [
    {
      id: 'grounded',
      title: 'Source-Grounded Checks',
      description: 'Findings link directly to verified brand sources, preferred terms, and guidelines.',
      tag: 'Deterministic',
    },
    {
      id: 'immutable',
      title: 'Never Overwrites Silently',
      description: 'Original drafts are immutable. Creators accept, edit, reject, defer, or challenge diff suggestions.',
      tag: 'Human Control',
    },
    {
      id: 'privacy',
      title: 'Local-First & Zero Paid APIs',
      description: 'Runs with local ONNX embeddings and Ollama. Your brand content never leaves your infrastructure.',
      tag: '₹0 Budget',
    },
  ],
};
