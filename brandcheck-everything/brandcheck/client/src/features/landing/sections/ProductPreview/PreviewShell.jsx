import React from 'react';
import { ShieldCheck, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { SAMPLE_SOURCES, SAMPLE_DISCLAIMER } from '../../data/previewSample.js';
import PreviewContent from './PreviewContent.jsx';
import PreviewReport from './PreviewReport.jsx';

export default function PreviewShell({ currentStep = 0, onStepSelect }) {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-border/80 bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all text-text">
      {/* Fake Top Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-border bg-bg/90 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-text">Novacore Audio</span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
              Sample
            </span>
          </div>
        </div>

        {/* Disclaimer Tag per ADR-032 */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>{SAMPLE_DISCLAIMER}</span>
        </div>
      </div>

      {/* 3-Panel Review Workspace */}
      <div className="flex flex-col lg:flex-row min-h-[380px]">
        {/* Left Panel: Brand Sources */}
        <div className="w-full lg:w-[240px] flex flex-col bg-surface/30 border-b lg:border-b-0 lg:border-r border-border select-none">
          <div className="h-9 px-4 flex items-center justify-between border-b border-border bg-surface text-xs font-mono text-muted">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Brand Sources</span>
            </div>
            <span className="text-[11px]">{SAMPLE_SOURCES.length}</span>
          </div>

          <div className="p-3 flex flex-col gap-2">
            {SAMPLE_SOURCES.map((src) => (
              <div
                key={src.id}
                className="p-2.5 rounded-lg border border-border/60 bg-surface/60 hover:bg-surface-2/60 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text truncate max-w-[150px]">
                    {src.title}
                  </span>
                  <CheckCircle className="w-3 h-3 text-success shrink-0" />
                </div>
                <p className="text-[11px] text-muted line-clamp-2 leading-snug">
                  {src.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Content Editor */}
        <PreviewContent currentStep={currentStep} />

        {/* Right Panel: Review Report & Decisions */}
        <PreviewReport currentStep={currentStep} onStepSelect={onStepSelect} />
      </div>
    </div>
  );
}
