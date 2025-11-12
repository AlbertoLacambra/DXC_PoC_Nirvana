-- Migration: GitHub Projects Automation Schema
-- Version: 002
-- Created: 2025-11-09
-- Description: Tables for GitHub project automation, issue tracking, and hierarchy management

-- =====================================================
-- Table: github_projects
-- Stores GitHub project metadata and configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS github_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_owner VARCHAR(255) NOT NULL,
    repository_name VARCHAR(255) NOT NULL,
    github_project_id BIGINT, -- GitHub Project Board ID
    github_project_number INTEGER, -- Project number in repository
    status VARCHAR(50) DEFAULT 'draft', -- draft, planning, active, completed, archived
    priority VARCHAR(10), -- P0, P1, P2, P3
    timeline_start DATE,
    timeline_end DATE,
    success_metrics JSONB, -- Array of metric objects
    metadata JSONB, -- Additional configuration
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deployed_at TIMESTAMP WITH TIME ZONE, -- When deployed to GitHub
    CONSTRAINT github_projects_status_check CHECK (status IN ('draft', 'planning', 'active', 'completed', 'archived'))
);

-- =====================================================
-- Table: github_issues_tracking
-- Tracks GitHub issues created by automation
-- =====================================================
CREATE TABLE IF NOT EXISTS github_issues_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES github_projects(id) ON DELETE CASCADE,
    github_issue_number INTEGER NOT NULL, -- Issue number in repository
    github_issue_id BIGINT NOT NULL, -- GitHub issue ID
    issue_type VARCHAR(50) NOT NULL, -- epic, feature, story, enabler, test, task
    title VARCHAR(500) NOT NULL,
    body TEXT, -- Markdown content
    state VARCHAR(50) DEFAULT 'open', -- open, closed
    priority VARCHAR(10), -- P0, P1, P2, P3
    value VARCHAR(20), -- high, medium, low
    estimate VARCHAR(50), -- Story points or T-shirt size
    labels JSONB, -- Array of label strings
    assignees JSONB, -- Array of GitHub usernames
    milestone VARCHAR(255),
    sprint VARCHAR(50),
    component VARCHAR(100),
    parent_issue_id UUID REFERENCES github_issues_tracking(id), -- Reference to parent (Feature → Epic, Story → Feature)
    hierarchy_level INTEGER DEFAULT 0, -- 0=Epic, 1=Feature, 2=Story/Enabler/Test, 3=Task
    hierarchy_path VARCHAR(500), -- e.g., "1.2.3" for Epic 1, Feature 2, Story 3
    dependencies JSONB, -- Array of dependency objects: {type: "blocks|blocked-by|related|prerequisite", issue_number: 123}
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE, -- Last sync from GitHub
    CONSTRAINT github_issues_type_check CHECK (issue_type IN ('epic', 'feature', 'story', 'enabler', 'test', 'task')),
    CONSTRAINT github_issues_state_check CHECK (state IN ('open', 'in_progress', 'review', 'testing', 'closed')),
    CONSTRAINT github_issues_priority_check CHECK (priority IN ('P0', 'P1', 'P2', 'P3') OR priority IS NULL),
    CONSTRAINT github_issues_value_check CHECK (value IN ('high', 'medium', 'low') OR value IS NULL)
);

-- =====================================================
-- Table: project_board_columns
-- Tracks GitHub Project Board column configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS project_board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES github_projects(id) ON DELETE CASCADE,
    column_name VARCHAR(100) NOT NULL,
    column_order INTEGER NOT NULL,
    github_column_id VARCHAR(255), -- GitHub Project column ID
    automation_rules JSONB, -- Automation configuration for column
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_board_columns_unique UNIQUE (project_id, column_name)
);

-- =====================================================
-- Table: project_generation_logs
-- Audit log for AI-generated project plans
-- =====================================================
CREATE TABLE IF NOT EXISTS project_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES github_projects(id) ON DELETE CASCADE,
    user_input TEXT NOT NULL, -- Original user description
    agent_prompt TEXT, -- Full prompt sent to AI
    ai_response TEXT, -- Raw AI response
    generated_plan JSONB, -- Parsed JSON plan
    model_used VARCHAR(100), -- e.g., "gpt-4o"
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'success', -- success, error, partial
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_generation_logs_status_check CHECK (status IN ('success', 'error', 'partial'))
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_github_projects_status ON github_projects(status);
CREATE INDEX idx_github_projects_repository ON github_projects(repository_owner, repository_name);
CREATE INDEX idx_github_projects_created_at ON github_projects(created_at DESC);

CREATE INDEX idx_github_issues_project_id ON github_issues_tracking(project_id);
CREATE INDEX idx_github_issues_github_number ON github_issues_tracking(github_issue_number);
CREATE INDEX idx_github_issues_type ON github_issues_tracking(issue_type);
CREATE INDEX idx_github_issues_state ON github_issues_tracking(state);
CREATE INDEX idx_github_issues_priority ON github_issues_tracking(priority);
CREATE INDEX idx_github_issues_parent ON github_issues_tracking(parent_issue_id);
CREATE INDEX idx_github_issues_hierarchy ON github_issues_tracking(hierarchy_level, hierarchy_path);

CREATE INDEX idx_project_board_columns_project ON project_board_columns(project_id, column_order);

CREATE INDEX idx_project_generation_logs_project ON project_generation_logs(project_id);
CREATE INDEX idx_project_generation_logs_created_at ON project_generation_logs(created_at DESC);

-- =====================================================
-- Views for Reporting
-- =====================================================

-- View: Project hierarchy with issue counts
CREATE OR REPLACE VIEW vw_project_hierarchy_summary AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.status,
    COUNT(DISTINCT CASE WHEN i.issue_type = 'epic' THEN i.id END) AS epics_count,
    COUNT(DISTINCT CASE WHEN i.issue_type = 'feature' THEN i.id END) AS features_count,
    COUNT(DISTINCT CASE WHEN i.issue_type = 'story' THEN i.id END) AS stories_count,
    COUNT(DISTINCT CASE WHEN i.issue_type = 'enabler' THEN i.id END) AS enablers_count,
    COUNT(DISTINCT CASE WHEN i.issue_type = 'test' THEN i.id END) AS tests_count,
    COUNT(DISTINCT CASE WHEN i.state = 'closed' THEN i.id END) AS closed_count,
    COUNT(i.id) AS total_issues,
    ROUND(COUNT(DISTINCT CASE WHEN i.state = 'closed' THEN i.id END)::NUMERIC / NULLIF(COUNT(i.id), 0) * 100, 2) AS completion_percentage,
    p.created_at,
    p.deployed_at
FROM github_projects p
LEFT JOIN github_issues_tracking i ON p.id = i.project_id
GROUP BY p.id, p.name, p.status, p.created_at, p.deployed_at;

-- View: Issue dependencies graph
CREATE OR REPLACE VIEW vw_issue_dependencies AS
SELECT 
    i.id,
    i.project_id,
    i.github_issue_number,
    i.title,
    i.issue_type,
    i.priority,
    dep->>'type' AS dependency_type,
    (dep->>'issue_number')::INTEGER AS depends_on_issue_number,
    i2.id AS depends_on_issue_id,
    i2.title AS depends_on_title,
    i2.state AS depends_on_state
FROM github_issues_tracking i
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i.dependencies, '[]'::jsonb)) AS dep
LEFT JOIN github_issues_tracking i2 ON i2.project_id = i.project_id 
    AND i2.github_issue_number = (dep->>'issue_number')::INTEGER
WHERE i.dependencies IS NOT NULL AND jsonb_array_length(i.dependencies) > 0;

-- View: Sprint velocity tracking
CREATE OR REPLACE VIEW vw_sprint_metrics AS
SELECT 
    project_id,
    sprint,
    COUNT(DISTINCT id) AS total_stories,
    COUNT(DISTINCT CASE WHEN state = 'closed' THEN id END) AS completed_stories,
    SUM(CASE WHEN estimate ~ '^\d+$' THEN estimate::INTEGER ELSE 0 END) AS total_points,
    SUM(CASE WHEN state = 'closed' AND estimate ~ '^\d+$' THEN estimate::INTEGER ELSE 0 END) AS completed_points,
    ROUND(
        COUNT(DISTINCT CASE WHEN state = 'closed' THEN id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT id), 0) * 100, 
        2
    ) AS completion_rate
FROM github_issues_tracking
WHERE issue_type IN ('story', 'enabler') 
    AND sprint IS NOT NULL
GROUP BY project_id, sprint
ORDER BY project_id, sprint;

-- =====================================================
-- Triggers for Automatic Timestamp Updates
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_github_projects_updated_at
    BEFORE UPDATE ON github_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_issues_tracking_updated_at
    BEFORE UPDATE ON github_issues_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Functions for Helper Operations
-- =====================================================

-- Function: Get full issue hierarchy for a project
CREATE OR REPLACE FUNCTION get_project_hierarchy(p_project_id UUID)
RETURNS TABLE (
    issue_id UUID,
    issue_number INTEGER,
    title VARCHAR,
    issue_type VARCHAR,
    hierarchy_level INTEGER,
    hierarchy_path VARCHAR,
    parent_title VARCHAR,
    priority VARCHAR,
    state VARCHAR,
    estimate VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.github_issue_number,
        i.title,
        i.issue_type,
        i.hierarchy_level,
        i.hierarchy_path,
        p.title AS parent_title,
        i.priority,
        i.state,
        i.estimate
    FROM github_issues_tracking i
    LEFT JOIN github_issues_tracking p ON i.parent_issue_id = p.id
    WHERE i.project_id = p_project_id
    ORDER BY i.hierarchy_path, i.hierarchy_level;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate project health score
CREATE OR REPLACE FUNCTION calculate_project_health(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    completed_count INTEGER;
    blocked_count INTEGER;
    p0_open_count INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN state = 'closed' THEN 1 END),
        COUNT(CASE WHEN dependencies::TEXT LIKE '%blocked-by%' AND state != 'closed' THEN 1 END),
        COUNT(CASE WHEN priority = 'P0' AND state != 'closed' THEN 1 END)
    INTO total_count, completed_count, blocked_count, p0_open_count
    FROM github_issues_tracking
    WHERE project_id = p_project_id;

    result := json_build_object(
        'total_issues', total_count,
        'completed', completed_count,
        'completion_rate', ROUND(completed_count::NUMERIC / NULLIF(total_count, 0) * 100, 2),
        'blocked_issues', blocked_count,
        'critical_open', p0_open_count,
        'health_score', CASE 
            WHEN p0_open_count > 0 THEN 'critical'
            WHEN blocked_count > total_count * 0.2 THEN 'at-risk'
            WHEN completed_count::NUMERIC / NULLIF(total_count, 0) > 0.7 THEN 'healthy'
            ELSE 'on-track'
        END
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE github_projects IS 'Stores GitHub project metadata and configuration for automation';
COMMENT ON TABLE github_issues_tracking IS 'Tracks all GitHub issues created by project automation with hierarchy and dependencies';
COMMENT ON TABLE project_board_columns IS 'GitHub Project Board column configuration for Kanban workflow';
COMMENT ON TABLE project_generation_logs IS 'Audit log for AI-generated project plans and API calls';
COMMENT ON VIEW vw_project_hierarchy_summary IS 'Summary view of project issues grouped by type with completion metrics';
COMMENT ON VIEW vw_issue_dependencies IS 'Flattened view of issue dependencies for dependency graph visualization';
COMMENT ON VIEW vw_sprint_metrics IS 'Sprint-level metrics for velocity tracking and predictability analysis';
