import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_DRAFT } from '../../data/previewSample.js';

export default function PreviewContent({ currentStep = 0 }) {
  // At step 0: unhighlighted raw text
  // At step 1: highlights active on 'revolutionary' and '48 hours'
  // At step 2: 'revolutionary' replaced by 'innovative' (accepted diff)

  return (
    <div className="flex-1 flex flex-col bg-surface/50 border-r border-border min-h-[360px] overflow-hidden">
      {/* Tab Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-border bg-surface text-xs font-mono text-muted">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="text-text font-medium">{SAMPLE_DRAFT.title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          {currentStep === 2 ? (
            <span className="text-success flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              1 Revision Applied
            </span>
          ) : currentStep === 1 ? (
            <span className="text-warning font-semibold">2 Flagged Issues</span>
          ) : (
            <span className="text-muted">Draft Ready</span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed text-text select-none">
        <p className="mb-4 text-muted/60 text-[11px]">--- Content Segment #1 [Markdown] ---</p>
        <p>
          Experience sound redefined. The all-new Novacore Aura headphones deliver{' '}
          {currentStep === 0 && <span>revolutionary</span>}
          {currentStep === 1 && (
            <span className="highlight-warning text-warning font-semibold px-1 py-0.5 rounded transition-all animate-pulse">
              revolutionary
            </span>
          )}
          {currentStep === 2 && (
            <span className="bg-success/20 text-success border border-success/40 font-semibold px-1.5 py-0.5 rounded transition-all">
              innovative
            </span>
          )}{' '}
          noise isolation engineered with studio-grade precision and an astonishing{' '}
          {currentStep === 0 && <span>48 hours</span>}
          {currentStep >= 1 && (
            <span className="highlight-error text-error font-semibold px-1 py-0.5 rounded">
              48 hours
            </span>
          )}{' '}
          of uninterrupted wireless playback.
        </p>

        {currentStep === 2 && (
          <div className="mt-6 p-3 rounded border border-success/30 bg-success/10 text-xs text-success flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Decision recorded: Replaced <strong>"revolutionary"</strong> with approved term <strong>"innovative"</strong> grounded in Brand Vocabulary Guide.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
