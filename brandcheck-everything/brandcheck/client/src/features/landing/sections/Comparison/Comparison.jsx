import React from 'react';
import { Check, X, Minus, ShieldCheck, Sparkles } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    feature: 'Verified Brand Source Grounding',
    generic: 'None (Generic dictionary only)',
    manual: 'Subjective (Reviewer memory)',
    brandcheck: 'Strictly tied to workspace source library',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: 'partial',
  },
  {
    feature: 'Draft Immutability Protection',
    generic: 'Silently overwrites text in place',
    manual: 'Cluttered tracked changes in Word',
    brandcheck: 'Original text immutable; non-destructive diffs',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: 'partial',
  },
  {
    feature: 'Fact & Claim Consistency Checks',
    generic: 'No fact checking capability',
    manual: 'Manual cross-referencing against specs',
    brandcheck: 'Deterministic fact rules + Ollama diff grounding',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: 'partial',
  },
  {
    feature: 'Privacy & Operating Budget',
    generic: 'Recurring SaaS per-seat token billing',
    manual: 'High personnel labor cost',
    brandcheck: '100% Local-first (₹0 budget, zero cloud leaks)',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: 'partial',
  },
  {
    feature: 'Governance Audit Trail & Approvals',
    generic: 'None (Personal tool)',
    manual: 'Lost in email or Slack threads',
    brandcheck: 'Multi-role review sign-off and decision history',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: false,
  },
  {
    feature: 'WCAG Content Accessibility Checks',
    generic: 'Basic spell check only',
    manual: 'Frequently overlooked',
    brandcheck: 'Automated vague link, alt text, and acronym checks',
    brandcheckStatus: true,
    genericStatus: false,
    manualStatus: 'partial',
  },
];

export default function Comparison() {
  return (
    <section className="relative py-24 px-4 sm:px-6 bg-surface/30 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-primary mb-3">
            <span>Competitive Architecture Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text mb-4">
            How BrandCheck compares.
          </h2>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Unlike generic grammar plugins or slow manual reviews, BrandCheck connects deterministic brand rules with local models for human-governed publishing.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-surface/80 backdrop-blur-md shadow-lg">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-xs font-mono">
                <th className="py-4 px-6 text-muted font-medium w-2/5">CAPABILITY</th>
                <th className="py-4 px-6 text-muted font-medium w-1/5">GENERIC LINTERS</th>
                <th className="py-4 px-6 text-muted font-medium w-1/5">MANUAL REVIEW</th>
                <th className="py-4 px-6 text-primary font-semibold w-1/5 bg-primary/5 border-l border-r border-primary/20">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>BRANDCHECK</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`hover:bg-surface-2/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-surface/40'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-text">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-muted flex items-center gap-2">
                    <X className="w-4 h-4 text-error shrink-0" />
                    <span className="text-xs">{row.generic}</span>
                  </td>
                  <td className="py-4 px-6 text-muted">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-xs">{row.manual}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 bg-primary/5 border-l border-r border-primary/20 font-medium text-text">
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="w-4 h-4 text-primary shrink-0 font-bold" />
                      <span className="text-xs text-text">{row.brandcheck}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
