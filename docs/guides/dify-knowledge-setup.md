# 🤖 Dify Dataset Configuration - Nirvana Knowledge Portal

## Overview

This guide walks you through creating and configuring a Dify Knowledge Dataset for the Nirvana Knowledge Portal.

---

## Prerequisites

- [x] VPN connected (OpenVPN)
- [x] Database `nirvana_knowledge` created
- [x] Access to Dify UI: http://10.0.2.91

---

## Step 1: Access Dify Interface

1. **Connect to VPN**:
   ```bash
   sudo openvpn --config /mnt/c/PROYECTS/dify-azure-private-deployment/vpn-config/mi-laptop.ovpn
   ```

2. **Open Dify in browser**:
   - URL: `http://10.0.2.91`
   - Login with your Dify credentials

---

## Step 2: Create New Knowledge Base

1. **Navigate to Knowledge**:
   - Click on "Knowledge" in the left sidebar
   - Click "+ Create Knowledge" button

2. **Configure Basic Settings**:
   ```
   Name: Nirvana Knowledge Portal
   Description: Technical documentation, ADRs, code examples, and runbooks for DXC Cloud Mind - Nirvana PoC
   Icon: 🧠 (brain emoji)
   ```

3. **Select Knowledge Type**:
   - Choose: **"External Knowledge Base"** (we'll use our custom pgvector database)
   - OR choose: **"Internal"** if you want Dify to manage everything

---

## Step 3: Configure Retrieval Settings

### Embedding Model Configuration

1. **Select Embedding Provider**:
   - Provider: `Azure OpenAI`
   - Model: `text-embedding-3-large`
   - Dimensions: `3072`

2. **Embedding Settings**:
   ```yaml
   Batch Size: 100
   Max Tokens per Chunk: 800
   Overlap Tokens: 100
   ```

### Retrieval Configuration

1. **Retrieval Method**:
   - Method: `Vector Search + Keyword`
   - This combines semantic search (vector) with traditional keyword search

2. **Retrieval Parameters**:
   ```yaml
   Top K: 5
   Score Threshold: 0.50
   Max Tokens: 4000
   Rerank: Enabled
   Rerank Model: Cohere Rerank (or compatible)
   ```

   > **Note**: Score threshold of 0.50 is recommended based on production testing.  
   > Typical similarity scores range 0.50-0.65 for relevant matches with:
   > - text-embedding-3-large (3072 dimensions)
   > - Multilingual queries (Spanish/English)
   > - Semantic (not exact) matching

3. **Chunking Strategy**:
   ```yaml
   Automatic Chunking: Disabled (we do custom chunking)
   Chunk Size: 800 tokens
   Chunk Overlap: 100 tokens
   Separator: "\n\n" (double newline)
   ```

---

## Step 4: Connect to Vector Database (pgvector)

If using External Knowledge Base:

1. **Database Connection**:
   ```yaml
   Database Type: PostgreSQL (pgvector)
   Host: dify-postgres-9107e36a.postgres.database.azure.com
   Port: 5432
   Database: nirvana_knowledge
   User: difyadmin
   Password: [from secret]
   SSL Mode: require
   ```

2. **Table Mapping**:
   ```yaml
   Embeddings Table: knowledge_chunks
   Vector Column: embedding
   Content Column: content
   Metadata Columns:
     - source_type
     - category
     - file_path
     - repository
     - tags
     - language
   ```

---

## Step 5: Configure Indexing Rules

1. **File Type Filters**:
   ```yaml
   Allowed Extensions:
     - .md (Markdown)
     - .py (Python)
     - .ts (TypeScript)
     - .tsx (TypeScript React)
     - .yaml (YAML)
     - .yml (YAML)
     - .json (JSON)
     - .sh (Shell scripts)
   
   Excluded Patterns:
     - node_modules/**
     - .git/**
     - dist/**
     - build/**
     - *.min.js
     - *.map
   ```

2. **Metadata Extraction**:
   ```yaml
   Extract from Git:
     - Commit SHA
     - Author
     - Commit Date
     - Branch
   
   Extract from File:
     - File Path
     - File Size
     - Last Modified
     - Language (from extension)
   ```

---

## Step 6: Create Test Documents

Upload a few test documents to verify the setup:

1. **Test Document 1** - Create `test-architecture.md`:
   ```markdown
   # Architecture Overview
   
   This is a test document to verify the Knowledge Portal setup.
   
   ## Components
   - AKS Cluster: dify-aks
   - PostgreSQL: dify-postgres-9107e36a
   - Vector Extension: pgvector
   
   ## Tags
   #architecture #azure #kubernetes
   ```

2. **Upload to Dify**:
   - Click "Add Document"
   - Upload `test-architecture.md`
   - Wait for processing

3. **Verify Indexing**:
   - Check that document appears in the list
   - Status should be "Completed"
   - Click on document to see chunks

---

## Step 7: Test Retrieval

1. **Open Knowledge Base Testing**:
   - Click on the knowledge base
   - Go to "Test" tab

2. **Test Queries**:
   ```
   Query 1: "What AKS cluster is used?"
   Expected: Should return info about dify-aks
   
   Query 2: "How is the vector database configured?"
   Expected: Should return info about pgvector
   
   Query 3: "What is the PostgreSQL host?"
   Expected: Should return dify-postgres-9107e36a.postgres.database.azure.com
   ```

3. **Check Results**:
   - Verify that relevant chunks are returned
   - Check similarity scores (should be > 0.70)
   - Verify metadata is present

---

## Step 8: Create RAG Application

Now create a chat application that uses this knowledge base:

1. **Create New App**:
   - Click "Studio" → "+ Create Application"
   - Name: `Nirvana Knowledge Assistant`
   - Type: `Chat App`

2. **Configure App**:
   ```yaml
   Model: gpt-4o-mini (Azure OpenAI)
   Temperature: 0.3
   Max Tokens: 2000
   Top P: 0.9
   ```

3. **Add Knowledge Base**:
   - In "Context" section
   - Click "+ Add Knowledge"
   - Select "Nirvana Knowledge Portal"
   - Retrieval Mode: `Multi-path Retrieval`

4. **System Prompt**:
   ```
   You are an expert technical assistant for the DXC Cloud Mind - Nirvana project.
   
   Your role is to help engineers with:
   - Architecture decisions and ADRs
   - Code examples and best practices
   - Troubleshooting issues
   - Infrastructure questions
   - Azure and Kubernetes guidance
   
   RULES:
   1. Answer based ONLY on the provided documentation context
   2. If information is not in the context, say "I don't have that information in the knowledge base"
   3. Cite sources by mentioning the document name
   4. Be concise but thorough
   5. Use code examples when appropriate
   6. Format responses in Markdown
   
   CONTEXT:
   The following documentation chunks are relevant to the user's question:
   {context}
   
   USER QUESTION:
   {query}
   ```

5. **Test the App**:
   - Click "Debug and Preview"
   - Try the same test queries
   - Verify responses are accurate and cite sources

---

## Step 9: Configure API Access

1. **Generate API Key**:
   - Go to App Settings
   - Navigate to "API Keys"
   - Click "+ Create API Key"
   - Name: `Knowledge Portal API`
   - Save the key securely

2. **Test API**:
   ```bash
   curl -X POST "http://10.0.2.91/v1/chat-messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "inputs": {},
       "query": "What is the AKS cluster name?",
       "user": "test-user",
       "response_mode": "blocking"
     }'
   ```

---

## Step 10: Enable WebApp (Optional)

If you want a public-facing chat interface:

1. **Enable Site**:
   - Go to App Settings
   - Toggle "Enable Site" to ON

2. **Get WebApp Code**:
   - Copy the WebApp code (e.g., `abc123def456`)
   - URL will be: `http://10.0.2.91/chatbot/abc123def456`

3. **Update Knowledge Portal Config**:
   ```typescript
   // apps/control-center-ui/.env.local
   NEXT_PUBLIC_KNOWLEDGE_WEBAPP_CODE=abc123def456
   ```

---

## Verification Checklist

- [ ] Knowledge base created and configured
- [ ] Embedding model set to `text-embedding-3-large`
- [ ] Retrieval settings configured (top_k=5, threshold=0.70)
- [ ] Vector database connected (pgvector)
- [ ] Test documents uploaded and indexed
- [ ] Test queries return relevant results
- [ ] RAG application created and tested
- [ ] API key generated and tested
- [ ] WebApp enabled (if needed)

---

## Troubleshooting

### Issue 1: "Connection to vector database failed"

**Solution**:
- Verify VPN is connected
- Check PostgreSQL credentials
- Test connection manually:
  ```bash
  psql -h dify-postgres-9107e36a.postgres.database.azure.com \
       -U difyadmin -d nirvana_knowledge
  ```

### Issue 2: "Embedding generation failed"

**Solution**:
- Verify Azure OpenAI is configured in Dify
- Check API key is valid
- Verify model `text-embedding-3-large` is deployed

### Issue 3: "No results returned for queries"

**Solution**:
- Lower score threshold (try 0.60)
- Increase top_k (try 10)
- Check that documents were actually indexed
- Verify vector column has data:
  ```sql
  SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NOT NULL;
  ```

### Issue 4: "Chunks are too large/small"

**Solution**:
- Adjust chunk size in settings
- We use custom chunking, so this shouldn't affect our pipeline
- Verify our chunks are ~800 tokens:
  ```sql
  SELECT AVG(LENGTH(content)) FROM knowledge_chunks;
  ```

---

## Next Steps

1. Configure GitHub Actions to sync documentation automatically
2. Implement FastAPI backend for custom queries
3. Integrate with Next.js UI
4. Build VS Code extension

---

## Configuration Summary

```yaml
Knowledge Base: Nirvana Knowledge Portal
Database: nirvana_knowledge (pgvector)
Embedding Model: text-embedding-3-large (1536 dims)
LLM: gpt-4o-mini
Retrieval:
  Top K: 5
  Threshold: 0.70
  Rerank: Enabled
Chunking:
  Size: 800 tokens
  Overlap: 100 tokens
API Endpoint: http://10.0.2.91/v1/chat-messages
WebApp: http://10.0.2.91/chatbot/{code}
```

---

**Last Updated**: October 25, 2025  
**Status**: Configuration Guide  
**Next**: Implement sync pipeline
