-- =============================================================================
-- Migration: 001_create_specs_tables.sql
-- Description: Create tables for Spec Library Manager
-- Author: DXC Cloud Mind - Nirvana Team
-- Date: 2025-10-28
-- =============================================================================

-- Drop tables if exist (for development, remove in production)
DROP TABLE IF EXISTS spec_usage CASCADE;
DROP TABLE IF EXISTS spec_versions CASCADE;
DROP TABLE IF EXISTS specs CASCADE;

-- =============================================================================
-- Table: specs
-- Description: Main table to store specifications
-- =============================================================================

CREATE TABLE specs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  content TEXT NOT NULL,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  
  -- Metadata (Arrays)
  tags TEXT[] DEFAULT '{}',
  applicable_to TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  conflicts TEXT[] DEFAULT '{}',
  
  -- Validation
  required BOOLEAN DEFAULT false,
  min_version VARCHAR(20),
  max_version VARCHAR(20),
  
  -- Usage Tracking
  project_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  popularity INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT specs_category_check CHECK (category IN (
    'development', 
    'infrastructure', 
    'security', 
    'testing', 
    'observability', 
    'finops', 
    'compliance'
  )),
  CONSTRAINT specs_status_check CHECK (status IN (
    'draft', 
    'active', 
    'deprecated', 
    'archived'
  )),
  CONSTRAINT specs_version_format CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Create indexes for specs table
CREATE INDEX idx_specs_category ON specs(category);
CREATE INDEX idx_specs_status ON specs(status);
CREATE INDEX idx_specs_tags ON specs USING GIN(tags);
CREATE INDEX idx_specs_name ON specs(name);
CREATE INDEX idx_specs_popularity ON specs(popularity DESC);
CREATE INDEX idx_specs_created_at ON specs(created_at DESC);
CREATE INDEX idx_specs_updated_at ON specs(updated_at DESC);

-- Create full-text search index
CREATE INDEX idx_specs_search ON specs USING GIN(
  to_tsvector('english', 
    COALESCE(display_name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(content, '')
  )
);

-- Comment on table
COMMENT ON TABLE specs IS 'Main table storing all specifications with metadata and versioning';
COMMENT ON COLUMN specs.name IS 'Unique identifier for the spec (kebab-case)';
COMMENT ON COLUMN specs.display_name IS 'Human-readable name for the spec';
COMMENT ON COLUMN specs.category IS 'Category of the spec (development, infrastructure, security, etc.)';
COMMENT ON COLUMN specs.status IS 'Current status (draft, active, deprecated, archived)';
COMMENT ON COLUMN specs.content IS 'Full markdown content of the spec';
COMMENT ON COLUMN specs.applicable_to IS 'Project types where this spec applies (backend, frontend, infrastructure)';
COMMENT ON COLUMN specs.dependencies IS 'Array of spec names that this spec depends on';
COMMENT ON COLUMN specs.conflicts IS 'Array of spec names that conflict with this spec';
COMMENT ON COLUMN specs.popularity IS 'Calculated popularity score based on usage';

-- =============================================================================
-- Table: spec_versions
-- Description: Version history for specifications
-- =============================================================================

CREATE TABLE spec_versions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  spec_id UUID NOT NULL REFERENCES specs(id) ON DELETE CASCADE,
  
  -- Version Information
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  changelog TEXT,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  
  -- Constraints
  UNIQUE(spec_id, version),
  CONSTRAINT spec_versions_version_format CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Create indexes for spec_versions table
CREATE INDEX idx_spec_versions_spec_id ON spec_versions(spec_id);
CREATE INDEX idx_spec_versions_version ON spec_versions(version);
CREATE INDEX idx_spec_versions_created_at ON spec_versions(created_at DESC);

-- Comment on table
COMMENT ON TABLE spec_versions IS 'Version history for specifications, following semantic versioning';
COMMENT ON COLUMN spec_versions.spec_id IS 'Reference to the parent spec';
COMMENT ON COLUMN spec_versions.version IS 'Semantic version number (e.g., 1.0.0)';
COMMENT ON COLUMN spec_versions.changelog IS 'Description of changes in this version';

-- =============================================================================
-- Table: spec_usage
-- Description: Track which projects use which specs
-- =============================================================================

CREATE TABLE spec_usage (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  spec_id UUID NOT NULL REFERENCES specs(id) ON DELETE CASCADE,
  
  -- Project Information
  project_id UUID NOT NULL,
  project_name VARCHAR(200),
  
  -- Usage Tracking
  applied_at TIMESTAMP DEFAULT NOW(),
  spec_version VARCHAR(20),
  
  -- Constraints
  UNIQUE(spec_id, project_id)
);

-- Create indexes for spec_usage table
CREATE INDEX idx_spec_usage_spec_id ON spec_usage(spec_id);
CREATE INDEX idx_spec_usage_project_id ON spec_usage(project_id);
CREATE INDEX idx_spec_usage_applied_at ON spec_usage(applied_at DESC);

-- Comment on table
COMMENT ON TABLE spec_usage IS 'Tracks which projects use which specifications for analytics';
COMMENT ON COLUMN spec_usage.spec_id IS 'Reference to the spec being used';
COMMENT ON COLUMN spec_usage.project_id IS 'UUID of the project using this spec';
COMMENT ON COLUMN spec_usage.project_name IS 'Human-readable name of the project';
COMMENT ON COLUMN spec_usage.applied_at IS 'When the spec was applied to the project';

-- =============================================================================
-- Functions
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on specs table
CREATE TRIGGER update_specs_updated_at 
  BEFORE UPDATE ON specs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update popularity score
CREATE OR REPLACE FUNCTION update_spec_popularity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update popularity based on project_count
    UPDATE specs 
    SET popularity = project_count * 10 + 
                     EXTRACT(EPOCH FROM (NOW() - last_used)) / 86400 -- Factor in recency
    WHERE id = NEW.spec_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update popularity when spec_usage changes
CREATE TRIGGER update_popularity_on_usage 
  AFTER INSERT OR UPDATE ON spec_usage 
  FOR EACH ROW 
  EXECUTE FUNCTION update_spec_popularity();

-- =============================================================================
-- Grants (adjust as needed for your user)
-- =============================================================================

-- Grant permissions to the application user (replace 'nirvana_app' with your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON specs TO nirvana_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON spec_versions TO nirvana_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON spec_usage TO nirvana_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nirvana_app;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Verify tables were created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('specs', 'spec_versions', 'spec_usage')
ORDER BY table_name;

-- Output migration status
DO $$
BEGIN
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Migration 001_create_specs_tables.sql completed successfully';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - specs (with % columns)', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'specs');
  RAISE NOTICE '  - spec_versions (with % columns)', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'spec_versions');
  RAISE NOTICE '  - spec_usage (with % columns)', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'spec_usage');
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Next step: Run 002_seed_predefined_specs.sql to populate initial data';
  RAISE NOTICE '=============================================================================';
END $$;
