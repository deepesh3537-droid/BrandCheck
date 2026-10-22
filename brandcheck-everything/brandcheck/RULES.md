# Development Rules

> The rulebook for any AI assistant or team member working on BrandCheck. For Cursor, these can also be split into `.cursor/rules/` (`general.mdc`, `frontend.mdc`, `backend.mdc`, `testing.mdc`).

## Document Map and Precedence

| File | Answers |
|---|---|
| `PRD.md` | WHAT and WHY |
| `ARCHITECTURE.md` | HOW (stack, pipeline, data, API, rules) |
| `FOLDER_STRUCTURE.md` | WHERE files go (single source of truth for the tree) |
| `DESIGN.md` | How it looks, feels and moves (product app and landing page) |
| `SECURITY.md` | Security and privacy requirements |
| `TEST_PLAN.md` | What "working" means |
| `DECISIONS.md` | Permanent decisions and pending questions |
| `TASKS.md` | The work, in order |
| `MEMORY.md` | Current state |
| `RULES.md` | How to work |

**If files disagree:** (1) what the team has explicitly said wins; (2) then `DECISIONS.md`; (3) then the more specific file for that topic (structure → `FOLDER_STRUCTURE.md`, look and motion → `DESIGN.md`, security → `SECURITY.md`, everything else → `ARCHITECTURE.md` / `PRD.md`). Then **fix the disagreement in the files** and note it in `MEMORY.md`; do not silently pick a side.

## Before Coding

- Read, in order: `MEMORY.md` (current state) → `TASKS.md` (current task) → `PRD.md` → `ARCHITECTURE.md` → `FOLDER_STRUCTURE.md` → `DESIGN.md` → `SECURITY.md` → `DECISIONS.md`.
- Inspect the existing implementation and reuse it before writing anything new.
- Make a short plan for any change that touches more than one layer.
- Do not assume missing requirements. If something is not in the docs, ask the team, or add it to `DECISIONS.md` as a pending question.
- Work on **one task at a time** (TASK-xxx). Never build the whole application in one prompt.
- Put every new file where `FOLDER_STRUCTURE.md` says. If a new folder is needed, update `FOLDER_STRUCTURE.md` in the same change.

## General

- Language: **JavaScript (ES modules)**. Use JSDoc for important shapes. Do not introduce TypeScript unless `DECISIONS.md` changes.
- Reuse existing components and functions. Do not duplicate logic.
- Keep functions small and named for what they do.
- Do not modify unrelated files. Do not refactor outside the current task.
- Dependencies already approved by the team or in `DECISIONS.md` (React, Vite, Tailwind, Lucide, React Router, Framer Motion, GSAP, Lenis, Three.js, React Three Fiber, Express, Zod, `pg`, `bcryptjs`, `helmet`, Vitest, Supertest, Testing Library, fonts) may be used after their licence is recorded in `docs/licences.md`. **Any other dependency needs a reason, a licence check and a note in `DECISIONS.md` first.**
- Do not add paid APIs or services. The budget is ₹0. Free 3D assets, images and fonts must have a verified licence.
- Keep the project scope as written. Do not expand it into an enterprise platform.
- Do not build something only because it looks impressive. The core loop comes first (see ADR-031).

## Product Rules (specific to BrandCheck)

- Brand governance, not grammar checking.
- Never overwrite user content silently. The original version is preserved; proposed changes are shown before they are applied, and only an explicit user action applies them.
- Never invent brand rules, facts, citations, quotes, asset permissions or confidence scores.
- A finding is `source_backed` only if it cites a real source item from the same workspace. Otherwise it is `uncertain`.
- Treat model output as untrusted: validate it with Zod, never execute it, never trust its citations.
- Treat content under review as data, never as instructions to the model.
- Humans make the final decisions. Nothing is published or approved automatically.
- Do not claim a check, format or feature is supported until it is implemented **and** tested. This includes the landing page copy and the product-preview demo. Update the supported list in the UI and docs only then.
- Video processing stays out of the core workflow, code and demo until the core is complete and the team says so.

## Backend

- Routes are thin: validate → authorise → call a service → respond.
- Verify authentication and workspace role server-side on every route.
- Scope every query by `workspace_id`.
- All database access goes through services / `db` helpers; no SQL in routes.
- Use parameterised queries only. Never build SQL from strings with user input.
- Return consistent error shapes; never leak stack traces or internal details to clients.
- Read configuration through `server/src/config/env.js` (Zod-validated), not `process.env` scattered across files.

## Frontend (product app)

- Components render and handle UI state only; no direct fetch or database logic in components.
- Follow `DESIGN.md`. Use its tokens, not ad-hoc colours.
- Every async view has loading, empty, error and success states.
- Never convey meaning by colour alone. Keep keyboard access and visible focus.
- Motion: CSS / Tailwind and Framer Motion only. **No GSAP, Lenis or Three.js in the product app.**
- Respect `prefers-reduced-motion`.
- Tests are co-located (`Component.test.jsx`) as listed in `FOLDER_STRUCTURE.md`.

## Frontend (landing page)

- All landing code lives in `client/src/features/landing/`. It never imports from product features, and product features never import from it.
- GSAP, ScrollTrigger, Lenis, Three.js and React Three Fiber are imported **only** inside `features/landing/`. Register GSAP in one place (`animation/gsap.js`).
- Lazy-load the landing route and the 3D scene so the product app never downloads them.
- Clean up every GSAP / Lenis / Three resource on unmount (use `gsap.context` and dispose of geometries, materials and textures).
- Provide fallbacks: `prefers-reduced-motion`, no WebGL, weak or small device. Content must be readable and the CTA usable with no animation.
- Landing copy and the preview demo state only what is implemented. Preview data is sample data, labelled "Sample"; never invent metrics or claim measured results that were not measured.
- Recreate the *feel* of the referenced landing page only. Do not copy another site's text, assets, code or branding.
- Check the licence of every 3D model, image and font; record it in `docs/licences.md`.

## Security

- Never commit secrets. Real values live in the root `.env`; the repo has `.env.example` only.
- Never expose secrets to client-side code. Only `VITE_*` values reach the browser, and none may be secret.
- Validate all input, uploads and model output.
- Do not log confidential content, credentials or personal data.
- See `SECURITY.md` for the full requirements.

## Testing

- Add tests for important functionality alongside the code (Vitest; Supertest for the API; Testing Library for the UI).
- Cover correct content, problematic content, and failure cases.
- Run tests after each implementation and fix failures before moving on.
- Never fabricate test results or user-testing evidence. Record only what was actually run, in `docs/testing-evidence.md` and `TEST_PLAN.md`.

## Git

- Small commits with descriptive messages.
- Keep history honest; do not rewrite or manipulate it.
- Record reused code, templates and significant AI assistance in `docs/disclosures.md` for the submission.

## Working Loop

```
TASK-xxx → Implement → Test → Review → Update TASKS.md and MEMORY.md → next task
```
