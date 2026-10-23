import React, { useMemo, useState } from 'react';
import { 
  FileText, 
  Play, 
  Loader2, 
  Plus, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  GitBranch,
  ArrowRight,
  Download,
  Check,
  Copy,
  Image as ImageIcon,
  Columns
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
  previewMode = 'highlights', // 'highlights' | 'improved' | 'diff'
  setPreviewMode,
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Normalize active mode
  const activeMode = previewMode === 'preview' ? 'improved' : previewMode;
  const updateMode = (mode) => {
    if (typeof setPreviewMode === 'function') {
      setPreviewMode(mode);
    }
  };

  const bodyText = currentVersion?.body || '';

  // Check if content has poster/image artwork or markdown image
  const imageMarkdownMatch = bodyText.match(/!\[(.*?)\]\((.*?)\)/);
  const isPosterContent = 
    selectedContent?.title?.toLowerCase().includes('poster') || 
    Boolean(imageMarkdownMatch) ||
    bodyText.startsWith('data:image/');

  // Calculate staged text with all accepted / edited suggestions applied
  const stagedContent = useMemo(() => {
    if (!bodyText || findings.length === 0) return bodyText;

    const resolvedFindings = findings
      .filter((f) => (f.decision === 'accepted' || f.decision === 'edited') && (f.decision_text || f.suggested_text))
      .sort((a, b) => b.span_start - a.span_start);

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

    const sorted = [...findings].sort((a, b) => a.span_start - b.span_start);
    const segments = [];
    let currentIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
      const f = sorted[i];
      if (f.span_start < currentIndex) continue;

      if (f.span_start > currentIndex) {
        segments.push({
          type: 'text',
          text: bodyText.slice(currentIndex, f.span_start),
          id: `plain-${currentIndex}`,
        });
      }

      const spanEnd = Math.min(f.span_end, bodyText.length);
      segments.push({
        type: 'finding',
        text: bodyText.slice(f.span_start, spanEnd),
        finding: f,
        id: `finding-${f.id}`,
      });

      currentIndex = spanEnd;
    }

    if (currentIndex < bodyText.length) {
      segments.push({
        type: 'text',
        text: bodyText.slice(currentIndex),
        id: `plain-${currentIndex}`,
      });
    }

    return segments;
  }, [bodyText, findings]);

  // Improved segments where accepted changes are highlighted with light animation
  const improvedSegments = useMemo(() => {
    if (!bodyText) return [];

    const resolvedFindings = findings
      .filter((f) => (f.decision === 'accepted' || f.decision === 'edited') && (f.decision_text || f.suggested_text))
      .sort((a, b) => a.span_start - b.span_start);

    if (resolvedFindings.length === 0) {
      return [{ type: 'text', text: bodyText, id: 'imp-plain-0' }];
    }

    const segments = [];
    let currentIndex = 0;

    for (let i = 0; i < resolvedFindings.length; i++) {
      const f = resolvedFindings[i];
      if (f.span_start < currentIndex) continue;

      if (f.span_start > currentIndex) {
        segments.push({
          type: 'text',
          text: bodyText.slice(currentIndex, f.span_start),
          id: `imp-text-${currentIndex}`,
        });
      }

      const replacement = f.decision_text || f.suggested_text;
      segments.push({
        type: 'improved',
        text: replacement,
        originalText: f.flagged_text,
        finding: f,
        id: `imp-rev-${f.id}-${replacement}`,
      });

      currentIndex = Math.min(f.span_end, bodyText.length);
    }

    if (currentIndex < bodyText.length) {
      segments.push({
        type: 'text',
        text: bodyText.slice(currentIndex),
        id: `imp-text-${currentIndex}`,
      });
    }

    return segments;
  }, [bodyText, findings]);

  const acceptedCount = findings.filter(
    (f) => f.decision === 'accepted' || f.decision === 'edited'
  ).length;

  const handleDownloadImproved = () => {
    const contentToDownload = stagedContent || bodyText;
    const safeTitle = (selectedContent?.title || 'BrandCheck_Document').replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${safeTitle}-improved-v${currentVersion?.version_no || 1}.txt`;

    const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyImproved = () => {
    const text = stagedContent || bodyText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-bg h-full overflow-hidden">
      {/* Top Bar: Document selector, version badge, preview tabs, and actions */}
      <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-surface/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />

            {/* Document Selector Dropdown */}
            {contents.length > 0 ? (
              <div className="relative flex items-center gap-1.5 min-w-0">
                <select
                  value={selectedContent?.id || ''}
                  onChange={(e) => onSelectContent(e.target.value)}
                  className="bg-surface-2 border border-border text-text text-xs rounded-lg px-2.5 py-1.5 font-medium truncate max-w-[180px] sm:max-w-[280px] focus:outline-none focus:border-primary cursor-pointer"
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
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-2 text-text border border-border text-xs font-medium transition-colors shrink-0"
            title="Submit another piece of marketing or product copy"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">New Content</span>
          </button>
        </div>

        {/* Center / Right: Mode Switcher & Download Button & Run Review */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          {selectedContent && (
            <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5 text-xs font-medium">
              <button
                onClick={() => updateMode('highlights')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeMode === 'highlights'
                    ? 'bg-primary text-bg font-semibold shadow-glow-primary'
                    : 'text-muted hover:text-text'
                }`}
                title="View original draft with finding highlights"
              >
                <FileText className="w-3 h-3" />
                <span>Highlighted Draft</span>
              </button>

              <button
                onClick={() => updateMode('improved')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeMode === 'improved'
                    ? 'bg-primary text-bg font-semibold shadow-glow-primary'
                    : 'text-muted hover:text-text'
                }`}
                title="View live improved preview with accepted changes"
              >
                <Sparkles className="w-3 h-3" />
                <span>Improved Preview</span>
                {acceptedCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeMode === 'improved' ? 'bg-bg/25 text-bg' : 'bg-success/20 text-success'
                  }`}>
                    {acceptedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => updateMode('diff')}
                className={`hidden md:flex px-2 py-1 rounded-md transition-all items-center gap-1 ${
                  activeMode === 'diff'
                    ? 'bg-primary text-bg font-semibold shadow-glow-primary'
                    : 'text-muted hover:text-text'
                }`}
                title="View side-by-side comparison"
              >
                <Columns className="w-3 h-3" />
                <span>Diff</span>
              </button>
            </div>
          )}

          {/* Download Improved Version Button */}
          {selectedContent && (
            <button
              onClick={handleDownloadImproved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-2 border border-primary/40 hover:border-primary text-text hover:text-primary text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
              title="Download improved version as a clean text file"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Download Improved Version</span>
                  <span className="sm:hidden">Download</span>
                </>
              )}
            </button>
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
                  <span className="hidden sm:inline">Run Review</span>
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
              Paste marketing copy, press releases, or upload a <code>.txt</code> / <code>.md</code> document or poster image to audit against verified brand sources.
            </p>
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg font-semibold text-xs hover:bg-primary-hover shadow-glow-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Copy for Governance Review</span>
            </button>
          </div>
        ) : activeMode === 'improved' ? (
          /* 1. Live Improved Preview with Light Animation on Accepted Changes */
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-3.5 rounded-xl bg-surface border border-primary/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Live Improved Preview</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {acceptedCount} {acceptedCount === 1 ? 'change applied' : 'changes applied'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyImproved}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text text-[11px] transition-colors"
                  title="Copy improved text"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadImproved}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-bg font-semibold text-[11px] hover:bg-primary-hover shadow-glow-primary transition-all"
                  title="Download improved version"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Poster / Image Banner if applicable */}
            {isPosterContent && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border flex items-center gap-2.5 text-xs text-muted">
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                <span>Poster Copy Preview &middot; Showing verified OCR text with brand-governed revisions</span>
              </div>
            )}

            {/* Document Body with Glowing Live Improvements */}
            <div className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-sm font-sans text-sm leading-loose whitespace-pre-wrap select-text">
              {improvedSegments.map((segment) => {
                if (segment.type === 'text') {
                  return <span key={segment.id}>{segment.text}</span>;
                }

                // Render improved replacement with light glowing animation
                return (
                  <span
                    key={segment.id}
                    className="inline-flex items-center gap-1 font-semibold text-success bg-success/15 border border-success/40 rounded px-2 py-0.5 mx-0.5 shadow-sm transition-all duration-500 animate-pulse"
                    title={`Improved from: "${segment.originalText}"`}
                  >
                    <Sparkles className="w-3 h-3 text-success inline shrink-0" />
                    <span>{segment.text}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : activeMode === 'diff' ? (
          /* 2. Side-by-Side Comparison Diff Mode */
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Column */}
              <div className="p-5 rounded-2xl border border-border bg-surface/50 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border text-xs font-semibold text-muted">
                  <span>Original Draft (v{currentVersion?.version_no || 1})</span>
                  <span className="text-[10px] font-mono text-error">{findings.length} issues flagged</span>
                </div>
                <div className="font-sans text-xs leading-relaxed whitespace-pre-wrap text-muted">
                  {bodyText}
                </div>
              </div>

              {/* Improved Column */}
              <div className="p-5 rounded-2xl border border-primary/30 bg-surface shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border text-xs font-semibold text-primary">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Improved Version</span>
                  </div>
                  <button
                    onClick={handleDownloadImproved}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary text-bg text-[10px] font-semibold"
                  >
                    <Download className="w-2.5 h-2.5" />
                    <span>Download</span>
                  </button>
                </div>
                <div className="font-sans text-xs leading-relaxed whitespace-pre-wrap text-text">
                  {stagedContent}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. Interactive Highlighted Document View */
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Poster Banner if applicable */}
            {isPosterContent && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                  <span>Poster Text Extraction &middot; Reviewing brand terms, tone, and claims</span>
                </div>
                {acceptedCount > 0 && (
                  <button
                    onClick={() => updateMode('improved')}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View Improved Preview</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className="p-6 md:p-8 rounded-2xl border border-border bg-surface/70 shadow-sm font-sans text-sm leading-loose whitespace-pre-wrap select-text">
              {renderedSegments.map((segment) => {
                if (segment.type === 'text') {
                  return <span key={segment.id}>{segment.text}</span>;
                }

                const f = segment.finding;
                const isSelected = selectedFindingId === f.id;
                const isAccepted = f.decision === 'accepted' || f.decision === 'edited';

                // If user already accepted on the right, show the live accepted improvement with light animation!
                if (isAccepted) {
                  return (
                    <mark
                      key={segment.id}
                      onClick={() => onSelectFinding(f.id)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-success/40 bg-success/15 text-success font-medium cursor-pointer transition-all duration-300 animate-pulse shadow-sm"
                      title={`Accepted improvement: "${f.decision_text || f.suggested_text}" (replacing "${f.flagged_text}")`}
                    >
                      <span className="line-through text-error/60 text-xs">{segment.text}</span>
                      <ArrowRight className="w-3 h-3 text-success shrink-0" />
                      <span className="font-semibold">{f.decision_text || f.suggested_text}</span>
                    </mark>
                  );
                }

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
                    className={`${highlightClass} px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 ${
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
