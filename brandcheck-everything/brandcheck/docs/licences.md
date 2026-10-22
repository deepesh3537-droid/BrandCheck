# Verified Open-Source Licenses Directory

> Generated for TASK-006. Verifies that every planned dependency, model, typography package, and library operates under an approved, permissive license consistent with the ₹0 budget and event guidelines.

---

## 1. Machine Learning Models

| Model | Original Author / Organization | License | Usage Permitted | Operational Notes |
|---|---|---|---|---|
| **`all-MiniLM-L6-v2`** | Sentence-Transformers / Hugging Face | **Apache 2.0** | Commercial & Non-Commercial | Permissive; embedding weights converted to ONNX for Node runtime. |
| **`DeBERTa-v3-base-mnli`** | Moritz Laurer / Microsoft | **MIT** | Commercial & Non-Commercial | Permissive zero-shot NLI classifier; run via ONNX runtime. |
| **`Qwen2.5-3B-Instruct` / `Qwen3-4B`** | Alibaba Cloud / Qwen Team | **Apache 2.0** | Commercial & Non-Commercial | Fully open-source Apache 2.0 license; run locally via Ollama. |

---

## 2. Animation & 3D Graphics Libraries

| Library | Package | License | Permitted Scope | Compliance Notes |
|---|---|---|---|---|
| **GSAP** (GreenSock) | `gsap` | **GreenSock Standard "No Charge" License** | Free for public web and non-re-sold applications | Standard web use is free under GreenSock terms. Restricted exclusively to `client/src/features/landing/`. |
| **Framer Motion** | `framer-motion` / `motion` | **MIT** | Commercial & Non-Commercial | Fully permissive; used for layout transitions and mounting. |
| **Lenis** | `lenis` / `@studio-freight/lenis` | **MIT** | Commercial & Non-Commercial | Permissive smooth scroll; isolated to landing page route. |
| **Three.js** | `three` | **MIT** | Commercial & Non-Commercial | Permissive 3D WebGL engine for hero canvas backdrop. |
| **React Three Fiber** | `@react-three/fiber` | **MIT** | Commercial & Non-Commercial | React wrapper for Three.js; MIT licensed. |
| **Drei** | `@react-three/drei` | **MIT** | Commercial & Non-Commercial | Helper utilities for React Three Fiber. |

---

## 3. Core Frontend & Backend Packages

| Package | Purpose | License |
|---|---|---|
| **React & React-DOM** | UI Library | **MIT** |
| **Vite** | Frontend Build Tool | **MIT** |
| **React Router DOM** | Client-Side Routing | **MIT** |
| **Tailwind CSS & PostCSS** | Design Tokens & Styling | **MIT** |
| **Lucide React** | UI Icons | **ISC** (Permissive, MIT equivalent) |
| **Express** | Backend REST Framework | **MIT** |
| **Zod** | Schema & Output Validation | **MIT** |
| **`pg` (node-postgres)** | PostgreSQL Driver | **MIT** |
| **bcryptjs** | Password Hashing | **MIT** |
| **cookie-parser** | HTTP Cookie Parsing | **MIT** |
| **jsonwebtoken** | Signed JWT Authentication | **MIT** |
| **helmet** | HTTP Security Headers | **MIT** |
| **cors** | Cross-Origin Resource Sharing | **MIT** |
| **Vitest** | Test Runner | **MIT** |
| **Supertest** | API Integration Testing | **MIT** |
| **Testing Library** | UI Component Testing | **MIT** |
| **mammoth** | DOCX Document Text Extraction | **BSD-2-Clause** |
| **pdfjs-dist** | PDF Document Text Extraction | **Apache 2.0** |
| **tesseract.js** | Client-Side Poster / Image OCR | **Apache 2.0** |

---

## 4. Typography & Fonts

| Font Family | Distribution | License | Compliance Notes |
|---|---|---|---|
| **Inter** | Self-hosted via `@fontsource/inter` | **SIL Open Font License (OFL) 1.1** | Free and open-source; self-hosted locally without Google Fonts CDN calls. |
| **JetBrains Mono** | Self-hosted via `@fontsource/jetbrains-mono` | **OFL 1.1 / Apache 2.0** | Free and open-source; monospace font for code, tokens, and chips. |

---

## 5. 3D & Visual Assets

- **3D Hero Visuals:** Implemented programmatically in code using Three.js procedural geometries (particle fields, wireframe brand governance grid, dynamic geometric nodes).
- **External 3D Models (.glb):** None required. By generating procedural visuals with Three.js shaders and geometry primitives, zero external 3D asset copyright or attribution encumbrance is introduced.
- **Brand Logos & UI Icons:** SVG vectors rendered locally via Lucide Icons (ISC License).

---

## 6. Budget & Zero-Cost Compliance

- **Total Direct Licensing Cost:** ₹0.00.
- **Paid APIs or Hosted Model Services:** None.
- **Cloud Infrastructure:** Local execution for development; standard free-tier hosting (Vercel + Render/Railway + Supabase Free) for final event review.
