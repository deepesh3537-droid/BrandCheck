/**
 * Scripted storyline stages for the interactive product preview.
 * Synchronized with ScrollTrigger or step buttons.
 */

export const PREVIEW_STAGES = [
  {
    step: 0,
    title: '1. Ingest Draft & Ground Sources',
    caption: 'Draft uploaded into the workspace. Verified brand sources are loaded in the left panel.',
    activeHighlight: null,
    findingState: 'idle',
    acceptedDiff: false,
  },
  {
    step: 1,
    title: '2. Review Engine Scans & Flags',
    caption: 'Deterministic guidelines and ONNX/Ollama models flag violations with grounded source links.',
    activeHighlight: 'revolutionary',
    findingState: 'flagged',
    acceptedDiff: false,
  },
  {
    step: 2,
    title: '3. Human-in-the-Loop Decision',
    caption: 'Creator accepts the non-destructive diff correction. The draft is safely updated.',
    activeHighlight: null,
    findingState: 'resolved',
    acceptedDiff: true,
  },
];
