# Design System

> **Provisional.** The team asked for a dark, techy, clean and professional look with animations where useful (ADR-008) and will provide final colours and fonts later. The tokens below are placeholders chosen by the assistant so the UI is consistent now. Change them in one place (Tailwind theme / CSS variables) when the team decides.
> Applies to both the **product app** and the **landing page**. The landing page has its own section below.

## Style

Dark · Technical · Clean · Professional. A developer-tool feel (VS Code-inspired review workspace) with generous spacing and calm, restrained colour. No clutter, no decorative noise. Motion and 3D are used to explain or add atmosphere, never to hide content.

## Product App Layout (VS Code-inspired, confirmed by the team)

```
┌──────────────────────────────────────────────────────────────┐
│ Top bar: logo · workspace switcher · review status · user    │
├───────────────┬─────────────────────────────┬────────────────┤
│ Left panel    │ Centre panel                │ Right panel    │
│ Files &       │ Content editor / preview    │ Review report  │
│ brand sources │ highlighted findings,       │ findings list, │
│               │ suggested alternatives      │ evidence,      │
│               │                             │ comments, state│
└───────────────┴─────────────────────────────┴────────────────┘
```

- Top bar ~48px. Left panel ~280px, right panel ~360px, centre flexible. Panels are resizable and collapsible.
- Below 1024px, panels become tabs (Sources · Content · Report). Must remain usable at 375px, 768px and 1440px.
- Selecting a finding in the report scrolls to and highlights it in the content, and vice versa.
- Every panel and control must serve the core workflow; no non-functional placeholders.

## Typography (provisional)

- UI: **Inter**
- Code, labels, IDs, source references: **JetBrains Mono**
- Both are open-source (OFL). Self-host through `@fontsource` packages, not a CDN; verify the licence terms.
- Product scale: 12 / 14 / 16 / 20 / 28px. Body 14px.
- Landing-only display scale: 40–72px headlines (fluid with `clamp()`), 18–20px lead text.

## Colours (provisional tokens)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0F14` | App background |
| `--surface` | `#111720` | Panels, cards |
| `--surface-2` | `#171F2B` | Raised elements, hover |
| `--border` | `#243041` | Dividers, outlines |
| `--text` | `#E6EDF3` | Primary text |
| `--muted` | `#8B98A9` | Secondary text |
| `--primary` | `#22D3EE` | Primary actions, focus ring, active state |
| `--error` | `#F87171` | Errors |
| `--warning` | `#FBBF24` | Warnings |
| `--suggestion` | `#60A5FA` | Suggestions |
| `--success` | `#34D399` | Success, approved |

Landing glows and gradients are derived from `--primary`; no new brand colours are introduced until the team provides final ones.

Contrast target: body text at least WCAG AA (4.5:1) against its background. Verify every pair, including text over the landing's 3D backdrop.

## Never colour alone

Severity and status always combine colour with an **icon and a text label**. Highlighted text in the editor combines a tinted background with a distinct underline style per severity (solid for error, dashed for warning, dotted for suggestion). Source-backed vs uncertain findings differ by label and icon, not by colour alone.

## Components

- **Buttons:** Primary, Secondary, Ghost, Destructive. Visible focus ring (2px, `--primary`). Minimum 36px height; 44px touch target on small screens.
- **Cards / panels:** Border radius 10px, 1px `--border`, no heavy shadows. Subtle inner glow on the active item.
- **Finding card:** severity icon + label · category · flagged text (monospace) · explanation · source reference chip · suggested correction shown as a diff (original vs proposed) · decision buttons: Accept, Edit, Reject, Defer, Challenge.
- **Badges:** severity, evidence status (Source-backed / Uncertain), review status (Draft, In review, Changes requested, Approved).
- **Source reference chip:** monospace title + type; opens the exact source item in the left panel.
- **Forms:** visible labels, inline validation messages, helpful error text, correct `autocomplete` and input types.
- **Toasts:** confirm every success and failure.
- **Dialogs:** keyboard trap and Esc to close; focus returns to the trigger.

## Motion

Motion clarifies state changes; it never decorates at the cost of usability. Two budgets apply:

### Product app (ADR-029)
- Tools: CSS / Tailwind transitions, plus Framer Motion for mount / unmount, presence and layout. **No GSAP, Lenis or Three.js in the product app.**
- Timing: 120–240ms; `ease-out` entering, `ease-in` leaving.
- Panel open/close and resize: smooth width transition.
- Finding highlight: soft fade-in pulse when selected.
- Review running: progress indicator and skeleton shimmer in the report panel.
- Findings list: staggered fade-and-rise as results arrive.
- Decision applied: brief check animation and a status badge transition.
- Buttons and cards: subtle hover lift / border glow.

### Landing page (ADR-025, ADR-029)
- Tools: GSAP + ScrollTrigger (scroll-driven and pinned sequences, text reveal), Framer Motion (hover, mount), Lenis (smooth scroll), Three.js / React Three Fiber (hero backdrop).
- Longer, more cinematic timings are allowed (roughly 400–1200ms for reveals), with shared durations and easings defined once in `features/landing/animation/easings.js`.
- The headline and CTA must be visible and usable **before** the 3D scene loads.

### Both
- **Respect `prefers-reduced-motion`:** disable non-essential animation; on the landing page also disable Lenis, scroll-pinning and 3D, and show static content (ADR-030).
- Animation must never block keyboard use or hide content from assistive technology.

## Landing Page (public route `/`)

Sections planned (ADR-026): **Hero** and **Product preview**. No other sections are planned; add them to this file when the team decides.

Inspiration (ADR-025): the team referenced Google Antigravity's landing page for its general feel (dark, large type, scroll-driven motion, depth). We recreate a *feel*, not its text, assets, layout or branding. Specific reference points will be agreed with the team.

### Hero
- Large headline, one lead sentence, one primary CTA (to `/register`, or `/app` if already signed in) and a secondary "Sign in" link to `/login`.
- Headline reveal by GSAP text-split; backdrop is a lazy-loaded 3D / particle scene with a static fallback.
- Copy lives in `hero.copy.js`, mentions only capabilities that are implemented and tested, and makes no numeric or performance claims that have not been measured.

### Product preview
- A scroll-pinned, scripted demo of the real three-panel review UI: content with highlighted findings, report cards with source references, a decision being made.
- Uses the **same tokens and component look** as the product app, with sample content for a fictional company, visibly labelled "Sample".
- Never shows invented metrics or implies results that were not measured.
- Storyline lives in `preview.script.js`; sample content in `data/previewSample.js`.

### Landing rules
- Mobile first; reflows at 375px, 768px and 1440px. Reduce or drop 3D on small or weak devices.
- Keep the page keyboard-usable and the CTA reachable without any animation.
- Text over 3D keeps AA contrast (use an overlay gradient if needed).
- Keep the landing bundle separate from the product app.

## UX Requirements

- Mobile responsive (375px, 768px, 1440px)
- Loading states (skeletons, progress)
- Empty states with a clear next action (for example "Add your first brand rule")
- Error states with a retry or fix action
- Success states reflected in the interface, never implied
- Accessible forms; full keyboard navigation (tab order, visible focus, shortcuts documented)
- A clear next action at every stage of the workflow

## Tone of Voice (product and landing copy)

Plain, direct, respectful. Explain why, not only what. Never blame the creator. Use "uncertain" honestly rather than sounding confident. No hype claims; say only what the product actually does.
