# Landing Page Concept & Copy Direction

> Generated for TASK-008. Defines the agreed visual reference points, copy directions, and technical animation specifications for the public landing page at `/`.

---

## 1. Approved Hero Copy

- **Headline:** *Brand governance before you hit publish.*
- **Lead Sub-headline:** *Review drafts from any source against your approved brand guidelines, facts, terminology, and voice before they reach the public.*
- **Primary CTA:** "Get Started Free" $\rightarrow$ routes to `/register` (or `/app` if authenticated session detected).
- **Secondary CTA:** "Sign In" $\rightarrow$ routes to `/login`.
- **Honesty & Integrity Policy (ADR-032):** The copy references only supported capabilities (terminology, fact consistency, promotional claim support, and tone). No unmeasured performance percentages or fictitious client logos are included.

---

## 2. Visual Reference Points (Antigravity-Inspired Feel)

In alignment with ADR-025 and ADR-030:
1. **Atmosphere:** Deep obsidian background (`#0B0F14`) with elevated surfaces (`#111720`) and subtle cyan glow gradients derived from `--primary` (`#22D3EE`).
2. **Typography & Animation:**
   - Fluid responsive display typography (40px–72px) set in Inter with JetBrains Mono chips.
   - Text reveal powered by GSAP character/word reveal sequence upon initial view load.
3. **Hero 3D Visual Backdrop:**
   - Procedural Three.js particle constellation and geometric wireframe nodes representing brand source grounding.
   - Lazy-loaded via React Three Fiber (`<Canvas>`); degrades seamlessly to static CSS radial gradient if WebGL is unavailable or on low-power devices.
4. **Scroll Dynamics:**
   - Smooth inertia scrolling via Lenis (landing route only).
   - ScrollTrigger-pinned interactive product preview displaying the 3-panel VS Code-style interface (`WorkspaceLayout`), transitioning through content highlighting and a creator decision.
   - All preview data is labelled "Sample".

---

## 3. Technical Constraints & Isolation (ADR-029)

- All landing page logic is encapsulated in `client/src/features/landing/`.
- GSAP, Lenis, and Three.js/R3F are code-split and only loaded when navigating to `/`.
- Strict compliance with `prefers-reduced-motion`: animation, smooth scroll, and 3D are automatically bypassed, presenting immediate accessible static content.
