import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MailCheck, Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService.js';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        setLoading(true);
        setError(null);
        const data = await collaborationService.getInvitation(token);
        setInvitation(data.invitation);
      } catch (err) {
        setError(err.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadInvite();
    }
  }, [token]);

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError(null);
      const res = await collaborationService.acceptInvitation(token);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/app/w/${res.membership.workspaceId}`, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg text-text">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-surface text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-primary mx-auto mb-5 shadow-glow-primary">
          <MailCheck className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-text">Workspace Invitation</h1>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Validating invitation token...</span>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              to="/app"
              className="inline-block px-4 py-2 rounded-lg bg-surface-2 border border-border text-xs text-text hover:bg-surface transition-colors"
            >
              Return to Workspaces
            </Link>
          </div>
        ) : success ? (
          <div className="py-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-text">Invitation Accepted!</h3>
            <p className="text-xs text-muted">Redirecting you to the workspace...</p>
          </div>
        ) : invitation ? (
          <div className="mt-4 space-y-5">
            <p className="text-xs text-muted leading-relaxed">
              You have been invited to collaborate on brand governance in:
            </p>

            <div className="p-4 rounded-xl border border-border bg-surface-2 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Workspace:</span>
                <span className="text-xs font-bold text-text font-mono">
                  {invitation.workspace_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Assigned Role:</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-semibold capitalize">
                  {invitation.role}
                </span>
              </div>
              {invitation.inviter_name && (
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Invited by:</span>
                  <span>{invitation.inviter_name}</span>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-bg font-semibold text-sm transition-colors shadow-glow-primary disabled:opacity-50"
              >
                {accepting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Accept & Join as {user.displayName || user.email}</span>
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to={`/login?invite=${token}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-bg font-semibold text-xs transition-colors shadow-glow-primary"
                >
                  <span>Sign In to Accept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/register?invite=${token}`}
                  className="w-full inline-block py-2 px-4 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs transition-colors"
                >
                  Create New Account
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
