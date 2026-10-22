import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignOffBar from './SignOffBar.jsx';
import CommentsThread from './CommentsThread.jsx';
import ComplianceReportModal from './ComplianceReportModal.jsx';
import { collaborationService } from '../../services/collaborationService.js';
import * as AuthContext from '../../app/providers/AuthProvider.jsx';

describe('Phase 6: Frontend Collaboration & Governance UI', () => {
  const mockReview = {
    id: 'rev-999',
    status: 'in_review',
  };

  const mockContent = {
    id: 'cnt-1',
    title: 'Botanical Drink Press Release',
    created_by: 'creator-123',
  };

  it('TASK-063 & ADR-020: Disables approval button when current user is the content creator', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'creator-123', email: 'creator@brand.com' },
    });

    render(
      <SignOffBar
        review={mockReview}
        content={mockContent}
        onStatusUpdated={vi.fn()}
      />
    );

    // Verify creator guard per ADR-020
    const approveBtn = screen.getByRole('button', { name: /Approve \(Reviewer Required\)/i });
    expect(approveBtn).toBeInTheDocument();
    expect(approveBtn).toBeDisabled();
  });

  it('TASK-063: Reviewer sees active approval and request changes buttons', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'reviewer-456', email: 'reviewer@brand.com' },
    });

    render(
      <SignOffBar
        review={mockReview}
        content={mockContent}
        onStatusUpdated={vi.fn()}
      />
    );

    // Reviewer can approve
    const approveBtn = screen.getByRole('button', { name: /Approve for Publication/i });
    expect(approveBtn).toBeInTheDocument();
    expect(approveBtn).not.toBeDisabled();

    // Reviewer can request changes
    const changeBtn = screen.getByRole('button', { name: /Request Changes/i });
    expect(changeBtn).toBeInTheDocument();
  });

  it('TASK-061 & TASK-062: CommentsThread renders comments and posts new comment', async () => {
    vi.spyOn(collaborationService, 'getComments').mockResolvedValue([
      {
        id: 'comm-1',
        author_name: 'Lead Reviewer',
        body: 'Check the extraction claim.',
        created_at: new Date().toISOString(),
      },
    ]);

    vi.spyOn(collaborationService, 'addComment').mockResolvedValue({
      comment: {
        id: 'comm-2',
        author_name: 'Lead Reviewer',
        body: 'Approved once modified.',
        created_at: new Date().toISOString(),
      },
    });

    render(<CommentsThread reviewId="rev-999" />);

    await waitFor(() => {
      expect(screen.getByText('Check the extraction claim.')).toBeInTheDocument();
      expect(screen.getByText('Lead Reviewer')).toBeInTheDocument();
    });

    // Post new comment
    const input = screen.getByPlaceholderText(/Type a comment/i);
    const sendBtn = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Approved once modified.' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(collaborationService.addComment).toHaveBeenCalledWith('rev-999', {
        findingId: null,
        body: 'Approved once modified.',
      });
    });
  });

  it('TASK-065: ComplianceReportModal renders executive metrics and findings breakdown', () => {
    render(
      <ComplianceReportModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        currentVersion={{ version_no: 2 }}
        review={{ ...mockReview, status: 'approved', created_at: new Date().toISOString() }}
        findings={[
          {
            id: 'f-1',
            category: 'terminology',
            severity: 'error',
            evidence_status: 'source_backed',
            flagged_text: 'miracle',
            explanation: 'Prohibited buzzword',
            decision: 'accepted',
          },
        ]}
      />
    );

    expect(screen.getByText('Brand Governance Compliance Report')).toBeInTheDocument();
    expect(screen.getByText('Botanical Drink Press Release')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('Total Findings')).toBeInTheDocument();
    expect(screen.getByText('Resolved / Accepted')).toBeInTheDocument();
  });
});
