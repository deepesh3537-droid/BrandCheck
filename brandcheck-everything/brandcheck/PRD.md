# Product Requirements Document

> PRD = WHAT + WHY. For HOW, see `ARCHITECTURE.md`. For WHERE files go, see `FOLDER_STRUCTURE.md`. For the look and feel, see `DESIGN.md`.
> Items marked **[Decided]** were chosen by the assistant on the team's behalf and can be overridden. See `DECISIONS.md`.

## Product

**BrandCheck** by Team Voxen (Deepesh Kumar Prajapati, Kajal, Som Sahu, Pragya Singh).
Problem statement by Inkloom AI. The project name is taken from the team's deck and can be changed.

Tagline: *Brand governance before you hit publish.*

## Problem

Employees, agencies and AI tools publish content quickly. Wrong claims, outdated facts, off-brand language and inaccessible visuals can reach the public before anyone checks them. Many organisations have brand guidelines, but nothing enforces them before publication.

Evidence (taken from the team's Round 1 deck; re-verify each figure and source before reusing it in any submission):
- ASCI Annual Report 2025-26: 98% of 9,841 reviewed ads needed modification; 27.5% of violations involved misleading claims.
- ASCI Half-Yearly 2025-26: 61% of food and beverage violations (211 ads) were misleading health or nutrition claims.
- WebAIM Million 2026: 95.9% of home pages had WCAG failures.

Research status: desk research is done. The 14-question survey is drafted, **not yet run**. No user-research results exist and none may be claimed.

## Target Users

Setting: small and mid-sized marketing teams and agencies, and claim-heavy sectors (food and beverage, personal care, health, real estate). Publishing stays outside the tool.

| Role | What they do | Likely needs (to validate) |
|---|---|---|
| Company owner / admin | Creates the workspace; defines guidelines, approved facts, terms, assets; invites the team | Turn existing brand rules into checkable rules; see where rules are unclear |
| Content creator | Submits content; inspects findings; accepts, edits, rejects, defers or challenges suggestions; shares for review | Fast, specific feedback that explains why; no silent rewriting; a way to push back |
| Manager / reviewer | Opens the same review and report; comments; requests changes; records approval | One place for content, findings and decisions; fewer repeat fixes; an audit trail |

## Goal

Give small teams a lightweight, transparent, human-in-control reviewer that checks content from any source against the organisation's approved sources before it goes live. It shows the source behind each finding and flags what it cannot verify.

BrandCheck is **not** a generic grammar checker or text editor.

## Core Principles

1. Review before publication. The tool never publishes anything.
2. Ground every check in approved brand sources.
3. Explain each finding: what is wrong, why it matters, which source supports it.
4. Suggest corrections; never overwrite silently. The original is always preserved.
5. Humans decide: accept, edit, reject, defer or challenge.
6. Separate **source-backed** findings from **uncertain** ones. Never fabricate citations, quotes or confidence scores.
7. Claim only what is implemented and tested.

## Core Features

1. Authentication and workspaces
2. Brand source library (guidelines, terminology, approved facts, approved claims/messaging)
3. Content submission (text)
4. Review engine (rules + local models)
5. Findings with evidence, explanation and suggested correction
6. Creator decisions on each finding
7. Share with reviewer; comments; request changes; approval
8. Revision and decision history
9. Report generated from real findings and decisions
10. Public landing page (hero + scroll-driven product preview) at `/`, inside the same app (ADR-024, ADR-026)

## MVP

### Priority 1 (must work)
- Create a workspace; define brand sources **[Decided: entered through forms; no PDF import in v1]**
- Submit text content **[Decided: pasted text, plus `.txt` / `.md` upload]**
- Run a real review with these checks **[Decided]**:
  1. Preferred / prohibited terminology (deterministic)
  2. Fact consistency against approved facts (deterministic first, model-assisted where needed)
  3. Unsupported promotional claims (deterministic patterns + source lookup)
  4. Tone against the brand voice (model-assisted; always marked uncertain unless backed by an explicit rule)
- Findings with source evidence and a suggested correction
- Explicit user decision on each finding (accept / edit / reject / defer / challenge)

### Priority 2 (complete the story)
- Invite team members by link; roles: owner, creator, reviewer
- Share a review with a reviewer; comments; request changes; record approval
- Review status and revision history
- Public landing page: hero (GSAP, Framer Motion, Lenis, Three.js / React Three Fiber) and a scroll-driven product preview using labelled sample data. **[Decided: built after the core loop works; needs team confirmation, ADR-031]**

### Priority 3 (only if time permits)
- Image and document formats (PDF, DOCX); logo / colour checks
- Accessibility checks
- Repeated-mistake insights (derived only from recorded decisions)
- Required-phrase checks

### Deferred (separate from the core)
- Video review. Not built until the entire core project is complete.

## Out of Scope

- Generic grammar or spell checking
- Automatic publishing or any integration that publishes content
- Overwriting content without an explicit user action
- Paid APIs or services (₹0 budget)
- Video processing (until the core is finished)
- Mobile app
- Landing page sections beyond hero and product preview (until the team adds them)
- Invented metrics, testimonials, logos or performance claims on the landing page
- Payments or billing
- Enterprise SSO, advanced permission management, multi-region infrastructure
- Analytics that are not derived from real recorded data

## Finding Model (summary; full schema in `ARCHITECTURE.md`)

- Category: terminology, fact, claim, tone (later: visual, accessibility)
- Severity: error, warning, suggestion
- Evidence status: **source-backed** or **uncertain**
- Fields: text span, explanation, source reference (if any), suggested correction, creator decision, reviewer state

## Success Criteria

A user should be able to:
1. Create a workspace and add brand terms, facts and a tone guide.
2. Invite a creator and a reviewer by link.
3. Submit text containing deliberate issues (wrong term, conflicting fact, unsupported claim, off-tone wording).
4. See each finding with explanation, source reference and suggested correction.
5. Accept, edit, reject, defer or challenge a finding, with the original content preserved.
6. Share the review; the reviewer sees the same content and report, comments, and requests changes or approves.
7. See the status change reflected in the interface and recorded in history.
8. Submit clean content and see no (or only justified) findings.
9. Open the landing page, understand what BrandCheck does from the hero and product preview, and reach sign-up or sign-in without any animation being required.

Quality criteria (measured honestly; no numbers are quoted before they are measured):
- Issues caught on a seeded test set; false positives on clean content
- Share of findings with a valid source reference
- Review time with and without the tool (state the sample size)

## Non-Functional Requirements

- Privacy: workspace isolation enforced on the backend; confidential content is not logged
- Local-first: local model inference; no external AI service without disclosure
- Graceful degradation: if local models are unavailable, the rule-based checks still run
- Accessibility: keyboard navigable, readable contrast, never colour alone; the landing page respects reduced motion and works without WebGL (ADR-030)
- Honesty: landing copy and the product preview state only what is implemented and tested, using sample data labelled as such (ADR-032)
- Performance: the product app does not download landing or 3D code (ADR-029)
- States: loading, empty, success and error states for every flow

## Open Questions (need the team)

- Official build window, deadlines and submission format
- The three improvements to name for Round 2 / 3 judging (see `TASKS.md`)
- Final colours and fonts (see `DESIGN.md`)
- Landing page priority (ADR-031), reference points, hero copy direction, and 3D approach (see `DECISIONS.md` → Pending)
- Hardware available for local models (RAM / GPU / free disk)
- Name of the fictional demo company and its brand rules
