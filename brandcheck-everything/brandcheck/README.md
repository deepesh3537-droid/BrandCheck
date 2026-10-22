# BrandCheck

> **Brand governance before you hit publish.**
> Problem statement sponsored by Inkloom AI. Developed by Team Voxen (Deepesh Kumar Prajapati, Kajal, Som Sahu, Pragya Singh).

BrandCheck is a lightweight, transparent, human-in-the-loop review workspace that audits marketing, claims, and product copy against an organization's verified brand guidelines, approved facts, terminology, and brand voice before content goes live.

BrandCheck is **not** a generic grammar checker or silent auto-rewriter. It grounds every finding in approved brand sources, separates source-backed evidence from model uncertainties, and keeps content creators and managers in total control.

---

## 1. Core Principles

1. **Pre-Publication Governance:** Review content before publication. The tool never publishes anything automatically.
2. **Grounded in Approved Sources:** Checks are anchored strictly in workspace guidelines, approved facts, claims, and terminology.
3. **Transparent Evidence:** Every finding explains what was flagged, why it matters, and which exact brand source item supports it.
4. **Non-Destructive Corrections:** Suggestions are presented as diffs; original content version 1 is immutable and never silently overwritten.
5. **Human Decision Control:** Authors decide: *accept*, *edit*, *reject*, *defer*, or *challenge*. Approvals require manager/reviewer sign-off.
6. **Honesty & Integrity:** Findings are bifurcated into `source_backed` and `uncertain`. No synthetic citations or fake confidence scores.
7. **Zero Cost & Local First:** $0 budget. Local model inference with graceful fallback to deterministic rule checks.

---

## 2. Technology Stack

- **Client:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Framer Motion (product & landing), GSAP + ScrollTrigger, Lenis smooth scrolling, Three.js / React Three Fiber (landing hero).
- **Server:** Node.js (ES modules), Express, Zod validation, `pg` (node-postgres), `bcryptjs`, JWT cookies.
- **Database:** PostgreSQL (local primary, Supabase Free Postgres optional).
- **ML & Inference:** `all-MiniLM-L6-v2` (ONNX via `@huggingface/transformers`), `MoritzLaurer/DeBERTa-v3-base-mnli` (ONNX), `Qwen2.5-3B-Instruct` / `Qwen3-4B` (Ollama over local HTTP).
- **Testing:** Vitest, Supertest, React Testing Library.

---

## 3. Supported Checks

| Check | Method | Evidence Status |
|---|---|---|
| **Terminology** | Deterministic dictionary match against preferred / prohibited terms | `source_backed` |
| **Fact Consistency** | Segment retrieval + deterministic assertion against approved facts | `source_backed` |
| **Unsupported Claims** | Pattern recognition (superlatives, absolute claims) + claim source lookup | `source_backed` or `uncertain` |
| **Tone of Voice** | Zero-shot DeBERTa classification against brand tone guidelines | `uncertain` (unless backed by rule) |
| **Grounded Diff Fixes** | Context-grounded Qwen inference strictly citing retrieved sources | `source_backed` |

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL (v14+ running locally or Supabase connection string)
- Git
- Optional (for local LLM explanations): [Ollama](https://ollama.com/) with `qwen2.5:3b` pulled.

### Installation
1. Clone the repository and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local PostgreSQL credentials and a random JWT_SECRET
   ```
2. Setup and run backend:
   ```bash
   cd server
   npm install
   npm run migrate
   npm run dev
   ```
3. Setup and run frontend:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
4. Access the web interface:
   - Public Landing Page: `http://localhost:5173/`
   - Product Review App: `http://localhost:5173/app`
   - Express REST API: `http://localhost:4000/api`

---

## 5. Repository Structure

```
brandcheck/
├── client/                  # React + Vite frontend (landing + 3-panel review UI)
├── server/                  # Express REST API, migrations, and review pipeline
├── seed/                    # Fictional company seed sources and evaluation test sets
├── docs/                    # Architecture records, model specs, licenses, disclosures
├── .env.example             # Environment template (git-ignored .env at root)
├── .gitignore               # Root git ignore rules
├── README.md                # Project documentation
├── PRD.md                   # Product requirements document
├── ARCHITECTURE.md          # System architecture and data pipeline
├── DESIGN.md                # Design tokens and UI/motion guidelines
├── RULES.md                 # Development constraints and conventions
└── TASKS.md                 # Phased engineering task list
```

---

## 6. Known Limitations & Roadmap

- **Document Formats in v1:** Ingestion supports pasted text, `.txt`, and `.md` files. PDF/DOCX rule extraction is slated for Phase 8 / Improvement 1.
- **Model Fallback:** When Ollama or local ONNX runtimes are offline, BrandCheck gracefully degrades to deterministic-only rule evaluation and logs skipped checks transparently.
- **Video Review:** Video frame inspection is explicitly deferred until the core text-and-claims engine is verified.

---

## 7. Disclosures & Licensing

All dependencies and pre-trained models operate under permissive open-source licenses (MIT, Apache 2.0, ISC, OFL 1.1, and GreenSock Standard No-Charge License). For full disclosures and testing evidence, see:
- [`docs/licences.md`](docs/licences.md)
- [`docs/models.md`](docs/models.md)
- [`docs/disclosures.md`](docs/disclosures.md)
- [`docs/improvements.md`](docs/improvements.md)
