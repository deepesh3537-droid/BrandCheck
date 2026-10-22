# Round 2 & 3 Named Improvements

> Generated for TASK-003. Formally records the three selected improvements to be highlighted and evaluated during Round 2 / Round 3 judging.

---

## 1. Improvement 1: Brand-PDF Rule Extraction
- **Category:** Knowledge Ingestion & Onboarding Acceleration
- **Problem Statement:** Organizations maintain lengthy, complex brand guidelines in PDF format. Manually extracting individual rules, approved terminology, and verified company claims into structured database records creates high friction for workspace setup.
- **Proposed Solution:** An intelligent document ingestion pipeline that extracts text from brand guideline PDFs, segments sections (Voice, Typography, Terminology, Fact Sheets), and converts them into structured brand source entities (`terms`, `facts`, `guidelines`, `claims`) with draft status for administrator review.
- **Evaluation Criteria for Judging:**
  - Accurate extraction of prohibited and preferred terms from sample brand PDFs.
  - Correct isolation of factual statements vs stylistic rules.
  - Zero loss of human editorial control (all extracted rules require admin approval before becoming active).

---

## 2. Improvement 2: Accessibility & WCAG Compliance Checks
- **Category:** Brand Inclusivity & Regulatory Safety
- **Problem Statement:** 95.9% of digital assets and homepages suffer from WCAG failures. Brand guidelines frequently mandate accessible contrast and font legibility, but content creators lack automated checks before publishing assets.
- **Proposed Solution:** Automated deterministic checks evaluating text and markup against WCAG AA standards (minimum contrast ratio 4.5:1 for standard text, 3:1 for large text, typographic hierarchy, and descriptive alt-text validation for referenced assets).
- **Evaluation Criteria for Judging:**
  - Automated detection of low-contrast combinations.
  - Verification that warnings strictly follow the "Never colour alone" design principle.
  - Source-backed findings linking directly to the organization's accessibility guidelines.

---

## 3. Improvement 3: Repeated-Mistake Analytics & Guideline Clarification
- **Category:** Continuous Governance & Rule Evolution
- **Problem Statement:** Static brand guidelines fail to adapt when rules are ambiguous or frequently rejected by creators, resulting in recurring bottlenecks between creators and managers.
- **Proposed Solution:** An audit-driven analytical feedback loop computed exclusively from real creator decisions (*challenged*, *rejected*, *deferred*). Identifies specific brand rules that generate the highest friction or repeat violations, providing workspace admins with data-backed recommendations to clarify or update their guidelines.
- **Evaluation Criteria for Judging:**
  - Analytics derived strictly from append-only recorded review events (`review_events` table); no fabricated metrics.
  - Actionable insights identifying which brand guidelines cause frequent challenges or edits.
  - Clear reporting for brand managers to refine guideline ambiguity.
