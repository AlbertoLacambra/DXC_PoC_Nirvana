# Agent Hub - Migration to Azure PostgreSQL (11/17/2025)

## Context

Due to Azure subscription **739aaf91-5cb2-45a6-ab4f-abf883e9d3f7** being blocked until **November 17, 2025**, Agent Hub was developed and tested using a local PostgreSQL Docker container.

This document outlines the steps to migrate the Agent Hub data from local Docker to Azure PostgreSQL when the subscription is reactivated.

---

## Current Environment

### Local PostgreSQL (Docker)
```bash
Container: nirvana-agent-hub-db
Host: localhost
Port: 5433
Database: nirvana_agent_hub
User: nirvana
Password: nirvana123
```

### Environment Variables (.env.local)
```bash
AGENT_HUB_DB_HOST=localhost
AGENT_HUB_DB_PORT=5433
AGENT_HUB_DB_NAME=nirvana_agent_hub
AGENT_HUB_DB_USER=nirvana
AGENT_HUB_DB_PASSWORD=nirvana123
```

### Database Content
- **8 tables**: agents, prompts, instructions, chat_modes, sessions, audit_logs, user_favorites, usage_statistics
- **42 components**: 2 agents, 11 prompts, 16 instructions, 13 chat modes
- **Schema**: `database/migrations/001_create_agent_hub_schema.sql`
- **Seed data**: `database/seeds/001_seed_agent_hub_content.sql`

---

## Migration Steps (After 11/17/2025)

### 1. Verify Azure Subscription Status

```bash
az account show --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
```

**Expected output**: Status should be "Enabled"

### 2. Verify Kubernetes Access

```bash
# Check AKS cluster access
az aks get-credentials --resource-group dxc-nirvana-rg --name dxc-nirvana-aks

# Verify PostgreSQL pod is running
kubectl get pods -n dify | grep postgres
```

**Expected output**: PostgreSQL pod should be in "Running" state

### 3. Export Data from Local Docker

```bash
# Create export directory
mkdir -p /tmp/agent-hub-migration

# Export schema (structure only)
docker exec nirvana-agent-hub-db pg_dump \
  -U nirvana \
  -d nirvana_agent_hub \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f /tmp/schema.sql

# Copy schema from container to host
docker cp nirvana-agent-hub-db:/tmp/schema.sql /tmp/agent-hub-migration/

# Export data (content only, using INSERT format for compatibility)
docker exec nirvana-agent-hub-db pg_dump \
  -U nirvana \
  -d nirvana_agent_hub \
  -t agents \
  -t prompts \
  -t instructions \
  -t chat_modes \
  -t sessions \
  -t audit_logs \
  -t user_favorites \
  -t usage_statistics \
  --data-only \
  --inserts \
  --no-owner \
  --no-privileges \
  -f /tmp/data.sql

# Copy data from container to host
docker cp nirvana-agent-hub-db:/tmp/data.sql /tmp/agent-hub-migration/

# Verify exports
ls -lh /tmp/agent-hub-migration/
```

### 4. Prepare Azure PostgreSQL

```bash
# Port-forward Azure PostgreSQL
kubectl port-forward -n dify svc/postgres 5432:5432 &

# Verify connection
PGPASSWORD=<azure_postgres_password> psql \
  -h localhost \
  -p 5432 \
  -U difyadmin \
  -d dify \
  -c "SELECT version();"
```

### 5. Create Agent Hub Schema in Azure

```bash
# Option 1: Using migration file
PGPASSWORD=<azure_postgres_password> psql \
  -h localhost \
  -p 5432 \
  -U difyadmin \
  -d dify \
  -f database/migrations/001_create_agent_hub_schema.sql

# Option 2: Using exported schema
PGPASSWORD=<azure_postgres_password> psql \
  -h localhost \
  -p 5432 \
  -U difyadmin \
  -d dify \
  -f /tmp/agent-hub-migration/schema.sql
```

**Verify schema creation:**
```sql
\dt  -- List tables
\di  -- List indexes
```

### 6. Import Data to Azure

```bash
# Import seed data (recommended - clean data)
PGPASSWORD=<azure_postgres_password> psql \
  -h localhost \
  -p 5432 \
  -U difyadmin \
  -d dify \
  -f database/seeds/001_seed_agent_hub_content.sql

# OR import exported data (if you have custom data)
PGPASSWORD=<azure_postgres_password> psql \
  -h localhost \
  -p 5432 \
  -U difyadmin \
  -d dify \
  -f /tmp/agent-hub-migration/data.sql
```

**Verify data import:**
```sql
SELECT COUNT(*) FROM agents;        -- Expected: 2
SELECT COUNT(*) FROM prompts;       -- Expected: 11
SELECT COUNT(*) FROM instructions;  -- Expected: 16
SELECT COUNT(*) FROM chat_modes;    -- Expected: 13
```

### 7. Update Application Configuration

**Edit `apps/control-center-ui/.env.local`:**

```bash
# Remove or comment out local Docker variables
# AGENT_HUB_DB_HOST=localhost
# AGENT_HUB_DB_PORT=5433
# AGENT_HUB_DB_NAME=nirvana_agent_hub
# AGENT_HUB_DB_USER=nirvana
# AGENT_HUB_DB_PASSWORD=nirvana123

# Application will now use fallback to Azure PostgreSQL
# via POSTGRES_* variables (already configured)
```

**Restart Next.js application:**
```bash
cd apps/control-center-ui
npm run dev
```

### 8. Verify Application Works with Azure

**Test all Agent Hub features:**
1. ✅ http://localhost:3000/agent-hub (Agents - should show 2 agents)
2. ✅ http://localhost:3000/agent-hub/prompts (Prompts - should show 11 prompts)
3. ✅ http://localhost:3000/agent-hub/instructions (Instructions - should show 16)
4. ✅ http://localhost:3000/agent-hub/chatmodes (Chat Modes - should show 13)
5. ✅ http://localhost:3000/mcp/tools (MCP Tools - should show 4 servers + 17 tools)

**Verify content loads:**
- Open agent details → should show Agent Instructions content
- Open prompt details → should show template content from markdown files
- Open instruction details → should show content from markdown files

### 9. Stop Local Docker Container (Optional)

```bash
# Stop container (can be restarted later if needed)
docker stop nirvana-agent-hub-db

# Or remove completely
docker stop nirvana-agent-hub-db
docker rm nirvana-agent-hub-db
```

### 10. Commit Configuration Changes

```bash
git add apps/control-center-ui/.env.local
git commit -m "chore: Switch Agent Hub to Azure PostgreSQL after subscription reactivation"
git push origin master
```

---

## Rollback Plan (If Migration Fails)

If Azure PostgreSQL has issues, quickly rollback to local Docker:

```bash
# 1. Start local Docker container
docker start nirvana-agent-hub-db

# 2. Restore .env.local variables
# Uncomment AGENT_HUB_DB_* variables

# 3. Restart Next.js
npm run dev
```

---

## Post-Migration Tasks

### Enable Dify API Integration
Once Azure is active, integrate real Dify API for chat responses:

**File**: `apps/control-center-ui/app/agent-hub/chatmodes/[id]/page.tsx`

Replace simulated response (line ~115) with:
```typescript
const response = await fetch(
  `/api/agent-hub/chatmodes/${chatMode.id}/sessions/${session.id}/message`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: currentInput }),
  }
);
```

Create API endpoint:
```bash
# Create file
apps/control-center-ui/app/api/agent-hub/chatmodes/[id]/sessions/[sessionId]/message/route.ts
```

### Implement MCP Server Status Checks
Connect MCP servers to actually check if they're online/offline instead of hardcoded "Offline" status.

---

## Troubleshooting

### Issue: Cannot connect to Azure PostgreSQL
```bash
# Check port-forward is running
ps aux | grep "kubectl port-forward"

# Re-establish port-forward
killall kubectl
kubectl port-forward -n dify svc/postgres 5432:5432 &
```

### Issue: Schema already exists
```sql
-- Drop and recreate (CAUTION: destroys data)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS usage_statistics CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS chat_modes CASCADE;
DROP TABLE IF EXISTS instructions CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Then re-run schema migration
```

### Issue: Data conflicts (duplicate IDs)
```sql
-- Clear existing data before import
TRUNCATE agents, prompts, instructions, chat_modes, sessions, audit_logs, user_favorites, usage_statistics CASCADE;
```

### Issue: File paths don't match
If prompt/instruction file paths are wrong (like we fixed during testing), update them:

```sql
-- Update prompt file paths
UPDATE prompts SET file_path = 'docs/features/agent-hub/prompts/code-review-checklist.prompt.md' WHERE name = 'Code Review';
UPDATE prompts SET file_path = 'docs/features/agent-hub/prompts/create-readme.prompt.md' WHERE name = 'Create README';
-- ... etc (see commit history for full list)

-- Clear cached content to force reload
UPDATE prompts SET content = NULL;
UPDATE instructions SET content = NULL;
UPDATE agents SET content = NULL;
```

---

## Validation Checklist

After migration, verify:

- [ ] All 42 components seeded correctly
- [ ] Content loads from markdown files
- [ ] Search and filters work
- [ ] Navigation (tabs, back buttons) works
- [ ] No console errors in browser
- [ ] Audit logs are being created
- [ ] Sessions can be created (chat modes)
- [ ] MCP tools/servers display correctly

---

## Contact & References

**Implementation Period**: November 5-7, 2025  
**Migration Target Date**: November 17, 2025 (or when subscription reactivates)  
**Database Schema**: `database/migrations/001_create_agent_hub_schema.sql`  
**Seed Data**: `database/seeds/001_seed_agent_hub_content.sql`  
**Repository**: https://github.com/AlbertoLacambra/DXC_PoC_Nirvana

**Known Issues Fixed During Testing**:
- ✅ Technology field is `string`, not `array`
- ✅ Prompt file paths corrected (e.g., `code-review.prompt.md` → `code-review-checklist.prompt.md`)
- ✅ API response format standardized: `{data: ..., pagination: ..., filters: ...}`
- ✅ Null handling for `model_config`, `required_roles`
- ✅ Multi-technology filtering in Instructions Browser

---

**Last Updated**: November 7, 2025  
**Status**: Ready for migration on 11/17/2025
