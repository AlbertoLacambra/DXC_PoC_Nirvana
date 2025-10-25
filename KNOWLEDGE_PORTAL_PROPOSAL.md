# 🧠 Knowledge Portal - Propuesta de Implementación

**Fecha**: 25 de Octubre 2025  
**Versión**: 1.0  
**Estado**: Propuesta para Revisión

---

## 📋 Resumen Ejecutivo

El **Knowledge Portal** es un sistema RAG (Retrieval-Augmented Generation) avanzado que centraliza toda la documentación técnica del proyecto DXC Cloud Mind - Nirvana y proporciona asistencia inteligente tanto desde la UI web como desde VS Code.

**Objetivos principales**:

1. ✅ **Repositorio centralizado**: Almacenar ADRs, documentación técnica, código, runbooks
2. ✅ **Asistencia de desarrollo**: Código, tests, troubleshooting, seguridad, documentación
3. ✅ **Integración dual**: UI web + VS Code extension
4. ✅ **Fuentes externas**: Stack Overflow, GitHub, Azure Docs, DXC Wiki

---

## 🎯 Casos de Uso

### 1. **Para Desarrolladores** (VS Code)

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/nv_new` | Crear nuevo proyecto/repo con template | `/nv_new microservice-fastapi` |
| `/nv_test` | Generar y ejecutar tests | `/nv_test --coverage src/api.py` |
| `/nv_fix` | Analizar y arreglar errores | `/nv_fix TypeError line 45` |
| `/nv_doc` | Documentar código y guardar en KB | `/nv_doc --save src/utils.py` |
| `/nv_review` | Code review con best practices | `/nv_review --security PR#123` |
| `/nv_explain` | Explicar código complejo | `/nv_explain algorithm.py` |

### 2. **Para Cloud Engineers** (UI + VS Code)

- Consultar runbooks operativos
- Buscar soluciones a incidentes previos
- Obtener comandos kubectl/az cli contextuales
- Troubleshooting guiado

### 3. **Para Tech Writers** (UI)

- Buscar documentación existente antes de escribir
- Validar consistencia terminológica
- Generar índices automáticos

---

## 🏗️ Arquitectura Propuesta

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE PORTAL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │  VS Code Ext    │              │   Next.js UI     │          │
│  │  (Copilot Chat) │              │   /knowledge     │          │
│  │                 │              │                  │          │
│  │ /nv_new         │              │ Search Bar       │          │
│  │ /nv_test        │◄────────────►│ Chat Widget      │          │
│  │ /nv_fix         │   API REST   │ Code Examples    │          │
│  │ /nv_doc         │              │ ADR Explorer     │          │
│  └────────┬────────┘              └────────┬─────────┘          │
│           │                                │                     │
│           └────────────┬───────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│           ┌────────────────────────┐                            │
│           │   FastAPI Gateway      │                            │
│           │   /api/knowledge/*     │                            │
│           └────────┬───────────────┘                            │
│                    │                                             │
│                    ▼                                             │
│           ┌────────────────────────┐                            │
│           │   Dify RAG Platform    │                            │
│           │   • Knowledge Datasets │                            │
│           │   • Workflows          │                            │
│           │   • Agent Tools        │                            │
│           └────────┬───────────────┘                            │
│                    │                                             │
│         ┌──────────┼──────────┐                                 │
│         ▼          ▼          ▼                                 │
│    ┌────────┐ ┌─────────┐ ┌──────────┐                         │
│    │pgvector│ │ Redis   │ │Azure Blob│                         │
│    │Embeddings Cache    │ │Documents │                         │
│    └────────┘ └─────────┘ └──────────┘                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

         ▲                           ▲
         │                           │
    ┌────┴─────┐              ┌─────┴──────┐
    │ Internal │              │  External  │
    │ Sources  │              │  Sources   │
    └──────────┘              └────────────┘
         │                           │
    • GitHub Repos              • Stack Overflow API
    • ADR Files                 • Azure Docs
    • Confluence                • GitHub Public Repos
    • Local Docs                • DXC Knowledge Base
    • Code Comments             • Medium/Dev.to
```

### Stack Tecnológico (100% Reutilización de Infraestructura Existente)

| Capa | Tecnología | Estado Actual | Coste Incremental |
|------|------------|---------------|-------------------|
| **Frontend Web** | Next.js 14 + React | ✅ Ya implementado | €0 |
| **Frontend IDE** | VS Code Extension API | 📦 Por implementar | €0 |
| **Backend API** | FastAPI en AKS | 🆕 Nuevo pod en `cloudmind` namespace | €0 (dentro de cluster) |
| **RAG Engine** | Dify 1.9.2 | ✅ Ya desplegado (`dify-aks`) | €0 |
| **Vector DB** | **pgvector en PostgreSQL existente** | ✅ `dify-postgres-9107e36a` + extensión `vector` | €0 |
| **Embeddings** | text-embedding-3-large | ✅ Azure OpenAI ya configurado | ~€15/mes (uso) |
| **LLM** | gpt-4o-mini | ✅ Azure OpenAI ya configurado | ~€20/mes (uso) |
| **Cache** | **Redis existente** | ✅ `redis` pod en namespace `dify` | €0 |
| **Storage** | **Azure Blob existente** | ✅ `difyprivatest9107e36a` | €0 |
| **AKS Cluster** | **dify-aks** | ✅ 2 nodos (autoscaling 1-3) | €0 |

**Ahorro total vs nueva infraestructura**: **~€150/mes** 🎉

---

## 📚 Fuentes de Datos

### A. Fuentes Internas (Automáticas)

| Fuente | Frecuencia Sync | Formato | Prioridad |
|--------|----------------|---------|-----------|
| **GitHub Repos** (AlbertoLacambra/*) | On push | Markdown, Code | Alta |
| **ADRs** (`docs/architecture/adr.md`) | On commit | Markdown | Alta |
| **Confluence/Wiki DXC** | Daily | HTML → MD | Media |
| **Runbooks** (`docs/runbooks/`) | On push | Markdown | Alta |
| **Code Comments** (docstrings) | On push | Python, TS | Media |
| **Issues/PRs** (metadata) | Weekly | JSON | Baja |

### B. Fuentes Externas (Bajo Demanda)

| Fuente | Método | Uso |
|--------|--------|-----|
| **Stack Overflow** | API Search | Troubleshooting genérico |
| **Azure Docs** | Web Scraping | Consultas Azure |
| **GitHub Public** | API Search | Ejemplos de código |
| **DXC Internal KB** | API | Policies, compliance |

---

## 🗄️ Base de Datos Vectorial - Reutilizando PostgreSQL Existente

### ✅ Infraestructura Ya Disponible

```yaml
# Configuración actual de Dify
PostgreSQL Flexible Server:
  Host: dify-postgres-9107e36a.postgres.database.azure.com
  Database: dify
  User: difyadmin
  Port: 5432
  Extensiones: uuid-ossp, vector  ✅ YA INSTALADA
  
Vector Store Config (Dify):
  VECTOR_STORE: pgvector  ✅ YA CONFIGURADO
  PGVECTOR_HOST: dify-postgres-9107e36a.postgres.database.azure.com
  PGVECTOR_DATABASE: dify
```

### 📊 Estrategia de Schema (Nueva Base de Datos en mismo servidor)

**Opción Recomendada**: Crear nueva base de datos `nirvana_knowledge` en el mismo servidor PostgreSQL.

```sql
-- Conectar como difyadmin
psql -h dify-postgres-9107e36a.postgres.database.azure.com \
     -U difyadmin -d postgres

-- Crear nueva base de datos para Knowledge Portal
CREATE DATABASE nirvana_knowledge;

-- Conectar a la nueva DB
\c nirvana_knowledge

-- Habilitar extensión vector (si no está)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de conocimiento
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido
  content TEXT NOT NULL,
  embedding vector(1536),  -- text-embedding-3-large (1536 dimensions)
  
  -- Metadata
  source_type VARCHAR(50) NOT NULL,  -- 'github', 'adr', 'code', 'runbook', etc.
  source_url TEXT,
  file_path TEXT,
  repository VARCHAR(255),
  
  -- Categorización
  category VARCHAR(100),  -- 'architecture', 'code', 'troubleshooting', etc.
  tags TEXT[],
  language VARCHAR(50),  -- 'python', 'typescript', 'markdown', etc.
  
  -- Versioning
  version VARCHAR(50),
  commit_sha VARCHAR(40),
  
  -- Metadata adicional
  author VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Calidad y relevancia
  quality_score FLOAT,  -- Score de calidad del contenido
  usage_count INTEGER DEFAULT 0,  -- Veces usado en RAG
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', content)
  ) STORED
);

-- Índices optimizados
CREATE INDEX idx_embedding ON knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_source_type ON knowledge_chunks(source_type);
CREATE INDEX idx_category ON knowledge_chunks(category);
CREATE INDEX idx_tags ON knowledge_chunks USING gin(tags);
CREATE INDEX idx_search_vector ON knowledge_chunks USING gin(search_vector);
CREATE INDEX idx_created_at ON knowledge_chunks(created_at DESC);

-- Tabla de documentos originales (opcional, para referencia)
CREATE TABLE source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL UNIQUE,
  content TEXT,
  hash VARCHAR(64),  -- SHA-256 para detectar cambios
  last_synced TIMESTAMP DEFAULT NOW(),
  chunks_count INTEGER DEFAULT 0
);
```

### 💡 Ventajas de esta Estrategia

| Ventaja | Descripción |
|---------|-------------|
| **€0 coste adicional** | Mismo servidor PostgreSQL, solo nueva DB |
| **Seguridad** | Aislamiento entre `dify` y `nirvana_knowledge` |
| **Backups automáticos** | Azure PostgreSQL Flexible Server ya configurado |
| **Alta disponibilidad** | Hereda HA del servidor existente |
| **Monitoreo** | Mismo Azure Monitor y alertas |
| **Networking** | Mismas reglas de firewall, VPN access |

### Estrategia de Chunking

```python
# Configuración por tipo de documento
CHUNK_CONFIGS = {
    'markdown': {
        'chunk_size': 800,
        'chunk_overlap': 100,
        'split_by': 'section',  # Respetar headers
    },
    'python': {
        'chunk_size': 600,
        'chunk_overlap': 50,
        'split_by': 'function',  # Por función/clase
    },
    'typescript': {
        'chunk_size': 600,
        'chunk_overlap': 50,
        'split_by': 'function',
    },
    'yaml': {
        'chunk_size': 400,
        'chunk_overlap': 50,
        'split_by': 'resource',  # Por recurso K8s
    },
}
```

---

## 🔄 Pipeline de Datos Automático

### GitHub Actions Workflow

```yaml
# .github/workflows/sync-knowledge-base.yml
name: 🧠 Sync Knowledge Base

on:
  push:
    branches: [master]
    paths:
      - 'docs/**'
      - 'apps/**/*.py'
      - 'apps/**/*.ts'
      - 'apps/**/*.tsx'
  workflow_dispatch:

jobs:
  sync-knowledge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 📦 Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: 📥 Install Dependencies
        run: |
          pip install langchain openai tiktoken gitpython
      
      - name: 🔍 Extract Changed Files
        id: changes
        run: |
          git diff --name-only HEAD~1 HEAD > changed_files.txt
          cat changed_files.txt
      
      - name: 📝 Process Documents
        env:
          OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
        run: |
          python scripts/process-knowledge-documents.py \
            --files changed_files.txt \
            --output embeddings.json
      
      - name: 🚀 Upload to Dify
        env:
          DIFY_API_KEY: ${{ secrets.DIFY_API_KEY }}
          DIFY_URL: ${{ secrets.DIFY_URL }}
        run: |
          python scripts/upload-to-dify.py \
            --embeddings embeddings.json \
            --dataset-id ${{ secrets.DIFY_DATASET_KNOWLEDGE_ID }}
      
      - name: ✅ Verify Upload
        run: |
          python scripts/verify-knowledge-sync.py
```

### Script de Procesamiento

```python
# scripts/process-knowledge-documents.py
import os
import json
from pathlib import Path
from typing import List, Dict
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    Language
)
from openai import AzureOpenAI
import git

class KnowledgeProcessor:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=os.getenv('OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version='2024-02-01'
        )
        self.repo = git.Repo('.')
    
    def process_file(self, file_path: str) -> List[Dict]:
        """Procesa un archivo y retorna chunks con embeddings"""
        
        # Leer contenido
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Detectar tipo y chunking strategy
        chunks = self._chunk_content(file_path, content)
        
        # Generar embeddings
        embeddings = self._generate_embeddings(chunks)
        
        # Extraer metadata
        metadata = self._extract_metadata(file_path)
        
        # Combinar
        return [{
            'content': chunk,
            'embedding': emb,
            'metadata': metadata,
        } for chunk, emb in zip(chunks, embeddings)]
    
    def _chunk_content(self, file_path: str, content: str) -> List[str]:
        """Chunking inteligente según tipo de archivo"""
        
        ext = Path(file_path).suffix
        
        if ext == '.md':
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,
                chunk_overlap=100,
                separators=['\n## ', '\n### ', '\n\n', '\n', ' ']
            )
        elif ext == '.py':
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=Language.PYTHON,
                chunk_size=600,
                chunk_overlap=50
            )
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            )
        
        return splitter.split_text(content)
    
    def _generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Genera embeddings con Azure OpenAI"""
        
        response = self.client.embeddings.create(
            model='text-embedding-3-large',
            input=chunks
        )
        
        return [item.embedding for item in response.data]
    
    def _extract_metadata(self, file_path: str) -> Dict:
        """Extrae metadata del archivo y git"""
        
        # Git metadata
        commits = list(self.repo.iter_commits(paths=file_path, max_count=1))
        last_commit = commits[0] if commits else None
        
        return {
            'file_path': file_path,
            'repository': 'DXC_PoC_Nirvana',
            'commit_sha': last_commit.hexsha if last_commit else None,
            'author': str(last_commit.author) if last_commit else None,
            'updated_at': last_commit.committed_datetime.isoformat() if last_commit else None,
            'category': self._categorize_file(file_path),
            'tags': self._extract_tags(file_path),
        }
    
    def _categorize_file(self, file_path: str) -> str:
        """Categoriza el archivo"""
        
        if 'architecture' in file_path:
            return 'architecture'
        elif 'adr' in file_path:
            return 'adr'
        elif file_path.endswith('.py'):
            return 'code'
        elif 'runbook' in file_path:
            return 'runbook'
        else:
            return 'general'
    
    def _extract_tags(self, file_path: str) -> List[str]:
        """Extrae tags del archivo"""
        
        tags = []
        
        if 'azure' in file_path.lower():
            tags.append('azure')
        if 'terraform' in file_path.lower():
            tags.append('terraform')
        if 'kubernetes' in file_path.lower() or 'k8s' in file_path.lower():
            tags.append('kubernetes')
        
        return tags
```

---

## 🔌 VS Code Extension - Especificación

### Arquitectura de la Extensión

```
nirvana-vscode-extension/
├── package.json
├── src/
│   ├── extension.ts          # Entry point
│   ├── commands/
│   │   ├── nvNew.ts          # /nv_new
│   │   ├── nvTest.ts         # /nv_test
│   │   ├── nvFix.ts          # /nv_fix
│   │   ├── nvDoc.ts          # /nv_doc
│   │   ├── nvReview.ts       # /nv_review
│   │   └── nvExplain.ts      # /nv_explain
│   ├── providers/
│   │   ├── ChatParticipant.ts   # Copilot Chat integration
│   │   └── CodeLensProvider.ts  # Inline suggestions
│   ├── services/
│   │   ├── KnowledgeAPI.ts      # Llamadas a FastAPI
│   │   └── EmbeddingService.ts  # Local embeddings (opcional)
│   └── ui/
│       └── WebviewPanel.ts      # Panel lateral
└── resources/
    ├── templates/               # Project templates
    └── icons/
```

### Comandos Implementados

#### 1. `/nv_new` - Crear Proyecto

```typescript
// src/commands/nvNew.ts
import * as vscode from 'vscode';
import { KnowledgeAPI } from '../services/KnowledgeAPI';

export async function nvNew(args: string[]) {
  const projectType = args[0] || await vscode.window.showQuickPick([
    'microservice-fastapi',
    'microservice-nodejs',
    'terraform-module',
    'react-component',
    'python-library',
  ], { placeHolder: 'Selecciona tipo de proyecto' });
  
  // Consultar Knowledge Portal por template
  const api = new KnowledgeAPI();
  const template = await api.getProjectTemplate(projectType);
  
  // Crear estructura
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Abre un workspace primero');
    return;
  }
  
  // Generar código
  await generateProjectStructure(workspaceFolder.uri.fsPath, template);
  
  vscode.window.showInformationMessage(
    `✅ Proyecto ${projectType} creado con éxito`
  );
}
```

#### 2. `/nv_test` - Generar Tests

```typescript
// src/commands/nvTest.ts
export async function nvTest(args: string[]) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  const code = editor.document.getText();
  const filePath = editor.document.fileName;
  
  // Llamar a Knowledge Portal
  const api = new KnowledgeAPI();
  const tests = await api.generateTests({
    code,
    filePath,
    coverage: args.includes('--coverage'),
  });
  
  // Crear archivo de test
  const testFilePath = filePath.replace(/\.py$/, '_test.py');
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(testFilePath),
    Buffer.from(tests.code)
  );
  
  // Abrir archivo
  const doc = await vscode.workspace.openTextDocument(testFilePath);
  await vscode.window.showTextDocument(doc);
}
```

#### 3. `/nv_fix` - Arreglar Errores

```typescript
// src/commands/nvFix.ts
export async function nvFix(args: string[]) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  // Obtener diagnósticos (errores)
  const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
  
  if (diagnostics.length === 0) {
    vscode.window.showInformationMessage('No hay errores detectados');
    return;
  }
  
  // Enviar a Knowledge Portal
  const api = new KnowledgeAPI();
  const fixes = await api.suggestFixes({
    code: editor.document.getText(),
    diagnostics: diagnostics.map(d => ({
      message: d.message,
      line: d.range.start.line,
      severity: d.severity,
    })),
  });
  
  // Mostrar sugerencias
  const fix = await vscode.window.showQuickPick(
    fixes.map(f => ({
      label: f.title,
      description: f.description,
      fix: f,
    })),
    { placeHolder: 'Selecciona una solución' }
  );
  
  if (fix) {
    // Aplicar fix
    await editor.edit(editBuilder => {
      editBuilder.replace(
        new vscode.Range(fix.fix.range.start, fix.fix.range.end),
        fix.fix.newCode
      );
    });
  }
}
```

#### 4. `/nv_doc` - Documentar y Guardar

```typescript
// src/commands/nvDoc.ts
export async function nvDoc(args: string[]) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  const code = editor.document.getText();
  const api = new KnowledgeAPI();
  
  // Generar documentación
  const doc = await api.generateDocumentation({
    code,
    language: editor.document.languageId,
    includeExamples: true,
  });
  
  // Insertar docstrings
  await editor.edit(editBuilder => {
    // Insertar en cada función/clase
    doc.insertions.forEach(ins => {
      editBuilder.insert(
        new vscode.Position(ins.line, 0),
        ins.docstring
      );
    });
  });
  
  // Guardar en Knowledge Base si --save
  if (args.includes('--save')) {
    await api.saveToKnowledgeBase({
      code,
      documentation: doc.markdown,
      metadata: {
        filePath: editor.document.fileName,
        author: vscode.env.username,
      },
    });
    
    vscode.window.showInformationMessage(
      '✅ Código documentado y guardado en Knowledge Base'
    );
  }
}
```

### Integración con GitHub Copilot Chat

```typescript
// src/providers/ChatParticipant.ts
import * as vscode from 'vscode';

export function registerChatParticipant(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    'nirvana',
    async (
      request: vscode.ChatRequest,
      context: vscode.ChatContext,
      stream: vscode.ChatResponseStream,
      token: vscode.CancellationToken
    ) => {
      // Parsear comando
      const command = request.command;
      
      if (command === 'new') {
        await handleNewCommand(request, stream);
      } else if (command === 'test') {
        await handleTestCommand(request, stream);
      } else if (command === 'fix') {
        await handleFixCommand(request, stream);
      } else if (command === 'doc') {
        await handleDocCommand(request, stream);
      } else {
        // Query genérica a Knowledge Portal
        await handleGenericQuery(request, stream);
      }
    }
  );
  
  context.subscriptions.push(participant);
}

async function handleGenericQuery(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream
) {
  const api = new KnowledgeAPI();
  
  stream.progress('Consultando Knowledge Portal...');
  
  const response = await api.query({
    question: request.prompt,
    context: {
      activeFile: vscode.window.activeTextEditor?.document.fileName,
      workspace: vscode.workspace.name,
    },
  });
  
  stream.markdown(response.answer);
  
  // Mostrar fuentes
  if (response.sources.length > 0) {
    stream.markdown('\n\n**Fuentes:**\n');
    response.sources.forEach(source => {
      stream.markdown(`- [${source.title}](${source.url})\n`);
    });
  }
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (Semanas 1-2) - **€0 infraestructura**

**Base de Datos**:
- [x] PostgreSQL ya existe: `dify-postgres-9107e36a` ✅
- [x] Extensión vector ya instalada ✅
- [ ] Crear nueva base de datos `nirvana_knowledge` (mismo servidor)
- [ ] Ejecutar schema SQL (`knowledge_chunks`, `source_documents`)
- [ ] Configurar credentials en K8s Secret

**Dify Configuration**:
- [x] Dify 1.9.2 ya desplegado ✅
- [ ] Crear nuevo Dataset "Nirvana Knowledge Base"
- [ ] Configurar retrieval settings (top_k=5, threshold=0.7)
- [ ] Testing de embeddings quality

**Pipeline Datos**:
- [ ] Implementar `process-knowledge-documents.py`
- [ ] Crear GitHub Action `sync-knowledge-base.yml`
- [ ] Indexar documentación existente:
  - `docs/architecture/*.md` (~10 archivos)
  - `docs/guides/*.md` (~5 archivos)
  - ADRs (`docs/architecture/adr.md`)
  - README.md
- [ ] Validar calidad de embeddings (test queries)

**Coste Fase 1**: €35 (embeddings iniciales one-time) + €0 infraestructura

### Fase 2: API Backend (Semanas 3-4) - **€0 infraestructura**

**FastAPI Service** (nuevo pod en namespace `cloudmind`):
```yaml
# Deployment en AKS existente
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knowledge-api
  namespace: cloudmind
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: fastapi
        image: cloudmind<random>.azurecr.io/knowledge-api:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"  # 0.25 cores
          limits:
            memory: "1Gi"
            cpu: "500m"  # 0.5 cores
        env:
        - name: POSTGRES_HOST
          value: "dify-postgres-9107e36a.postgres.database.azure.com"
        - name: POSTGRES_DB
          value: "nirvana_knowledge"
```

**Endpoints**:
- [ ] `POST /api/knowledge/query` - RAG search
- [ ] `POST /api/knowledge/generate-tests` - Test generation
- [ ] `POST /api/knowledge/suggest-fixes` - Error fixing
- [ ] `POST /api/knowledge/generate-docs` - Documentation
- [ ] `GET /api/knowledge/health` - Healthcheck

**Integración Dify**:
- [ ] Wrapper Python para Dify API
- [ ] Workflow "Code Assistant"
- [ ] Workflow "Documentation Generator"
- [ ] Testing E2E con Postman/pytest

**Coste Fase 2**: €0 (pod dentro del cluster existente)

### Fase 3: UI Web (Semanas 5-6) - **€0 infraestructura**

**Next.js Pages** (en `apps/control-center-ui`):
- [ ] `/knowledge` - Portal principal
- [ ] `/knowledge/search` - Búsqueda semántica
- [ ] `/knowledge/adr` - Explorador ADRs
- [ ] `/knowledge/code` - Code examples browser

**Componentes**:
- [ ] `SearchBar` con autocomplete
- [ ] `ResultCard` con syntax highlighting
- [ ] `SourceViewer` con referencias
- [ ] `ChatWidget` integrado (ya existe ✅)

**Coste Fase 3**: €0 (Next.js ya desplegado)

### Fase 4: VS Code Extension (Semanas 7-9) - **€0 infraestructura**

**Comandos básicos**:
- [ ] `/nv_new` - Project scaffolding
- [ ] `/nv_test` - Test generation
- [ ] `/nv_fix` - Error fixing
- [ ] `/nv_doc` - Documentation

**Copilot Chat Integration**:
- [ ] Chat participant `@nirvana`
- [ ] Slash commands en chat
- [ ] Context awareness (archivo activo)

**Marketplace**:
- [ ] Publicar en VS Code Marketplace (free)
- [ ] README con ejemplos
- [ ] Video demo

**Coste Fase 4**: €0 (desarrollo one-time)

### Fase 5: Fuentes Externas (Semanas 10-11) - **€0 infraestructura**

**Integraciones**:
- [ ] Stack Overflow API (free tier)
- [ ] Azure Docs scraper
- [ ] GitHub Code Search API (free)
- [ ] DXC Internal KB connector

**Smart Routing**:
- [ ] Detectar query type (internal vs external)
- [ ] Routing automático a fuente correcta
- [ ] Merge de resultados

**Coste Fase 5**: €0 (APIs gratuitas)

---

### 📊 Resumen de Costes por Fase

| Fase | Duración | Infraestructura | API Usage | Total |
|------|----------|-----------------|-----------|-------|
| Fase 1 | 2 semanas | €0 | €35 (one-time) | €35 |
| Fase 2 | 2 semanas | €0 | €12 | €12 |
| Fase 3 | 2 semanas | €0 | €8 | €8 |
| Fase 4 | 3 semanas | €0 | €10 | €10 |
| Fase 5 | 2 semanas | €0 | €8 | €8 |
| **Total 11 semanas** | - | **€0** | **€73** | **€73** |

**Coste operacional mensual (post-implementación)**: **€21/mes**

---

## 💰 Coste Estimado Mensual (OPTIMIZADO - Reutilizando Infraestructura)

### Infraestructura Existente (€0 Incremental)

| Recurso | Estado | Coste Original | Coste Incremental |
|---------|--------|----------------|-------------------|
| **AKS Cluster** (dify-aks) | ✅ Reutilizado | €155/mes | **€0** |
| **PostgreSQL** (dify-postgres-9107e36a) | ✅ Reutilizado + nueva DB | €25/mes | **€0** |
| **Redis** (pod en dify namespace) | ✅ Reutilizado | €0 | **€0** |
| **Azure Blob** (difyprivatest9107e36a) | ✅ Reutilizado | €5/mes | **€0** |
| **pgvector extension** | ✅ Ya instalada | €0 | **€0** |
| **Subtotal Infraestructura** | - | €185/mes | **€0** ✅ |

### Nuevos Componentes (Solo API Usage)

| Componente | Uso Estimado | Coste/Mes |
|------------|--------------|-----------|
| **Embeddings** (text-embedding-3-large) | ~500K tokens/mes (docs iniciales) + 50K/mes (updates) | **€8** |
| **LLM Queries** (gpt-4o-mini) | ~3K requests/mes × 1K tokens avg | **€12** |
| **FastAPI Pod** (nuevo en namespace `cloudmind`) | 0.5 core, 1GB RAM (dentro del cluster) | **€0** |
| **Storage incremental** (nuevos docs) | +20 GB | **€1** |
| **External APIs** (Stack Overflow, etc.) | Rate limits gratuitos | **€0** |
| **Subtotal Nuevos Componentes** | - | **€21/mes** |

### 🎯 TOTAL MENSUAL: **€21/mes** (~$23/mes)

**Comparación con propuesta original**:
- ❌ Propuesta inicial: €65/mes (sin optimizar)
- ✅ **Propuesta optimizada: €21/mes**
- 💰 **Ahorro: €44/mes (68% reducción)**

### ROI Mejorado

| Comparación | Coste/Usuario/Mes | Usuarios Ilimitados |
|-------------|-------------------|---------------------|
| GitHub Copilot Business | $19/usuario | ❌ No |
| Tabnine Enterprise | $39/usuario | ❌ No |
| ChatGPT Plus | $20/usuario | ❌ No |
| **Nirvana Knowledge Portal** | **$23 total** | ✅ **Sí** |

**Para 5 desarrolladores**:
- GitHub Copilot: $95/mes
- Knowledge Portal: $23/mes
- **Ahorro: $72/mes ($864/año)** 🎉

### Proyección de Costes (6 meses)

```
Mes 1 (indexación masiva): ~€35 (embeddings iniciales)
Mes 2-6 (operación normal): ~€21/mes
Promedio: €24/mes
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tiempo de búsqueda** | Reducir de 15 min → 2 min | Analytics |
| **Precisión RAG** | >85% respuestas correctas | User feedback |
| **Adoption VS Code Ext** | >70% developers | Download stats |
| **Documentación indexada** | 100% archivos MD + código | Dashboard |
| **Consultas/día** | >50 queries | Logs |
| **Satisfacción usuario** | >4.5/5 stars | Encuestas |

---

## 🔐 Seguridad y Compliance

### Control de Acceso

```typescript
// API Authentication
const authMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // Validar API key en Azure Key Vault
  const isValid = await validateAPIKey(apiKey);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Logging
  await logAPIAccess({
    user: req.user,
    endpoint: req.path,
    timestamp: new Date(),
  });
  
  next();
};
```

### Data Privacy

- ✅ **Code scanning**: No indexar secrets, credentials
- ✅ **PII detection**: Filtrar información sensible
- ✅ **Access logs**: Auditoría completa
- ✅ **Encryption**: At-rest (Blob) y in-transit (HTTPS)

---

## 📚 Documentación Técnica

### API Endpoints

```
POST /api/knowledge/query
Body: { "question": "¿Cómo desplegar en AKS?", "context": {...} }
Response: { "answer": "...", "sources": [...] }

POST /api/knowledge/generate-tests
Body: { "code": "def foo()...", "language": "python" }
Response: { "tests": "def test_foo()...", "coverage": 85 }

POST /api/knowledge/suggest-fixes
Body: { "code": "...", "errors": [...] }
Response: { "fixes": [{ "title": "...", "diff": "..." }] }

POST /api/knowledge/save-document
Body: { "content": "...", "metadata": {...} }
Response: { "id": "uuid", "status": "indexed" }
```

### VS Code Extension API

```typescript
// Uso programático
import { NirvanaAPI } from 'nirvana-vscode';

const api = new NirvanaAPI();

// Query
const answer = await api.query('¿Cómo usar Terraform modules?');

// Generate tests
const tests = await api.generateTests(currentFile);

// Fix error
const fixes = await api.suggestFixes(diagnostics);
```

---

## ✅ Próximos Pasos

1. **Revisar propuesta** con el equipo
2. **Aprobar presupuesto** (~€65/mes)
3. **Fase 1**: Implementar pipeline de datos (2 semanas)
4. **Fase 2**: Backend API (2 semanas)
5. **MVP**: UI web (2 semanas)
6. **V1.0**: VS Code extension (3 semanas)

**Timeline total**: ~11 semanas  
**Fecha estimada de lanzamiento**: Enero 2026

---

**Contacto**: Alberto Lacambra  
**Última actualización**: 25 de Octubre 2025
