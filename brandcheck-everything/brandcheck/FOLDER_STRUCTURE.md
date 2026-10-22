# Folder Structure

> The **single source of truth for where files live.** `ARCHITECTURE.md` links here. If a new folder is needed, update this file in the same change (see `RULES.md`).
> Plain folders, one repo: `client/` and `server/` each have their own `package.json` (ADR-027). Language: JavaScript, ES modules (ADR-005).
> The landing page lives **inside the client app** (ADR-024). Planned landing sections: **hero + product preview only** (ADR-026). Landing libraries: GSAP, Framer Motion, Lenis, Three.js / React Three Fiber (ADR-025).

## Top Level

```
brandcheck/
├── client/                  # React + Vite app (landing page + product app)
├── server/                  # Node + Express API and review engine
├── seed/                    # Fictional company: sources + sample content (dev/demo only)
├── docs/                    # Setup guide, models, licences, disclosures, evidence
├── .env.example             # committed template; real values go in the root .env (git-ignored)
├── .gitignore
├── README.md                # Setup steps, supported checks, known limitations
├── PRD.md
├── ARCHITECTURE.md
├── FOLDER_STRUCTURE.md
├── DESIGN.md
├── RULES.md
├── TASKS.md
├── DECISIONS.md
├── MEMORY.md
├── TEST_PLAN.md
└── SECURITY.md
```

**Environment:** one `.env` at the repo root (ADR-033). The server reads it through `server/src/config/env.js`; Vite's `envDir` is set to the repo root. Only `VITE_*` values reach the browser, and none may be secret.

## `client/`

```
client/
├── index.html
├── package.json
├── vite.config.js            # envDir points to the repo root; Vitest config
├── tailwind.config.js        # theme tokens mirror DESIGN.md
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
├── public/
│   ├── favicon.svg
│   └── models/               # optional compressed .glb for the 3D hero (licence verified)
└── src/
    ├── main.jsx
    ├── app/
    │   ├── App.jsx
    │   ├── router.jsx        # React Router (ADR-028): "/" landing, "/login", "/register", "/invite/:token", "/app/*"
    │   ├── providers/        # AuthProvider, QueryProvider, ToastProvider
    │   ├── layouts/
    │   │   ├── LandingLayout.jsx
    │   │   ├── AuthLayout.jsx
    │   │   └── WorkspaceLayout.jsx   # 3-panel shell (top bar, left, centre, right)
    │   └── guards/
    │       └── RequireAuth.jsx       # UI mirror only; the server enforces access
    │
    ├── features/
    │   ├── landing/                  # public landing page (see below)
    │   ├── auth/
    │   ├── workspace/                # create workspace, members, invitations
    │   ├── sources/                  # brand source library (left panel)
    │   ├── content/                  # paste / upload content, editor, highlights (centre)
    │   ├── review/                   # findings list, finding card, evidence chip, diff, decisions (right)
    │   ├── collaboration/            # share, comments, request changes, approve
    │   ├── history/                  # revision + decision history
    │   └── report/                   # report built from real findings and decisions
    │
    ├── components/                   # shared UI, no feature logic
    │   ├── ui/                       # Button, Card, Badge, Dialog, Input, Tabs, Toast, Skeleton
    │   ├── layout/                   # ResizablePanel, TopBar, PanelHeader
    │   ├── feedback/                 # EmptyState, ErrorState, LoadingState
    │   └── icons/                    # thin wrappers around Lucide
    │
    ├── services/                     # API client functions only; no UI
    │   ├── apiClient.js
    │   ├── authService.js
    │   ├── workspaceService.js
    │   ├── sourceService.js
    │   ├── contentService.js
    │   ├── reviewService.js
    │   └── collaborationService.js
    │
    ├── hooks/                        # shared hooks (useMediaQuery, usePrefersReducedMotion, useHotkeys)
    ├── lib/                          # pure helpers (formatDate, cn, constants)
    ├── test/
    │   └── setup.js                  # Vitest + Testing Library setup
    └── styles/
        ├── index.css                 # Tailwind layers + CSS variables from DESIGN.md
        └── fonts.css                 # self-hosted Inter and JetBrains Mono
```

Client tests are **co-located** with the code they test (`Component.test.jsx`), per ADR-022.

### `client/src/features/landing/`

Scope for now: **hero + product preview.** Add folders only when the team adds sections.

```
features/landing/
├── LandingPage.jsx               # composes sections; sets up smooth scroll + GSAP context
├── sections/
│   ├── Hero/
│   │   ├── Hero.jsx              # headline, lead text, primary CTA, "Sign in" link
│   │   ├── HeroHeadline.jsx      # split-text reveal (GSAP)
│   │   ├── HeroBackdrop.jsx      # lazy-loaded 3D scene host, with static fallback
│   │   └── hero.copy.js          # all text in one place; implemented capabilities only
│   └── ProductPreview/
│       ├── ProductPreview.jsx    # scroll-pinned demo of the three-panel review UI
│       ├── PreviewShell.jsx      # fake top bar + left / centre / right panels
│       ├── PreviewContent.jsx    # sample text with animated highlights
│       ├── PreviewReport.jsx     # sample findings appearing one by one
│       └── preview.script.js     # scripted storyline (what appears at each scroll step)
├── three/                        # Three.js / React Three Fiber, isolated and code-split
│   ├── HeroScene.jsx             # <Canvas> + camera + lights
│   ├── objects/                  # meshes / particle field / grid
│   ├── shaders/                  # optional GLSL files
│   └── useSceneQuality.js        # lowers quality or disables 3D on weak devices
├── animation/
│   ├── gsap.js                   # the single place GSAP + ScrollTrigger are registered
│   ├── lenis.js                  # Lenis setup, synced with ScrollTrigger; landing route only
│   ├── variants.js               # Framer Motion variants (fade, rise, stagger)
│   ├── easings.js                # landing durations and easings (DESIGN.md: landing 400-1200ms, product 120-240ms)
│   └── useScrollTimeline.js      # hook wrapping gsap.context for cleanup
├── components/                   # landing-only pieces (GlowButton, GradientText, GridBackground)
├── data/
│   └── previewSample.js          # sample content for a fictional company, labelled "Sample"
└── landing.css                   # only if Tailwind utilities are not enough
```

**Who animates what (ADR-029):**
- **GSAP + ScrollTrigger:** scroll-driven and pinned sequences (product preview), text splitting, timeline choreography. Landing only.
- **Framer Motion:** component mount/unmount, hover and tap states, layout and presence animations. Used on the landing page **and** in the product app.
- **Lenis:** smooth scrolling, synced with ScrollTrigger in `animation/lenis.js`. Landing route only.
- **Three.js / R3F:** hero backdrop only; lazy-loaded with `React.lazy` so the product app never downloads it.

**Landing performance and accessibility rules (ADR-030, ADR-032):**
- Landing code is its own chunk; the product app does not pay for it.
- Respect `prefers-reduced-motion`: disable Lenis, scroll-pinning and 3D, and show static content.
- Provide a static fallback when WebGL is unavailable or the device is weak (`useSceneQuality`).
- All preview content is sample data labelled as such; no invented metrics.
- The page stays readable and the CTA reachable by keyboard without any animation.
- Clean up GSAP, Lenis and Three resources on unmount.

## `server/`

```
server/
├── package.json
├── eslint.config.js
├── migrations/                   # numbered plain SQL files; match the data model in ARCHITECTURE.md
│   ├── 001_users.sql
│   ├── 002_workspaces_members.sql
│   ├── 003_invitations.sql
│   ├── 004_source_items.sql
│   ├── 005_contents_versions.sql
│   ├── 006_reviews_findings.sql
│   ├── 007_comments_events.sql
│   └── README.md
├── src/
│   ├── index.js                  # starts the server
│   ├── app.js                    # Express app, middleware, route mounting
│   ├── config/
│   │   └── env.js                # reads and validates the root .env with Zod
│   ├── routes/                   # thin HTTP handlers
│   │   ├── auth.routes.js
│   │   ├── workspaces.routes.js
│   │   ├── invitations.routes.js
│   │   ├── sources.routes.js
│   │   ├── contents.routes.js
│   │   ├── reviews.routes.js
│   │   ├── findings.routes.js
│   │   └── comments.routes.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   ├── requireWorkspaceRole.js
│   │   ├── validate.js           # Zod request validation
│   │   ├── upload.js             # type / size / filename / encoding checks
│   │   ├── rateLimit.js
│   │   └── errorHandler.js
│   ├── schemas/                  # Zod schemas (requests, findings, model output)
│   ├── services/                 # business logic + DB access
│   │   ├── authService.js
│   │   ├── workspaceService.js
│   │   ├── sourceService.js
│   │   ├── contentService.js
│   │   ├── reviewService.js
│   │   ├── findingService.js
│   │   ├── commentService.js
│   │   └── historyService.js
│   ├── review/                   # pure pipeline: content + sources in, findings out
│   │   ├── orchestrator.js
│   │   ├── segment.js            # sentences/paragraphs with offsets
│   │   ├── retrieve.js           # MiniLM embeddings + cosine similarity
│   │   ├── normalise.js          # enforces source_backed vs uncertain
│   │   ├── rules/
│   │   │   ├── terminology.js
│   │   │   ├── facts.js
│   │   │   ├── claims.js
│   │   │   └── index.js
│   │   └── models/
│   │       ├── embeddings.js     # all-MiniLM-L6-v2
│   │       ├── tone.js           # DeBERTa zero-shot
│   │       ├── explain.js        # Qwen3-4B via Ollama
│   │       └── availability.js   # detects missing models; drives rules-only fallback
│   ├── db/
│   │   ├── pool.js
│   │   ├── migrate.js
│   │   └── queries/              # SQL helpers (parameterised only)
│   └── lib/
│       ├── logger.js             # never logs content or credentials
│       └── errors.js
├── tests/
│   ├── api/                      # Supertest: auth, isolation, uploads
│   ├── review/                   # rule tests + seeded test set runner
│   └── fixtures/
└── .model-cache/                 # git-ignored (MODEL_CACHE_DIR resolves here)
```

## `seed/`

```
seed/
├── README.md                     # states the company is fictional
├── company.json                  # name TBD
├── sources/
│   ├── terms.json
│   ├── facts.json
│   ├── claims.json
│   └── tone-guide.md
├── content/
│   ├── with-issues/              # deliberate issues: wrong term, conflicting fact, unsupported claim, off-tone
│   └── clean/                    # compliant content (must not be over-flagged)
└── expected-findings.json        # labelled expectations for TEST_PLAN section 5
```

The landing page's `data/previewSample.js` may reuse this fictional company but is a separate file with sample text only.

## `docs/`

```
docs/
├── setup.md                      # fresh-machine setup (Node, PostgreSQL, Ollama, models)
├── models.md                     # chosen models, hardware notes, spike results (TASK-015)
├── licences.md                   # verified licences: models, libraries, fonts, 3D assets (TASK-006)
├── disclosures.md                # AI assistance, reused code, external services (TASK-007, TASK-094)
├── testing-evidence.md           # only tests actually run, and real measurements (TASK-077, TASK-093)
└── limitations-and-roadmap.md
```

## Dependencies Planned for the Client

| Package | Purpose | Note |
|---|---|---|
| `react`, `react-dom`, `react-router-dom` | App and routing | Router per ADR-028 |
| `tailwindcss`, `lucide-react` | Styling and icons | Agreed stack |
| `framer-motion` (or its renamed package `motion`) | Component animation (product app + landing) | Verify the current package name and licence |
| `gsap` (+ ScrollTrigger, `@gsap/react`) | Landing scroll and timeline animation | Verify current licence terms |
| `lenis` | Landing smooth scrolling | |
| `three`, `@react-three/fiber`, `@react-three/drei` | Landing 3D hero | Lazy-loaded; `drei` optional |
| `@fontsource/inter`, `@fontsource/jetbrains-mono` | Self-hosted fonts | Provisional (see `DESIGN.md`) |
| `vitest`, `@testing-library/react` | Tests | ADR-022 |

Versions are pinned at setup and recorded in `MEMORY.md`. Licences are recorded in `docs/licences.md` before use.

## Rules This Structure Enforces

- Components never contain API or database logic; they use `services/` through hooks.
- Landing code never imports from product features, and product features never import from `features/landing/`.
- GSAP, Lenis and Three.js are imported only inside `features/landing/`.
- Shared UI lives in `components/`; landing-only pieces stay in `features/landing/components/`.
- Server routes stay thin; business logic and SQL live in `services/` and `db/`.
- The review engine never writes to the database; services persist its results.
- Video code, if ever built, gets its own `server/src/video/` and `client/src/features/video/`, never wired into the core flow.

## Open Items (also in `DECISIONS.md` → Pending)

- Landing sections beyond hero and product preview (navbar, problem stats, comparison, team, footer) are **not planned**.
- Whether the 3D hero uses a custom model or generated geometry / particles (affects `public/models/`).
- Landing reference points from Google Antigravity's feel, and the hero copy direction.
- Final colours and fonts (pending from the team).
