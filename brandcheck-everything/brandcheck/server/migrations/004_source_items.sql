CREATE TABLE IF NOT EXISTS source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('guideline', 'term', 'fact', 'claim', 'tone')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  structured JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding REAL[],
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_items_workspace_id ON source_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_source_items_workspace_type ON source_items(workspace_id, type);
