# 📚 Knowledge Portal - Implementation Guide

**Project**: Nirvana - DXC Cloud Mind PoC  
**Component**: Knowledge Portal (RAG System)  
**Status**: Phase 1 Complete ✅  
**Last Updated**: 2025-10-26

---

## Overview

The Knowledge Portal is a **Retrieval-Augmented Generation (RAG)** system that enables AI agents and developers to query technical documentation, code examples, ADRs, and runbooks stored in GitHub repositories.

### Key Features

- ✅ **Vector Semantic Search** - Find relevant docs by meaning, not just keywords
- ✅ **Automated Sync** - Keep knowledge base updated with GitHub repository (every 6 hours)
- ✅ **Multilingual** - Supports queries in Spanish and English
- ✅ **Cost-Optimized** - Uses existing PostgreSQL + pgvector (~$50/month)
- ✅ **Production-Ready** - Deployed with monitoring, health checks, and automation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE PORTAL ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  GitHub Repos    │  (Source of Truth)
│  DXC_PoC_Nirvana │
└────────┬─────────┘
         │ (git clone)
         ▼
┌────────────────────────────────────────────────────────────┐
│  Processing Pipeline (Kubernetes CronJob)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Clone Repository                                   │  │
│  │ 2. Find Documents (.md, .py, .ts, .tsx, etc.)       │  │
│  │ 3. Smart Chunking (800/600/400 chars by file type)  │  │
│  │ 4. Generate Embeddings (Azure OpenAI)               │  │
│  │ 5. Store in PostgreSQL (pgvector)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Vector Database (PostgreSQL + pgvector)                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  knowledge_chunks (637 chunks)                        │    │
│  │  - id, content, embedding[3072]                       │    │
│  │  - file_path, category, tags, language               │    │
│  │  - quality_score, usage_count                         │    │
│  │                                                        │    │
│  │  source_documents (31 documents)                      │    │
│  │  - file_path, chunks_count, commit_sha               │    │
│  │  - last_synced, author, branch                       │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Retrieval API (SQL Queries)                                  │
│  - Vector Similarity Search (cosine distance)                 │
│  - Top-K results (K=5)                                        │
│  - Score threshold filtering (≥0.50)                          │
│  - Metadata filtering (category, tags, language)              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Consumers                                                     │
│  - Dify AI Platform (via External Knowledge Base)             │
│  - Direct API queries (Python/TypeScript clients)             │
│  - SRE Agent, FinOps Optimizer, etc.                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Database

**Service**: Azure Database for PostgreSQL Flexible Server  
**Name**: `dify-postgres-9107e36a`  
**Database**: `nirvana_knowledge`  
**Extension**: `pgvector` v0.8.0

**Tables**:
- `knowledge_chunks` - Stores text chunks with 3072-dim vector embeddings
- `source_documents` - Tracks source files and sync status
- `query_logs` - Logs retrieval queries for analytics

**Storage**: ~2MB currently (637 chunks), estimated ~30MB at 10K chunks

### 2. Embedding Model

**Provider**: Azure OpenAI  
**Endpoint**: `https://alberto-resource.openai.azure.com/`  
**Model**: `text-embedding-3-large`  
**Deployment**: `text-embedding-3-large`  
**Dimensions**: 3072  
**API Version**: `2024-02-01`  
**Rate Limits**: 20 requests/10s, 20K tokens/minute

### 3. Processing Scripts

**Location**: `scripts/knowledge/`

- `process-knowledge-documents.py` - Main indexing script
- `test-retrieval.py` - Retrieval testing and validation
- `verify-knowledge-sync.py` - Health checks and monitoring

**Key Logic**:
```python
# Chunking strategy by file type
CHUNK_CONFIGS = {
    'markdown': {'chunk_size': 800, 'chunk_overlap': 100},
    'python': {'chunk_size': 600, 'chunk_overlap': 50},
    'typescript': {'chunk_size': 600, 'chunk_overlap': 50},
    'yaml': {'chunk_size': 400, 'chunk_overlap': 50}
}

# Embedding generation (batch of 100)
response = client.embeddings.create(
    model='text-embedding-3-large',
    input=batch_texts  # Up to 100 texts
)

# Vector storage
INSERT INTO knowledge_chunks (content, embedding, ...)
VALUES (%s, %s::vector(3072), ...)
ON CONFLICT (content_hash, file_path) DO UPDATE ...
```

### 4. Kubernetes Resources

**Namespace**: `cloudmind`

**Jobs**:
- `sync-knowledge-manual` - Manual one-time sync
- `test-knowledge-retrieval` - Validate retrieval functionality
- `verify-sync-results` - Check database state

**CronJobs**:
- `sync-knowledge-base` - Auto-sync every 6 hours (`0 */6 * * *`)

**Secrets**:
- `postgres-credentials` - Database connection details
- `azure-openai-credentials` - Azure OpenAI API key and endpoint

**Resource Allocation**:
```yaml
requests:
  cpu: 500m
  memory: 1Gi
limits:
  cpu: 2000m
  memory: 4Gi
```

---

## Deployment

### Prerequisites

1. ✅ Azure Database for PostgreSQL with pgvector
2. ✅ Azure OpenAI deployment (text-embedding-3-large)
3. ✅ Kubernetes cluster with access to private network
4. ✅ GitHub repository with documentation

### Step 1: Database Setup

```bash
# Apply database schema
kubectl apply -f kubernetes/knowledge-portal/setup-database-job.yaml

# Verify setup
kubectl logs -n cloudmind job/setup-knowledge-db
```

**Expected Output**:
```
✅ Database nirvana_knowledge created
✅ Extensions enabled: vector, uuid-ossp
✅ Tables created: knowledge_chunks, source_documents, query_logs
✅ Indexes created: 17
✅ Views created: 3
```

### Step 2: Configure Secrets

```bash
# PostgreSQL credentials
kubectl create secret generic postgres-credentials \
  --from-literal=host=dify-postgres-9107e36a.postgres.database.azure.com \
  --from-literal=username=difyadmin \
  --from-literal=password=YOUR_PASSWORD \
  -n cloudmind

# Azure OpenAI credentials
kubectl create secret generic azure-openai-credentials \
  --from-literal=AZURE_OPENAI_API_KEY=YOUR_API_KEY \
  --from-literal=AZURE_OPENAI_API_BASE=https://alberto-resource.openai.azure.com/ \
  --from-literal=AZURE_OPENAI_API_VERSION=2024-02-01 \
  --from-literal=AZURE_OPENAI_DEPLOYMENT=text-embedding-3-large \
  -n cloudmind
```

### Step 3: Initial Indexing

```bash
# Run manual sync job
kubectl apply -f kubernetes/knowledge-portal/sync-knowledge-manual-job.yaml

# Monitor progress
kubectl logs -n cloudmind -l app=knowledge-sync -f
```

**Expected Duration**: 11-13 minutes for ~30 files

**Expected Output**:
```
📄 Processing: docs/architecture/overview.md
  ✓ Created 13 chunks
  🔮 Generating embeddings for 13 chunks...
  ✓ Embeddings generated
  💾 Saving 13 chunks to database...
  ✓ Saved 13 chunks

...

✅ Knowledge base sync completed successfully
   - Processed 31 files
   - Repository: DXC_PoC_Nirvana
   - Database: nirvana_knowledge
```

### Step 4: Verify Results

```bash
# Run verification job
kubectl apply -f kubernetes/knowledge-portal/verify-sync-results-job.yaml
kubectl logs -n cloudmind job/verify-sync-results
```

**Expected Metrics**:
```
📊 Verificando resultados...

📄 Documentos sincronizados: 31
📦 Chunks generados: 637
🔮 Embeddings generados: 637
📁 Por tipo de archivo:
  - md:  14
  - ts:  12
  - tsx: 5
```

### Step 5: Deploy CronJob

```bash
# Enable automated sync (every 6 hours)
kubectl apply -f kubernetes/knowledge-portal/sync-knowledge-cronjob.yaml

# Verify CronJob
kubectl get cronjobs -n cloudmind
```

**Output**:
```
NAME                  SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
sync-knowledge-base   0 */6 * * *   False     0        <none>          5s
```

### Step 6: Test Retrieval

```bash
# Run retrieval tests
kubectl apply -f kubernetes/knowledge-portal/test-retrieval-job.yaml
kubectl logs -n cloudmind -l app=test-retrieval --tail=200
```

**Expected Results**: 5/5 tests find relevant documents with scores 0.50-0.65

---

## Usage

### Query Examples

#### Python

```python
import psycopg2
from openai import AzureOpenAI

# Generate query embedding
client = AzureOpenAI(
    api_key="YOUR_KEY",
    azure_endpoint="https://alberto-resource.openai.azure.com/",
    api_version="2024-02-01"
)

response = client.embeddings.create(
    model="text-embedding-3-large",
    input="¿Cómo configurar Azure OpenAI?"
)
query_embedding = response.data[0].embedding

# Search database
conn = psycopg2.connect("postgresql://...")
cursor = conn.cursor()

cursor.execute("""
    SELECT 
        content,
        file_path,
        category,
        1 - (embedding <=> %s::vector) AS similarity_score
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> %s::vector
    LIMIT 5
""", (query_embedding, query_embedding))

results = cursor.fetchall()
for content, file_path, category, score in results:
    print(f"Score: {score:.4f} | {file_path}")
    print(f"  {content[:200]}...\n")
```

#### SQL

```sql
-- Find chunks similar to a query embedding
SELECT 
    content,
    file_path,
    category,
    tags,
    1 - (embedding <=> '[0.123, -0.456, ...]'::vector(3072)) AS score
FROM knowledge_chunks
WHERE embedding IS NOT NULL
  AND category = 'architecture'  -- Optional filter
ORDER BY embedding <=> '[0.123, -0.456, ...]'::vector(3072)
LIMIT 5;
```

### Dify Integration

1. **Navigate to Dify UI**: http://10.0.2.91 (requires VPN)
2. **Create External Knowledge Base**:
   - Name: Nirvana Knowledge Portal
   - Type: PostgreSQL (pgvector)
   - Connection: Use `postgres-credentials` values
3. **Configure Retrieval**:
   - Table: `knowledge_chunks`
   - Embedding Column: `embedding`
   - Content Column: `content`
   - Top K: 5
   - Score Threshold: 0.50

See full guide: [docs/guides/dify-knowledge-setup.md](../guides/dify-knowledge-setup.md)

---

## Monitoring

### Health Checks

```bash
# Check CronJob status
kubectl get cronjobs -n cloudmind

# View recent sync logs
kubectl logs -n cloudmind -l app=knowledge-sync --tail=100

# Database health
kubectl apply -f kubernetes/knowledge-portal/verify-sync-results-job.yaml
kubectl logs -n cloudmind job/verify-sync-results
```

### Key Metrics

```sql
-- Sync status
SELECT 
    COUNT(*) as total_docs,
    COUNT(*) FILTER (WHERE last_synced > NOW() - INTERVAL '24 hours') as recent_syncs,
    MAX(last_synced) as last_sync,
    SUM(chunks_count) as total_chunks
FROM source_documents;

-- Embedding coverage
SELECT 
    COUNT(*) as total_chunks,
    COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings,
    ROUND(100.0 * COUNT(*) FILTER (WHERE embedding IS NOT NULL) / COUNT(*), 2) as coverage_pct
FROM knowledge_chunks;

-- Top categories
SELECT 
    category,
    COUNT(*) as chunk_count
FROM knowledge_chunks
GROUP BY category
ORDER BY chunk_count DESC;
```

### Alerts

Monitor these conditions:

- ❌ **Sync Failure**: CronJob fails 2+ times consecutively
- ⚠️ **Low Coverage**: Embedding coverage < 95%
- ⚠️ **Stale Data**: No syncs in last 12 hours
- ⚠️ **High Error Rate**: >5% of queries fail

---

## Troubleshooting

### Issue: Job Pending (Resource Quota)

**Symptoms**: Job stays in "Pending" state

**Diagnosis**:
```bash
kubectl describe pod -n cloudmind POD_NAME | grep -A5 Events
```

**Resolution**: Verify resource quotas allow job creation:
```bash
kubectl describe resourcequota -n cloudmind
```

Add resource requests/limits to job spec if needed.

### Issue: Embedding Generation Fails (404)

**Symptoms**: "Error code: 404" in logs

**Diagnosis**: Check endpoint format

**Resolution**: Ensure endpoint is `https://RESOURCE.openai.azure.com/` (NOT `cognitiveservices.azure.com/openai`)

### Issue: Low Similarity Scores

**Symptoms**: All scores < 0.50

**Diagnosis**: 
- Check if embeddings are NULL in database
- Verify embedding dimensions match (3072)
- Test with English query vs Spanish

**Resolution**:
- Threshold of 0.50 is appropriate for multilingual search
- Scores 0.50-0.65 are normal for semantic matching
- Consider hybrid search (vector + keyword)

### Issue: Slow Queries

**Symptoms**: Queries take >1 second

**Diagnosis**: No vector index available (3072 dims > ivfflat 2000 limit)

**Resolution**:
- Acceptable for <10K chunks (sequential scan ~100ms)
- Wait for pgvector 0.9+ with HNSW index support
- Consider dimensionality reduction to 1536

---

## Performance

### Current Scale

- **Documents**: 31
- **Chunks**: 637
- **Avg Chunks/Doc**: 20.5
- **Database Size**: 2MB
- **Query Time**: <100ms (sequential scan)

### Projected Scale

| Chunks | DB Size | Query Time | Index Type |
|--------|---------|------------|------------|
| 1,000 | 5MB | <100ms | Sequential |
| 10,000 | 50MB | <200ms | Sequential |
| 100,000 | 500MB | <500ms | HNSW (future) |

### Optimization Roadmap

**Phase 1** (Current): Sequential scan, acceptable for <10K chunks  
**Phase 2** (Q1 2026): HNSW index when pgvector 0.9+ available  
**Phase 3** (Q2 2026): Hybrid search (vector + full-text)  
**Phase 4** (Q3 2026): Distributed search if >100K chunks

---

## Costs

### Monthly Breakdown

```yaml
Azure Database for PostgreSQL:
  - Tier: Flexible Server (Burstable B1ms)
  - vCores: 1
  - Memory: 2GB
  - Storage: 32GB
  - Cost: ~$50/month (shared with Dify)

Azure OpenAI:
  - Embeddings: text-embedding-3-large
  - Usage: ~20K tokens/day (sync)
  - Cost: ~$0.50/month

Total: ~$50.50/month
```

**Cost Optimization**:
- ✅ Reuses existing PostgreSQL (no new database)
- ✅ Batch embeddings (100 chunks at once)
- ✅ Deduplication prevents re-embedding unchanged docs
- ✅ 6-hour sync interval vs real-time

---

## Next Steps

### Immediate (Week 1)

- [ ] Configure Dify External Knowledge Base (manual UI setup)
- [ ] Create production retrieval API endpoint
- [ ] Set up monitoring dashboards

### Short-term (Month 1)

- [ ] Process remaining ~32 documents
- [ ] Add query logging and analytics
- [ ] Implement reranking (jina-reranker-v2)
- [ ] Create developer documentation

### Medium-term (Quarter 1)

- [ ] Hybrid search (vector + full-text)
- [ ] Incremental sync (only changed files)
- [ ] Metadata filtering UI
- [ ] Multi-repository support

---

## References

### Documentation

- [Dify Knowledge Setup Guide](../guides/dify-knowledge-setup.md)
- [ADR-008: Vector Database Decision](./adr/ADR-008-knowledge-portal-vector-database.md)
- [Database Schema](../../scripts/database/setup-knowledge-db.sql)

### Scripts

- [Process Documents](../../scripts/knowledge/process-knowledge-documents.py)
- [Test Retrieval](../../scripts/knowledge/test-retrieval.py)
- [Verify Sync](../../scripts/knowledge/verify-knowledge-sync.py)

### Kubernetes Manifests

- [Sync Manual Job](../../kubernetes/knowledge-portal/sync-knowledge-manual-job.yaml)
- [Sync CronJob](../../kubernetes/knowledge-portal/sync-knowledge-cronjob.yaml)
- [Test Retrieval Job](../../kubernetes/knowledge-portal/test-retrieval-job.yaml)

---

## Support

**Questions?** Contact: Alberto Lacambra  
**Issues?** GitHub: [AlbertoLacambra/DXC_PoC_Nirvana/issues](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/issues)

---

**Last Updated**: 2025-10-26  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Phase 1)
