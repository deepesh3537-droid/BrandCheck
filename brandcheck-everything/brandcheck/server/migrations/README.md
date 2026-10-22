# Database Migrations

These numbered SQL files correspond to the database schema defined in `ARCHITECTURE.md`.

## Execution
Run migrations using the Node migration runner:
```bash
npm run migrate
```

## Migration Files
1. `001_users.sql`: `users` table and `pgcrypto` extension.
2. `002_workspaces_members.sql`: `workspaces` and `workspace_members` (roles: `owner`, `creator`, `reviewer`).
3. `003_invitations.sql`: Single-use invitation tokens with expiration.
4. `004_source_items.sql`: Approved guidelines, terminology, facts, claims, and tone guide with `REAL[]` embeddings (ADR-017).
5. `005_contents_versions.sql`: Content submissions and immutable version history (v1 original).
6. `006_reviews_findings.sql`: Reviews and normalized finding records (`source_backed` vs `uncertain`, 5 decisions).
7. `007_comments_events.sql`: Review comments and append-only audit event log (`review_events`).
