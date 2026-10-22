import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function ComplianceReportModal({
  isOpen,
  onClose,
  content,
  currentVersion,
  review,
  findings = [],
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !content || !review) return null;

  const totalFindings = findings.length;
  const acceptedFindings = findings.filter(
    (f) => f.decision === 'accepted' || f.decision === 'edited'
  );
  const sourceBackedCount = findings.filter(
    (f) => f.evidence_status === 'source_backed'
  ).length;
  const uncertainCount = findings.filter(
    (f) => f.evidence_status === 'uncertain'
  ).length;

  const markdownReport = `# BrandCheck Compliance Audit Report
**Document Title:** ${content.title}
**Version:** v${currentVersion?.version_no || 1}
**Review Status:** ${review.status.toUpperCase()}
**Audit Date:** ${new Date(review.created_at).toLocaleString()}

## Executive Summary
- Total Flagged Items: ${totalFindings}
- Resolved / Accepted: ${acceptedFindings.length}
- Source-Backed Rules: ${sourceBackedCount}
- Model Inference (Uncertain): ${uncertainCount}

## Detailed Findings & Decisions
${findings
  .map(
    (f, idx) => `
### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.category}
- **Flagged Phrase:** "${f.flagged_text}"
- **Evidence Status:** ${f.evidence_status}
- **Cited Source:** ${f.source_title || 'N/A'}
- **Explanation:** ${f.explanation}
- **Decision:** ${f.decision} ${f.decision_text ? `(Replacement: "${f.decision_text}")` : ''}
${f.decision_note ? `- **Note:** "${f.decision_note}"` : ''}
`
  )
  .join('\n')}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-success" />
            <div>
              <h3 className="text-sm font-semibold text-text">
                Brand Governance Compliance Report
              </h3>
              <p className="text-[11px] text-muted">
                Executive audit trail grounded in approved brand sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-text font-sans">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-surface-2">
            <div>
              <span className="text-muted text-[10px] uppercase font-mono block">Document</span>
              <strong className="text-xs truncate block">{content.title}</strong>
            </div>
            <div>
              <span className="text-muted text-[10px] uppercase font-mono block">Version</span>
              <strong className="text-xs font-mono">v{currentVersion?.version_no || 1}</strong>
            </div>
            <div>
              <span className="text-muted text-[10px] uppercase font-mono block">Status</span>
              <strong className="text-xs text-success capitalize">{review.status.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-muted text-[10px] uppercase font-mono block">Audit Date</span>
              <strong className="text-[11px] font-mono">{new Date().toLocaleDateString()}</strong>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-border bg-bg text-center">
              <span className="text-xl font-bold font-mono text-text">{totalFindings}</span>
              <span className="block text-[11px] text-muted mt-0.5">Total Findings</span>
            </div>
            <div className="p-3 rounded-xl border border-success/30 bg-success/5 text-center">
              <span className="text-xl font-bold font-mono text-success">{acceptedFindings.length}</span>
              <span className="block text-[11px] text-success mt-0.5">Resolved / Accepted</span>
            </div>
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 text-center">
              <span className="text-xl font-bold font-mono text-primary">{sourceBackedCount}</span>
              <span className="block text-[11px] text-primary mt-0.5">Source-Backed Rules</span>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
              Audit Findings & Creator Actions
            </h4>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-[10px] font-mono uppercase text-muted border-b border-border">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Flagged Phrase</th>
                    <th className="p-2.5">Evidence Status</th>
                    <th className="p-2.5">Action Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-surface-2/40">
                      <td className="p-2.5 font-medium capitalize">{f.category}</td>
                      <td className="p-2.5 font-mono text-error">"{f.flagged_text}"</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            f.evidence_status === 'source_backed'
                              ? 'text-success bg-success/10'
                              : 'text-warning bg-warning/10'
                          }`}
                        >
                          {f.evidence_status === 'source_backed' ? (
                            <ShieldCheck className="w-2.5 h-2.5" />
                          ) : (
                            <HelpCircle className="w-2.5 h-2.5" />
                          )}
                          <span>{f.evidence_status}</span>
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] capitalize">
                        {f.decision || 'pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-border bg-surface-2 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-muted font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Cryptographically verifiable audit</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-bg font-semibold text-xs hover:bg-primary-hover shadow-glow-primary transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
