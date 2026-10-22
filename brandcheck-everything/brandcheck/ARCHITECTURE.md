# Architecture

> Architecture = HOW. For WHAT and WHY, see `PRD.md`. For WHERE files live, see `FOLDER_STRUCTURE.md` (the single source of truth for the tree). For the look and feel, see `DESIGN.md`.
> Items marked **[Decided]** were chosen by the assistant on the team's behalf; items marked **[Team]** were chosen by the team. See `DECISIONS.md` for reasons and alternatives. Versions are pinned at setup time and recorded in `MEMORY.md`.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | **JavaScript (ES modules)** [Team] | JSDoc for key shapes (ADR-005) |
| Frontend | React + Vite [Team] | One single-page app containing the landing page **and** the product app (ADR-024) |
| Routing | React Router **[Decided]** | `/` landing, `/login`, `/register`, `/invite/:token`, `/app/*` product (ADR-028) |
| Styling | Tailwind CSS; Lucide icons; shadcn/ui optional [Team] | Dark theme; see `DESIGN.md` |
| Product-app motion | CSS / Tailwind transitions + Framer Motion | Mount / unmount, hover, layout (ADR-029) |
| Landing motion | GSAP + ScrollTrigger, Framer Motion, Lenis [Team] | Landing route only, code-split (ADR-025, ADR-029) |
| Landing 3D | Three.js + React Three Fiber [Team] | Hero backdrop only, lazy-loaded (ADR-025, ADR-030) |
| Backend | Node.js + Express [Team] | REST API |
| Validation | Zod | Request bodies, params, query, env, **and model outputs** |
| Database | PostgreSQL | **[Decided]** Local PostgreSQL primary; Supabase Free Postgres optional, after verifying current limits (ADR-010) |
| DB access | `pg` driver + plain SQL migrations | **[Decided]** No ORM |
| Authentication | Express-managed email + password | **[Decided]** `bcryptjs`; signed JWT in an httpOnly cookie (ADR-009) |
| File storage | None in v1 | **[Decided]** Text lives in PostgreSQL; logo / asset files (Priority 3) on local disk, git-ignored (ADR-011) |
| Embeddings | `all-MiniLM-L6-v2` | **[Decided]** In Node via `@huggingface/transformers` (ONNX); verify in the spike (ADR-018) |
| Tone classifier | `MoritzLaurer/DeBERTa-v3-base-mnli` | Zero-shot; verify licence and ONNX availability |
| Explanations / fixes | `Qwen/Qwen3-4B-Instruct-2507` | **[Decided]** Local, via Ollama over HTTP; verify the exact tag and hardware fit |
| Tests | Vitest (+ Supertest for API, Testing Library for UI) | **[Decided]** One Playwright end-to-end flow if time permits (ADR-022) |
| Configuration | One root `.env` | **[Decided]** Server loads it; Vite `envDir` points to the repo root; only `VITE_*` values reach the browser (ADR-033) |
| Deployment | Local run for the demo | **[Decided]** Local models need local hardware; hosted deployment optional (ADR-021) |

Model and library licences (including GSAP, Framer Motion / `motion`, Lenis, Three.js, React Three Fiber, fonts and any 3D asset) **must be verified** before use and recorded in `docs/licences.md`.

## Diagram

```
Visitor / User
  ↓
React app (Vite)
  ├─ "/"        Landing page (public; code-split; GSAP · Framer Motion · Lenis · R3F)
  ├─ "/login", "/register", "/invite/:token"   (public)
  └─ "/app/*"   Product app: 3-panel review UI (private)
        ↓  HTTPS/JSON (cookie auth)
Express API ── auth, workspace membership, role checks, Zod validation
  ↓
Services layer (workspaces, sources, content, reviews, comments)
  ├──→ PostgreSQL (sources, content versions, findings, decisions, history)
  └──→ Review Orchestrator
         ├─ 1. Retrieve   : MiniLM embeddings → relevant approved sources
         ├─ 2. Check      : deterministic rules; DeBERTa tone score
         ├─ 3. Explain    : Qwen3-4B (Ollama) → grounded explanation + fix
         └─ 4. Normalise  : Zod-validated finding records (source-backed | uncertain)
```

The landing page never calls the API. It uses clearly labelled sample data only.

## Client Routes (initial) **[Decided]**

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page (hero + product preview) |
| `/login`, `/register` | Public | Authentication |
| `/invite/:token` | Public → then login | Accept a workspace invitation |
| `/app` | Private | Workspace list / create workspace |
| `/app/w/:workspaceId` | Private | Workspace: sources, content, review (3-panel shell) |
| `/app/w/:workspaceId/reviews/:reviewId` | Private | A specific review and report |

Route guards in the UI only mirror what the server enforces.

## Review Pipeline Detail

1. **Prepare.** Load the content version and split it into segments (sentences / paragraphs) with character offsets, so findings can be highlighted precisely.
2. **Retrieve.** Compare segment embeddings with the embeddings of the workspace's source items. Source embeddings are computed when a source is saved and stored in PostgreSQL as `real[]`; cosine similarity is computed in Node. No `pgvector` (ADR-017).
3. **Deterministic checks.** Prohibited / preferred terms; approved-fact conflicts; promotional-claim patterns (absolutes, health or superiority claims) with a lookup for an approved supporting claim.
4. **Model-assisted checks.** DeBERTa scores tone against brand-voice labels from the tone guide. Qwen3-4B drafts the explanation and suggested correction using only the retrieved sources.
5. **Normalise.** Every result becomes one finding record (schema below).
6. **Evidence rule.** A finding is `source_backed` only if it cites a real `source_item_id` from the same workspace. Anything else is stored as `uncertain`. The server drops or downgrades model-invented citations.
7. **Fallback.** If a model or Ollama is unavailable, the review still runs the deterministic checks and reports which model-assisted checks were skipped. Nothing is silently omitted.

## Finding Schema (one normalised shape)

```js
{
  id,                 // uuid
  review_id,
  category,           // 'terminology' | 'fact' | 'claim' | 'tone' (later: 'visual' | 'accessibility')
  severity,           // 'error' | 'warning' | 'suggestion'
  evidence_status,    // 'source_backed' | 'uncertain'
  span_start, span_end, flagged_text,
  explanation,        // plain language: what, why it matters
  source_item_id,     // nullable; must exist in this workspace when source_backed
  suggested_text,     // nullable
  confidence,         // nullable; only a real model/rule output, never invented
  origin,             // 'rule' | 'model'
  decision,           // 'pending' | 'accepted' | 'edited' | 'rejected' | 'deferred' | 'challenged'
  decision_text,      // text the creator chose when edited
  decision_note,      // reason, especially for challenge/reject
  decided_by, decided_at
}
```

## Data Model (core tables)

- `users` (id, email, password_hash, display_name, created_at)
- `workspaces` (id, name, created_by, created_at)
- `workspace_members` (workspace_id, user_id, role: `owner` | `creator` | `reviewer`)
- `invitations` (id, workspace_id, role, token_hash, expires_at, used_at, created_by)
- `source_items` (id, workspace_id, type: `guideline` | `term` | `fact` | `claim` | `tone`, title, body, structured jsonb, embedding real[], version, active, created_by)
- `contents` (id, workspace_id, title, created_by)
- `content_versions` (id, content_id, version_no, body, created_by, created_at). The original is version 1 and is never edited.
- `reviews` (id, content_version_id, status: `running` | `ready` | `failed` | `in_review` | `changes_requested` | `approved`, models_used jsonb, skipped_checks jsonb, created_at)
- `findings` (see schema above)
- `comments` (id, review_id, finding_id nullable, author_id, body, created_at)
- `review_events` (id, review_id, actor_id, type, payload jsonb, created_at). Append-only audit trail.

Every table that holds workspace data carries (or joins to) `workspace_id`; every query is scoped by it. These match the migrations listed in `FOLDER_STRUCTURE.md`.

## API Surface (initial; REST, JSON)

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `POST /api/workspaces`, `GET /api/workspaces/:id`
- `POST /api/workspaces/:id/invitations`, `POST /api/invitations/:token/accept`
- `GET|POST|PATCH|DELETE /api/workspaces/:id/sources`
- `POST /api/workspaces/:id/contents` (paste or `.txt`/`.md` upload), `GET /api/contents/:id`
- `POST /api/contents/:id/reviews`, `GET /api/reviews/:id`
- `PATCH /api/findings/:id/decision`
- `POST /api/reviews/:id/share`, `POST /api/reviews/:id/comments`
- `POST /api/reviews/:id/request-changes`, `POST /api/reviews/:id/approve`
- `GET /api/reviews/:id/history`, `GET /api/reviews/:id/report`

The landing page uses none of these.

## Folder Structure

See **`FOLDER_STRUCTURE.md`** for the full tree. In brief: `client/` (landing in `features/landing/`, product in the other `features/*`), `server/` (routes → services → review engine / db), `seed/` (fictional company), `docs/`. Plain folders with their own `package.json`; no workspaces monorepo (ADR-027).

## Architectural Rules

- UI components contain no database or API-fetch logic; they call `services/` through feature hooks.
- Route handlers are thin: validate (Zod), authorise, call a service, return.
- All database access lives in `server/src/services` / `db`; never in routes or the review engine's rule files.
- Authentication and role checks are enforced **server-side** on every route. The UI only mirrors them.
- Every query on workspace data is scoped by `workspace_id`; membership is verified before data access.
- The review engine is a pure pipeline: content + sources in, validated findings out. It does not write to the database. The service layer persists the result.
- All model output is validated with Zod and treated as untrusted data. Content under review is data, never instructions.
- Each check lives in its own module under `server/src/review/rules/` so it can be tested and claimed independently.
- Config and secrets come from environment variables only (see `.env.example`).
- **Landing isolation:** `features/landing/` never imports from product features, and product features never import from it. GSAP, Lenis and Three.js are imported only inside `features/landing/`.
- **Code splitting:** the landing route and the 3D scene are lazy-loaded so the product app does not download them.
- Video code, if ever added, lives in a separate module and is never wired into the core review flow.

## Reliability Notes

- Review runs are asynchronous from the UI's point of view (status `running` → `ready` | `failed`) so a slow local model does not freeze the page.
- Timeouts and clear errors for model calls; failures are recorded on the review.
- Model weights are downloaded once and cached locally in `server/.model-cache/` (git-ignored).
- The landing page degrades gracefully: reduced-motion, no-WebGL and weak-device paths show static content (ADR-030).
