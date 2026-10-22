import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SourceLibraryPanel from './SourceLibraryPanel.jsx';
import { sourceService } from '../../services/sourceService.js';

describe('SourceLibraryPanel component', () => {
  it('renders source cards when sources are loaded', async () => {
    vi.spyOn(sourceService, 'getSources').mockResolvedValue([
      {
        id: 's1',
        type: 'term',
        title: "Prohibited: 'revolutionary'",
        body: 'Do not use revolutionary.',
        version: 1,
        structured: { prohibited: 'revolutionary', preferred: 'innovative' },
      },
      {
        id: 's2',
        type: 'fact',
        title: 'Protein Content: 15g',
        body: '15g organic pea protein per bottle.',
        version: 1,
        structured: { correct_value: '15g' },
      },
    ]);

    render(<SourceLibraryPanel workspaceId="ws-123" />);

    await waitFor(() => {
      expect(screen.getByText("Prohibited: 'revolutionary'")).toBeInTheDocument();
      expect(screen.getByText('Protein Content: 15g')).toBeInTheDocument();
      expect(screen.getByText('revolutionary')).toBeInTheDocument();
      expect(screen.getByText('innovative')).toBeInTheDocument();
    });
  });

  it('renders empty state when workspace has no sources', async () => {
    vi.spyOn(sourceService, 'getSources').mockResolvedValue([]);

    render(<SourceLibraryPanel workspaceId="ws-empty" />);

    await waitFor(() => {
      expect(screen.getByText(/No brand sources yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Load Seed Rules/i })).toBeInTheDocument();
    });
  });

  it('filters sources when category tabs are clicked', async () => {
    vi.spyOn(sourceService, 'getSources').mockResolvedValue([
      {
        id: 's1',
        type: 'term',
        title: "Prohibited: 'revolutionary'",
        body: 'Do not use revolutionary.',
        version: 1,
      },
      {
        id: 's2',
        type: 'fact',
        title: 'Protein Content: 15g',
        body: '15g organic pea protein per bottle.',
        version: 1,
      },
    ]);

    render(<SourceLibraryPanel workspaceId="ws-123" />);

    await waitFor(() => {
      expect(screen.getByText("Prohibited: 'revolutionary'")).toBeInTheDocument();
    });

    const factsTab = screen.getByRole('button', { name: /Facts/i });
    fireEvent.click(factsTab);

    expect(screen.queryByText("Prohibited: 'revolutionary'")).not.toBeInTheDocument();
    expect(screen.getByText('Protein Content: 15g')).toBeInTheDocument();
  });

  it('opens create source modal on plus button click', async () => {
    vi.spyOn(sourceService, 'getSources').mockResolvedValue([]);

    render(<SourceLibraryPanel workspaceId="ws-123" />);

    const addBtn = screen.getByTitle('Add Brand Rule');
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Brand Source Rule')).toBeInTheDocument();
  });
});
