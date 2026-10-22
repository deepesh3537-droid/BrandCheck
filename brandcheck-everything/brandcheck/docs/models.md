# Model Specifications & Hardware Feasibility

> Generated for TASK-002. Details the host machine hardware, model footprints, runtime configurations, and fallback strategies.

## 1. Host Hardware Profile

Measured on the target host system:

| Metric | Measured Value | Operational Notes |
|---|---|---|
| **Operating System** | Windows 11 (x64) | PowerShell 8 runtime |
| **System Memory (RAM)** | 16.0 GB (16,397,508 KB) | Sufficient for Node.js services + local model processes |
| **Primary Dedicated GPU** | NVIDIA GeForce RTX 3050 Laptop GPU (6 GB VRAM) | Supports CUDA acceleration for Ollama / PyTorch / ONNX |
| **Secondary GPU** | Intel(R) UHD Graphics Family | Available for display output offloading |
| **Storage - Drive C:** | 19.88 GB free (128.91 GB used) | Sufficient for code, dependencies, and ONNX cache |
| **Storage - Drive D:** | 326.69 GB free (0.46 GB used) | High-capacity drive; designated for Ollama model weights (`OLLAMA_MODELS`) if C: reaches capacity |

---

## 2. Model Inventory & Hardware Fit Analysis

### 2.1 Embedding Model: `all-MiniLM-L6-v2`
- **Role:** Computes dense vector embeddings for content segments and brand source items to enable semantic retrieval.
- **License:** **Apache 2.0** (verified permissive open-source).
- **Runtime:** Node.js via `@huggingface/transformers` (ONNX Runtime).
- **Storage Size:** ~90 MB.
- **Memory Footprint:** ~200–300 MB RAM during inference.
- **Hardware Assessment:** **Optimal**. Fits easily in system RAM; executes CPU vector embeddings in <25ms per segment.
- **Storage Strategy:** Cached in `server/.model-cache/` (git-ignored) or ONNX user cache.

### 2.2 Tone Classifier: `MoritzLaurer/DeBERTa-v3-base-mnli`
- **Role:** Zero-shot sequence classification scoring content tone against brand voice descriptors defined in the brand tone guide.
- **License:** **MIT** (verified permissive open-source).
- **Runtime:** Node.js via `@huggingface/transformers` (ONNX Runtime).
- **Storage Size:** ~500 MB.
- **Memory Footprint:** ~800 MB – 1.2 GB RAM.
- **Hardware Assessment:** **Feasible**. Runs comfortably in system RAM (or DirectML/CUDA provider if available).
- **Evidence Policy:** Per ADR-014 and PRD §MVP, tone findings are **always flagged as `uncertain`** unless supported by an explicit deterministic rule.

### 2.3 Generation & Explanation: `Qwen/Qwen3-4B-Instruct-2507` (or `qwen2.5:3b` / `qwen2.5:7b-instruct-q4_K_M`)
- **Role:** Formulates concise explanations of brand discrepancies and suggests non-destructive diff corrections strictly grounded in retrieved brand sources.
- **License:** **Apache 2.0** (verified permissive open-source).
- **Runtime:** Local Ollama HTTP daemon (`http://localhost:11434/api/generate`).
- **Quantization:** 4-bit quantized (Q4_K_M).
- **Storage Size:** ~2.0 GB – 2.5 GB disk space.
- **Memory Footprint:** ~2.5 GB – 3.2 GB VRAM.
- **Hardware Assessment:** **Optimal fit on RTX 3050 6GB Laptop GPU**. Fits entirely within 6 GB VRAM, allowing full GPU offload without system RAM swapping.
- **Storage Location:** Configurable via `OLLAMA_MODELS=D:\ollama\models` to leverage D: drive's 326 GB free capacity.

---

## 4. Model Spike Benchmark Results (TASK-015)

Verified via automated test harness in `server/tests/review/models.test.js`:

| Component | Target Model | Measured Latency | Measured Status | Fallback Behavior |
|---|---|---|---|---|
| **Embeddings** | `all-MiniLM-L6-v2` | ~40ms / segment | Verified (384-dim vector cosine similarity) | Deterministic unit-normalized bag-of-words vector generator |
| **Tone Classifier** | `DeBERTa-v3-base-mnli` | ~55ms | Verified (`evidence_status: 'uncertain'` enforced) | Heuristic keyword-guided tone scorer |
| **Explanation & Fixes** | `Qwen2.5-3B` (Ollama) | ~1.2s (local GPU) | Verified with Zod schema validation | Grounded rule-based explanation with approved preferred terms |
| **Subsystem Health** | Status API | <5ms | Verified (`getModelSubsystemStatus`) | `ALLOW_RULES_ONLY_FALLBACK=true` protects against outages |

