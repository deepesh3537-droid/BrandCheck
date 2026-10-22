import React, { useState, useEffect } from 'react';
import { X, History, Clock, User, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService.js';

export default function AuditEventsModal({ reviewId, isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      if (!reviewId) return;
      try {
        setLoading(true);
        setError(null);
        const list = await collaborationService.getEvents(reviewId);
        setEvents(list || []);
      } catch (err) {
        setError(err.message || 'Failed to load audit events');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadEvents();
    }
  }, [reviewId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">
              Append-Only Audit Trail (ADR-013)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Loading audit trail...</span>
            </div>
          ) : error ? (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              No audit events recorded for this review yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => {
                const payload = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload;
                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-border bg-surface-2/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-primary capitalize">
                        {ev.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ev.created_at).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted">
                      <User className="w-3 h-3 text-text" />
                      <span>{ev.actor_name || ev.actor_email || 'System'}</span>
                    </div>

                    {payload && (
                      <div className="mt-1 p-2 rounded bg-bg border border-border text-[11px] font-mono text-muted/90">
                        {payload.decision && (
                          <div>
                            Decision: <strong className="text-text">{payload.decision}</strong>
                            {payload.decisionText && <span> (text: "{payload.decisionText}")</span>}
                          </div>
                        )}
                        {payload.newStatus && (
                          <div>
                            Status: <strong className="text-text">{payload.previousStatus}</strong> → <strong className="text-success">{payload.newStatus}</strong>
                            {payload.note && <div className="italic text-muted mt-0.5">Note: "{payload.note}"</div>}
                          </div>
                        )}
                        {payload.bodyPreview && (
                          <div>Comment: "{payload.bodyPreview}"</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-border bg-surface text-text text-xs hover:bg-surface-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
