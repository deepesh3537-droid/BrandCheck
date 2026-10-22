# Architecture & Product Decisions

> Permanent decisions. Current state lives in `MEMORY.md`.
>
> **Status key**
> - **Team-decided:** stated by the team in its documents or answers.
> - **Assistant-decided:** the team asked the assistant to decide these open items and report them. They stand until the team overrides them.
> - **Pending:** needs the team; nothing is assumed.

## Team-decided

### ADR-001 Product scope
Decision: BrandCheck is a brand-governance and pre-publication review platform, not a generic grammar checker.
Source: `context.md`, deck.

### ADR-002 Roles and workflow
Decision: Roles are company owner/admin, content creator, and manager/authorised reviewer. The workflow is: sources → submit → review → findings → decide → share → comment/approve → history.
Source: `context.md`, deck.

### ADR-003 Interface
Decision: VS Code-inspired three-panel layout with a top navbar, left files/sources panel, centre content/review panel, right report panel.
Source: `context.md`.

### ADR-004 Stack
Decision: React + Vite, Tailwind CSS, Node.js + Express, Zod, PostgreSQL (Supabase Free or local). shadcn/ui optional. Additions are in ADR-025 and ADR-028.
Source: deck, `tech_implementation.md`.

### ADR-005 Language
Decision: JavaScript (ES modules), not TypeScript.
Source: the team's answer in this conversation.

### ADR-006 Budget and inference
Decision: ₹0 budget; local inference first; no paid APIs; verify free-tier limits and every licence (models, libraries, fonts, 3D assets).
Source: `tech_implementation.md`.

### ADR-007 Video is deferred
Decision: Video review is built only after the entire core is complete and stays separate from the core workflow.
Source: `context.md`.

### ADR-008 Design direction
Decision: Dark, techy, clean, professional, with animations where useful. Final colours and fonts will be provided by the team; the values in `DESIGN.md` are provisional.
Source: the team's answer in this conversation.

### ADR-024 Landing page lives in the client app
Decision: One Vite app. The landing page is the public route `/`; the product app is under `/app`. Shared tokens, one build.
Source: the team's answer in this conversation.

### ADR-025 Landing page libraries and inspiration
Decision: GSAP (+ ScrollTrigger), Framer Motion, Lenis smooth scroll, and Three.js with React Three Fiber, alongside React. The landing page should have a feel similar to Google Antigravity's landing page.
Notes: The reference has not been reviewed in detail for this plan; specific reference points are to be agreed (TASK-008). We recreate a feel only, never another site's text, assets, code or branding. Licences of GSAP, Framer Motion / `motion`, Lenis, Three.js and R3F are to be verified (TASK-006).
Source: the team's request and answers in this conversation.

### ADR-026 Landing sections
Decision: Hero and product preview only. Other sections (navbar, problem stats, comparison, team, footer) are not planned until the team asks.
Source: the team's answer in this conversation.

### ADR-027 Repository layout
Decision: One repository with plain `client/` and `server/` folders (each with its own `package.json`); no npm-workspaces monorepo. `FOLDER_STRUCTURE.md` is the single source of truth for the tree.
Source: the team's answer in this conversation.

## Assistant-decided (the team asked me to decide these and report them)

### ADR-009 Authentication
Decision: Express-managed email and password. Passwords hashed with `bcryptjs`. A signed JWT in an httpOnly, SameSite cookie.
Reason: Works identically on local PostgreSQL and Supabase, avoids depending on a hosted service that may pause, and the team can explain every part of it.
Alternative: Supabase Auth. More battle-tested but requires the hosted service.
Trade-off: Hand-rolled auth carries risk; mitigated by `SECURITY.md` (rate limiting, short expiry, no custom crypto).

### ADR-010 Database hosting
Decision: Local PostgreSQL is the primary. Supabase Free Postgres is an optional hosted option, used only after verifying current limits and pausing behaviour.
Reason: ₹0, no dependence on a free tier that may sleep or delete data, and local models require a local machine anyway.

### ADR-011 File storage
Decision: No separate file-storage service in v1. Content and source text are stored in PostgreSQL. Logo and asset files (Priority 3) use local disk, git-ignored.
Reason: The first version accepts text only.

### ADR-012 Formats in the first version
Decision: Pasted text plus `.txt` and `.md` upload. PDF, DOCX and images are Priority 3 and are not claimed until implemented and tested.

### ADR-013 Brand sources are entered through forms
Decision: Owners add guidelines, terms, facts, claims and a tone guide through structured forms. Importing a brand PDF is not in v1.
Reason: Structured entries give deterministic checks and exact source references. The deck notes owners will want to turn a PDF into rules; this is a candidate improvement (see Pending).

### ADR-014 First checks
Decision: Implement these four first, in this order: terminology, fact consistency, unsupported promotional claims, tone. Required phrases, visual and accessibility checks are Priority 3.
Reason: They match the demo scenario in `context.md` and are the most defensible against approved sources. Tone is model-assisted and therefore always marked uncertain unless an explicit rule backs it.

### ADR-015 Evidence and finding status
Decision: Findings are either `source_backed` (cite a real source item in the same workspace) or `uncertain`. The server enforces this and downgrades any model-invented citation.

### ADR-016 Creator decisions
Decision: Five decisions: accept, edit, reject, defer, challenge.
Reason: `context.md` lists accept / edit / reject / challenge; the deck lists accept / reject / edit / defer. Both are supported so neither is contradicted.

### ADR-017 Embeddings storage
Decision: Source embeddings are stored as `real[]` in PostgreSQL and compared in Node. No `pgvector`.
Reason: A workspace has few source items; local setup stays simple.

### ADR-018 Model runtime
Decision: MiniLM and DeBERTa run in Node through `@huggingface/transformers` (ONNX). Qwen3-4B-Instruct-2507 runs through Ollama over local HTTP.
Reason: One language and no separate Python service for the first version.
Fallback: If a model does not fit the hardware or an ONNX build is unavailable, the review runs rules-only and reports which checks were skipped. To be confirmed by the model spike (TASK-015).

### ADR-019 Invitations
Decision: Single-use invitation links with a hashed token, an expiry, and a fixed role. The browser route is `/invite/:token`.

### ADR-020 Revision and history
Decision: The original content is version 1 and never changes. A new version is created only by an explicit user action. All status changes and decisions are appended to a review-event log.

### ADR-021 Hosting and submission
Decision: Development and primary verification run locally with local models. For final event submission, a live public web deployment is required alongside the GitHub repository, walkthrough video demo, and presentation deck. Free-tier deployment (e.g. Vercel for client, Render/Railway for server, Supabase Postgres for DB) is provisioned while strictly preserving the ₹0 budget and graceful degradation rules when cloud resources do not support GPU inference.

### ADR-022 Testing tools
Decision: Vitest for client and server, Supertest for the API, Testing Library for the UI. Client tests are co-located with components. One Playwright end-to-end flow if time permits.

### ADR-023 Project name
Decision: Use "BrandCheck" (the deck's name) consistently. Changeable.

### ADR-028 Router and client routes
Decision: React Router. Routes: `/` (landing), `/login`, `/register`, `/invite/:token`, `/app/*` (private product). The table is in `ARCHITECTURE.md`.
Reason: A single app with a public landing page and a private product area needs client-side routing.

### ADR-029 Who animates what
Decision:
- Product app: CSS / Tailwind transitions and Framer Motion only (120–240ms).
- Landing page: GSAP + ScrollTrigger for scroll-driven and pinned sequences and text reveal; Framer Motion for hover and mount; Lenis for smooth scroll (landing route only); Three.js / R3F for the hero backdrop only.
- GSAP, Lenis and Three.js are imported only inside `features/landing/`; landing and product features never import each other; the landing route and 3D scene are lazy-loaded.
Reason: Avoids two libraries fighting over the same element, and keeps the product app light and fast.

### ADR-030 Landing fallbacks and performance
Decision: Respect `prefers-reduced-motion` (disable Lenis, scroll-pinning, 3D and show static content). Provide a static fallback when WebGL is unavailable or the device is weak or small. Headline and CTA must work before the 3D scene loads. Clean up GSAP / Lenis / Three resources on unmount.
Reason: Accessibility, reliability on demo hardware, and a usable page for every visitor.

### ADR-031 Landing page priority [Team-confirmed]
Decision: The landing page is prioritized earlier to be built alongside Phase 2 (Auth/Workspaces) and Phase 5 (Review UI), allowing public presentation while core review features are developed.
Source: The team's confirmation in TASK-004.

### ADR-032 Landing content honesty
Decision: Hero copy and the product-preview demo mention only capabilities that are implemented and tested. The preview uses sample data for a fictional company, labelled "Sample". No invented metrics, testimonials, logos or performance claims.
Reason: The rules forbid claiming unimplemented features and impressive-looking but unmeasured analytics.

### ADR-033 Environment configuration
Decision: One `.env` at the repo root (git-ignored). The server loads it through `config/env.js` (Zod-validated); Vite's `envDir` points to the repo root. Only `VITE_*` variables reach the browser and none may be secret. `.env.example` is committed.
Reason: One place to configure everything; no secrets in client code.

### ADR-034 Document precedence
Decision: If files disagree: explicit team statements → `DECISIONS.md` → the more specific file for the topic → then fix the files and note it in `MEMORY.md`. See the map in `RULES.md`.

## Pending (needs the team)

- Official build window confirmed: 48-hour sprint; deliverables: Live public deployment + GitHub repository + video demo (ADR-021)
- The three improvements for judging confirmed: (1) Brand-PDF Rule Extraction, (2) Accessibility & WCAG Compliance, (3) Repeated-Mistake Analytics; recorded in `docs/improvements.md`
- Confirmation of ADR-031: Confirmed; landing page prioritized earlier alongside Phase 2 / Phase 5.
- Assistant ADRs (ADR-009 through ADR-020): Confirmed and ratified by the team.
- Landing reference points & hero copy: Confirmed; deep obsidian aesthetic, procedural Three.js particle constellation, GSAP reveal, documented in `docs/landing.md`
- 3D hero asset approach: Confirmed procedural Three.js geometry/particle system (100% clean license, zero external GLB files)
- Whether the landing needs more sections or a navbar (ADR-026 says not yet)
- Hardware confirmed: 16 GB RAM, RTX 3050 6GB GPU, C: 19.8GB free, D: 326.7GB free; model plan logged in `docs/models.md`
- Final colours and fonts
- Fictional demo company name and rules
- Creator self-approval: Confirmed NO; manager or reviewer sign-off is strictly required.
- Verification of licenses: Completed; all permissive/free licenses logged in `docs/licences.md` and `docs/models.md`
- External AI/API service: None (₹0 budget, local-first inference).
