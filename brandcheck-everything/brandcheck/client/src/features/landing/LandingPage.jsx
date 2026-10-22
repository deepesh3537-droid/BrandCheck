import React, { useEffect } from 'react';
import Hero from './sections/Hero/Hero.jsx';
import ProductPreview from './sections/ProductPreview/ProductPreview.jsx';
import ProblemStats from './sections/Stats/ProblemStats.jsx';
import Comparison from './sections/Comparison/Comparison.jsx';
import TeamSection from './sections/Team/TeamSection.jsx';
import LandingFooter from './sections/Footer/LandingFooter.jsx';
import { initLenis } from './animation/lenis.js';

/**
 * Public Landing Page at `/` (TASK-085 & ADR-026).
 * Composes Hero, Product Preview, Problem Stats, Comparison, Team, and Footer.
 */
export default function LandingPage() {
  useEffect(() => {
    // Initialize Lenis smooth scroll on landing route only (ADR-025, ADR-029)
    const { destroy } = initLenis();

    return () => {
      // Clean up smooth scroll instance on unmount
      destroy();
    };
  }, []);

  return (
    <div className="w-full flex flex-col bg-bg text-text selection:bg-primary/20 selection:text-primary">
      {/* 1. Hero Section (GSAP Headline Reveal + 3D Scene + Verified Capabilities) */}
      <Hero />

      {/* 2. Product Preview Section (Scroll-Pinned 3-Panel Workspace Storyline) */}
      <ProductPreview />

      {/* 3. Problem Stats (The Brand Governance Challenge) */}
      <ProblemStats />

      {/* 4. Comparison Section (BrandCheck vs Generic Linters vs Manual Review) */}
      <Comparison />

      {/* 5. Team & Philosophy Section (Team Voxen & Local-First Conviction) */}
      <TeamSection />

      {/* 6. Comprehensive Landing Footer */}
      <LandingFooter />
    </div>
  );
}
