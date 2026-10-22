import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceListPage from './WorkspaceListPage.jsx';
import { workspaceService } from '../../services/workspaceService.js';
import * as AuthProviderModule from '../../app/providers/AuthProvider.jsx';

describe('WorkspaceListPage component', () => {
  beforeEach(() => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'owner@example.com', displayName: 'Owner' },
      logout: vi.fn(),
    });
  });

  it('renders workspaces when list is loaded', async () => {
    vi.spyOn(workspaceService, 'getWorkspaces').mockResolvedValue([
      {
        id: 'ws-123',
        name: 'Verdant Botanicals',
        role: 'owner',
        created_at: new Date().toISOString(),
        source_count: 5,
      },
    ]);

    render(
      <BrowserRouter>
        <WorkspaceListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verdant Botanicals')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
      expect(screen.getByText(/5 active sources/i)).toBeInTheDocument();
    });
  });

  it('renders empty state when user has no workspaces', async () => {
    vi.spyOn(workspaceService, 'getWorkspaces').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <WorkspaceListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No workspaces found/i)).toBeInTheDocument();
    });
  });

  it('opens and closes create workspace modal', async () => {
    vi.spyOn(workspaceService, 'getWorkspaces').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <WorkspaceListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const createBtns = screen.getAllByRole('button', { name: /Create Workspace/i });
    fireEvent.click(createBtns[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Brand Workspace')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
