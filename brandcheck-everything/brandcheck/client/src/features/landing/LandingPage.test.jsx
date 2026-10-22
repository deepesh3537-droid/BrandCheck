import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LandingLayout from '../../app/layouts/LandingLayout.jsx';
import LandingPage from './LandingPage.jsx';

describe('Phase 7 Landing Page (TASK-070 to TASK-075)', () => {
  it('renders LandingLayout with accessible skip link, logo, and auth navigation', () => {
    render(
      <BrowserRouter>
        <LandingLayout>
          <LandingPage />
        </LandingLayout>
      </BrowserRouter>
    );

    // Accessible skip link
    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();

    // Top logo & navigation
    expect(screen.getAllByText(/BrandCheck/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Sign In/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Get Started/i }).length).toBeGreaterThan(0);
  });

  it('renders Hero section with approved copy and implemented capability cards (TASK-071, TASK-072)', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Approved headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Brand governance/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/before you hit publish/i);

    // Primary CTA
    expect(screen.getByRole('link', { name: /Get Started Free/i })).toBeInTheDocument();

    // Capability cards (verified capabilities only per ADR-032)
    expect(screen.getByText(/Source-Grounded Checks/i)).toBeInTheDocument();
    expect(screen.getByText(/Never Overwrites Silently/i)).toBeInTheDocument();
    expect(screen.getByText(/Local-First & Zero Paid APIs/i)).toBeInTheDocument();
  });

  it('renders Product Preview with 3-panel shell, sample data label, and interactive stage tabs (TASK-074)', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Section title
    expect(screen.getByRole('heading', { name: /See the review loop in action/i })).toBeInTheDocument();

    // Sample data disclaimer label (ADR-026 / ADR-032)
    expect(screen.getAllByText(/Sample/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Novacore Audio/i).length).toBeGreaterThan(0);

    // Tabs for 3 storyline stages
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);

    // Initial state: Step 1 active
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Switch to step 2: flags appear
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Forbidden Terminology/i)).toBeInTheDocument();

    // Switch to step 3: accepted revision recorded
    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/1 Revision Applied/i)).toBeInTheDocument();
  });

  describe('TASK-085: Additional Landing Sections', () => {
    it('renders ProblemStats section with governance pain points and architectural anchors', () => {
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Section title & problem points
      expect(screen.getByRole('heading', { name: /Why pre-publication review matters/i })).toBeInTheDocument();
      expect(screen.getByText(/The Brand Governance Challenge/i)).toBeInTheDocument();
      expect(screen.getByText(/Guideline Drift Across Teams/i)).toBeInTheDocument();
      expect(screen.getByText(/Silent AI Overwriting/i)).toBeInTheDocument();
      expect(screen.getByText(/Cloud Leaks & Token Bills/i)).toBeInTheDocument();

      // Architectural impact badges
      expect(screen.getByText(/₹0 budget violation and data exposure risks/i)).toBeInTheDocument();
    });

    it('renders Comparison section with capability matrix across tools', () => {
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Matrix title & column headers
      expect(screen.getByRole('heading', { name: /How BrandCheck compares/i })).toBeInTheDocument();
      expect(screen.getAllByText(/BrandCheck/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/GENERIC LINTERS/i)).toBeInTheDocument();
      expect(screen.getAllByText(/MANUAL REVIEW/i).length).toBeGreaterThan(0);

      // Matrix capability items
      expect(screen.getByText(/Verified Brand Source Grounding/i)).toBeInTheDocument();
      expect(screen.getByText(/Draft Immutability Protection/i)).toBeInTheDocument();
      expect(screen.getByText(/Fact & Claim Consistency Checks/i)).toBeInTheDocument();
      expect(screen.getByText(/Privacy & Operating Budget/i)).toBeInTheDocument();
    });

    it('renders TeamSection with Team Voxen mission and design philosophy', () => {
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: /Engineered with integrity/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Built by Team Voxen/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Inkloom AI Challenge/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Local-First Inference/i)).toBeInTheDocument();
      expect(screen.getByText(/Human-in-Control Governance/i)).toBeInTheDocument();
      expect(screen.getByText(/Transparent & Permissive/i)).toBeInTheDocument();
    });

    it('renders LandingFooter with 4 columns, runtime specs, and links', () => {
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // Footer elements & runtime specs
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText(/Local Runtimes/i)).toBeInTheDocument();
      expect(screen.getByText(/Compliance & Ethics/i)).toBeInTheDocument();
      expect(screen.getByText(/Ollama · Qwen2.5-3B \(Diffs & Fixes\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Hugging Face ONNX · MiniLM \(Vectors\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Tesseract.js \(Client Poster OCR\)/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Local Inference \(₹0\)/i)).toBeInTheDocument();
    });
  });
});
