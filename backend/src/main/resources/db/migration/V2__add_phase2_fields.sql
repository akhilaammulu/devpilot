-- DevPilot Phase 2: Static Analysis Engines & Issue Status

ALTER TABLE issues ADD COLUMN IF NOT EXISTS engine VARCHAR(50);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'OPEN';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS language VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_issues_engine ON issues(engine);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
