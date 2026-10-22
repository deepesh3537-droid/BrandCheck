import React, { useState } from 'react';
import { X, MailPlus, Copy, Check, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService.js';

export default function InviteMemberModal({ workspaceId, isOpen, onClose }) {
  const [role, setRole] = useState('reviewer');
  const [expiresInHours, setExpiresInHours] = useState('72');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setCopied(false);

    try {
      const res = await collaborationService.createInvitation(workspaceId, {
        role,
        expiresInHours: Number(expiresInHours),
      });

      const fullUrl = `${window.location.origin}/invite/${res.invitation.token}`;
      setInviteUrl(fullUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MailPlus className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">Invite Team Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!inviteUrl ? (
          <form onSubmit={handleGenerate} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Workspace Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="reviewer">Reviewer (Can sign off, approve, or request changes)</option>
                <option value="creator">Creator (Can submit content drafts & respond to diffs)</option>
                <option value="owner">Owner (Full administrative rights)</option>
              </select>
              <p className="text-[11px] text-muted mt-1">
                {role === 'reviewer'
                  ? 'Reviewers provide independent brand governance sign-off.'
                  : 'Creators submit marketing & product copy.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Link Expiration:
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="24">24 Hours</option>
                <option value="72">3 Days (Default)</option>
                <option value="168">7 Days</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-bg font-semibold text-xs shadow-glow-primary transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MailPlus className="w-3.5 h-3.5" />}
                <span>Generate Secure Link</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Invitation link generated successfully!</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted">
                Share this link with your teammate:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-bg border border-border text-text select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-bg font-semibold text-xs hover:bg-primary-hover transition-colors shadow-glow-primary shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-surface-2 hover:bg-surface text-text text-xs border border-border"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
