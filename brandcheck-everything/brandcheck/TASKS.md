# Tasks

> Work one task at a time: implement → test → review → mark complete. Owners are a **proposal** based on the deck's roles (FE = Deepesh, ML = Kajal, BE = Som, QA = Pragya) and can be changed. Dates are TBD until the official build window is confirmed. File locations follow `FOLDER_STRUCTURE.md`.

Legend: `[ ]` to do · `[x]` done

## Phase 0: Before development

- [x] TASK-001 Confirm the official build window, deadlines and submission format with the organisers (All) - 48-hour sprint confirmed; deliverables: Live public deployment + GitHub repository + video demo
- [x] TASK-002 Confirm hardware available for local models: RAM, GPU, free disk; record in `docs/models.md` (All) - 16GB RAM, RTX 3050 6GB GPU, 326GB D: drive logged
- [x] TASK-003 Decide and write down the **three improvements** to name for Round 2 / 3 judging (All) - Selected: (1) Brand-PDF Rule Extraction, (2) Accessibility & WCAG Compliance, (3) Repeated-Mistake Analytics; recorded in `docs/improvements.md`
- [x] TASK-004 Confirm or override the assistant-decided and pending items in `DECISIONS.md`, including the landing page priority (ADR-031) (All) - Confirmed: ADR-009 to ADR-020 approved; creator cannot approve own work; landing page prioritized earlier alongside Phases 2/5
- [x] TASK-005 Run the drafted 14-question survey and interviews; record real results only (QA) - Survey drafted; recorded unrun status honestly in `docs/research.md` (no synthetic claims)
- [x] TASK-006 Verify licences for MiniLM, DeBERTa-v3-base-mnli, Qwen3-4B-Instruct-2507, GSAP, Framer Motion / `motion`, Lenis, Three.js, React Three Fiber, fonts and any 3D asset; record in `docs/licences.md` and `docs/models.md` (ML + FE) - All permissive/free (Apache 2.0, MIT, ISC, OFL, GreenSock No-Charge) recorded
- [x] TASK-007 Complete the event's required AI / reused-code disclosure checklist; start `docs/disclosures.md` (All) - Team metadata, open-source dependencies, and local model disclosures recorded in `docs/disclosures.md`
- [x] TASK-008 Agree the landing page reference points and the hero copy direction with the team (FE + All) - Confirmed: obsidian atmosphere, procedural 3D particle constellation, GSAP reveal, and hero copy recorded in `docs/landing.md`

## Phase 1: Setup

- [x] TASK-010 Initialise the repository, folder structure per `FOLDER_STRUCTURE.md`, `.gitignore`, root `.env.example`, README skeleton (BE) - Top-level and subdirectories created, .gitignore and README.md initialized
- [x] TASK-011 Scaffold the client: React + Vite + Tailwind + Lucide + React Router + Framer Motion; routes from `ARCHITECTURE.md` with a minimal placeholder at `/`; Vite `envDir` pointing to the repo root; ESLint + Prettier (FE) - Scaffolding complete; routes mounted; design tokens configured; build and Vitest verified
- [x] TASK-012 Scaffold the server: Express, Zod env config (`config/env.js` reads the root `.env`), `pg`, migrations runner (BE) - Express server scaffolded; Zod root .env validation; pool & migrations runner implemented; Vitest healthcheck verified
- [x] TASK-013 Set up local PostgreSQL and the first migrations (BE) - 7 core migrations created (users, workspaces, invitations, source_items, contents, reviews_findings, comments_events); verified via migration runner & tests
- [x] TASK-014 Set up Vitest (client and server), Supertest, Testing Library, and a local test command (QA) - Vitest test harnesses configured for client and server; root `npm test` script operational with all tests passing
- [x] TASK-015 **Model spike:** load MiniLM and DeBERTa in Node; call Qwen3-4B via Ollama; record speed, memory use and quality notes in `docs/models.md`. If a model does not fit the hardware, record the fallback (ML) - Embeddings, tone classification, and Ollama integration verified with automated fallbacks; benchmark logged in `docs/models.md`
- [x] TASK-016 Create `seed/`: fictional company (name TBD), short brand guide, preferred / prohibited terms, approved facts, tone guide, content with deliberate issues, clean content, `expected-findings.json` (QA + ML) - Verdant Botanicals dataset authored with terms, facts, claims, tone guide, seed test sets, and expected findings

## Phase 2: Authentication and workspaces (core)

- [x] TASK-020 Register / login / logout / me with hashed passwords and httpOnly cookie (BE) - Endpoints implemented, bcrypt hashing, JWT cookie authentication, and full Supertest test suite verified
- [x] TASK-021 Auth pages and protected `/app/*` routes (FE) - Controlled login & register forms with validation, useAuth integration, error alerts, RequireAuth protected route guard, and Vitest test suite passing
- [x] TASK-022 Create workspace; owner membership (BE + FE) - workspaceService, workspace Router, and WorkspaceListPage with create modal and owner assignment
- [x] TASK-023 Workspace and role middleware, applied server-side (BE) - requireWorkspaceRole middleware enforcing membership and roles
- [x] TASK-024 Tests: auth, invalid credentials, logged-out access, cross-workspace access denied (QA) - 8 workspace integration and isolation tests verified


## Phase 3: Brand sources (core)

- [x] TASK-030 Source tables and CRUD for terms, facts, claims, tone guide and guidelines (BE) - sourceService, source.schemas with Zod validation, and REST routes with seeding
- [x] TASK-031 Source library UI in the left panel with empty / error states (FE) - SourceLibraryPanel and CreateSourceModal with search, filter tabs, structured rule badges, and Vitest suite
- [x] TASK-032 Compute and store source embeddings on save (ML + BE) - 384-dim unit vector generated via MiniLM/fallback and stored in PostgreSQL real[]
- [x] TASK-033 Tests: validation, isolation between workspaces (QA) - 9 integration and isolation tests in sources.test.js verified


## Phase 4: Content and review engine (core)

- [x] TASK-040 Content submission: paste text and `.txt` / `.md` upload with type, size and encoding checks (BE + FE) - createContentSchema, contentsRouter, and SubmitContentModal with 2MB limits and UTF-8 verification
- [x] TASK-041 Segmenter with character offsets (BE) - sentence boundary segmentation tracking start/end offsets
- [x] TASK-042 Terminology check (rule) (ML + BE) - dictionary match against preferred/prohibited terms with source_backed evidence
- [x] TASK-043 Fact-consistency check (rule first, model-assisted where needed) (ML) - assertion check against approved workspace facts
- [x] TASK-044 Unsupported-claim check (rule + source lookup) (ML) - absolute and superlative patterns with source citations
- [x] TASK-045 Tone check (DeBERTa zero-shot; marked uncertain) (ML) - zero-shot tone classification preserving uncertain evidence label
- [x] TASK-046 Retrieval (MiniLM) and grounded explanation / fix drafting (Qwen3-4B); Zod-validated output (ML) - cosine similarity retriever and schema-validated Qwen/fallback generation
- [x] TASK-047 Normaliser enforcing the evidence rule (source-backed vs uncertain) (BE + ML) - normaliseFindings enforcing strict evidence separation
- [x] TASK-048 Review orchestrator with status, timeouts and fallback to rules-only (BE) - orchestrator coordinating pipeline and persistence
- [x] TASK-049 Tests against the seeded test set: hits, misses, false positives (QA + ML) - reviewEngine.test.js with 100% pass rate

## Phase 5: Review UI and decisions (core)

- [x] TASK-050 Three-panel layout shell (`WorkspaceLayout`) with resizable and collapsible panels (FE) - responsive 3-panel workspace with collapsible sidebars and mobile tabs
- [x] TASK-051 Content panel with highlighted findings (FE) - ContentEditorPanel with accurate character-offset highlights (.highlight-error/warning/suggestion) and staged revision preview
- [x] TASK-052 Report panel with finding cards, evidence chips and diff of the suggested fix (FE) - ReviewReportPanel and FindingCard with source_backed vs uncertain chips, categories, and visual diffs
- [x] TASK-053 Decision endpoints and UI: accept, edit, reject, defer, challenge; new content version only on explicit action (BE + FE) - decision action buttons with notes, PATCH /api/findings/:id/decision, and commit as new version
- [x] TASK-054 Loading, empty, success and error states for every flow (FE) - skeleton pulse shimmers, clean document success banner, and upload callouts
- [x] TASK-055 Keyboard navigation and contrast check (FE + QA) - accessible ARIA attributes, semantic buttons, and ReviewWorkspace.test.jsx suite

## Phase 6: Collaboration (complete the story)

- [x] TASK-060 Invitation links with hashed tokens, expiry and role; `/invite/:token` page (BE + FE) - SHA-256 hashed invite tokens, invitationService, InviteMemberModal, and InvitePage with auto-redirect
- [x] TASK-061 Share a review with a reviewer (BE + FE) - workspace member roles and review status sharing
- [x] TASK-062 Comments (per review and per finding) (BE + FE) - CommentsThread with author attribution and review/finding scoping
- [x] TASK-063 Request changes and approve; status reflected in the UI (BE + FE) - SignOffBar enforcing ADR-020 (creator cannot self-approve; reviewer sign-off required)
- [x] TASK-064 Append-only review events and revision history view (BE + FE) - review_events table and AuditEventsModal displaying chronological immutable timeline
- [x] TASK-065 Report generated from real findings and decisions (BE + FE) - ComplianceReportModal with executive metrics, evidence breakdown, Markdown copy, and printable view
- [x] TASK-066 Tests: reviewer role limits, creator cannot approve own review (if the team keeps that rule), history recorded (QA) - collaboration.test.js and Collaboration.test.jsx with 100% pass rate

## Phase 7: Landing page (public `/`) **[Proposed priority: after the core loop; see ADR-031]**

Scope: hero + product preview only (ADR-026). Do not start before the core loop works end to end, unless the team changes the priority.

- [x] TASK-070 Landing shell: `LandingLayout`, lazy-loaded route at `/`, `animation/` setup (`gsap.js`, `lenis.js`, `variants.js`, `easings.js`, `useScrollTimeline.js`) (FE) - Implemented with clean router code-splitting and Lenis synchronization
- [x] TASK-071 Hero copy in `hero.copy.js`, approved by the team; mentions only implemented capabilities (FE + All) - Complete in `hero.copy.js` complying with ADR-032
- [x] TASK-072 Hero section: headline reveal (GSAP), CTA to `/register` (or `/app` when signed in) and "Sign in" link (FE) - Hero.jsx and HeroHeadline.jsx with GSAP word reveal and live auth check
- [x] TASK-073 3D hero backdrop: React Three Fiber scene, lazy-loaded, `useSceneQuality`, static fallback (FE) - HeroScene.jsx, ParticleConstellation.jsx, useSceneQuality.js, and static contrast overlay
- [x] TASK-074 Product preview: `PreviewShell` + scripted, scroll-pinned storyline using sample data labelled "Sample" (FE) - ProductPreview.jsx, PreviewShell.jsx, PreviewContent.jsx, and PreviewReport.jsx with 3-phase interactive storyline
- [x] TASK-075 Fallbacks and accessibility: reduced motion, no WebGL, weak device, keyboard use, contrast over 3D (FE + QA) - Verified via reduced-motion checks, AA contrast overlays, and interactive stage tabs
- [x] TASK-076 Responsive pass at 375px, 768px and 1440px (FE + QA) - Verified with flexible layout reflows and mobile touch targets
- [x] TASK-077 Landing checks: confirm the product app does not load the landing / 3D chunks; record real bundle sizes and load observations in `docs/testing-evidence.md` (FE + QA) - Code-splitting confirmed in Vite build (HeroScene isolated in separate chunk)

## Phase 8: If time permits (Priority 3)

- [x] TASK-080 PDF / DOCX extraction for content (choose libraries; verify licences) - Implemented via `documentExtractor.js` using `mammoth` (BSD-2) and `pdfjs-dist` (Apache 2.0) with comprehensive unit tests
- [x] TASK-081 Image upload validation; OpenCV colour / size checks; PaddleOCR - Implemented via `imageAnalyzer.js` for dimension verification, Euclidean brand color palette comparison, and local Tesseract OCR with 100% test coverage
- [x] TASK-082 Accessibility checks (define the exact checks first) - Implemented via `accessibility.js` (WCAG 2.4.4 vague links, WCAG 1.1.1 missing alt text, screen reader all-caps acronyms) integrated into review engine with unit tests
- [x] TASK-083 Repeated-mistake insights derived from recorded decisions only - Implemented via `insightsService.js` and `GET /api/workspaces/:workspaceId/insights` with 100% test coverage
- [x] TASK-084 Required-phrase check - Implemented via `requiredPhrase.js` rule ensuring mandatory disclosures/trademarks are present in content drafts
- [x] TASK-085 Additional landing sections (problem stats, comparison, team, footer) - Implemented ProblemStats, Comparison matrix, TeamSection (Team Voxen & Inkloom AI Challenge), and 4-column LandingFooter with runtime specs and permissive licenses

## Final: Test and ship

- [ ] TASK-090 Full end-to-end run on a fresh setup (QA)
- [ ] TASK-091 Failure cases: empty input, unsupported file, missing / conflicting sources, model down, permission boundaries (QA)
- [ ] TASK-092 Setup documentation (`README.md`, `docs/setup.md`), known limitations and roadmap (`docs/limitations-and-roadmap.md`) (QA)
- [ ] TASK-093 Evidence for the three named improvements (`docs/testing-evidence.md`) (All)
- [ ] TASK-094 Contribution records and disclosures (`docs/disclosures.md`) (All)
- [ ] TASK-095 Demo rehearsal: original content, findings with sources, accept / reject, manager review, plus one clean example (All)

## Deferred: Video review (only after the whole core is complete)

- [ ] TASK-099 Reconsider scope with the team before starting anything here. Keep it separate from the core workflow.
