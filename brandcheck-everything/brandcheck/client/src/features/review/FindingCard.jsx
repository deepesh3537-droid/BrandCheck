import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  Edit3, 
  X, 
  Clock, 
  MessageSquare,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SEVERITY_CONFIG = {
  error: {
    label: 'Error',
    icon: AlertCircle,
    color: 'text-error',
    bg: 'bg-error/10 border-error/30',
    underline: 'solid',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/30',
    underline: 'dashed',
  },
  suggestion: {
    label: 'Suggestion',
    icon: Info,
    color: 'text-suggestion',
    bg: 'bg-suggestion/10 border-suggestion/30',
    underline: 'dotted',
  },
};

const CATEGORY_LABELS = {
  terminology: 'Terminology',
  fact: 'Approved Fact',
  claim: 'Unsupported Claim',
  tone: 'Brand Tone',
  visual: 'Visual Rule',
  accessibility: 'Accessibility',
};

export default function FindingCard({
  finding,
  isSelected,
  onSelect,
  onDecision,
  isDeciding,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState(finding.suggested_text || '');
  const [decisionNote, setDecisionNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showSourceDetails, setShowSourceDetails] = useState(false);

  const severity = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.warning;
  const SeverityIcon = severity.icon;
  const isSourceBacked = finding.evidence_status === 'source_backed';

  const handleAccept = (e) => {
    e.stopPropagation();
    onDecision(finding.id, {
      decision: 'accepted',
      decision_text: finding.suggested_text || null,
    });
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (!customText.trim()) return;
    onDecision(finding.id, {
      decision: 'edited',
      decision_text: customText.trim(),
    });
    setIsEditing(false);
  };

  const handlePromptNote = (e, action) => {
    e.stopPropagation();
    setPendingAction(action);
    setShowNoteInput(true);
  };

  const handleConfirmWithNote = (e) => {
    e.stopPropagation();
    if (!pendingAction) return;
    onDecision(finding.id, {
      decision: pendingAction,
      decision_note: decisionNote.trim() || undefined,
    });
    setShowNoteInput(false);
    setPendingAction(null);
    setDecisionNote('');
  };

  const handleCancelNote = (e) => {
    e.stopPropagation();
    setShowNoteInput(false);
    setPendingAction(null);
    setDecisionNote('');
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary bg-surface-2 shadow-glow-primary ring-1 ring-primary/40'
          : 'border-border bg-surface hover:bg-surface-2/80 hover:border-border/80'
      }`}
    >
      {/* Top Header: Severity + Category + Evidence Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Severity Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${severity.bg} ${severity.color}`}
          >
            <SeverityIcon className="w-3 h-3" />
            <span>{severity.label}</span>
          </span>

          {/* Category Badge */}
          <span className="text-[11px] font-medium text-muted px-2 py-0.5 rounded bg-surface border border-border">
            {CATEGORY_LABELS[finding.category] || finding.category}
          </span>
        </div>

        {/* Evidence Status Chip: source-backed vs uncertain per Core Principle 6 */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
            isSourceBacked
              ? 'text-success bg-success/10 border-success/30'
              : 'text-warning bg-warning/10 border-warning/30'
          }`}
          title={
            isSourceBacked
              ? 'Grounded directly in approved workspace source item'
              : 'Statistical/heuristic inference. Exercise editorial judgment.'
          }
        >
          {isSourceBacked ? (
            <ShieldCheck className="w-3 h-3 text-success" />
          ) : (
            <HelpCircle className="w-3 h-3 text-warning" />
          )}
          <span>{isSourceBacked ? 'source-backed' : 'uncertain'}</span>
        </span>
      </div>

      {/* Flagged Text */}
      <div className="mb-2">
        <div className="text-[11px] text-muted font-sans mb-0.5">Flagged phrase:</div>
        <div className="font-mono text-xs px-2 py-1 rounded bg-bg border border-border text-error font-medium break-words">
          "{finding.flagged_text}"
        </div>
      </div>

      {/* Grounded Explanation */}
      <p className="text-xs text-text/90 leading-relaxed mb-3">
        {finding.explanation}
      </p>

      {/* Suggested Fix Diff */}
      {finding.suggested_text && (
        <div className="mb-3 p-2.5 rounded-lg bg-bg/80 border border-border text-xs">
          <div className="text-[11px] font-semibold text-muted mb-1.5 flex items-center gap-1">
            <span>Suggested Correction:</span>
          </div>

          {!isEditing ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 font-mono text-[11px]">
              <span className="line-through text-error/80 bg-error/10 px-1.5 py-0.5 rounded">
                {finding.flagged_text}
              </span>
              <ArrowRight className="w-3 h-3 text-muted shrink-0 hidden sm:inline" />
              <span className="text-success bg-success/10 px-1.5 py-0.5 rounded font-medium">
                {finding.decision_text || finding.suggested_text}
              </span>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2.5 py-1 text-xs rounded border border-primary bg-surface text-text focus:outline-none"
                placeholder="Enter custom replacement..."
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleSaveEdit}
                  disabled={isDeciding || !customText.trim()}
                  className="px-2 py-0.5 rounded bg-primary text-bg text-[11px] font-semibold hover:bg-primary-hover"
                >
                  Save & Apply
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                  }}
                  className="px-2 py-0.5 rounded bg-surface border border-border text-muted hover:text-text text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cited Brand Source Reference Item */}
      {finding.source_title && (
        <div className="mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSourceDetails(!showSourceDetails);
            }}
            className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded bg-surface-2 border border-border text-[11px] font-mono text-muted hover:text-text hover:border-primary/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <BookOpen className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Source: {finding.source_title}</span>
            </span>
            {showSourceDetails ? (
              <ChevronUp className="w-3 h-3 shrink-0" />
            ) : (
              <ChevronDown className="w-3 h-3 shrink-0" />
            )}
          </button>

          {showSourceDetails && finding.source_body && (
            <div className="mt-1.5 p-2 rounded bg-bg border border-border text-[11px] text-muted font-sans leading-relaxed">
              <div className="font-semibold text-text mb-1 text-[10px] uppercase tracking-wider">
                Approved Brand Source Excerpt:
              </div>
              <p className="italic">"{finding.source_body}"</p>
            </div>
          )}
        </div>
      )}

      {/* Human Decision Status or Action Buttons (TASK-053) */}
      <div className="border-t border-border pt-2.5 mt-2">
        {finding.decision && finding.decision !== 'pending' ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted">Decision recorded:</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono capitalize border ${
                finding.decision === 'accepted' || finding.decision === 'edited'
                  ? 'bg-success/10 text-success border-success/30'
                  : finding.decision === 'rejected'
                  ? 'bg-error/10 text-error border-error/30'
                  : finding.decision === 'challenged'
                  ? 'bg-warning/10 text-warning border-warning/30'
                  : 'bg-surface-2 text-muted border-border'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>{finding.decision}</span>
            </span>
          </div>
        ) : !showNoteInput ? (
          <div className="flex flex-wrap gap-1.5">
            {finding.suggested_text && (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isDeciding}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-[11px] font-medium transition-colors"
                  title="Accept suggested correction"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  disabled={isDeciding}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface hover:bg-surface-2 text-text border border-border text-[11px] font-medium transition-colors"
                  title="Edit suggested correction"
                >
                  <Edit3 className="w-3 h-3 text-muted" />
                  <span>Edit</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={(e) => handlePromptNote(e, 'rejected')}
              disabled={isDeciding}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-error/15 text-muted hover:text-error border border-border hover:border-error/30 text-[11px] font-medium transition-colors"
              title="Reject finding"
            >
              <X className="w-3 h-3" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={(e) => handlePromptNote(e, 'deferred')}
              disabled={isDeciding}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-muted hover:text-text border border-border text-[11px] font-medium transition-colors"
              title="Defer decision to reviewer"
            >
              <Clock className="w-3 h-3" />
              <span>Defer</span>
            </button>

            <button
              type="button"
              onClick={(e) => handlePromptNote(e, 'challenged')}
              disabled={isDeciding}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-warning/15 text-muted hover:text-warning border border-border hover:border-warning/30 text-[11px] font-medium transition-colors"
              title="Challenge finding (creator objection)"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Challenge</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-[11px] font-semibold text-text">
              <span className="capitalize">Reason for {pendingAction}:</span>
              <button
                type="button"
                onClick={handleCancelNote}
                className="text-muted hover:text-text"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea
              rows={2}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Add optional rationale or explanation..."
              className="w-full p-2 text-xs rounded border border-border bg-bg text-text focus:outline-none focus:border-primary resize-none"
              autoFocus
            />
            <div className="flex gap-1.5 justify-end">
              <button
                type="button"
                onClick={handleCancelNote}
                className="px-2 py-0.5 rounded bg-surface border border-border text-muted text-[11px] hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithNote}
                disabled={isDeciding}
                className="px-2.5 py-0.5 rounded bg-primary text-bg font-semibold text-[11px] hover:bg-primary-hover"
              >
                Confirm {pendingAction}
              </button>
            </div>
          </div>
        )}

        {/* Display attached decision note if present */}
        {finding.decision_note && (
          <div className="mt-2 p-1.5 rounded bg-bg text-[10px] text-muted border border-border italic">
            Note: "{finding.decision_note}"
          </div>
        )}
      </div>
    </div>
  );
}
