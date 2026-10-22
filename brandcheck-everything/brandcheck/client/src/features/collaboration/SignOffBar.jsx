import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  MessageSquarePlus,
  X
} from 'lucide-react';
import { collaborationService } from '../../services/collaborationService.js';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

export default function SignOffBar({
  review,
  content,
  onStatusUpdated,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState(null);

  if (!review || !content) return null;

  // Check if current user is the content creator (ADR-020)
  const isCreator = user && content.created_by === user.id;
  const currentStatus = review.status || 'ready';

  const handleOpenPrompt = (status) => {
    setError(null);
    setTargetStatus(status);
    setNoteText('');
    setShowNoteModal(true);
  };

  const handleConfirmStatus = async () => {
    if (!targetStatus) return;
    try {
      setLoading(true);
      setError(null);
      const res = await collaborationService.updateStatus(review.id, {
        status: targetStatus,
        note: noteText.trim() || undefined,
      });

      onStatusUpdated(res.review);
      setShowNoteModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update review status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border-t border-border bg-surface-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted font-medium">Governance Status:</span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold border ${
            currentStatus === 'approved'
              ? 'bg-success/15 text-success border-success/30'
              : currentStatus === 'changes_requested'
              ? 'bg-warning/15 text-warning border-warning/30'
              : 'bg-surface text-muted border-border'
          }`}
        >
          {currentStatus === 'approved' ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : currentStatus === 'changes_requested' ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Reviewer Sign-off Action Buttons */}
      <div className="flex items-center gap-2">
        {currentStatus !== 'approved' && (
          <>
            <button
              onClick={() => handleOpenPrompt('changes_requested')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-warning/30 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-semibold transition-colors disabled:opacity-50"
              title="Request changes from content author"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            {isCreator ? (
              <div
                className="relative group cursor-not-allowed"
                title="ADR-020: Content creators cannot approve their own work"
              >
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-muted text-xs font-semibold opacity-50 cursor-not-allowed"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-muted" />
                  <span>Approve (Reviewer Required)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenPrompt('approved')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success text-bg font-semibold text-xs hover:bg-success/90 shadow-glow-primary transition-colors disabled:opacity-50"
                title="Approve content for publication sign-off"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve for Publication</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Note / Feedback Confirmation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text capitalize">
                Confirm {targetStatus.replace('_', ' ')}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1 rounded text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                {targetStatus === 'changes_requested'
                  ? 'Required Changes / Feedback Note:'
                  : 'Approval Note (Optional):'}
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  targetStatus === 'changes_requested'
                    ? 'Explain which claims or terminology need revision...'
                    : 'Add any sign-off remarks...'
                }
                className="w-full p-2.5 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder-muted/60 focus:outline-none focus:border-primary resize-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 text-text text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatus}
                disabled={loading}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
                  targetStatus === 'approved'
                    ? 'bg-success text-bg hover:bg-success/90'
                    : 'bg-warning text-bg hover:bg-warning/90'
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Confirm {targetStatus === 'approved' ? 'Approval' : 'Change Request'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
