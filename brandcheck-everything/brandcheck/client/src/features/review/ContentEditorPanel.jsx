import React, { useMemo } from 'react';
import { 
  FileText, 
  Play, 
  Loader2, 
  Plus, 
  ChevronDown, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  GitBranch,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ContentEditorPanel({
  contents = [],
  selectedContent,
  currentVersion,
  findings = [],
  selectedFindingId,
  onSelectFinding,
  onSelectContent,
  onOpenSubmitModal,
  onRunReview,
  isReviewing,
  previewMode = 'highlights', // 'highlights' | 'preview'
  setPreviewMode,
}) {
  const bodyText = currentVersion?.body || '';

  // Calculate staged text if any findings have been accepted / edited
  const stagedContent = useMemo(() => {
    if (!bodyText || findings.length === 0) return bodyText;

    // Filter findings that have been accepted or edited
    const resolvedFindings = findings
      .filter((f) => (f.decision === 'accepted' || f.decision === 'edited') && (f.decision_text || f.suggested_text))
      .sort((a, b) => b.span_start - a.span_start); // Replace backwards to keep offsets valid

    let modified = bodyText;
    for (const f of resolvedFindings) {
      const replacement = f.decision_text || f.suggested_text;
      if (f.span_start >= 0 && f.span_end <= modified.length) {
        modified =
          modified.slice(0, f.span_start) +
          replacement +
          modified.slice(f.span_end);
      }
    }
    return modified;
  }, [bodyText, findings]);

  // Slices text into plain segments and finding highlight spans
  const renderedSegments = useMemo(() => {
    if (!bodyText) return [];
    if (!findings || findings.length === 0) {
      return [{ type: 'text', text: bodyText, id: 'plain-0' }];
    }

    // Sort findings by span_start ASC
    const sorted = [...findings].sort((a, b) => a.span_start - b.span_start);
    const segments = [];
    let currentIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
      const f = sorted[i];
      if (f.span_start < currentIndex) {
        // Skip overlapping spans
        continue;
      }

      // Add preceding plain text
      if (f.span_start > currentIndex) {
        segments.push({
          type: 'text',
          text: bodyText.slice(currentIndex, f.span_start),
          id: `plain-${currentIndex}`,
        });
      }

      // Add highlighted finding span
      const spanEnd = Math.min(f.span_end, bodyText.length);
      segments.push({
        type: 'finding',
        text: bodyText.slice(f.span_start, spanEnd),
        finding: f,
        id: `finding-${f.id}`,
      });

      currentIndex = spanEnd;
    }

    // Add remaining plain text
    if (currentIndex < bodyText.length) {
      segments.push({
        type: 'text',
        text: bodyText.slice(currentIndex),
        id: `plain-${currentIndex}`,
      });
    }

    return segments;
  }, [bodyText, findings]);

  const acceptedCount = findings.filter(
    (f) => f.decision === 'accepted' || f.decision === 'edited'
  ).length;

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-bg h-full overflow-hidden">
      {/* Top Bar: Document selector, version badge, review button */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-3 bg-surface/50 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-primary shrink-0" />

          {/* Document Selector Dropdown */}
          {contents.length > 0 ? (
            <div className="relative flex items-center gap-1.5 min-w-0">
              <select
                value={selectedContent?.id || ''}
                onChange={(e) => onSelectContent(e.target.value)}
                className="bg-surface-2 border border-border text-text text-xs rounded-lg px-2.5 py-1.5 font-medium truncate max-w-[200px] sm:max-w-[320px] focus:outline-none focus:border-primary cursor-pointer"
              >
                {contents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Version Badge (ADR-013: Version 1 immutable) */}
              <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-muted">
                v{currentVersion?.version_no || 1}{' '}
                {currentVersion?.version_no === 1 ? '(immutable)' : '(revised)'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted font-medium">No active document</span>
          )}

          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface-2 text-text border border-border text-xs font-medium transition-colors shrink-0"
            title="Submit another piece of marketing or product copy"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">New Content</span>
          </button>
        </div>

        {/* Right Actions: View Mode toggle & Run Review */}
        <div className="flex items-center gap-2 shrink-0">
          {acceptedCount > 0 && (
            <div className="hidden md:flex items-center rounded-lg border border-border bg-surface-2 p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setPreviewMode('highlights')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  previewMode === 'highlights'
                    ? 'bg-primary text-bg font-semibold'
                    : 'text-muted hover:text-text'
                }`}
              >
                Highlighted Draft
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  previewMode === 'preview'
                    ? 'bg-primary text-bg font-semibold'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Staged v{Number(currentVersion?.version_no || 1) + 1} Preview</span>
              </button>
            </div>
          )}

          {selectedContent && (
            <button
              onClick={onRunReview}
              disabled={isReviewing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-bg font-semibold text-xs hover:bg-primary-hover shadow-glow-primary transition-colors disabled:opacity-50"
              title="Run automated brand governance audit"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Review</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 font-sans leading-relaxed text-sm text-text">
        {!selectedContent ? (
          /* Empty State when no document submitted yet (TASK-054) */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4 text-primary">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-text mb-2">
              No Content In Review
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-6">
              Paste marketing copy, press releases, or upload a <code>.txt</code> / <code>.md</code> document to audit against verified brand sources.
            </p>
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg font-semibold text-xs hover:bg-primary-hover shadow-glow-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Copy for Governance Review</span>
            </button>
          </div>
        ) : previewMode === 'preview' ? (
          /* Staged Revision Preview */
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-3 rounded-lg bg-surface border border-primary/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-primary font-medium">
                <GitBranch className="w-4 h-4" />
                <span>Proposed Revision Preview (v{Number(currentVersion?.version_no || 1) + 1})</span>
              </div>
              <span className="text-[11px] text-muted">
                {acceptedCount} changes staged
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm font-sans text-sm leading-loose whitespace-pre-wrap">
              {stagedContent}
            </div>
          </div>
        ) : (
          /* Interactive Highlighted Document View */
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 rounded-2xl border border-border bg-surface/70 shadow-sm font-sans text-sm leading-loose whitespace-pre-wrap">
              {renderedSegments.map((segment) => {
                if (segment.type === 'text') {
                  return <span key={segment.id}>{segment.text}</span>;
                }

                const f = segment.finding;
                const isSelected = selectedFindingId === f.id;
                const highlightClass =
                  f.severity === 'error'
                    ? 'highlight-error'
                    : f.severity === 'warning'
                    ? 'highlight-warning'
                    : 'highlight-suggestion';

                return (
                  <mark
                    key={segment.id}
                    onClick={() => onSelectFinding(f.id)}
                    className={`${highlightClass} px-1 py-0.5 rounded cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-bg font-medium bg-primary/20 shadow-glow-primary'
                        : 'hover:opacity-80'
                    }`}
                    title={`${f.severity.toUpperCase()}: ${f.explanation}`}
                  >
                    {segment.text}
                  </mark>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
