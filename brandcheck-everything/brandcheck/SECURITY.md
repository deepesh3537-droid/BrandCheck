# Security Requirements

> Security is built in from the first task, not added before the demo. The problem statement specifically calls for protecting confidential brand material and responsible use of AI and external services.

## Authentication

- Email + password, passwords hashed with `bcryptjs` (never stored or logged in plain text).
- Session: signed JWT in an **httpOnly**, `SameSite` cookie, `Secure` in any non-local environment. Short expiry.
- Rate-limit login, registration and invitation-accept endpoints.
- Generic error messages for failed login.
- Private routes require authentication on the **server**; the UI only mirrors it.

## Authorization and workspace isolation

- Roles: owner, creator, reviewer. Enforced in server middleware on every route, not only in the UI.
- Every query on workspace data is scoped by `workspace_id`, and membership is verified first.
- One organisation must never see another's brand material. Test this through direct API calls, not only through the UI.
- Users can only access resources in workspaces they belong to; reviewers can only act on reviews shared with them or in their workspace per the final rule.
- Do not claim a role protection until it is implemented and tested.

## Secrets

- Real values live in `.env` (git-ignored). The repository contains `.env.example` only.
- Never expose secrets to client-side code. Only variables explicitly prefixed for the client are bundled, and none of them may be secret.
- Never commit API keys, passwords, tokens, private documents or model caches.
- Rotate any secret that is ever committed by mistake.

## Input validation

- Validate every request body, parameter and query with Zod on the server.
- Validate model output with Zod before using it; discard anything that does not match.
- Use parameterised SQL only.
- Escape or sanitise anything rendered as HTML; do not render raw user or model output as HTML.

## File uploads

Validate on the server (never trust the client):
- File type (extension **and** content), initially `.txt` and `.md` only
- File size (limit from environment)
- Filename (sanitised; never used to build file paths)
- Text encoding; reject binary data
- Unsupported or malformed files produce a clear error and never enter the review pipeline

## AI and model safety

- Content under review is **data, never instructions**. Prompts must keep content clearly separated from system instructions.
- Treat model output as untrusted: validate, never execute it.
- A citation is accepted only if it points to a real source item in the same workspace; otherwise the finding is marked uncertain.
- Local models first. No content is sent to an external AI or API service unless the team approves it, discloses it, and checks the data-handling terms.
- Never fabricate citations, quotes or confidence scores.

## Logging and privacy

- Do not log content text, source text, credentials or personal data. Log identifiers, status and error types.
- Collect and keep only what the product needs.
- Use fictional data for development and demos; do not use real confidential material.
- Explain data handling and any external service use to users.

## Public vs private routes and the landing page

| Route | Access |
|---|---|
| `/` (landing), `/login`, `/register`, `/invite/:token` | Public |
| `/app/*` | Private; the server enforces access on every API call |

- The landing page makes **no API calls** and handles no user data or secrets.
- Landing preview content is fictional sample data; never real confidential material.
- Fonts, scripts and 3D assets are self-hosted or installed from npm; no third-party CDN or tracking / analytics scripts without team approval and disclosure.
- Verify the licence of every library, font, image and 3D asset (`docs/licences.md`).
- Only `VITE_*` variables reach the browser, and none may be secret. Never put keys in landing or client code.

## Transport and headers

- HTTPS in any hosted deployment.
- Use `helmet` for secure headers; a strict CORS allow-list from `CLIENT_ORIGIN`.
- CSRF protection through `SameSite` cookies plus an `Origin` check on state-changing requests.

## Dependencies and licences

- Verify the licence of every model, model revision, library and dependency before use.
- Keep dependencies minimal; run `npm audit` periodically and record the results honestly.
- Record reused code, templates and significant AI assistance for the submission disclosure.

## Incident basics

- Known limitations and any security gaps are documented, not hidden.
- If a secret leaks, rotate it and note it in `MEMORY.md`.

## Security checklist (tick only when verified)

- [ ] No secrets in the repo or client bundle
- [ ] Auth enforced server-side on every private route
- [ ] Cross-workspace access tested and denied
- [ ] Zod validation on all inputs and model outputs
- [ ] Upload validation tested
- [ ] Rate limiting on auth endpoints
- [ ] Logs reviewed for sensitive content
- [ ] Dependency, model, font and asset licences recorded in `docs/licences.md`
- [ ] Landing page makes no API calls and loads no third-party tracking scripts
