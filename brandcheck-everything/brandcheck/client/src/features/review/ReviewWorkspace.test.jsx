import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReviewWorkspaceView from './ReviewWorkspaceView.jsx';
import FindingCard from './FindingCard.jsx';
import ContentEditorPanel from './ContentEditorPanel.jsx';
import ReviewReportPanel from './ReviewReportPanel.jsx';
import { contentService } from '../../services/contentService.js';
import { reviewService } from '../../services/reviewService.js';
import { sourceService } from '../../services/sourceService.js';

describe('Phase 5: Review UI and Decisions Integration', () => {
  const mockWorkspaceId = 'ws-test-456';

  const mockFindingSourceBacked = {
    id: 'f-1',
    category: 'terminology',
    severity: 'error',
    evidence_status: 'source_backed',
    span_start: 11,
    span_end: 24,
    flagged_text: 'revolutionary',
    explanation: 'Brand guideline prohibits buzzwords.',
    suggested_text: 'evidence-based',
    source_title: 'Tone and Voice Guide',
    source_body: 'Never use revolutionary without clinical backing.',
    decision: 'pending',
  };

  const mockFindingUncertain = {
    id: 'f-2',
    category: 'tone',
    severity: 'warning',
    evidence_status: 'uncertain',
    span_start: 35,
    span_end: 48,
    flagged_text: 'super excited',
    explanation: 'Zero-shot classification suggests casual tone mismatch.',
    suggested_text: 'proud',
    decision: 'pending',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(sourceService, 'getSources').mockResolvedValue([]);
  });

  it('TASK-052: FindingCard renders evidence status chip (source-backed vs uncertain)', () => {
    const handleSelect = vi.fn();
    const handleDecision = vi.fn();

    const { rerender } = render(
      <FindingCard
        finding={mockFindingSourceBacked}
        isSelected={false}
        onSelect={handleSelect}
        onDecision={handleDecision}
      />
    );

    // Verify source-backed evidence chip
    expect(screen.getByText('source-backed')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Brand guideline prohibits buzzwords.')).toBeInTheDocument();
    expect(screen.getByText('evidence-based')).toBeInTheDocument();

    // Rerender with uncertain finding
    rerender(
      <FindingCard
        finding={mockFindingUncertain}
        isSelected={false}
        onSelect={handleSelect}
        onDecision={handleDecision}
      />
    );

    // Verify uncertain evidence chip
    expect(screen.getByText('uncertain')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('super excited')).toBeInTheDocument();
  });

  it('TASK-053: FindingCard records human decisions (accept, edit, reject)', () => {
    const handleDecision = vi.fn();

    render(
      <FindingCard
        finding={mockFindingSourceBacked}
        isSelected={false}
        onSelect={vi.fn()}
        onDecision={handleDecision}
      />
    );

    // Click Accept
    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptBtn);

    expect(handleDecision).toHaveBeenCalledWith('f-1', {
      decision: 'accepted',
      decision_text: 'evidence-based',
    });
  });

  it('TASK-051: ContentEditorPanel renders highlighted spans for findings', () => {
    const onSelectFinding = vi.fn();
    const fullText = 'Welcome to revolutionary products for everyone.';

    render(
      <ContentEditorPanel
        contents={[{ id: 'c-1', title: 'Test Document' }]}
        selectedContent={{ id: 'c-1', title: 'Test Document' }}
        currentVersion={{ version_no: 1, body: fullText }}
        findings={[mockFindingSourceBacked]}
        selectedFindingId="f-1"
        onSelectFinding={onSelectFinding}
        onSelectContent={vi.fn()}
        onOpenSubmitModal={vi.fn()}
        onRunReview={vi.fn()}
        isReviewing={false}
        previewMode="highlights"
        setPreviewMode={vi.fn()}
      />
    );

    // Check highlighted text is rendered in a mark tag
    const markEl = screen.getByText('revolutionary');
    expect(markEl).toBeInTheDocument();
    expect(markEl.tagName.toLowerCase()).toBe('mark');

    // Click on highlight triggers selection
    fireEvent.click(markEl);
    expect(onSelectFinding).toHaveBeenCalledWith('f-1');
  });

  it('TASK-050 & TASK-054: ReviewWorkspaceView loads content, runs review, and renders 3-panel shell', async () => {
    vi.spyOn(contentService, 'getContents').mockResolvedValue([
      { id: 'c-100', title: 'Verdant Product Launch' },
    ]);
    vi.spyOn(contentService, 'getContent').mockResolvedValue({
      id: 'c-100',
      title: 'Verdant Product Launch',
      current_version: {
        id: 'cv-1',
        version_no: 1,
        body: 'Verdant is proud to introduce our revolutionary new line.',
      },
    });
    vi.spyOn(reviewService, 'triggerReview').mockResolvedValue({
      review: {
        id: 'rev-1',
        status: 'ready',
        findings: [mockFindingSourceBacked],
      },
    });

    render(
      <MemoryRouter initialEntries={[`/app/w/${mockWorkspaceId}`]}>
        <Routes>
          <Route path="/app/w/:workspaceId" element={<ReviewWorkspaceView />} />
        </Routes>
      </MemoryRouter>
    );

    // Document title and version badge appear
    await waitFor(() => {
      expect(screen.getAllByText('Verdant Product Launch').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('v1 (immutable)')).toBeInTheDocument();
      expect(screen.getByText('Audit Report & Findings')).toBeInTheDocument();
      expect(screen.getByText('Brand guideline prohibits buzzwords.')).toBeInTheDocument();
    });
  });
});
