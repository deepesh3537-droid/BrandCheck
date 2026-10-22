import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowRight, 
  FolderKanban, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  X,
  BookOpen,
  LogOut
} from 'lucide-react';
import { workspaceService } from '../../services/workspaceService.js';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

export default function WorkspaceListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Workspace Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newWorkspaceName.trim()) {
      setCreateError('Workspace name cannot be empty');
      return;
    }

    try {
      setCreating(true);
      const created = await workspaceService.createWorkspace({ name: newWorkspaceName.trim() });
      setWorkspaces((prev) => [created, ...prev]);
      setModalOpen(false);
      setNewWorkspaceName('');
      navigate(`/app/w/${created.id}`);
    } catch (err) {
      setCreateError(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-primary shadow-glow-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text">BrandCheck</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {user && (
            <span className="font-mono text-muted bg-surface-2 px-2.5 py-1 rounded border border-border">
              {user.displayName || user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-2 text-muted hover:text-text transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Your Workspaces</h1>
            <p className="text-sm text-muted mt-1">
              Select or create a brand workspace to govern content against verified sources
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-bg font-semibold text-xs hover:bg-primary-hover transition-colors shadow-glow-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl border border-error/30 bg-error/10 text-error text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadWorkspaces}
              className="text-xs underline hover:no-underline font-medium text-error"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border bg-surface animate-pulse h-44 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2" />
                  <div className="h-4 w-3/4 rounded bg-surface-2" />
                  <div className="h-3 w-1/2 rounded bg-surface-2" />
                </div>
                <div className="h-4 w-1/3 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && workspaces.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface/50 max-w-md mx-auto my-10">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mx-auto mb-4">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-text">No workspaces found</h2>
            <p className="text-xs text-muted mt-1.5 mb-6">
              Create your first brand workspace to store guidelines, terminology rules, and run reviews.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-bg font-semibold text-xs hover:bg-primary-hover transition-colors shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
          </div>
        )}

        {/* Workspace List Grid */}
        {!loading && !error && workspaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                to={`/app/w/${ws.id}`}
                className="p-5 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-border-focus transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-primary group-hover:shadow-glow-primary transition-shadow">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded font-mono border border-border bg-surface text-primary uppercase tracking-wide">
                      {ws.role || 'member'}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
                    {ws.name}
                  </h2>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{ws.source_count || 0} active sources</span>
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                  <span className="font-mono text-[11px]">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      {modalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setModalOpen(false);
                setCreateError('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Create Brand Workspace</h3>
                <p className="text-xs text-muted">A dedicated space for guidelines and review assets</p>
              </div>
            </div>

            {createError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text mb-1.5" htmlFor="ws-name">
                  Workspace Name
                </label>
                <input
                  id="ws-name"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Verdant Botanicals"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setCreateError('');
                  }}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-bg text-xs font-semibold shadow-glow-primary transition-colors flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
