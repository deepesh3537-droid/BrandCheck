import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckSquare, 
  BookOpen, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  Loader2,
  AlertCircle,
  MessageSquare,
  History,
  FileCheck
} from 'lucide-react';
import SourceLibraryPanel from '../sources/SourceLibraryPanel.jsx';
import ContentEditorPanel from './ContentEditorPanel.jsx';
import ReviewReportPanel from './ReviewReportPanel.jsx';
import SubmitContentModal from '../content/SubmitContentModal.jsx';
import SignOffBar from '../collaboration/SignOffBar.jsx';
import CommentsThread from '../collaboration/CommentsThread.jsx';
import AuditEventsModal from '../collaboration/AuditEventsModal.jsx';
import ComplianceReportModal from '../collaboration/ComplianceReportModal.jsx';
import { contentService } from '../../services/contentService.js';
import { reviewService } from '../../services/reviewService.js';

export default function ReviewWorkspaceView() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  // Layout states (TASK-050)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('findings'); // 'findings' | 'comments'
  const [mobileTab, setMobileTab] = useState('content'); // 'sources' | 'content' | 'report'

  // Content & Review states (TASK-051 to TASK-054)
  const [contents, setContents] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [review, setReview] = useState(null);
  const [findings, setFindings] = useState([]);
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [previewMode, setPreviewMode] = useState('highlights');

  // Collaboration modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Loading & Error states
  const [loadingContents, setLoadingContents] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch workspace contents
  const fetchContents = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoadingContents(true);
      setError(null);
      const list = await contentService.getContents(workspaceId);
      setContents(list || []);

      if (list && list.length > 0 && !selectedContentId) {
        setSelectedContentId(list[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workspace contents');
    } finally {
      setLoadingContents(false);
    }
  }, [workspaceId, selectedContentId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 2. Fetch selected content and its latest version & review
  const loadContentDetails = useCallback(async (contentId) => {
    if (!workspaceId || !contentId) return;
    try {
      setError(null);
      const content = await contentService.getContent(workspaceId, contentId);
      setSelectedContent(content);
      const ver = content.current_version || {
        id: content.current_version_id,
        version_no: content.version_no,
        body: content.body,
        created_at: content.version_created_at,
      };
      setCurrentVersion(ver);

      // Trigger or retrieve review for this content
      setIsReviewing(true);
      try {
        const revData = await reviewService.triggerReview(contentId);
        setReview(revData.review);
        setFindings(revData.review.findings || []);
      } catch (revErr) {
        setReview(null);
        setFindings([]);
      } finally {
        setIsReviewing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load document details');
    }
  }, [workspaceId]);

  useEffect(() => {
    if (selectedContentId) {
      loadContentDetails(selectedContentId);
    }
  }, [selectedContentId, loadContentDetails]);

  // 3. Run or re-run review manually
  const handleRunReview = async () => {
    if (!selectedContent) return;
    setIsReviewing(true);
    setError(null);
    try {
      const revData = await reviewService.triggerReview(selectedContent.id);
      setReview(revData.review);
      setFindings(revData.review.findings || []);
      setSelectedFindingId(null);
    } catch (err) {
      setError(err.message || 'Failed to complete review check');
    } finally {
      setIsReviewing(false);
    }
  };

  // 4. Handle human decision on finding (TASK-053)
  const handleDecision = async (findingId, payload) => {
    setIsDeciding(true);
    try {
      const res = await reviewService.recordDecision(findingId, payload);
      const updated = res.finding;

      // Update finding in local state
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, ...updated } : f))
      );
    } catch (err) {
      alert(`Decision error: ${err.message}`);
    } finally {
      setIsDeciding(false);
    }
  };

  // 5. Commit accepted changes as a new content version (ADR-013 & TASK-053)
  const handleCommitNewVersion = async () => {
    if (!selectedContent || !currentVersion) return;

    // Build resolved text from accepted & edited findings
    const resolvedFindings = findings
      .filter((f) => (f.decision === 'accepted' || f.decision === 'edited') && (f.decision_text || f.suggested_text))
      .sort((a, b) => b.span_start - a.span_start);

    let updatedText = currentVersion.body;
    for (const f of resolvedFindings) {
      const replacement = f.decision_text || f.suggested_text;
      if (f.span_start >= 0 && f.span_end <= updatedText.length) {
        updatedText =
          updatedText.slice(0, f.span_start) +
          replacement +
          updatedText.slice(f.span_end);
      }
    }

    try {
      setIsCreatingVersion(true);
      const newVer = await contentService.createVersion(workspaceId, selectedContent.id, {
        body: updatedText,
      });

      setCurrentVersion(newVer);
      setPreviewMode('highlights');

      // Auto-trigger fresh review on the new version to show compliance resolution
      await handleRunReview();
    } catch (err) {
      alert(`Failed to commit new version: ${err.message}`);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleContentSubmitted = (newContent) => {
    fetchContents();
    if (newContent?.id) {
      setSelectedContentId(newContent.id);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-bg text-text">
      {/* Secondary Actions Bar (Audit Trail & Report Export) */}
      <div className="h-10 border-b border-border bg-surface-2/40 px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 text-muted font-medium">
          <span className="text-text font-semibold">{selectedContent?.title || 'Brand Governance'}</span>
          {review && (
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-muted">
              <span>(status:</span>
              <span className="text-primary font-semibold">{review.status}</span>
              <span>)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {review && (
            <>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs transition-colors"
                title="View immutable review event history (ADR-013)"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Audit Trail</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs transition-colors"
                title="Generate compliance report (TASK-065)"
              >
                <FileCheck className="w-3.5 h-3.5 text-success" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Tab Switcher (< 1024px) */}
      <div className="lg:hidden flex items-center border-b border-border bg-surface shrink-0 text-xs">
        <button
          onClick={() => setMobileTab('sources')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
            mobileTab === 'sources'
              ? 'border-primary text-primary bg-surface-2'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Brand Sources</span>
        </button>
        <button
          onClick={() => setMobileTab('content')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
            mobileTab === 'content'
              ? 'border-primary text-primary bg-surface-2'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Content Draft</span>
        </button>
        <button
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
            mobileTab === 'report'
              ? 'border-primary text-primary bg-surface-2'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Findings ({findings.length})</span>
        </button>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Brand Sources with Collapse Toggle */}
        <div
          className={`h-full transition-all duration-200 relative ${
            mobileTab === 'sources' ? 'flex flex-1' : 'hidden lg:flex'
          } ${leftCollapsed ? 'lg:w-12' : 'lg:w-72 xl:w-80'}`}
        >
          {leftCollapsed ? (
            <div className="w-12 h-full bg-surface border-r border-border flex flex-col items-center py-3 gap-3">
              <button
                onClick={() => setLeftCollapsed(false)}
                className="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-text transition-colors"
                title="Expand Brand Sources Panel"
              >
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              </button>
              <div className="writing-vertical-lr text-[11px] font-mono uppercase text-muted tracking-widest mt-4">
                Brand Sources
              </div>
            </div>
          ) : (
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <SourceLibraryPanel 
                workspaceId={workspaceId} 
                onCollapse={() => setLeftCollapsed(true)} 
              />
            </div>
          )}
        </div>

        {/* Centre Panel: Content Editor & Sign-off Bar */}
        <div
          className={`flex-1 h-full min-w-0 flex flex-col ${
            mobileTab === 'content' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <ContentEditorPanel
              contents={contents}
              selectedContent={selectedContent}
              currentVersion={currentVersion}
              findings={findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={(id) => {
                setSelectedFindingId(id);
                setRightPanelTab('findings');
                if (window.innerWidth < 1024) setMobileTab('report');
              }}
              onSelectContent={(id) => setSelectedContentId(id)}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              onRunReview={handleRunReview}
              isReviewing={isReviewing}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
            />
          </div>

          {/* Reviewer Sign-Off Bar (TASK-063 & ADR-020) */}
          <SignOffBar
            review={review}
            content={selectedContent}
            onStatusUpdated={(updatedRev) => setReview(updatedRev)}
          />
        </div>

        {/* Right Panel: Audit Report & Discussion with Tabs */}
        <div
          className={`h-full transition-all duration-200 relative ${
            mobileTab === 'report' ? 'flex flex-1' : 'hidden lg:flex'
          } ${rightCollapsed ? 'lg:w-12' : 'lg:w-96 xl:w-[420px]'}`}
        >
          {rightCollapsed ? (
            <div className="w-12 h-full bg-surface border-l border-border flex flex-col items-center py-3 gap-3">
              <button
                onClick={() => setRightCollapsed(false)}
                className="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-text transition-colors"
                title="Expand Audit Report Panel"
              >
                <PanelRightOpen className="w-4 h-4 text-warning" />
              </button>
              <div className="writing-vertical-lr text-[11px] font-mono uppercase text-muted tracking-widest mt-4">
                Findings ({findings.length})
              </div>
            </div>
          ) : (
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              {/* Tab Switcher: Findings vs Comments (TASK-061 & TASK-062) */}
              <div className="border-b border-border bg-surface-2 flex items-center shrink-0 pr-2">
                <button
                  onClick={() => setRightPanelTab('findings')}
                  className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                    rightPanelTab === 'findings'
                      ? 'border-primary text-primary bg-surface'
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Findings ({findings.length})</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('comments')}
                  className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                    rightPanelTab === 'comments'
                      ? 'border-primary text-primary bg-surface'
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion</span>
                </button>
                <button
                  onClick={() => setRightCollapsed(true)}
                  className="hidden lg:flex p-1.5 ml-1.5 rounded-lg bg-surface hover:bg-surface-2 border border-border text-muted hover:text-text transition-colors"
                  title="Collapse Findings Panel"
                  aria-label="Collapse Findings Panel"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanelTab === 'findings' ? (
                  <ReviewReportPanel
                    review={review}
                    findings={findings}
                    selectedFindingId={selectedFindingId}
                    onSelectFinding={(id) => setSelectedFindingId(id)}
                    onDecision={handleDecision}
                    isDeciding={isDeciding}
                    isReviewing={isReviewing}
                    onCommitNewVersion={handleCommitNewVersion}
                    isCreatingVersion={isCreatingVersion}
                  />
                ) : (
                  <CommentsThread
                    reviewId={review?.id}
                    findingId={selectedFindingId}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SubmitContentModal
        workspaceId={workspaceId}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onContentSubmitted={handleContentSubmitted}
      />

      <AuditEventsModal
        reviewId={review?.id}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <ComplianceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        content={selectedContent}
        currentVersion={currentVersion}
        review={review}
        findings={findings}
      />
    </div>
  );
}
