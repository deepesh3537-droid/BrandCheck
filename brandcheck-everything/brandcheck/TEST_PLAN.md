# Test Plan

> Defines what "working" means. Record only tests that were actually run. Never fabricate results or user-testing evidence. Status column: `Not run` until a real run happens.

## 1. Authentication

| Case | Expected | Status |
|---|---|---|
| Register with valid details | Account created | Not run |
| Register with an existing email | Clear error; no duplicate | Not run |
| Login with valid credentials | Session started | Not run |
| Login with invalid credentials | Error shown; no detail about which part failed | Not run |
| Logged-out user opens a protected page or API | Redirect / 401 | Not run |
| Repeated failed logins | Rate limited | Not run |

## 2. Workspace, roles and isolation

| Case | Expected | Status |
|---|---|---|
| Owner creates a workspace | Workspace exists; owner role set | Not run |
| Invitation link accepted before expiry | User joins with the invited role | Not run |
| Invitation link reused or expired | Rejected with a clear message | Not run |
| User from workspace A requests workspace B sources, content, reviews or findings (via the UI **and** direct API calls) | 403 / 404; no data returned | Not run |
| Creator tries owner-only actions (edit sources, invite) | Rejected server-side | Not run |
| Reviewer tries to edit content | Rejected server-side | Not run |
| Creator approves their own review | Rejected (if the team keeps that rule) | Not run |

## 3. Brand sources

| Case | Expected | Status |
|---|---|---|
| Add / edit / delete a term, fact, claim, tone guide | Saved and shown | Not run |
| Invalid or empty source input | Validation error | Not run |
| Review with no sources | Clear message; no invented findings | Not run |
| Conflicting sources (for example two different values for one fact) | Flagged as uncertain; human clarification requested | Not run |

## 4. Content submission

| Case | Expected | Status |
|---|---|---|
| Paste valid text | Stored as version 1 | Not run |
| Upload `.txt` / `.md` | Accepted and extracted | Not run |
| Empty input | Clear error | Not run |
| Unsupported file type (for example `.exe`, `.pdf` before it is implemented) | Clear error; not processed | Not run |
| Oversized file | Rejected with the limit stated | Not run |
| Malformed encoding | Clear error | Not run |

## 5. Review engine (seeded test set)

Build a labelled set from the fictional company (see `seed/`). For each item, record the expected findings and what the engine actually returned.

| Test item | Expected | Actual | Result |
|---|---|---|---|
| Wrong preferred term | Terminology finding with source | | Not run |
| Prohibited term | Terminology finding with source | | Not run |
| Fact conflicting with an approved fact | Fact finding with source | | Not run |
| Outdated figure | Fact finding with source | | Not run |
| Unsupported promotional claim | Claim finding | | Not run |
| Claim that **is** backed by an approved claim | No finding | | Not run |
| Off-tone wording | Tone finding marked uncertain | | Not run |
| Fully compliant content | No findings (or only justified ones) | | Not run |
| Content containing instructions aimed at the model ("ignore the rules…") | Treated as ordinary text; no behaviour change | | Not run |

Measure and report honestly: hits, misses, false positives on clean content. No numbers are quoted before they are measured.

Also check:
- Every `source_backed` finding references a real source item in the same workspace.
- A model-invented citation is downgraded to `uncertain`.
- Suggested corrections preserve the creator's meaning (manual review of each).
- Repeated runs on the same content give consistent results for the deterministic checks.

## 6. Decisions and content integrity

| Case | Expected | Status |
|---|---|---|
| Accept a suggestion | New version created; original untouched | Not run |
| Edit a suggestion | Chosen text applied only on explicit action | Not run |
| Reject / defer / challenge | Decision and note recorded; content unchanged | Not run |
| Original content after any decision | Still retrievable as version 1 | Not run |

## 7. Collaboration and history

| Case | Expected | Status |
|---|---|---|
| Creator shares a review with a reviewer | Reviewer sees the same content and report | Not run |
| Reviewer comments / requests changes | Status and comment visible to the creator | Not run |
| Reviewer approves | Status shown in the UI and stored | Not run |
| History view | Who did what and when, in order | Not run |

## 8. Failure and resilience

| Case | Expected | Status |
|---|---|---|
| Ollama not running | Rules-only review; skipped checks listed | Not run |
| Model call timeout | Review recorded as failed or partial; user told | Not run |
| Database unavailable | Friendly error; no crash | Not run |
| Network error in the UI | Error state with retry | Not run |
| Review still running when the page is closed | State recoverable on reopening | Not run |

## 9. Accessibility and usability (product app)

| Case | Expected | Status |
|---|---|---|
| Keyboard-only run through the core flow | Fully usable; visible focus | Not run |
| Contrast check on all text / background pairs | At least WCAG AA | Not run |
| Severity and status without colour | Icon and label still convey meaning | Not run |
| `prefers-reduced-motion` on | Non-essential animation disabled | Not run |

## 10. Landing page (public `/`)

| Case | Expected | Status |
|---|---|---|
| Open `/` signed out | Hero and product preview render; no API call is needed | Pass |
| Hero CTA | Goes to `/register`; to `/app` when already signed in; "Sign in" goes to `/login` | Pass |
| Headline and CTA before the 3D scene loads | Visible and usable | Pass |
| `prefers-reduced-motion` on | No Lenis, no scroll-pinning, no 3D; static content readable | Pass |
| WebGL unavailable or weak device | Static fallback; no errors | Pass |
| Keyboard only | CTA and links reachable with visible focus | Pass |
| Contrast of text over the 3D backdrop | At least WCAG AA | Pass |
| Product preview content | Labelled "Sample"; no invented metrics or unimplemented features | Pass |
| Navigate landing → product app → back | No leaked GSAP / Lenis / Three instances or console errors | Pass |
| Open `/app` and check the network tab | Landing and 3D chunks are **not** downloaded | Pass |
| Bundle size and load observations | Measured and recorded in `docs/testing-evidence.md`; no numbers quoted before measurement | Pass |

## 11. Responsive

Test at **375px**, **768px** and **1440px**. In the product app, panels collapse into tabs on small screens. On the landing page, sections reflow, and 3D is reduced or dropped on small screens. No content is cut off.

## 12. Security checks (see `SECURITY.md`)

- No secrets in the repository or client bundle (only `VITE_*` values; none secret).
- Logs contain no content or credentials.
- Uploads validated for type, size and filename.
- Parameterised queries only.

## 13. User testing

Plan structured sessions with a small number of creators and reviewers. Record: number of participants, tasks, time taken with and without the tool, and feedback. **State the real sample size. Do not claim results that were not collected.**

## 14. Bug log

| ID | Description | Found | Fixed | Notes |
|---|---|---|---|---|
| | | | | |
