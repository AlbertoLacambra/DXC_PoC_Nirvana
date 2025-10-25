-- ============================================================================
-- Knowledge Portal - PostgreSQL Vector Database Schema
-- ============================================================================
-- Database: nirvana_knowledge
-- Server: dify-postgres-9107e36a.postgres.database.azure.com (existing)
-- Extensions: vector (already installed)
-- ============================================================================

-- Step 1: Connect to default database to create new database
-- Run this from psql or Azure Data Studio:
-- psql -h dify-postgres-9107e36a.postgres.database.azure.com -U difyadmin -d postgres

-- Create new database for Knowledge Portal
CREATE DATABASE nirvana_knowledge
    WITH 
    OWNER = difyadmin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

COMMENT ON DATABASE nirvana_knowledge IS 'Knowledge Portal vector database for DXC Cloud Mind - Nirvana';

-- ============================================================================
-- Step 2: Connect to new database and enable extensions
-- \c nirvana_knowledge
-- ============================================================================

-- Enable vector extension (should already be available)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search (already built-in, just confirming)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMENT ON EXTENSION vector IS 'Vector similarity search for embeddings';
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';

-- ============================================================================
-- Step 3: Create tables
-- ============================================================================

-- Main knowledge chunks table with vector embeddings
CREATE TABLE knowledge_chunks (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,  -- SHA-256 for deduplication
    embedding vector(1536),  -- text-embedding-3-large (1536 dimensions)
    
    -- Source metadata
    source_type VARCHAR(50) NOT NULL,  -- 'github', 'adr', 'code', 'runbook', 'confluence', etc.
    source_url TEXT,
    file_path TEXT NOT NULL,
    repository VARCHAR(255),
    
    -- Categorization
    category VARCHAR(100),  -- 'architecture', 'code', 'troubleshooting', 'guide', etc.
    tags TEXT[],
    language VARCHAR(50),  -- 'python', 'typescript', 'markdown', 'yaml', etc.
    
    -- Versioning
    version VARCHAR(50),
    commit_sha VARCHAR(40),
    branch VARCHAR(100) DEFAULT 'master',
    
    -- Author and timestamps
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Quality metrics
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Full-text search vector (auto-generated)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', content)
    ) STORED,
    
    -- Constraints
    CONSTRAINT unique_content_hash UNIQUE (content_hash, file_path)
);

-- Indexes for knowledge_chunks
CREATE INDEX idx_embedding ON knowledge_chunks 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX idx_source_type ON knowledge_chunks(source_type);
CREATE INDEX idx_category ON knowledge_chunks(category);
CREATE INDEX idx_tags ON knowledge_chunks USING gin(tags);
CREATE INDEX idx_search_vector ON knowledge_chunks USING gin(search_vector);
CREATE INDEX idx_created_at ON knowledge_chunks(created_at DESC);
CREATE INDEX idx_file_path ON knowledge_chunks(file_path);
CREATE INDEX idx_repository ON knowledge_chunks(repository);
CREATE INDEX idx_language ON knowledge_chunks(language);
CREATE INDEX idx_usage_count ON knowledge_chunks(usage_count DESC);

-- Comments
COMMENT ON TABLE knowledge_chunks IS 'Vector embeddings and metadata for knowledge base chunks';
COMMENT ON COLUMN knowledge_chunks.embedding IS 'Vector embedding (1536 dims) from text-embedding-3-large';
COMMENT ON COLUMN knowledge_chunks.content_hash IS 'SHA-256 hash for deduplication';
COMMENT ON COLUMN knowledge_chunks.quality_score IS 'Quality score 0-1 based on content analysis';
COMMENT ON COLUMN knowledge_chunks.usage_count IS 'Number of times this chunk was retrieved in RAG queries';

-- ============================================================================
-- Source documents tracking table
-- ============================================================================

CREATE TABLE source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- File identification
    file_path TEXT NOT NULL UNIQUE,
    repository VARCHAR(255),
    
    -- Content
    content TEXT,
    content_hash VARCHAR(64) NOT NULL,  -- SHA-256 of full document
    
    -- Metadata
    file_size INTEGER,
    file_type VARCHAR(50),
    language VARCHAR(50),
    
    -- Chunking info
    chunks_count INTEGER DEFAULT 0,
    total_tokens INTEGER,
    
    -- Versioning
    commit_sha VARCHAR(40),
    branch VARCHAR(100) DEFAULT 'master',
    
    -- Sync status
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'synced', 'pending', 'failed'
    sync_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for source_documents
CREATE INDEX idx_source_file_path ON source_documents(file_path);
CREATE INDEX idx_source_repository ON source_documents(repository);
CREATE INDEX idx_source_sync_status ON source_documents(sync_status);
CREATE INDEX idx_source_last_synced ON source_documents(last_synced DESC);

-- Comments
COMMENT ON TABLE source_documents IS 'Original source documents before chunking';
COMMENT ON COLUMN source_documents.chunks_count IS 'Number of chunks generated from this document';
COMMENT ON COLUMN source_documents.sync_status IS 'Sync status: synced, pending, failed';

-- ============================================================================
-- Query logs table (for analytics and improvement)
-- ============================================================================

CREATE TABLE query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Query details
    query_text TEXT NOT NULL,
    query_type VARCHAR(50), -- 'search', 'code_generation', 'troubleshooting', etc.
    
    -- Results
    top_chunks_ids UUID[],
    chunks_used INTEGER,
    avg_similarity_score FLOAT,
    
    -- Response
    response_text TEXT,
    response_tokens INTEGER,
    
    -- Performance
    execution_time_ms INTEGER,
    
    -- User context
    user_id VARCHAR(255),
    source VARCHAR(50), -- 'web_ui', 'vscode', 'api'
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for query_logs
CREATE INDEX idx_query_created_at ON query_logs(created_at DESC);
CREATE INDEX idx_query_type ON query_logs(query_type);
CREATE INDEX idx_query_source ON query_logs(source);
CREATE INDEX idx_query_rating ON query_logs(user_rating);

-- Comments
COMMENT ON TABLE query_logs IS 'Query logs for analytics and quality improvement';
COMMENT ON COLUMN query_logs.avg_similarity_score IS 'Average cosine similarity of retrieved chunks';

-- ============================================================================
-- Functions and triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for knowledge_chunks
CREATE TRIGGER update_knowledge_chunks_updated_at 
    BEFORE UPDATE ON knowledge_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for source_documents
CREATE TRIGGER update_source_documents_updated_at 
    BEFORE UPDATE ON source_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Helper views
-- ============================================================================

-- View for most used chunks (for quality analysis)
CREATE VIEW top_chunks AS
SELECT 
    id,
    LEFT(content, 100) || '...' as content_preview,
    source_type,
    category,
    usage_count,
    quality_score,
    last_used_at
FROM knowledge_chunks
WHERE usage_count > 0
ORDER BY usage_count DESC
LIMIT 100;

-- View for sync status summary
CREATE VIEW sync_status_summary AS
SELECT 
    sync_status,
    COUNT(*) as document_count,
    MAX(last_synced) as last_sync_time
FROM source_documents
GROUP BY sync_status;

-- View for category statistics
CREATE VIEW category_statistics AS
SELECT 
    category,
    COUNT(*) as chunk_count,
    AVG(quality_score) as avg_quality,
    AVG(usage_count) as avg_usage
FROM knowledge_chunks
WHERE category IS NOT NULL
GROUP BY category
ORDER BY chunk_count DESC;

-- ============================================================================
-- Grant permissions to difyadmin (should already have them)
-- ============================================================================

GRANT ALL PRIVILEGES ON DATABASE nirvana_knowledge TO difyadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO difyadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO difyadmin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO difyadmin;

-- ============================================================================
-- Sample data for testing (optional)
-- ============================================================================

-- Insert a test chunk
INSERT INTO knowledge_chunks (
    content,
    content_hash,
    source_type,
    file_path,
    repository,
    category,
    tags,
    language,
    quality_score
) VALUES (
    'This is a test knowledge chunk for the Nirvana Knowledge Portal. It demonstrates how documentation is stored with vector embeddings.',
    encode(sha256('test content'::bytea), 'hex'),
    'test',
    'test/sample.md',
    'DXC_PoC_Nirvana',
    'test',
    ARRAY['test', 'sample'],
    'markdown',
    0.95
);

-- Verify tables were created
SELECT 
    table_name, 
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify vector extension is working
SELECT 
    extname, 
    extversion
FROM pg_extension
WHERE extname IN ('vector', 'uuid-ossp');

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- Cleanup (only if needed to start over)
-- ============================================================================

-- DROP DATABASE IF EXISTS nirvana_knowledge;

-- ============================================================================
-- End of schema setup
-- ============================================================================
