# Project Context: Brand Governance & Content Review Platform

## 1. Purpose of This File

This document is a portable context brief for another AI assistant or a
new team member. It captures the product idea, scope decisions, proposed
user experience, technical pipeline, hackathon priorities, and the
explicitly deferred video-review extension.

When continuing this project: - Treat this document as the current
working context. - Help the user organise and refine their ideas rather
than taking over ideation without being asked. - Distinguish confirmed
scope from optional recommendations. - Do not invent requirements,
completed features, integrations, test results, or judging criteria. -
Keep video processing separate from the main workflow until the core
project is complete.

------------------------------------------------------------------------

## 2. Project Summary

The project is a **brand-governance platform** that checks content
before publication against an organisation's approved brand guidelines,
facts, terminology, messaging, and assets.

The problem it addresses is that content created by employees, agencies,
and AI tools can become inconsistent, inaccurate, outdated,
inaccessible, or misleading. The platform should help teams identify and
correct those issues while preserving the creator's intent.

This is not intended to be merely a generic grammar checker or text
editor. Its central value is **brand-specific review that explains
findings and supports a human review/approval process**.

### Core principles

-   Review content before publication.
-   Ground checks in approved brand sources wherever possible.
-   Explain what was flagged, why it matters, and which guideline or
    approved source supports the finding.
-   Suggest useful corrections without silently overwriting the
    creator's work.
-   Allow people to accept, edit, reject, or challenge suggestions.
-   Keep important review and publication decisions under authorised
    human control.
-   Clearly communicate uncertainty and supported capabilities.
-   Protect confidential brand material and credentials.

------------------------------------------------------------------------

## 3. Users and Roles

The initial product concept includes these roles:

### Company owner / administrator

-   Creates a company workspace.
-   Defines and manages the organisation's brand guidelines, approved
    facts, terminology, and assets.
-   Invites team members using an invitation link.
-   Manages workspace membership and, where implemented, role
    permissions.

### Content creator / team member

-   Joins the company workspace.
-   Adds or selects content for review.
-   Inspects findings and suggested corrections.
-   Revises content and decides which suggestions to accept, edit, or
    reject.
-   Shares a review with a manager or authorised reviewer.

### Manager / authorised reviewer

-   Opens the same content/review and sees the report and its current
    state.
-   Comments on content, requests changes, or records an approval.
-   Can inspect revision and review history where implemented.

The exact permission model should stay as simple as feasible for the
hackathon. Do not claim role-based protections that have not been
implemented and tested.

------------------------------------------------------------------------

## 4. Brand Knowledge the Platform Uses

The workspace should be able to define or import a manageable set of
approved sources:

-   Brand guidelines and tone-of-voice rules.
-   Approved facts, figures, and claims.
-   Preferred and prohibited terminology.
-   Approved messaging and product descriptions.
-   Reusable brand assets, such as logos and other approved visual
    materials.
-   Relevant accessibility guidance, where supported.

The review system must not invent brand rules, facts, citations, or
asset permissions. If source material is missing, conflicting, or
insufficient to verify a claim, it should indicate uncertainty or
request human clarification.

For a hackathon demo, use a small, coherent set of fictional company
rules and approved facts so the end-to-end behaviour is easy to
demonstrate.

------------------------------------------------------------------------

## 5. Content Checks

The project brief identifies the following issue areas. The hackathon
build should implement and test a realistic subset rather than claim all
checks are complete.

1.  **Tone and language:** Does the content match the brand's approved
    voice?
2.  **Terminology and messaging:** Are preferred terms and approved
    messaging used consistently?
3.  **Fact consistency:** Does the content contradict approved facts or
    use outdated information?
4.  **Promotional claims:** Are claims unsupported by the approved
    sources?
5.  **Visual consistency and asset usage:** Where image checks are
    implemented, does the content use approved assets and follow
    relevant visual guidance?
6.  **Accessibility:** Where supported, are there relevant accessibility
    issues?

Each finding should ideally include: - The specific text or content area
flagged. - A category and useful severity/status (for example, issue,
warning, or suggestion). - A plain-language explanation. - The relevant
guideline or source reference, when available. - A suggested correction
or next action. - A way for the user to accept, edit, reject, or
challenge the suggestion.

Do not present AI output as verified fact merely because a model
generated it. Do not fabricate source quotations, citations, or
confidence scores.

------------------------------------------------------------------------

## 6. Main Product Workflow

The main workflow is:

1.  **Create a workspace:** The company owner creates the organisation's
    workspace.
2.  **Add brand sources:** The owner defines or imports guidelines,
    approved facts/claims, terminology, and relevant assets.
3.  **Invite the team:** The owner invites content creators and
    reviewers.
4.  **Submit content:** A creator enters or uploads content in a
    supported format.
5.  **Run the review:** The platform compares the content with the
    available approved sources using the checks that have actually been
    implemented.
6.  **Inspect findings:** The creator sees the flagged content,
    explanations, evidence/source references, and proposed corrections.
7.  **Revise content:** The creator accepts, edits, rejects, or
    otherwise responds to suggestions. Preserve the original and make
    proposed changes visible before applying them.
8.  **Request review:** The creator shares the content and review report
    with a manager or authorised reviewer.
9.  **Review and decide:** The manager comments, requests changes, or
    records an approval.
10. **Track the outcome:** The platform records review status and, where
    implemented, who acted, comments, and revision history.

The flow should have a clear next action at every stage. Provide useful
empty, loading, success, and error states. A successful review or
approval must be reflected in the interface rather than implied.

### Main workflow boundary

**Video is not part of this core workflow.** Video review is a future
extension to be developed only after the main project is complete.

------------------------------------------------------------------------

## 7. Proposed User Interface

The user proposed a VS Code-inspired review interface:

-   **Top navigation bar:** Main navigation, workspace context, and
    relevant user/workspace actions.
-   **Left panel --- files and sources:** Uploaded content/files and
    possibly the approved brand sources relevant to the current review.
-   **Centre panel --- content and review:** Content editor or preview,
    highlighted findings, and suggested alternatives.
-   **Right panel --- report:** Generated review report with categories,
    explanations, supporting sources, suggestions, and review state.

The design should support a user reviewing findings in context, rather
than forcing them to switch between unrelated screens. The three-panel
arrangement is a design direction, not a reason to overbuild the
interface.

### Collaboration behaviour

-   A creator can share a review with a manager.
-   The manager opens the same review and sees the relevant
    content/report state.
-   Comments, requested changes, approvals, and revision history should
    be visible when implemented.
-   Important controls must work; avoid a polished UI made up of
    non-functional placeholders.

------------------------------------------------------------------------

## 8. Proposed Technical Pipeline --- Main Project

The exact stack has not been finalised in this context. Choose
technologies the team can implement, explain, and test within the
official build window. Keep the architecture reasonably separated
without adding unnecessary infrastructure.

### A. Workspace and source setup

1.  User creates or joins an organisation workspace.
2.  Server authenticates the user and checks workspace
    membership/permissions.
3.  Owner adds or imports brand rules, approved facts, terminology, and
    assets.
4.  Backend validates and stores source material, associating it with
    the correct organisation.
5.  Review requests retrieve only the relevant sources belonging to that
    workspace.

### B. Content submission and validation

1.  Creator enters text or uploads a supported file.
2.  Frontend sends the content and relevant metadata to the backend.
3.  Backend checks authentication, workspace access, input validity,
    file type, size, and supported format.
4.  Unsupported or malformed files produce a clear error rather than
    entering the review pipeline.
5.  Backend extracts usable content from the supported format. For
    image/document formats, implement only the extraction and analysis
    paths that are actually tested.
6.  Original content is preserved so suggested changes can be compared
    with it.

### C. Review and analysis

1.  Backend loads the applicable approved brand sources.
2.  Review engine runs implemented checks against those sources.
3.  Deterministic rules can handle checks such as required/preferred
    terminology or known approved facts where appropriate.
4.  An AI model may be used for checks that require language
    interpretation, such as tone or contextual messaging, provided
    outputs are grounded in the approved sources and the use of external
    services is handled responsibly.
5.  Each result is normalised into a consistent finding structure, such
    as:
    -   finding category;
    -   affected text/area;
    -   explanation;
    -   source/rule reference, if available;
    -   proposed correction;
    -   uncertainty or review status where relevant.
6.  The backend should distinguish source-backed findings from uncertain
    suggestions and avoid fabricated citations or claims.
7.  The frontend displays findings in context and in the report panel.

### D. Correction and human review

1.  Creator inspects a finding.
2.  Creator accepts, edits, rejects, or challenges the suggestion.
3.  The system records the decision where implemented and updates the
    working content only through an explicit user action.
4.  Creator submits the review to an authorised reviewer.
5.  Reviewer reads the same content and report, adds comments, requests
    changes, or records approval.
6.  Review status and revision history are updated.
7.  The system does not automatically publish content or override an
    authorised human decision.

### E. Reports and insights

-   Generate a report from actual findings and user decisions.
-   Report should explain issues and recommended actions, not merely
    provide a score.
-   Repeated-mistake insights can be added if they are derived from real
    recorded reviews/decisions.
-   Do not invent analytics or show meaningless metrics just to make the
    interface look advanced.

### F. Security and reliability

-   Enforce organisation boundaries and permissions on the backend, not
    only in the UI.
-   Validate user input and uploads.
-   Keep API keys and credentials in environment variables or a suitable
    secret manager; never commit secrets.
-   Avoid unnecessary logging of confidential content or personal
    information.
-   Disclose relevant external AI/API use and consider how confidential
    content is transmitted and retained.
-   Handle network/API errors, missing sources, conflicting guidance,
    empty input, and unsupported formats.
-   Test the main flow end to end, plus a few meaningful failure cases.
-   Document setup steps and known limitations.

### High-level architecture

`Frontend / Review UI` → `Backend API and Authentication` →
`Workspace, Permissions, and Brand Source Storage` →
`Content Validation and Extraction` → `Review Orchestrator` →
`Rule-Based Checks and/or Grounded AI Analysis` →
`Normalised Findings and Evidence` → `Report and Suggested Corrections`
→ `Creator Decisions` → `Reviewer Comments / Approval` →
`Revision and Review History`

This is a conceptual pipeline, not a claim that these modules have
already been built. The implementation may combine some components if
that keeps the project manageable.

------------------------------------------------------------------------

## 9. Hackathon-Specific Strategy

The goal is to demonstrate the problem statement convincingly within the
build window, not to build a fully mature commercial product.

### Core rules

-   Solve brand governance, not generic grammar correction.
-   Prioritise a small, complete workflow over many incomplete features.
-   Make the review engine and its evidence the centrepiece.
-   Use approved rules and facts as the foundation of the review.
-   Implement a few meaningful checks well before adding many shallow
    checks.
-   Explain each important finding and show its source when available.
-   Make corrections actionable and keep the human in control.
-   Choose a primary content format first. Text is a practical starting
    point; add images/documents only when the relevant checks work.
-   Keep collaboration minimal but real: creator submits, reviewer
    comments or approves.
-   Make every panel and control serve the core workflow.
-   Do not build features merely because they look impressive.
-   Do not claim a format, integration, or check is supported unless it
    has been implemented and tested.

### Recommended demo scenario

Prepare a fictional company with a short brand guide, a list of
preferred terms, and a few approved facts. Submit sample content
containing several deliberate issues, such as: - an incorrect preferred
term; - a fact that conflicts with the approved source; - an unsupported
promotional claim; - wording that conflicts with the tone guide.

Demonstrate: 1. The original content. 2. The exact findings and
supporting rules/sources. 3. Suggested corrections. 4. The creator
accepting or rejecting a suggestion. 5. The updated review state. 6. A
manager reviewing the same content/report and commenting or recording a
decision.

Also show at least one piece of correct content or a check that finds no
issue, to help demonstrate that the system is not simply flagging
everything.

### Priorities if time is limited

**Priority 1 --- Must work** - Define/use brand sources. - Submit
content. - Run a real review. - Show useful findings and evidence. -
Suggest a correction. - Let the user make an explicit decision.

**Priority 2 --- Complete the story** - Share with a reviewer. - Add
comments or request changes. - Record approval/review status. - Show
revision history where feasible.

**Priority 3 --- Only if time permits** - Additional content formats and
check types. - More elaborate analytics. - Advanced role/permission
management. - Extra integrations and infrastructure.

**After the core is complete** - Video review, maintained as a separate
future extension.

### Testing and delivery

-   Test a complete end-to-end scenario before adding optional features.
-   Test both correct and problematic content.
-   Test missing/conflicting guidelines, empty inputs, unsupported
    files, API failures, and permission boundaries as relevant to
    implemented features.
-   Check that suggested edits preserve meaning.
-   Reserve time for integration, bug fixing, setup documentation, and
    demo rehearsal.
-   Confirm the official build window, deadlines, and submission
    requirements.
-   Follow event rules for AI-generated code, reused code, libraries,
    external services, and disclosures.
-   Do not describe recommendations in this document as official judging
    criteria unless the official scoring rubric confirms them.

------------------------------------------------------------------------

## 10. Future Extension --- Video Review (Separate From Main Workflow)

**Status: deferred future feature.** The supplied project brief does not
explicitly require video as a core format. The team has chosen to keep
video review as an extension to build only after the whole main project
is complete.

Do not include video processing in the current core workflow, core
implementation tasks, or required main-project demo. Keep this section
as a future technical plan.

### Intended capability

Review a video against the same organisation's approved brand guidelines
and sources, and return a report with findings tied to relevant
timestamps.

### Possible technical pipeline

1.  **Video intake:** Accept a video file only when the extension is
    being implemented; validate format, size, duration, and processing
    limits.
2.  **Audio extraction:** Use a tool such as FFmpeg to extract the audio
    track.
3.  **Speech-to-text:** Run automatic speech recognition (ASR) to create
    a transcript, ideally with timestamps.
4.  **Frame extraction:** Extract representative frames or frames around
    scene changes rather than analysing every frame by default.
5.  **On-screen text:** Run OCR on selected frames to detect titles,
    captions, disclaimers, product names, or other visible text.
6.  **Visual inspection:** Use a vision-capable model or suitable
    image-analysis logic to inspect selected frames for relevant
    logo/asset use and visual brand consistency.
7.  **Brand-source comparison:** Compare transcript text, detected
    on-screen text, and visual observations with approved facts,
    terminology, claims, and asset guidance.
8.  **Finding normalisation:** Combine results into a consistent report
    format, including the timestamp or time range, finding category,
    explanation, evidence/source reference where available, and
    suggested next action.
9.  **Human review:** Show timestamped findings to a reviewer; allow the
    reviewer to inspect the relevant video segment and decide what to
    change.
10. **Integration after completion:** Reuse the existing workspace,
    source library, findings/report model, and review/approval concepts
    where practical.

### Potential tools and components

-   FFmpeg for media processing and frame/audio extraction.
-   An ASR service/model for speech transcription.
-   OCR for text visible in frames.
-   A vision-capable model or image-analysis service for selected
    frames.
-   A language model grounded in approved brand sources for contextual
    comparison.
-   Backend orchestration to connect outputs, validate evidence, and
    produce timestamped findings.

These are possible implementation choices, not a selected or already
integrated stack. Choose tools later based on feasibility, licensing,
privacy, cost, and the team's environment.

### Video-specific constraints

-   Avoid building a full video editor; the extension is for review and
    timestamped findings.
-   Do not claim complete video understanding from sparse frame
    sampling.
-   Make uncertainty clear when audio, OCR, or visual evidence is
    ambiguous.
-   Treat AI findings as review assistance, not definitive truth.
-   Protect confidential videos and check external service data-handling
    terms.
-   Test the pipeline with representative examples before claiming it
    works.
-   Keep this feature entirely outside the main project scope until the
    core product is finished.

------------------------------------------------------------------------

## 11. Current Decisions and Open Questions

### Decisions already made

-   The project is a brand-governance and content-review platform, not a
    generic grammar checker.
-   The initial user model includes a company owner/admin, content
    creator, and manager/authorised reviewer.
-   The owner manages brand guidelines and invites team members.
-   The user prefers a VS Code-inspired interface with a top navbar,
    left files/sources panel, central content/review panel, and right
    report panel.
-   Creators should be able to share reviews with managers, who see the
    same review/report.
-   The core workflow centres on approved sources, content review,
    explainable findings, suggested corrections, human decisions, and
    review/approval.
-   Video review is an extra feature for after the main project is
    complete. It must remain separate from the main workflow and current
    core implementation.

### Not yet fixed in this context

-   Final technology stack and hosting.
-   Authentication method and exact invitation-link implementation.
-   Database schema and storage strategy.
-   Exact file formats supported in the first version.
-   Which review checks will be implemented first.
-   Which AI model, OCR, ASR, or vision service will be used.
-   Exact report schema and severity definitions.
-   Exact permissions and revision-history depth.
-   Official judging rubric, scoring weights, and event deadlines.

Do not assume these open questions have already been decided. Ask the
user or help compare options when the next task requires them.

------------------------------------------------------------------------

## 12. Guidance for the Next AI Assistant

When helping with this project: - Keep answers aligned with the current
scope and hackathon constraints. - Organise the user's ideas clearly and
distinguish their decisions from optional suggestions. - Do not
automatically expand the product into an enterprise-scale platform. -
Prefer concrete, testable milestones and an end-to-end working demo. -
Explain trade-offs and flag complexity before recommending it. - When
writing implementation plans, separate **core hackathon work**,
**optional if time permits**, and **future video extension**. - Never
put video processing into the main workflow unless the user explicitly
changes the scope. - Be clear about what is implemented, proposed,
assumed, and unverified.
