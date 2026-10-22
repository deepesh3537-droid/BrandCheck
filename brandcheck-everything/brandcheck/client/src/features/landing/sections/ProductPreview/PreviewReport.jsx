import React from 'react';
import { AlertTriangle, AlertCircle, Check, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_FINDINGS } from '../../data/previewSample.js';

export default function PreviewReport({ currentStep = 0, onStepSelect }) {
  const finding1 = SAMPLE_FINDINGS[0];
  const finding2 = SAMPLE_FINDINGS[1];

  return (
    <div className="w-full lg:w-[360px] flex flex-col bg-surface/80 border-t lg:border-t-0 border-border min-h-[360px] overflow-hidden">
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-border bg-surface text-xs font-mono text-muted">
        <div className="flex items-center gap-1.5 font-semibold text-text">
          <span>Review Findings</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-2 border border-border text-[11px] text-primary">
            {currentStep >= 1 ? '2' : '0'}
          </span>
        </div>
        <span className="text-[10px] text-muted uppercase font-mono">Real-time</span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        {currentStep === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted">
            <div className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-primary/60 animate-pulse" />
            </div>
            <p className="text-xs font-medium text-text mb-1">Review Ready</p>
            <p className="text-[11px] text-muted">Awaiting scan trigger for this draft segment.</p>
          </div>
        ) : (
          <>
            {/* Finding Card 1: Brand Vocabulary */}
            <div
              className={`p-3.5 rounded-lg border transition-all ${
                currentStep === 2
                  ? 'border-success/40 bg-surface/90'
                  : 'border-warning/40 bg-surface/90 shadow-sm'
              }`}
            >
              {/* Severity & Category */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{finding1.category}</span>
                </div>
                {currentStep === 2 ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-success/20 text-success border border-success/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ACCEPTED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                    PENDING
                  </span>
                )}
              </div>

              {/* Monospace Flagged term */}
              <div className="text-xs font-mono mb-2">
                <span className="text-muted">Flagged: </span>
                <span className="text-warning font-semibold bg-warning/10 px-1 py-0.5 rounded">
                  "{finding1.flaggedText}"
                </span>
              </div>

              {/* Source Reference Chip */}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border text-[11px] text-primary mb-2.5 font-mono">
                <BookOpen className="w-3 h-3" />
                <span>{finding1.sourceTitle}</span>
              </div>

              {/* Diff Preview */}
              <div className="p-2 rounded bg-bg border border-border text-[11px] font-mono mb-3">
                <div className="text-error/80 flex items-center gap-1">
                  <span>-</span>
                  <del>{finding1.diff.original}</del>
                </div>
                <div className="text-success flex items-center gap-1 font-semibold">
                  <span>+</span>
                  <span>{finding1.diff.suggested}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {currentStep === 1 && (
                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <button
                    onClick={() => onStepSelect?.(2)}
                    className="flex-1 py-1.5 px-2 rounded bg-primary text-bg font-semibold text-xs hover:bg-primary-hover flex items-center justify-center gap-1 shadow-glow-primary transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Fix</span>
                  </button>
                  <button
                    disabled
                    className="py-1.5 px-3 rounded border border-border text-muted text-xs hover:bg-surface-2 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Finding Card 2: Factual Discrepancy */}
            <div className="p-3.5 rounded-lg border border-error/40 bg-surface/90 shadow-sm opacity-90">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-error">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{finding2.category}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-error/10 text-error border border-error/20">
                  FACT CONFLICT
                </span>
              </div>

              <p className="text-xs text-muted mb-2">{finding2.explanation}</p>

              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border text-[11px] text-primary font-mono">
                <BookOpen className="w-3 h-3" />
                <span>{finding2.sourceTitle}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
