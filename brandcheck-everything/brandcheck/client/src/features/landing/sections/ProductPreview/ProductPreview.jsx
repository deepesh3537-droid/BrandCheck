import React, { useState, useRef } from 'react';
import { useScrollTimeline } from '../../animation/useScrollTimeline.js';
import { ScrollTrigger } from '../../animation/gsap.js';
import { PREVIEW_STAGES } from './preview.script.js';
import PreviewShell from './PreviewShell.jsx';
import { SAMPLE_DISCLAIMER } from '../../data/previewSample.js';

export default function ProductPreview() {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useScrollTimeline(() => {
    // Only pin on desktop viewports and when reduced-motion is not requested
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const totalSteps = PREVIEW_STAGES.length;

    ScrollTrigger.create({
      trigger: triggerRef.current,
      start: 'top top+=80',
      end: '+=1200',
      pin: true,
      anticipatePin: 1,
      scrub: 0.5,
      onUpdate: (self) => {
        const step = Math.min(
          totalSteps - 1,
          Math.floor(self.progress * totalSteps)
        );
        setCurrentStep(step);
      },
    });
  }, triggerRef);

  return (
    <section
      id="product-preview"
      ref={triggerRef}
      className="relative py-20 px-4 sm:px-6 bg-bg flex flex-col items-center justify-center min-h-[90vh]"
    >
      <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-primary mb-3">
            <span>Interactive Workspace Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-3">
            See the review loop in action.
          </h2>
          <p className="text-sm sm:text-base text-muted">
            From unreviewed draft to grounded evidence and human creator sign-off.
          </p>
        </div>

        {/* Step Progress Pills (Interactive / Keyboard accessible) */}
        <div
          role="tablist"
          aria-label="Storyline Stages"
          className="flex flex-wrap items-center justify-center gap-2 mb-6 select-none"
        >
          {PREVIEW_STAGES.map((stage, idx) => (
            <button
              key={stage.step}
              role="tab"
              aria-selected={currentStep === idx}
              onClick={() => setCurrentStep(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                currentStep === idx
                  ? 'border-primary bg-primary/10 text-primary shadow-glow-primary'
                  : 'border-border bg-surface/60 text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === idx ? 'bg-primary text-bg font-bold' : 'bg-surface-2 text-muted'
                }`}
              >
                {idx + 1}
              </span>
              <span>{stage.title.split('. ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Current Stage Caption Banner */}
        <div className="mb-6 px-4 py-2 rounded-lg bg-surface-2/60 border border-border text-xs text-muted max-w-xl text-center">
          <span className="text-primary font-semibold font-mono mr-1.5">
            [Step {currentStep + 1} of 3]
          </span>
          <span>{PREVIEW_STAGES[currentStep].caption}</span>
        </div>

        {/* 3-Panel Preview Shell */}
        <PreviewShell currentStep={currentStep} onStepSelect={setCurrentStep} />

        {/* Accessibility & Integrity Footer Disclaimer (ADR-032) */}
        <div className="mt-4 text-center">
          <p className="text-[11px] font-mono text-muted/60">
            * {SAMPLE_DISCLAIMER}. All diffs, guidelines, and actions represent real system behavior.
          </p>
        </div>
      </div>
    </section>
  );
}
