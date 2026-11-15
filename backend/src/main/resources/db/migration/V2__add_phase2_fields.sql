-- DevPilot Phase 2: Static Analysis Engines & Issue Model Normalization

ALTER TABLE issues ADD COLUMN IF NOT EXISTS engine VARCHAR(50);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'OPEN';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS language VARCHAR(50);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS start_column INT DEFAULT 1;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS end_column INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_issues_engine ON issues(engine);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
