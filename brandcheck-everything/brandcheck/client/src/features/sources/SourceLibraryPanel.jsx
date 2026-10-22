import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  FileText,
  Bookmark,
  PanelLeftClose
} from 'lucide-react';
import { sourceService } from '../../services/sourceService.js';
import CreateSourceModal from './CreateSourceModal.jsx';

const TYPE_CONFIG = {
  term: { label: 'Term', color: 'text-error border-error/30 bg-error/10' },
  fact: { label: 'Fact', color: 'text-primary border-primary/30 bg-primary/10' },
  claim: { label: 'Claim', color: 'text-success border-success/30 bg-success/10' },
  tone: { label: 'Tone', color: 'text-suggestion border-suggestion/30 bg-suggestion/10' },
  guideline: { label: 'Guide', color: 'text-text border-border bg-surface-2' },
};

export default function SourceLibraryPanel({ workspaceId, onCollapse }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await sourceService.getSources(workspaceId);
      setSources(list);
    } catch (err) {
      setError(err.message || 'Failed to load brand sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchSources();
    }
  }, [workspaceId]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await sourceService.seedSources(workspaceId);
      await fetchSources();
    } catch (err) {
      setError(err.message || 'Failed to seed default guidelines');
    } finally {
      setSeeding(false);
    }
  };

  const filteredSources = sources.filter((s) => {
    const matchesTab = activeTab === 'all' || s.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.structured?.prohibited?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <aside className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-text uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Brand Sources</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
            {sources.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            title="Add Brand Rule"
            aria-label="Add Brand Rule"
            className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-primary hover:text-primary-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Brand Sources Panel"
              aria-label="Collapse Brand Sources Panel"
              className="hidden lg:flex p-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text transition-colors"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2.5 border-b border-border space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search rules, facts, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-surface-2 text-text text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted/60"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-medium text-muted scrollbar-none">
          {['all', 'term', 'fact', 'claim', 'tone'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-bg font-semibold shadow-glow-primary'
                  : 'hover:bg-surface-2 hover:text-text'
              }`}
            >
              {tab === 'all' ? 'All' : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Sources List / Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
        {/* Loading State */}
        {loading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border bg-surface-2/50 animate-pulse space-y-2"
              >
                <div className="h-3 w-1/3 rounded bg-surface-2" />
                <div className="h-4 w-3/4 rounded bg-surface-2" />
                <div className="h-3 w-full rounded bg-surface-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg border border-error/30 bg-error/10 text-error space-y-2"
          >
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load sources</span>
            </div>
            <p className="text-[11px] text-error/90">{error}</p>
            <button
              onClick={fetchSources}
              className="text-[11px] font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sources.length === 0 && (
          <div className="p-6 text-center rounded-xl border border-dashed border-border bg-surface-2/30 my-4 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-primary mx-auto">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-text text-xs">No brand sources yet</p>
              <p className="text-[11px] text-muted mt-1">
                Add rules or load the Verdant Botanicals demo dataset.
              </p>
            </div>
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-bg font-semibold text-xs transition-colors shadow-glow-primary flex items-center justify-center gap-1.5"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Load Seed Rules</span>
            </button>
          </div>
        )}

        {/* List of Source Cards */}
        {!loading && !error && filteredSources.length > 0 && (
          filteredSources.map((source) => {
            const cfg = TYPE_CONFIG[source.type] || TYPE_CONFIG.guideline;
            return (
              <div
                key={source.id}
                className="p-3 rounded-lg border border-border bg-surface-2 hover:border-border-focus transition-all group select-text"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-[10px] font-mono text-muted">v{source.version || 1}</span>
                </div>

                <h4 className="font-semibold text-text text-xs mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {source.title}
                </h4>

                <p className="text-muted text-[11px] leading-relaxed line-clamp-2 mb-2">
                  {source.body}
                </p>

                {/* Structured Rule Badges */}
                {source.type === 'term' && source.structured?.prohibited && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-border/50 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-error bg-error/10 px-1.5 py-0.5 rounded border border-error/20">
                      <XCircle className="w-3 h-3" />
                      <del>{source.structured.prohibited}</del>
                    </span>
                    {source.structured?.preferred && (
                      <span className="flex items-center gap-1 text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{source.structured.preferred}</span>
                      </span>
                    )}
                  </div>
                )}

                {source.type === 'fact' && source.structured?.correct_value && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-[10px] font-mono text-primary flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    <span>Fact: {source.structured.correct_value}</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Filter Zero Results */}
        {!loading && !error && sources.length > 0 && filteredSources.length === 0 && (
          <div className="p-6 text-center text-xs text-muted">
            No rules match current filter or search query.
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateSourceModal
        workspaceId={workspaceId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSourceCreated={(newSource) => setSources((prev) => [newSource, ...prev])}
      />
    </aside>
  );
}
