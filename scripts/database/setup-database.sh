#!/bin/bash

# ============================================================================
# Setup Knowledge Portal Database
# ============================================================================
# This script creates the nirvana_knowledge database and applies the schema
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Knowledge Portal - Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
POSTGRES_HOST="dify-postgres-9107e36a.postgres.database.azure.com"
POSTGRES_USER="difyadmin"
POSTGRES_DB="postgres"  # Connect to default DB first
NEW_DB="nirvana_knowledge"

# Check if password is provided
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${YELLOW}PostgreSQL password not set in environment${NC}"
    echo -n "Enter PostgreSQL password for difyadmin: "
    read -s POSTGRES_PASSWORD
    echo ""
fi

export PGPASSWORD="$POSTGRES_PASSWORD"

echo -e "${YELLOW}Step 1: Testing connection to PostgreSQL...${NC}"
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed. Please check credentials and VPN connection.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Checking if database already exists...${NC}"
DB_EXISTS=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='$NEW_DB'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠ Database '$NEW_DB' already exists${NC}"
    echo -n "Do you want to drop and recreate it? (yes/no): "
    read ANSWER
    if [ "$ANSWER" = "yes" ]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE $NEW_DB;"
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo -e "${YELLOW}Skipping database creation${NC}"
        echo -n "Do you want to apply schema to existing database? (yes/no): "
        read APPLY_SCHEMA
        if [ "$APPLY_SCHEMA" != "yes" ]; then
            echo -e "${YELLOW}Exiting without changes${NC}"
            exit 0
        fi
        # Skip to Step 4
        SKIP_CREATE=true
    fi
fi

if [ "$SKIP_CREATE" != "true" ]; then
    echo ""
    echo -e "${YELLOW}Step 3: Creating new database '$NEW_DB'...${NC}"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    CREATE DATABASE $NEW_DB
        WITH 
        OWNER = difyadmin
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.utf8'
        LC_CTYPE = 'en_US.utf8'
        TEMPLATE = template0;
    "
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create database${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}Step 4: Enabling extensions...${NC}"
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$NEW_DB" << EOF
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Extensions enabled (vector, uuid-ossp)${NC}"
else
    echo -e "${RED}✗ Failed to enable extensions${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Creating tables and indexes...${NC}"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SQL_FILE="$SCRIPT_DIR/setup-knowledge-db.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}✗ SQL file not found: $SQL_FILE${NC}"
    exit 1
fi

# Execute the SQL schema (skip CREATE DATABASE and EXTENSION parts)
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$NEW_DB" << 'EOF'
-- Main knowledge chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    embedding vector(1536),
    source_type VARCHAR(50) NOT NULL,
    source_url TEXT,
    file_path TEXT NOT NULL,
    repository VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    language VARCHAR(50),
    version VARCHAR(50),
    commit_sha VARCHAR(40),
    branch VARCHAR(100) DEFAULT 'master',
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    CONSTRAINT unique_content_hash UNIQUE (content_hash, file_path)
);

CREATE INDEX IF NOT EXISTS idx_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_source_type ON knowledge_chunks(source_type);
CREATE INDEX IF NOT EXISTS idx_category ON knowledge_chunks(category);
CREATE INDEX IF NOT EXISTS idx_tags ON knowledge_chunks USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_search_vector ON knowledge_chunks USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_created_at ON knowledge_chunks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_path ON knowledge_chunks(file_path);

CREATE TABLE IF NOT EXISTS source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL UNIQUE,
    repository VARCHAR(255),
    content TEXT,
    content_hash VARCHAR(64) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    language VARCHAR(50),
    chunks_count INTEGER DEFAULT 0,
    total_tokens INTEGER,
    commit_sha VARCHAR(40),
    branch VARCHAR(100) DEFAULT 'master',
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'synced',
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_file_path ON source_documents(file_path);
CREATE INDEX IF NOT EXISTS idx_source_sync_status ON source_documents(sync_status);

CREATE TABLE IF NOT EXISTS query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_type VARCHAR(50),
    top_chunks_ids UUID[],
    chunks_used INTEGER,
    avg_similarity_score FLOAT,
    response_text TEXT,
    response_tokens INTEGER,
    execution_time_ms INTEGER,
    user_id VARCHAR(255),
    source VARCHAR(50),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_created_at ON query_logs(created_at DESC);
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tables and indexes created${NC}"
else
    echo -e "${RED}✗ Failed to create tables${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 6: Verifying setup...${NC}"

# Verify extensions
psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$NEW_DB" -c "
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('vector', 'uuid-ossp');" | grep -q "vector"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Vector extension verified${NC}"
else
    echo -e "${RED}✗ Vector extension not found${NC}"
fi

# Verify tables
TABLE_COUNT=$(psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$NEW_DB" -tAc "
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('knowledge_chunks', 'source_documents', 'query_logs');")

if [ "$TABLE_COUNT" = "3" ]; then
    echo -e "${GREEN}✓ All 3 tables created successfully${NC}"
else
    echo -e "${RED}✗ Expected 3 tables, found $TABLE_COUNT${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "  Host: $POSTGRES_HOST"
echo "  Database: $NEW_DB"
echo "  User: $POSTGRES_USER"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update Kubernetes secret: kubernetes/knowledge-portal/knowledge-postgres-secret.yaml"
echo "  2. Apply secret: kubectl apply -f kubernetes/knowledge-portal/knowledge-postgres-secret.yaml"
echo "  3. Configure Dify Dataset to use this database"
echo "  4. Run the sync pipeline to index documentation"
echo ""
echo -e "${GREEN}Connection string:${NC}"
echo "  postgresql://difyadmin:<password>@$POSTGRES_HOST:5432/$NEW_DB?sslmode=require"
echo ""

# Unset password
unset PGPASSWORD
