import React, { useState } from 'react';
import { X, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { sourceService } from '../../services/sourceService.js';

export default function CreateSourceModal({ workspaceId, isOpen, onClose, onSourceCreated }) {
  const [type, setType] = useState('term');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prohibited, setProhibited] = useState('');
  const [preferred, setPreferred] = useState('');
  const [severity, setSeverity] = useState('error');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Please provide a title and rule description.');
      return;
    }

    const structured = {};
    if (type === 'term') {
      if (prohibited.trim()) structured.prohibited = prohibited.trim();
      if (preferred.trim()) structured.preferred = preferred.trim();
      structured.severity = severity;
    }

    try {
      setSubmitting(true);
      const created = await sourceService.createSource(workspaceId, {
        type,
        title: title.trim(),
        body: body.trim(),
        structured,
      });
      onSourceCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create brand source');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Add Brand Source Rule</h3>
            <p className="text-xs text-muted">Create a verifiable rule, approved claim, fact, or tone directive</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1.5" htmlFor="source-type">
              Rule Category
            </label>
            <select
              id="source-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="term">Terminology Rule (Prohibited / Preferred)</option>
              <option value="fact">Approved Fact (Truth anchor / Conflict prevention)</option>
              <option value="claim">Approved Claim (Substantiated promotional statement)</option>
              <option value="tone">Tone Guide (Brand voice descriptors & persona)</option>
              <option value="guideline">General Guideline</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1.5" htmlFor="source-title">
              Title
            </label>
            <input
              id="source-title"
              type="text"
              required
              placeholder="e.g. Prohibited Buzzword: 'revolutionary'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted/60"
            />
          </div>

          {type === 'term' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-surface-2/60">
              <div>
                <label className="block text-[11px] font-medium text-error mb-1" htmlFor="prohibited-term">
                  Prohibited Term
                </label>
                <input
                  id="prohibited-term"
                  type="text"
                  placeholder="e.g. revolutionary"
                  value={prohibited}
                  onChange={(e) => setProhibited(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text text-xs focus:outline-none focus:ring-1 focus:ring-error"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-primary mb-1" htmlFor="preferred-term">
                  Preferred Alternative
                </label>
                <input
                  id="preferred-term"
                  type="text"
                  placeholder="e.g. scientifically formulated"
                  value={preferred}
                  onChange={(e) => setPreferred(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-text mb-1" htmlFor="severity-term">
                  Severity on Violation
                </label>
                <select
                  id="severity-term"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="error">Error (Must be resolved before publishing)</option>
                  <option value="warning">Warning (Requires review approval)</option>
                  <option value="suggestion">Suggestion (Optional style enhancement)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1.5" htmlFor="source-body">
              Rule Description / Source Text
            </label>
            <textarea
              id="source-body"
              rows={4}
              required
              placeholder="Full description of the guideline, supporting rationale, or official approved wording..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-text text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted/60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-bg text-xs font-semibold shadow-glow-primary transition-colors flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Brand Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
