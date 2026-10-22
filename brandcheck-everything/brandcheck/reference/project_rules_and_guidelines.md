# Project Rules & Guidelines

## Purpose of This Document

This document translates the supplied problem statement into practical rules for planning, building, testing, and submitting the project. The problem statement identifies the challenge as maintaining consistent and trustworthy brand identity across content created by employees, agencies, and AI tools.

**Important:** “Must” and “required” refer to requirements stated in the supplied problem statement or its event rules. “Recommended” refers to practical guidance intended to help the team build a reliable project; it is not an additional official competition rule.

---

## 1. Understand the Problem Before Building

### Do
- Build a platform that reviews content **before publication** against approved brand guidelines, facts, terminology, and assets.
- Focus on preventing brand inconsistency and protecting trust and credibility.
- Consider the needs of content creators, managers, and authorised reviewers.
- Make findings understandable: explain what is wrong, why it matters, and which guideline or approved source supports the finding.
- Suggest corrections that preserve the creator’s original purpose rather than simply rejecting the content.
- Support human oversight alongside automation.

### Don’t
- Build only a generic grammar checker or text editor; the central goal is brand governance.
- Flag issues without explaining the reason or identifying supporting guidance where available.
- Assume every warning should automatically block publication.
- Present unsupported AI guesses as verified facts.
- Expand the scope so much that the core review-and-approval workflow is unfinished.

## 2. Core Product Capabilities

Treat the following as capabilities suggested by the problem statement. Prioritise a small, complete workflow over many incomplete features.

### Do
- Provide a way to import or define:
  - Brand guidelines.
  - Approved facts and claims.
  - Preferred terminology.
  - Reusable brand assets.
- Review the content formats the team explicitly supports, such as text, images, and documents.
- Check relevant issues involving:
  - Brand tone and language.
  - Terminology and messaging.
  - Fact consistency and outdated information.
  - Unsupported promotional claims.
  - Visual consistency and asset usage.
  - Accessibility.
- Explain each detected issue and point to the relevant approved guideline or source when possible.
- Offer suggested corrections that users can accept, edit, or reject.
- Include comments, approvals, revision history, and role-based review where feasible.
- Provide useful insights into repeated mistakes and unclear brand guidelines over time.
- Clearly show which formats and checks are currently supported.

### Don’t
- Claim to support a file type, integration, or check that has not been implemented and tested.
- Invent brand rules, approved facts, citations, or asset permissions.
- silently replace user content or make important decisions without human control.
- Treat every automated finding as certainly correct; allow users to review or challenge findings.
- Add analytics that look impressive but are not based on meaningful data.

## 3. User Experience and Workflow

### Do
- Make the main journey clear: **add approved brand sources → submit content → review findings → revise content → request review/approval → track the decision and changes**.
- Show findings in plain language and make the next action obvious.
- Distinguish errors, warnings, and suggestions if that helps users understand severity.
- Preserve the original content and make proposed changes visible before applying them.
- Show review status, comments, who acted, and relevant revision history.
- Design useful empty, loading, success, and error states.
- Make the interface usable with keyboard navigation and readable contrast.

### Don’t
- Hide why a result was flagged.
- Make users guess whether a review, upload, or approval succeeded.
- Use confusing status labels or a workflow that has no clear next step.
- Rely on colour alone to communicate a warning or status.
- Make the interface look complete while key controls are non-functional.

## 4. AI Quality and Explainability

### Do
- Ground checks in the organisation’s approved guidelines, facts, terminology, and assets.
- Separate source-backed findings from uncertain suggestions.
- Show the relevant rule or approved source behind a finding when available.
- Test for false positives, missed issues, inconsistent results, and misleading explanations.
- Handle missing, conflicting, or outdated source material carefully; ask for clarification or flag uncertainty rather than inventing an answer.
- Disclose the use of AI and external services as required by the event rules.
- Keep important publication and approval decisions under authorised human control.

### Don’t
- Treat an AI-generated answer as proof that a claim is true.
- Fabricate quotations, references, source documents, or confidence levels.
- promise perfect detection or zero errors.
- Automatically publish content or override an authorised reviewer’s decision without an explicit, approved workflow.
- Send confidential content to external services without an appropriate basis, safeguards, and disclosure.

## 5. Privacy, Security, and Responsible Design

The problem statement specifically calls for protection of confidential brand materials and responsible use of AI and external services.

### Do
- Collect and retain only the information the product needs.
- Restrict access according to user roles and permissions.
- Protect credentials and API keys using environment variables or a suitable secret manager; keep them out of source control.
- Avoid logging sensitive content, credentials, or personal information unnecessarily.
- Explain relevant data handling and external AI/API use to users.
- Use test or sample data during development when real confidential data is unnecessary.
- Respect privacy, intellectual property, data-protection requirements, and software licences.
- Check accessibility and avoid harmful, deceptive, illegal, or discriminatory use cases.

### Don’t
- Commit API keys, passwords, private documents, or other secrets to a public repository.
- expose one organisation’s confidential brand material to another organisation or unauthorised user.
- Use uploaded content for an unannounced purpose.
- Assume a third-party service is private or secure without checking its terms and configuration.
- Use copyrighted or third-party material without respecting applicable permissions and licences.

## 6. Technical and Coding Practices

These are recommended engineering practices, not additional official judging rules.

### Do
- Choose a technology stack that the team can explain, implement, test, and maintain within the official build window.
- Define a clear architecture and keep the interface, business logic, data handling, and external integrations reasonably separated.
- Use existing libraries, APIs, frameworks, datasets, and open-source components only in accordance with their licences.
- Keep configuration separate from code and document setup steps.
- Validate uploaded files and user input; handle unsupported formats and API failures gracefully.
- Add tests for the main review workflow and important edge cases.
- Use version control and meaningful commits to show development progress accurately.
- Keep a record of key technical decisions and known limitations.
- Make the core workflow work end to end before adding optional features.

### Don’t
- Add complex infrastructure without a clear need.
- Leave critical buttons, integrations, or workflow steps as placeholders in the final demonstration.
- ignore errors, failed API calls, empty inputs, or malformed files.
- hard-code secrets or rely on undocumented manual setup.
- claim that a feature is complete if it has not been tested.
- use libraries, templates, datasets, or code in ways that violate their licences.

## 7. Testing and Reliability

### Do
- Test a realistic end-to-end scenario: add brand rules, submit content, inspect findings, revise content, and complete a review or approval.
- Include examples with correct content, incorrect terminology, outdated facts, unsupported claims, off-brand tone, and visual/accessibility concerns where those checks are supported.
- Test missing or conflicting guidelines, unsupported files, network/API errors, and permission boundaries.
- Check that suggested edits do not unintentionally change the creator’s intended meaning.
- Record important bugs, fixes, and improvements.
- Gather user feedback or conduct structured testing where reasonably available, as the submission requirements request.

### Don’t
- Demonstrate only a happy path and ignore common failure cases.
- use fabricated test results as evidence of real user testing.
- claim a test was performed if it was not.
- hide known limitations that judges need to understand.

## 8. Competition Integrity and Development Window

The supplied problem statement’s general rules state that the product must be developed during the official build window communicated for the event. Research, planning, interviews, and idea discussions may happen earlier unless event instructions say otherwise.

### Do
- Confirm the official build-window dates, deadlines, and submission instructions with the organisers.
- Keep accurate repository history and development records.
- Disclose templates, boilerplate, previously created code, reused material, external services, and significant AI-generated components as required.
- Use third-party libraries and services within their licences and terms.
- Ensure the submission is the team’s own work.
- Accurately report every team member’s role and contribution.
- Make sure submitted links work and required materials are complete and truthful.
- Follow event instructions and community guidelines.

### Don’t
- Substantially build the project before the permitted development window if that violates the event rules.
- Misrepresent pre-existing code or AI-generated work as entirely new human-written work.
- Copy another team’s work or plagiarise.
- manipulate repository history, timestamps, testing evidence, or participant details.
- join more than one team in the same event; the supplied rules prohibit this.
- miss a deadline or assume an extension exists unless the organiser announces one.
- assume judges will accept a feature or submission item that has not been requested or approved.

## 9. Submission Checklist by Round

The event may use one or more stages. Complete every item announced for the stage that applies; the supplied statement says unused stages do not create an additional obligation.

### Round 1 — The Plan
- [ ] Define the problem and provide evidence that it is real.
- [ ] Identify target users, their needs, and the organisational context.
- [ ] Include supporting research, interviews, observations, surveys, or other evidence.
- [ ] Explain the proposed solution, value proposition, and end-to-end workflow.
- [ ] Describe planned features, technology stack, integrations, and data sources.
- [ ] Address privacy, security, responsible design, and human oversight.
- [ ] Include the development plan, role allocation, and expected impact.

**Judging weights**
- Understanding of the problem statement: 25 points.
- Proposed solution: 25 points.
- Technical plan: 20 points.
- Originality of approach: 15 points.
- Feasibility and scope: 15 points.

### Round 2 — The Build
- [ ] Provide a functional product, prototype, or demonstrable minimum viable product.
- [ ] Provide a public or judge-accessible source-code repository, unless the organiser approves another review method.
- [ ] Provide a deployed link, installation package, or clear functional demonstration.
- [ ] Explain the product architecture and main technical decisions.
- [ ] Disclose APIs, AI models, datasets, libraries, templates, and external services used.
- [ ] Provide user-testing evidence or structured feedback where reasonably available.
- [ ] State each team member’s contribution clearly.

**Judging weights**
- Core workflow runs end to end: 30 points.
- Technical depth and reliability: 25 points.
- Progress against the plan: 20 points.
- The three improvements named by the team: 15 points.
- Usability so far: 10 points.

**Important:** If the team names three improvements, track them explicitly and make sure they can be demonstrated and evidenced.

### Round 3 — The Finish
- [ ] Submit the final working product and source-code repository.
- [ ] Prepare a product demonstration video or live demonstration as requested.
- [ ] Prepare a concise presentation or report covering the problem, users, solution, workflow, technology, and impact.
- [ ] Provide evidence of testing, reliability improvements, and changes made during development.
- [ ] Explain privacy, security, accessibility, and responsible design.
- [ ] Document known limitations and a realistic future roadmap.
- [ ] Complete participant and contribution details in the required format.

**Judging weights**
- Completeness of the product: 25 points.
- The three improvements delivered: 20 points.
- Reliability under normal use: 20 points.
- Usability and real-world fit: 20 points.
- Documentation and roadmap: 15 points.

## 10. Final Team Checklist

### Before development
- [ ] Read the full problem statement and event instructions.
- [ ] Confirm the permitted build window and deadlines.
- [ ] Agree on target users, the core workflow, and a realistic feature scope.
- [ ] Assign roles and agree how contributions will be recorded.
- [ ] Select a feasible technology stack and identify data sources and external services.

### During development
- [ ] Build the core end-to-end workflow first.
- [ ] Use approved source material to ground brand checks.
- [ ] Explain findings and keep human review in control.
- [ ] Protect confidential data and credentials.
- [ ] Test regularly and record real progress.
- [ ] Track the three improvements named for judging, if applicable.
- [ ] Disclose reused code, templates, external services, and significant AI assistance.

### Before submission
- [ ] Verify that the product works in a fresh or documented setup.
- [ ] Test the main workflow and common failure cases.
- [ ] Check repository access, deployed links, and demonstration materials.
- [ ] Prepare architecture, technology, testing, privacy, limitations, and roadmap explanations.
- [ ] Verify all team contributions and participant details.
- [ ] Confirm every required item for the applicable round is included.
- [ ] Submit before the official deadline.

---

## 11. Source and Scope Notes

This document is based on the supplied five-page problem statement and its stated submission, judging, and general rules. The feature expectations and round-specific weights above reflect that document. Engineering recommendations are labelled as practical guidance rather than official competition rules.

The supplied problem statement does **not** require the project to be named “Inkloom AI”; that wording appears as the attribution “Problem Statement by Inkloom AI.” Choose a separate project name if the team prefers, and use it consistently in the interface, repository, documentation, and presentation.
