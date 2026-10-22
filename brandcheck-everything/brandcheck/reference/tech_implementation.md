# Tech Implementation --- Brand Governance Platform

> **Purpose:** Implementation checklist and inventory for the hackathon
> project. Fill in the status, versions, configuration, and
> implementation notes as decisions are finalized.
>
> **Budget constraint:** ₹0 total. Prefer local inference and
> free/open-source tools. Verify current free-tier limits, model
> licenses, and individual dependency/model terms before adopting them.

## 1. Core Application Stack

### Frontend

-   [ ] React
-   [ ] Vite
-   [ ] Tailwind CSS
-   [ ] shadcn/ui --- optional UI component library
-   [ ] Lucide --- icons

**Status / notes:**

### Backend

-   [ ] Node.js
-   [ ] Express
-   [ ] Zod --- request/input validation
-   [ ] Authentication and role-based permissions
-   [ ] Server-side file validation and error handling

**Status / notes:**

### Database, Authentication, and File Storage

-   [ ] PostgreSQL
-   [ ] Supabase Free --- possible hosted PostgreSQL, authentication,
    and storage option
-   [ ] Local PostgreSQL --- alternative for local development
-   [ ] File storage choice: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Free-tier / local setup notes:**

## 2. Content Ingestion and Parsing

Select parsers according to the formats actually supported by the
application.

-   [ ] PDF text extraction library:
    \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   [ ] DOCX text extraction library:
    \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   [ ] Plain text / Markdown handling
-   [ ] Image upload validation and preprocessing
-   [ ] File type, size, and permission checks

**Supported formats for the first version:**

**Implementation notes:**

## 3. Brand-Review Engine

The review engine should combine deterministic checks with pretrained
models where useful. Do not claim a check is supported until it is
implemented and tested.

### A. Deterministic / Rule-Based Checks

-   [ ] Approved and prohibited terminology
-   [ ] Required phrases and messaging
-   [ ] Known facts and claims
-   [ ] Unsupported promotional claims
-   [ ] Brand colors, logo, and approved-asset checks
-   [ ] Other explicit rules: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Rule format / storage location:**

### B. Pretrained NLP and Language Models

#### 1. Sentence embeddings / semantic retrieval

-   [ ] **Model:** `sentence-transformers/all-MiniLM-L6-v2`
-   **Purpose:** Embed content and brand rules for semantic similarity
    and retrieval.
-   **Model page:**
    https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
-   **License noted in prior research:** Apache-2.0
-   **Status / notes:**

#### 2. Zero-shot text classification

-   [ ] **Model candidate:** `MoritzLaurer/DeBERTa-v3-base-mnli`
-   **Purpose:** Experiment with classifying tone or content against
    defined labels without training a custom classifier.
-   **Model page:**
    https://huggingface.co/MoritzLaurer/DeBERTa-v3-base-mnli
-   **License:** Verify the exact model-card license before use.
-   **Status / notes:**

#### 3. Local instruction-following language model

-   [ ] **Model candidate:** `Qwen/Qwen3-4B-Instruct-2507`
-   **Purpose:** Contextual reasoning, explaining findings, and drafting
    suggested corrections grounded in retrieved brand sources.
-   **Model page:** https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
-   **License noted in prior research:** Apache-2.0
-   **Runtime:** Local inference; hardware requirements must be checked.
-   **Status / notes:**

### C. Pretrained Vision Models and Image Checks

#### 1. Image/text similarity

-   [ ] **Model candidate:** `openai/clip-vit-base-patch32`
-   **Purpose:** Compare images with text descriptions or candidate
    visual concepts.
-   **Model page:** https://huggingface.co/openai/clip-vit-base-patch32
-   **License:** Verify the exact model-card license and usage terms
    before use.
-   **Status / notes:**

#### 2. Image understanding / OCR-related tasks

-   [ ] **Model candidate:** `microsoft/Florence-2-base`
-   **Purpose:** Explore image captioning, visual understanding, and
    OCR-related tasks.
-   **Model page:** https://huggingface.co/microsoft/Florence-2-base
-   **License noted in prior research:** MIT
-   **Status / notes:**

#### 3. OCR

-   [ ] **Tool:** PaddleOCR
-   **Purpose:** Extract text from images and visual assets.
-   **Project page:** https://github.com/PaddlePaddle/PaddleOCR
-   **Project license noted in prior research:** Apache-2.0; verify the
    terms for any selected model and dependency.
-   **Status / notes:**

#### 4. Traditional image processing

-   [ ] **Tool:** OpenCV
-   **Purpose:** Rule-based checks such as approximate brand-color
    matching, image dimensions, and other measurable visual properties.
-   **Status / notes:**

## 4. Finding and Evidence Data Shape

Define one normalized structure for every finding.

-   [ ] Finding ID and category
-   [ ] Severity / priority
-   [ ] Content location or text span
-   [ ] Explanation
-   [ ] Supporting brand rule or source reference, when available
-   [ ] Suggested correction
-   [ ] Confidence / uncertainty where useful
-   [ ] Creator decision: accept, edit, reject, or challenge
-   [ ] Reviewer comment and approval state, where implemented

**Schema / implementation notes:**

## 5. Main Application Workflow

-   [ ] Create company workspace
-   [ ] Add approved brand guidelines, facts, terminology, messaging,
    and assets
-   [ ] Invite team members and enforce permissions
-   [ ] Submit supported content
-   [ ] Extract content and retrieve relevant brand sources
-   [ ] Run deterministic checks and selected model-assisted checks
-   [ ] Show findings with explanations and source evidence
-   [ ] Let the creator make explicit decisions; do not silently
    overwrite content
-   [ ] Share with an authorised reviewer
-   [ ] Record comments, requested changes, and approval status
-   [ ] Preserve revision/decision history if implemented

## 6. Suggested Development and Testing Software

-   [ ] Git --- version control
-   [ ] Node.js package manager (npm or another selected manager)
-   [ ] Python environment and package manager, if Python model
    inference is used
-   [ ] API testing tool: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
-   [ ] Browser developer tools
-   [ ] Environment-variable configuration for secrets
-   [ ] Test data for a fictional company
-   [ ] Logging that avoids unnecessary sensitive content

**Chosen versions / setup instructions:**

## 7. Zero-Cost Deployment and Runtime

-   [ ] Prefer local development and local model inference to avoid paid
    API calls.
-   [ ] Confirm model downloads fit available disk space and local
    hardware.
-   [ ] Confirm hosted database/storage quotas before choosing a free
    tier.
-   [ ] Check whether the selected free host sleeps, pauses, deletes
    data, or has ephemeral storage.
-   [ ] Do not depend on a free tier without verifying its current
    terms.
-   [ ] Do not include paid APIs or services in the implementation
    unless explicitly approved.

**Chosen hosting option:**

**Hardware available (RAM / GPU / free disk space):**

**Cost and quota checks:**

## 8. Future Extension --- Video Review (DEFERRED)

> **Do not implement this until the entire core project is complete.
> Keep video processing separate from the main content-review
> workflow.**

-   [ ] FFmpeg --- extract audio and sample frames
-   [ ] `openai/whisper-large-v3-turbo` --- candidate local
    speech-to-text model with timestamps
    -   Model page: https://huggingface.co/openai/whisper-large-v3-turbo
    -   License noted in prior research: MIT
-   [ ] PaddleOCR --- extract on-screen text
-   [ ] Florence-2 / CLIP or another verified vision model --- analyse
    selected frames
-   [ ] Compare transcript, on-screen text, and visuals with approved
    brand sources
-   [ ] Return timestamped findings for human review

**Deferred video notes:**

## 9. License, Privacy, and Reliability Checklist

-   [ ] Verify the license for each model, model revision, library, and
    dependency before use.
-   [ ] Verify whether model weights and dependencies can be used for
    the intended hackathon/demo.
-   [ ] Keep secrets out of source control.
-   [ ] Validate uploads and enforce workspace permissions on the
    server.
-   [ ] Avoid logging unnecessary private content.
-   [ ] Ground AI findings in actual approved sources; never invent
    citations or company facts.
-   [ ] Show uncertainty and allow users to challenge findings.
-   [ ] Keep humans responsible for final content decisions.
-   [ ] Test both compliant and deliberately non-compliant examples.
-   [ ] Document limitations and only claim checks that are actually
    implemented.

## 10. Implementation Decisions Log

  Decision           Selected option   Reason / notes   Status
  ------------------ ----------------- ---------------- ---------
  Frontend                                              Pending
  Backend                                               Pending
  Database                                              Pending
  Authentication                                        Pending
  File storage                                          Pending
  Model runtime                                         Pending
  Embedding model                                       Pending
  NLP classifier                                        Pending
  Local LLM                                             Pending
  Vision/OCR tools                                      Pending
  Deployment                                            Pending

------------------------------------------------------------------------

**Important:** This file is an implementation inventory and checklist,
not proof that every listed model or tool is required. Select only the
components that fit the first working version, your hardware, verified
licenses, and the ₹0 budget.
