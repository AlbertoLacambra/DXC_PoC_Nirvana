# 🧠 Knowledge Portal

AI-powered knowledge retrieval system using PostgreSQL pgvector and Azure OpenAI embeddings.

## Status

✅ **Phase 1 Complete** (2025-10-26)

- 31 documents indexed
- 637 chunks with 3072-dim embeddings
- Automated sync every 6 hours
- Retrieval tested and validated

## Quick Links

- 📖 [Implementation Guide](./IMPLEMENTATION.md)
- 🏗️ [Architecture Decision Record](../../architecture/adr/ADR-008-knowledge-portal-vector-database.md)
- 🔧 [Dify Setup Guide](../../guides/dify-knowledge-setup.md)

## Overview

```
GitHub Repos → Processing Pipeline → PostgreSQL (pgvector) → Dify AI / API
   (.md,        (chunking +              (vector search)
    .py,         embeddings)
    .ts)
```

### Key Metrics

| Metric | Value |
|--------|-------|
| Documents | 31 |
| Chunks | 637 |
| Embeddings | 637 (3072 dims) |
| Sync Interval | Every 6 hours |
| Query Time | <100ms |
| Similarity Threshold | 0.50 |
| Monthly Cost | ~$50 |

## Components

### Database

- **Service**: Azure Database for PostgreSQL
- **Database**: `nirvana_knowledge`
- **Extension**: pgvector v0.8.0
- **Tables**: `knowledge_chunks`, `source_documents`, `query_logs`

### Embedding Model

- **Provider**: Azure OpenAI
- **Model**: text-embedding-3-large
- **Dimensions**: 3072
- **Endpoint**: `https://alberto-resource.openai.azure.com/`

### Processing

- **Script**: `scripts/knowledge/process-knowledge-documents.py`
- **Kubernetes**: CronJob in `cloudmind` namespace
- **Schedule**: Every 6 hours (`0 */6 * * *`)

## Usage

### Manual Sync

```bash
kubectl apply -f kubernetes/knowledge-portal/sync-knowledge-manual-job.yaml
kubectl logs -n cloudmind -l app=knowledge-sync -f
```

### Query Example

```python
from openai import AzureOpenAI
import psycopg2

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
conn = psycopg2.connect("postgresql://difyadmin:PASSWORD@dify-postgres-9107e36a.postgres.database.azure.com/nirvana_knowledge")
cursor = conn.cursor()

cursor.execute("""
    SELECT content, file_path, 
           1 - (embedding <=> %s::vector) AS score
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> %s::vector
    LIMIT 5
""", (query_embedding, query_embedding))

for content, file_path, score in cursor.fetchall():
    print(f"{score:.4f} | {file_path}")
    print(f"  {content[:200]}...\n")
```

### Verify Status

```bash
kubectl apply -f kubernetes/knowledge-portal/verify-sync-results-job.yaml
kubectl logs -n cloudmind job/verify-sync-results
```

## Architecture Decisions

### Why PostgreSQL + pgvector?

✅ **Cost-effective**: ~$50/month vs $250+ for managed vector DBs  
✅ **Integrated**: Reuses existing Dify PostgreSQL  
✅ **Flexible**: Full SQL access for analytics  
✅ **No lock-in**: Standard PostgreSQL + open-source pgvector  

### Why text-embedding-3-large (3072 dims)?

✅ **Better quality**: Improved semantic matching  
✅ **Multilingual**: Better ES/EN cross-lingual retrieval  
✅ **Latest model**: v3 vs v2 (ada-002)  

**Trade-off**: 2x storage, no ivfflat index (>2000 dim limit)

### Why 0.50 score threshold?

Production testing showed:
- Relevant results score 0.50-0.65
- Multilingual queries naturally score lower
- 0.70 threshold rejected all valid matches

## Monitoring

### Health Check

```sql
-- Sync status
SELECT COUNT(*) as docs,
       MAX(last_synced) as last_sync,
       SUM(chunks_count) as chunks
FROM source_documents;

-- Embedding coverage
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings
FROM knowledge_chunks;
```

### CronJob Status

```bash
kubectl get cronjobs -n cloudmind
kubectl logs -n cloudmind -l app=knowledge-sync --tail=100
```

## Troubleshooting

### Job Pending

**Cause**: Resource quota exceeded  
**Fix**: Check `kubectl describe resourcequota -n cloudmind`

### Low Similarity Scores

**Expected**: 0.50-0.65 is normal for multilingual semantic search  
**Action**: Adjust threshold if needed (current: 0.50)

### Embedding Generation 404

**Cause**: Wrong endpoint format  
**Fix**: Use `*.openai.azure.com/` not `*.cognitiveservices.azure.com/openai`

## Next Steps

- [ ] Configure Dify External Knowledge Base (manual UI)
- [ ] Process remaining ~32 documents
- [ ] Add query analytics dashboard
- [ ] Implement hybrid search (vector + keyword)
- [ ] Deploy HNSW index when pgvector 0.9+ available

## References

- [Implementation Guide](./IMPLEMENTATION.md) - Full deployment and usage docs
- [ADR-008](../../architecture/adr/ADR-008-knowledge-portal-vector-database.md) - Architecture decisions
- [Dify Setup](../../guides/dify-knowledge-setup.md) - Dify integration guide
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/embeddings)

---

**Maintainer**: Alberto Lacambra  
**Last Updated**: 2025-10-26  
**Status**: ✅ Production Ready
