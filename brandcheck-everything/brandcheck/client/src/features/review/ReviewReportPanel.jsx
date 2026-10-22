import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Loader2, 
  Filter, 
  Search,
  Sparkles,
  GitCommit,
  X
} from 'lucide-react';
import FindingCard from './FindingCard.jsx';

export default function ReviewReportPanel({
  review,
  findings = [],
  selectedFindingId,
  onSelectFinding,
  onDecision,
  isDeciding,
  isReviewing,
  onCommitNewVersion,
  isCreatingVersion,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'error' | 'warning' | 'suggestion' | 'unresolved'
  const [searchQuery, setSearchQuery] = useState('');

  // Finding stats
  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const suggestionCount = findings.filter((f) => f.severity === 'suggestion').length;
  const acceptedCount = findings.filter((f) => f.decision === 'accepted' || f.decision === 'edited').length;
  const pendingCount = findings.filter((f) => !f.decision || f.decision === 'pending').length;

  const filteredFindings = findings.filter((f) => {
    // Severity filter
    if (filterType === 'unresolved' && f.decision && f.decision !== 'pending') return false;
    if (filterType !== 'all' && filterType !== 'unresolved' && f.severity !== filterType) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = f.flagged_text?.toLowerCase().includes(q);
      const matchExp = f.explanation?.toLowerCase().includes(q);
      const matchCategory = f.category?.toLowerCase().includes(q);
      if (!matchText && !matchExp && !matchCategory) return false;
    }

    return true;
  });

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] bg-surface flex flex-col shrink-0 h-full border-t lg:border-t-0 lg:border-l border-border select-none">
      {/* Panel Top Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-text uppercase tracking-wider">
          <CheckSquare className="w-4 h-4 text-warning" />
          <span>Audit Report & Findings</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {isReviewing ? (
            <span className="flex items-center gap-1 text-primary animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing...</span>
            </span>
          ) : findings.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text font-medium">
              {findings.length} {findings.length === 1 ? 'issue' : 'issues'}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 font-medium">
              0 issues
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-2.5 border-b border-border bg-surface-2/40 space-y-2">
        {/* Severity Filter Tabs */}
        <div className="flex gap-1 text-[11px] font-medium overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-bg font-semibold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setFilterType('unresolved')}
            className={`px-2 py-1 rounded transition-colors ${
              filterType === 'unresolved'
                ? 'bg-primary text-bg font-semibold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            Unresolved ({pendingCount})
          </button>
          {errorCount > 0 && (
            <button
              onClick={() => setFilterType('error')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterType === 'error'
                  ? 'bg-error text-bg font-semibold'
                  : 'bg-surface text-error hover:bg-error/10 border border-error/30'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Errors ({errorCount})</span>
            </button>
          )}
          {warningCount > 0 && (
            <button
              onClick={() => setFilterType('warning')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterType === 'warning'
                  ? 'bg-warning text-bg font-semibold'
                  : 'bg-surface text-warning hover:bg-warning/10 border border-warning/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Warnings ({warningCount})</span>
            </button>
          )}
          {suggestionCount > 0 && (
            <button
              onClick={() => setFilterType('suggestion')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                filterType === 'suggestion'
                  ? 'bg-suggestion text-bg font-semibold'
                  : 'bg-surface text-suggestion hover:bg-suggestion/10 border border-suggestion/30'
              }`}
            >
              <Info className="w-3 h-3" />
              <span>Tips ({suggestionCount})</span>
            </button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search findings or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs rounded bg-surface border border-border text-text placeholder-muted/60 focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Findings List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isReviewing ? (
          /* Shimmer Loading State per DESIGN.md */
          <div className="space-y-3 py-6">
            <div className="text-center text-xs text-muted mb-4 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span>Evaluating content against verified brand sources...</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border bg-surface-2 animate-pulse space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-border/60 rounded" />
                  <div className="h-4 w-16 bg-border/60 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-border/40 rounded" />
                <div className="h-8 w-full bg-border/30 rounded" />
              </div>
            ))}
          </div>
        ) : !review ? (
          /* Empty State: No Review Run Yet */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
            <Sparkles className="w-10 h-10 text-primary/50 mb-3" />
            <h4 className="text-xs font-semibold text-text mb-1">Audit Ready</h4>
            <p className="text-[11px] leading-relaxed max-w-xs mb-4">
              Click "Run Review" in the center panel to check this copy against verified terms, facts, claims, and tone.
            </p>
          </div>
        ) : findings.length === 0 ? (
          /* Success State: Clean Content (TASK-054) */
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <h4 className="text-sm font-semibold text-text mb-1">
              Zero Brand Violations
            </h4>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              Every term, claim, and approved fact matches workspace guidelines. This draft is ready for publication sign-off.
            </p>
          </div>
        ) : filteredFindings.length === 0 ? (
          /* Filtered empty state */
          <div className="py-8 text-center text-xs text-muted">
            No findings match your current filter.
          </div>
        ) : (
          /* List of Findings */
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isSelected={selectedFindingId === finding.id}
              onSelect={() => onSelectFinding(finding.id)}
              onDecision={onDecision}
              isDeciding={isDeciding}
            />
          ))
        )}
      </div>

      {/* Bottom Summary & Commit Action Bar (TASK-053) */}
      {acceptedCount > 0 && (
        <div className="p-3 border-t border-border bg-surface-2/90 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-muted flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>
              <strong className="text-text">{acceptedCount}</strong> {acceptedCount === 1 ? 'correction' : 'corrections'} accepted
            </span>
          </div>

          <button
            onClick={onCommitNewVersion}
            disabled={isCreatingVersion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-bg font-semibold text-xs hover:bg-primary-hover transition-colors shadow-glow-primary disabled:opacity-50"
            title="Create next revision version incorporating all accepted suggestions"
          >
            {isCreatingVersion ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GitCommit className="w-3.5 h-3.5" />
            )}
            <span>Commit as New Version</span>
          </button>
        </div>
      )}
    </aside>
  );
}
