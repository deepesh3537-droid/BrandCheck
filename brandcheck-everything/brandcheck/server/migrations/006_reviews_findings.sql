CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_version_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'ready', 'failed', 'in_review', 'changes_requested', 'approved')),
  models_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  skipped_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('terminology', 'fact', 'claim', 'tone', 'visual', 'accessibility')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('error', 'warning', 'suggestion')),
  evidence_status VARCHAR(50) NOT NULL CHECK (evidence_status IN ('source_backed', 'uncertain')),
  span_start INTEGER NOT NULL,
  span_end INTEGER NOT NULL,
  flagged_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  source_item_id UUID REFERENCES source_items(id) ON DELETE SET NULL,
  suggested_text TEXT,
  confidence REAL,
  origin VARCHAR(50) NOT NULL CHECK (origin IN ('rule', 'model')),
  decision VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending', 'accepted', 'edited', 'rejected', 'deferred', 'challenged')),
  decision_text TEXT,
  decision_note TEXT,
  decided_by UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_content_version_id ON reviews(content_version_id);
CREATE INDEX IF NOT EXISTS idx_findings_review_id ON findings(review_id);
CREATE INDEX IF NOT EXISTS idx_findings_source_item_id ON findings(source_item_id);
