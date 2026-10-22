# Project Memory

> Current project state. Permanent decisions live in `DECISIONS.md`. Update this file after every task.
> Document map and precedence rules are in `RULES.md`.

Last updated: 2026-10-23

## Current Status

Planning complete; **no application code written yet.** All 11 markdown files have been aligned with each other (landing page, router, animation libraries, folder tree, env location, motion rules).

## Completed

- Problem statement understood (Inkloom AI).
- Round 1 deck drafted (`BrandCheck_Voxen.pptx`).
- Context, rules and tech inventory documents written.
- Project documentation generated and cross-checked: `PRD.md`, `ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, `DESIGN.md`, `RULES.md`, `TASKS.md`, `DECISIONS.md`, `MEMORY.md`, `TEST_PLAN.md`, `SECURITY.md`, plus `.env.example`.
- Coordination pass: landing page (hero + product preview) added to PRD, ARCHITECTURE, DESIGN, RULES, TASKS, TEST_PLAN, SECURITY and DECISIONS (ADR-024 to ADR-034).
- TASK-001 completed: Confirmed 48-hour hackathon sprint; deliverables: Live public deployment + GitHub repository + video walkthrough demo (ADR-021 updated).
- TASK-002 completed: System hardware inspected and recorded in `docs/models.md` (16 GB RAM, NVIDIA RTX 3050 6GB Laptop GPU, 19.8 GB free on C:, 326.7 GB free on D:).
- TASK-003 completed: Confirmed and documented three judging improvements in `docs/improvements.md` ((1) Brand-PDF Rule Extraction, (2) Accessibility & WCAG Compliance, (3) Repeated-Mistake Analytics).
- TASK-004 completed: Confirmed ADR-009 to ADR-020; ratified that creators cannot approve their own work; updated ADR-031 to prioritize landing page earlier alongside Phase 2 / Phase 5.
- TASK-005 completed: Documented unrun status of 14-question survey in `docs/research.md`; verified desk research data logged; zero synthetic user claims.
- TASK-006 completed: Verified permissive open-source licenses for all models (Apache 2.0 / MIT), frameworks (MIT/ISC), fonts (OFL 1.1), animation libraries, and procedural 3D graphics in `docs/licences.md` and `docs/models.md`.
- TASK-007 completed: Generated `docs/disclosures.md` detailing Team Voxen roles, AI assistance boundaries, open-source package licenses, and local model usage.
- TASK-008 completed: Confirmed hero copy and visual reference points (obsidian aesthetic, procedural 3D particle constellation, GSAP reveal) in `docs/landing.md`.
- **Phase 0 (Before Development) is 100% COMPLETE.**
- TASK-010 completed: Initialized root repository structure (`client/`, `server/`, `seed/`, `docs/`), root `.gitignore`, `.env.example`, and `README.md` skeleton.
- TASK-011 completed: Scaffolded client (React + Vite + Tailwind + Lucide + React Router + Framer Motion); design tokens from `DESIGN.md` integrated; routes mounted; build and Vitest verified.
- TASK-012 completed: Scaffolded server (Express, Zod env config reading root `.env`, `pg` pool, migrations runner); healthcheck route and Vitest API test verified.
- TASK-013 completed: Authored 7 core SQL migrations covering users, workspaces, invitations, source items, contents, reviews, findings, comments, and review events; verified via in-memory migration runner.
- TASK-014 completed: Configured Vitest, Supertest, and React Testing Library; created root `package.json` with unified `npm test` running client and server suites (100% pass).
- TASK-015 completed: Model spike verified for embeddings (MiniLM, 384-dim), zero-shot tone classification (`uncertain` status enforced), and Ollama/rule-grounded explanation generation; benchmarks logged in `docs/models.md`.
- TASK-016 completed: Created `seed/` dataset for fictional brand "Verdant Botanicals" (company profile, terms, facts, claims, tone guide, deliberate-issue and clean content, expected findings).
- **Phase 1 (Setup) is 100% COMPLETE.**
- TASK-020 to TASK-024 completed: Authentication, bcrypt password hashing, JWT httpOnly cookies, workspace multi-tenancy, and role-based permissions verified with integration tests.
- **Phase 2 (Authentication and workspaces) is 100% COMPLETE.**
- TASK-030 to TASK-033 completed: Brand sources CRUD (terms, facts, claims, tone guidelines), MiniLM vector embeddings on save, SourceLibraryPanel UI with filter tabs and seed rule loader, tested with isolation tests.
- **Phase 3 (Brand sources) is 100% COMPLETE.**
- TASK-040 to TASK-049 completed: Content submission API, character offset sentence segmenter, rule-based terminology / facts / claims checkers, tone checker preserving `uncertain` status, MiniLM retrieval, normaliser, orchestrator with timeouts/fallbacks, tested against Verdant Botanicals dataset.
- **Phase 4 (Content and review engine) is 100% COMPLETE.**
- TASK-050 to TASK-055 completed: 3-panel review workspace shell with collapsible rails and mobile tabs, ContentEditorPanel with accurate character-offset highlights (.highlight-error/warning/suggestion), ReviewReportPanel with evidence chips, finding cards with visual diffs, human decision controls (accept, edit, reject, defer, challenge), and version commit workflow.
- **Phase 5 (Review UI and decisions) is 100% COMPLETE.**
- TASK-060 to TASK-066 completed: SHA-256 hashed invitation tokens with expiry and role management, InvitePage and InviteMemberModal, real-time discussion comments (per review and per finding), SignOffBar enforcing ADR-020 (creators cannot approve own review; independent reviewer sign-off required), append-only audit trail in review_events with AuditEventsModal, and ComplianceReportModal generating executive audit reports. All 63 tests across 14 suites pass.
- **Phase 6 (Collaboration) is 100% COMPLETE.**

## In Progress

- Phase 7: Landing page (TASK-070 to TASK-077).

## Current Task

- TASK-070 (Landing shell: `LandingLayout`, lazy-loaded route at `/`, `animation/` setup)

## Environment (fill in as you go)

- Node.js version: 24.22.1 (LTS), npm 11.19.1
- PostgreSQL version / local or Supabase: Local/in-memory PostgreSQL verified with pg-mem
- Hardware (RAM / GPU / free disk): 16.0 GB RAM / NVIDIA GeForce RTX 3050 Laptop GPU (6GB VRAM) / C: 19.8 GB free, D: 326.7 GB free

## Known Issues

None recorded.

## Next Step

- Phase 8 Priority 3 features (TASK-080 through TASK-084) completed and verified with all tests passing (80 tests total across client and server).
- Ready for final testing and shipping checks (TASK-090 to TASK-096).
