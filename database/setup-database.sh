#!/bin/bash

# =============================================================================
# Database Setup Script for DXC Cloud Mind - Nirvana
# Description: Run migrations and seed database for Spec Library
# Author: DXC Cloud Mind - Nirvana Team
# Date: 2025-10-28
# =============================================================================

set -e # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================================================
# Configuration
# =============================================================================

# Database connection from environment or .env.local
if [ -f "apps/control-center-ui/.env.local" ]; then
  export $(cat apps/control-center-ui/.env.local | grep -v '^#' | xargs)
fi

# Check DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
  echo "Please configure DATABASE_URL in apps/control-center-ui/.env.local"
  echo "Example: DATABASE_URL=\"postgresql://user:pass@localhost:5432/nirvana\""
  exit 1
fi

# Extract connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}DXC Cloud Mind - Nirvana - Database Setup${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo -e "📊 Database: ${GREEN}$DB_NAME${NC}"
echo -e "🖥️  Host: ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo ""

# =============================================================================
# Step 1: Test Connection
# =============================================================================

echo -e "${YELLOW}🔌 Step 1: Testing database connection...${NC}"

if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Connection successful${NC}"
else
  echo -e "${RED}❌ Connection failed${NC}"
  echo "Please check:"
  echo "  1. PostgreSQL is running"
  echo "  2. Port forwarding is active (if using AKS): kubectl port-forward svc/postgres-service -n nirvana 5432:5432"
  echo "  3. DATABASE_URL is correct"
  exit 1
fi

echo ""

# =============================================================================
# Step 2: Run Migration 001
# =============================================================================

echo -e "${YELLOW}📋 Step 2: Running migration 001_create_specs_tables.sql...${NC}"

if psql "$DATABASE_URL" -f database/migrations/001_create_specs_tables.sql; then
  echo -e "${GREEN}✅ Migration 001 completed${NC}"
else
  echo -e "${RED}❌ Migration 001 failed${NC}"
  exit 1
fi

echo ""

# =============================================================================
# Step 3: Run Seed 002
# =============================================================================

echo -e "${YELLOW}🌱 Step 3: Seeding database with predefined specs...${NC}"

if psql "$DATABASE_URL" -f database/seeds/002_seed_predefined_specs.sql; then
  echo -e "${GREEN}✅ Seed 002 completed${NC}"
else
  echo -e "${RED}❌ Seed 002 failed${NC}"
  exit 1
fi

echo ""

# =============================================================================
# Step 4: Verify Data
# =============================================================================

echo -e "${YELLOW}🔍 Step 4: Verifying data...${NC}"

SPEC_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM specs;" | xargs)
VERSION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM spec_versions;" | xargs)

echo -e "  📦 Specs created: ${GREEN}$SPEC_COUNT${NC}"
echo -e "  📌 Versions created: ${GREEN}$VERSION_COUNT${NC}"

if [ "$SPEC_COUNT" -eq 3 ] && [ "$VERSION_COUNT" -eq 3 ]; then
  echo -e "${GREEN}✅ Data verification passed${NC}"
else
  echo -e "${RED}❌ Data verification failed (expected 3 specs and 3 versions)${NC}"
  exit 1
fi

echo ""

# =============================================================================
# Step 5: Generate Prisma Client
# =============================================================================

echo -e "${YELLOW}⚙️  Step 5: Generating Prisma client...${NC}"

cd apps/control-center-ui

if npx prisma generate; then
  echo -e "${GREEN}✅ Prisma client generated${NC}"
else
  echo -e "${RED}❌ Prisma client generation failed${NC}"
  exit 1
fi

cd ../..

echo ""

# =============================================================================
# Step 6: Introspect Database (Optional - verify schema)
# =============================================================================

echo -e "${YELLOW}🔬 Step 6: Introspecting database...${NC}"

cd apps/control-center-ui

if npx prisma db pull; then
  echo -e "${GREEN}✅ Database introspection completed${NC}"
else
  echo -e "${YELLOW}⚠️  Database introspection had issues (non-critical)${NC}"
fi

cd ../..

echo ""

# =============================================================================
# Summary
# =============================================================================

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo "📊 Database Summary:"
echo "  • Tables created: specs, spec_versions, spec_usage"
echo "  • Specs inserted: 3 (git-flow, security, iac-terraform)"
echo "  • Prisma client generated: ✅"
echo ""
echo "🚀 Next Steps:"
echo "  1. Test API: curl http://localhost:3000/api/specs"
echo "  2. Create API endpoints in apps/control-center-ui/app/api/specs/"
echo "  3. Create UI components in apps/control-center-ui/components/specs/"
echo ""
echo -e "${BLUE}==============================================================================${NC}"
