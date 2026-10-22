# AI & Reused Code Disclosures

> Generated for TASK-007. Serves as the official submission compliance checklist detailing AI assistance, third-party libraries, and pre-trained models.

---

## 1. Project & Team Metadata

- **Project Name:** BrandCheck
- **Team Name:** Team Voxen
- **Team Members:**
  - Deepesh Kumar Prajapati (Frontend / UI Lead)
  - Kajal (Machine Learning / Inference Lead)
  - Som Sahu (Backend & Architecture Lead)
  - Pragya Singh (Quality Assurance & Compliance Lead)
- **Problem Statement Sponsor:** Inkloom AI

---

## 2. AI Assistance Disclosure

In compliance with event transparency guidelines, the following AI-assisted workflows were utilized:

| Phase | AI Tool | Nature of Usage | Human Oversight & Verification |
|---|---|---|---|
| **Architecture & Planning** | Antigravity AI Coding Assistant | Structuring PRD, Architecture, and Task sequence from problem statement | Team Voxen reviewed, modified, and confirmed all architectural decisions. |
| **Code Implementation** | Antigravity AI Coding Assistant | Generating boilerplate scaffolding, component layout, and Express services | Every file is tested via Vitest/Supertest and reviewed by the designated team member. |
| **Rule & Pipeline Scaffolding** | Antigravity AI Coding Assistant | Drafting regex patterns and prompt templates for Qwen/Ollama | Team verified test sets with deliberate brand errors to measure accuracy and false positives. |

---

## 3. Pre-Trained Machine Learning Models

No models were trained from scratch by Team Voxen. The following pre-trained, open-weights models are incorporated for local inference:

| Model Identifier | Source / Provider | License | Intended Role in BrandCheck |
|---|---|---|---|
| **`sentence-transformers/all-MiniLM-L6-v2`** | Hugging Face (ONNX) | Apache 2.0 | Generating dense vector embeddings for semantic retrieval of brand sources. |
| **`MoritzLaurer/DeBERTa-v3-base-mnli`** | Hugging Face (ONNX) | MIT | Zero-shot sequence classification for brand tone matching. |
| **`Qwen/Qwen2.5-3B-Instruct` / `Qwen3-4B`** | Alibaba Cloud / Ollama | Apache 2.0 | Formulating plain-language explanations and non-destructive diff corrections. |

All models run strictly locally or inside containerized runtimes with zero external data sharing.

---

## 4. Third-Party Code, Packages & Templates

All third-party packages used are standard open-source dependencies installed via npm:
- **Frontend Core:** React, React DOM, Vite, React Router DOM, Tailwind CSS, Lucide React, `@fontsource/inter`, `@fontsource/jetbrains-mono`.
- **Animation & Visuals:** Framer Motion (`motion`), GSAP, Lenis (`lenis`), Three.js (`three`), React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`).
- **Backend & Database:** Node.js, Express, Zod, `pg` (node-postgres), `bcryptjs`, `cookie-parser`, `jsonwebtoken`, `helmet`, `cors`.
- **Testing:** Vitest, Supertest, `@testing-library/react`.
- **Templates / Starters:** No pre-built commercial templates or full-application UI kits were cloned. All component layouts were designed specifically for BrandCheck.

---

## 5. Proprietary / Paid APIs & Telemetry

- **Paid APIs:** None ($0 budget).
- **External AI Cloud Services (e.g. OpenAI, Anthropic):** None.
- **Data Privacy:** User-submitted brand rules and draft content are processed locally in PostgreSQL; no client data is transmitted to third-party model providers.
