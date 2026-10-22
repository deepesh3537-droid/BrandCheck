import React, { useState } from 'react';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider.jsx';
import InviteMemberModal from '../../features/collaboration/InviteMemberModal.jsx';

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg text-text overflow-hidden font-sans">
      {/* Top bar (~48px) per DESIGN.md */}
      <header className="h-12 border-b border-border bg-surface flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-tight text-text">BrandCheck</span>
          </Link>
          <span className="text-border">/</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-surface-2 text-xs font-mono text-muted">
            <span>workspace:</span>
            <span className="text-text font-medium">{workspaceId || 'default'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-2 border border-border">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-text">Rules Engine: Ready</span>
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
            title="Invite collaborators to this workspace"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite Member</span>
          </button>

          {user && (
            <span className="hidden md:inline font-mono text-[11px] text-text px-2 py-0.5 rounded bg-surface-2 border border-border">
              {user.displayName || user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-surface-2 text-muted hover:text-text transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main 3-panel container / child route outlet */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>

      <InviteMemberModal
        workspaceId={workspaceId}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}

