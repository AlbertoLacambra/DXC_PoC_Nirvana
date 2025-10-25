#!/bin/bash

# ============================================================================
# Initial Knowledge Base Indexing
# ============================================================================
# This script indexes the initial set of documentation files
# ============================================================================

set -e

echo "============================================"
echo "🧠 Initial Knowledge Base Indexing"
echo "============================================"
echo ""

# Check if running in the correct directory
if [ ! -f "scripts/knowledge/process-knowledge-documents.py" ]; then
    echo "Error: Must run from repository root"
    exit 1
fi

# Check required environment variables
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
    echo "Error: AZURE_OPENAI_API_KEY not set"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "Error: POSTGRES_PASSWORD not set"
    exit 1
fi

# Export required environment variables
export AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT:-https://alberto-resource.cognitiveservices.azure.com/openai}"
export AZURE_OPENAI_DEPLOYMENT="${AZURE_OPENAI_DEPLOYMENT:-text-embedding-3-large}"
export POSTGRES_HOST="${POSTGRES_HOST:-dify-postgres-9107e36a.postgres.database.azure.com}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export POSTGRES_USER="${POSTGRES_USER:-difyadmin}"
export POSTGRES_DB="${POSTGRES_DB:-nirvana_knowledge}"

echo "Configuration:"
echo "  OpenAI Endpoint: $AZURE_OPENAI_ENDPOINT"
echo "  OpenAI Model: $AZURE_OPENAI_DEPLOYMENT"
echo "  PostgreSQL Host: $POSTGRES_HOST"
echo "  PostgreSQL DB: $POSTGRES_DB"
echo ""

# Read file list
FILES_TO_INDEX="scripts/knowledge/initial-docs.txt"

if [ ! -f "$FILES_TO_INDEX" ]; then
    echo "Error: File list not found: $FILES_TO_INDEX"
    exit 1
fi

# Count files
TOTAL_FILES=$(grep -v "^#" "$FILES_TO_INDEX" | grep -v "^$" | wc -l)
echo "Files to index: $TOTAL_FILES"
echo ""

# Check if files exist
echo "Validating files..."
MISSING_FILES=0
while IFS= read -r file; do
    # Skip comments and empty lines
    [[ "$file" =~ ^#.*$ ]] && continue
    [[ -z "$file" ]] && continue
    
    if [ ! -f "$file" ]; then
        echo "  ⚠ Missing: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done < "$FILES_TO_INDEX"

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo "Warning: $MISSING_FILES files not found"
    echo "Continue anyway? (yes/no)"
    read -r response
    if [ "$response" != "yes" ]; then
        echo "Indexing cancelled"
        exit 1
    fi
fi

echo ""
echo "Starting indexing..."
echo ""

# Create temporary file with existing files only
TEMP_FILES=$(mktemp)
while IFS= read -r file; do
    # Skip comments and empty lines
    [[ "$file" =~ ^#.*$ ]] && continue
    [[ -z "$file" ]] && continue
    
    if [ -f "$file" ]; then
        echo "$file" >> "$TEMP_FILES"
    fi
done < "$FILES_TO_INDEX"

# Install dependencies if needed
if ! python3 -c "import openai" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install --user openai langchain psycopg2-binary gitpython tqdm
    echo ""
fi

# Run processing script
python3 scripts/knowledge/process-knowledge-documents.py --files "$TEMP_FILES"

# Cleanup
rm -f "$TEMP_FILES"

echo ""
echo "============================================"
echo "✅ Initial indexing completed!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Verify indexing: python3 scripts/knowledge/verify-knowledge-sync.py"
echo "  2. Configure Dify Dataset following docs/guides/dify-knowledge-setup.md"
echo "  3. Test RAG queries in Dify"
echo ""
