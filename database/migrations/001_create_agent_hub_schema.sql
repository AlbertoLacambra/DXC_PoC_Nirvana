-- =====================================================
-- Agent Hub Database Schema
-- =====================================================
-- Description: PostgreSQL schema for Nirvana Agent Hub
-- Author: Alberto Lacambra
-- Date: 2025-11-06
-- Version: 1.0.0
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AGENTS TABLE
-- =====================================================
-- Stores metadata for both community and DXC custom agents

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('community', 'dxc-custom')),
    description TEXT NOT NULL,
    
    -- Content reference
    file_path TEXT NOT NULL, -- Path to .agent.md file in repository
    content TEXT, -- Full markdown content cached
    
    -- Metadata
    tools JSONB DEFAULT '[]'::jsonb, -- List of tools/capabilities
    mcp_servers JSONB DEFAULT '[]'::jsonb, -- MCP server dependencies
    tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Searchable tags
    
    -- Author information
    author VARCHAR(255),
    source_url TEXT, -- GitHub source URL
    
    -- Usage stats
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    
    -- Permissions
    required_roles TEXT[] DEFAULT ARRAY['developer']::TEXT[], -- RBAC roles
    is_approved BOOLEAN DEFAULT true, -- Admin approval flag
    is_active BOOLEAN DEFAULT true, -- Soft delete flag
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Indexes
    CONSTRAINT agents_name_check CHECK (char_length(name) >= 3),
    CONSTRAINT agents_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for agents
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_active ON agents(is_active) WHERE is_active = true;
CREATE INDEX idx_agents_approved ON agents(is_approved, is_active);
CREATE INDEX idx_agents_execution_count ON agents(execution_count DESC);

-- =====================================================
-- 2. PROMPTS TABLE
-- =====================================================
-- Stores reusable prompt templates

CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Content
    file_path TEXT NOT NULL,
    content TEXT NOT NULL, -- Full markdown content
    template TEXT, -- Extracted template with variables
    
    -- Metadata
    mode VARCHAR(50), -- chat, edit, workspace
    tools JSONB DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '[]'::jsonb, -- Template variables with types
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Categorization
    category VARCHAR(100), -- e.g., 'documentation', 'optimization', 'debugging'
    use_case TEXT, -- Description of when to use this prompt
    
    -- Author
    author VARCHAR(255),
    source_url TEXT,
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Permissions
    required_roles TEXT[] DEFAULT ARRAY['developer']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Indexes for prompts
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_mode ON prompts(mode);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_active ON prompts(is_active) WHERE is_active = true;
CREATE INDEX idx_prompts_usage_count ON prompts(usage_count DESC);

-- =====================================================
-- 3. INSTRUCTIONS TABLE
-- =====================================================
-- Stores technology-specific coding standards

CREATE TABLE IF NOT EXISTS instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Content
    file_path TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Technology classification
    technology VARCHAR(100) NOT NULL, -- e.g., 'terraform', 'python', 'kubernetes'
    technology_version VARCHAR(50), -- e.g., '1.5.x', '3.11'
    apply_to TEXT, -- File patterns to apply (e.g., '*.tf', '*.py')
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    related_technologies TEXT[] DEFAULT ARRAY[]::TEXT[], -- Related tech stacks
    
    -- Author
    author VARCHAR(255),
    source_url TEXT,
    
    -- Usage stats
    apply_count INTEGER DEFAULT 0,
    last_applied_at TIMESTAMP,
    
    -- Permissions
    required_roles TEXT[] DEFAULT ARRAY['developer']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Indexes for instructions
CREATE INDEX idx_instructions_technology ON instructions(technology);
CREATE INDEX idx_instructions_tags ON instructions USING GIN(tags);
CREATE INDEX idx_instructions_active ON instructions(is_active) WHERE is_active = true;
CREATE INDEX idx_instructions_apply_count ON instructions(apply_count DESC);

-- =====================================================
-- 4. CHAT_MODES TABLE
-- =====================================================
-- Stores specialized conversational modes

CREATE TABLE IF NOT EXISTS chat_modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Content
    file_path TEXT NOT NULL,
    content TEXT NOT NULL,
    system_prompt TEXT, -- Extracted system prompt
    
    -- Configuration
    model VARCHAR(100) DEFAULT 'gpt-4', -- AI model to use
    temperature DECIMAL(3,2) DEFAULT 0.7,
    tools JSONB DEFAULT '[]'::jsonb,
    
    -- Role classification
    role_category VARCHAR(100), -- e.g., 'architect', 'developer', 'dba', 'devops'
    expertise_areas TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['azure', 'terraform', 'security']
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Author
    author VARCHAR(255),
    source_url TEXT,
    
    -- Usage stats
    session_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Permissions
    required_roles TEXT[] DEFAULT ARRAY['developer']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Indexes for chat_modes
CREATE INDEX idx_chat_modes_role_category ON chat_modes(role_category);
CREATE INDEX idx_chat_modes_expertise ON chat_modes USING GIN(expertise_areas);
CREATE INDEX idx_chat_modes_tags ON chat_modes USING GIN(tags);
CREATE INDEX idx_chat_modes_active ON chat_modes(is_active) WHERE is_active = true;
CREATE INDEX idx_chat_modes_session_count ON chat_modes(session_count DESC);

-- =====================================================
-- 5. SESSIONS TABLE
-- =====================================================
-- Tracks usage sessions for agents and chat modes

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session type
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('agent', 'chat_mode', 'prompt')),
    
    -- References (nullable - only one should be set)
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    chat_mode_id UUID REFERENCES chat_modes(id) ON DELETE SET NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    
    -- User info
    user_id VARCHAR(255) NOT NULL, -- Azure AD user ID
    user_email VARCHAR(255),
    user_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Session data
    context JSONB, -- Initial context provided
    parameters JSONB, -- Execution parameters
    
    -- Tracking
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Results
    result JSONB, -- Execution result or chat history
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_type ON sessions(session_type);
CREATE INDEX idx_sessions_agent_id ON sessions(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_sessions_chat_mode_id ON sessions(chat_mode_id) WHERE chat_mode_id IS NOT NULL;
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX idx_sessions_status ON sessions(status);

-- =====================================================
-- 6. AUDIT_LOGS TABLE
-- =====================================================
-- Comprehensive audit trail for all operations

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event information
    event_type VARCHAR(100) NOT NULL, -- e.g., 'agent.execute', 'prompt.render', 'instruction.apply'
    entity_type VARCHAR(50) NOT NULL, -- 'agent', 'prompt', 'instruction', 'chat_mode'
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    
    -- User information
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Action details
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'execute'
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Changes (for updates)
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    metadata JSONB, -- Additional context
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT audit_logs_action_check CHECK (action IN ('create', 'read', 'update', 'delete', 'execute'))
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- 7. FAVORITES TABLE
-- =====================================================
-- User's favorite agents, prompts, etc.

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id VARCHAR(255) NOT NULL,
    
    -- Entity reference
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('agent', 'prompt', 'instruction', 'chat_mode')),
    entity_id UUID NOT NULL,
    
    -- Metadata
    notes TEXT, -- User's personal notes
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint: user can favorite an entity only once
    CONSTRAINT favorites_unique UNIQUE (user_id, entity_type, entity_id)
);

-- Indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_entity ON favorites(entity_type, entity_id);

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER instructions_updated_at BEFORE UPDATE ON instructions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER chat_modes_updated_at BEFORE UPDATE ON chat_modes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUNCTIONS
-- =====================================================

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_agent_usage(agent_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE agents 
    SET execution_count = execution_count + 1,
        last_executed_at = NOW()
    WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE prompts 
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = prompt_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_instruction_usage(instruction_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE instructions 
    SET apply_count = apply_count + 1,
        last_applied_at = NOW()
    WHERE id = instruction_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_chat_mode_usage(chat_mode_uuid UUID, is_new_session BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_modes 
    SET message_count = message_count + 1,
        session_count = CASE WHEN is_new_session THEN session_count + 1 ELSE session_count END,
        last_used_at = NOW()
    WHERE id = chat_mode_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. VIEWS
-- =====================================================

-- View: Popular Agents
CREATE OR REPLACE VIEW popular_agents AS
SELECT 
    id,
    name,
    slug,
    category,
    description,
    execution_count,
    last_executed_at,
    tags,
    is_active
FROM agents
WHERE is_active = true AND is_approved = true
ORDER BY execution_count DESC
LIMIT 20;

-- View: Popular Prompts
CREATE OR REPLACE VIEW popular_prompts AS
SELECT 
    id,
    name,
    slug,
    description,
    category,
    usage_count,
    last_used_at,
    tags,
    is_active
FROM prompts
WHERE is_active = true
ORDER BY usage_count DESC
LIMIT 20;

-- View: Agent Hub Statistics
CREATE OR REPLACE VIEW agent_hub_stats AS
SELECT 
    'agents' as entity_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true) as active,
    COUNT(*) FILTER (WHERE category = 'community') as community,
    COUNT(*) FILTER (WHERE category = 'dxc-custom') as dxc_custom,
    SUM(execution_count) as total_executions
FROM agents
UNION ALL
SELECT 
    'prompts',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    NULL,
    NULL,
    SUM(usage_count)
FROM prompts
UNION ALL
SELECT 
    'instructions',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    NULL,
    NULL,
    SUM(apply_count)
FROM instructions
UNION ALL
SELECT 
    'chat_modes',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    NULL,
    NULL,
    SUM(session_count)
FROM chat_modes;

-- =====================================================
-- 11. COMMENTS
-- =====================================================

COMMENT ON TABLE agents IS 'Metadata for AI agents (community and DXC custom)';
COMMENT ON TABLE prompts IS 'Reusable prompt templates with variables';
COMMENT ON TABLE instructions IS 'Technology-specific coding standards and best practices';
COMMENT ON TABLE chat_modes IS 'Specialized conversational modes for different roles';
COMMENT ON TABLE sessions IS 'Usage tracking for agents, chat modes, and prompts';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all operations';
COMMENT ON TABLE favorites IS 'User favorites for quick access';

COMMENT ON COLUMN agents.mcp_servers IS 'JSON array of MCP server dependencies';
COMMENT ON COLUMN agents.tools IS 'JSON array of tool capabilities';
COMMENT ON COLUMN prompts.variables IS 'JSON array of template variables with types and descriptions';
COMMENT ON COLUMN chat_modes.expertise_areas IS 'Array of expertise areas (e.g., azure, terraform)';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
