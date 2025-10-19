# Plan de Implementación - Cloud Control Center
## Starting Point & Roadmap

---

## 🎯 Estado Actual - Infraestructura Base

### ✅ Ya Desplegado y Funcionando

**Subscription**: `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7` (prueba - con budget)

| Recurso | Estado | Detalles |
|---------|--------|----------|
| **AKS Cluster** | ✅ Running | `dify-aks` en `northeurope`, K8s 1.30, 2 nodes |
| **Namespace: dify** | ✅ Active | Dify platform desplegado (API, Web, Worker, Redis, Nginx) |
| **Namespace: cloudmind** | ✅ Active | Preparado para nuevos workloads |
| **Dify Platform** | ✅ Running | 5 pods: API, Web, Worker, Redis, Nginx (LoadBalancer) |
| **PostgreSQL** | ✅ Desplegado | Flexible Server para Dify |
| **ACR** | ✅ Disponible | `dxccloudmindx0sa6l` (Basic SKU) |
| **VNet** | ✅ Configurado | Red privada para AKS |
| **Terraform State** | ✅ Configurado | Backend azurerm |
| **CI/CD** | ✅ Funcionando | GitHub Actions (deploy, drift-detection, gh-pages) |
| **GitHub Pages** | ✅ Live | Documentación publicada |

**Acceso a Dify**: LoadBalancer `10.0.2.62` (IP interna)

### 📊 Recursos Consumidos Actualmente

```
Estimación de costes actuales:
- AKS (2 nodes Standard_D2s_v3): ~€120/mes
- PostgreSQL Flexible Server: ~€60/mes  
- ACR Basic: ~€5/mes
- Storage: ~€10/mes
- Networking: ~€15/mes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~€210/mes (dentro de budget)
```

---

## 🚀 Recomendación: Estrategia de 3 Fases

### **FASE 1: UI Foundation + Dify Integration** (3-4 semanas)
**Objetivo**: Interfaz unificada funcionando + conectada a Dify existente

### **FASE 2: First Use Case - Knowledge Portal** (2-3 semanas)  
**Objetivo**: RAG funcional con documentación real

### **FASE 3: Second Use Case - Code Generation** (4-5 semanas)
**Objetivo**: Vibe Coding Studio básico funcionando

---

## 📋 FASE 1: UI Foundation (EMPEZAR AQUÍ) ⭐

### Semana 1-2: Setup del Proyecto NextJS

**Objetivo**: Crear la UI base que servirá como punto de entrada único

#### 1.1 Crear Proyecto NextJS en `/apps/control-center-ui`

```bash
# Estructura propuesta
apps/
└── control-center-ui/          # Nueva aplicación NextJS
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── app/
    │   ├── layout.tsx           # Layout principal
    │   ├── page.tsx             # Dashboard home
    │   ├── api/                 # API routes (BFF pattern)
    │   │   └── dify/
    │   │       └── route.ts     # Proxy to Dify API
    │   ├── chat/                # Chat interface
    │   │   └── page.tsx
    │   ├── knowledge/           # Knowledge portal
    │   │   └── page.tsx
    │   └── settings/
    │       └── page.tsx
    ├── components/
    │   ├── ui/                  # shadcn/ui components
    │   ├── chat/
    │   │   ├── ChatWidget.tsx
    │   │   ├── MessageList.tsx
    │   │   └── MessageInput.tsx
    │   ├── layout/
    │   │   ├── Navigation.tsx
    │   │   ├── Header.tsx
    │   │   └── Sidebar.tsx
    │   └── dashboard/
    │       ├── StatsCard.tsx
    │       └── ActivityFeed.tsx
    ├── lib/
    │   ├── dify-client.ts       # Cliente API de Dify
    │   ├── auth.ts              # Auth con Azure AD (futuro)
    │   └── utils.ts
    └── public/
        └── assets/
```

#### 1.2 Stack Tecnológico Concreto

```json
{
  "name": "control-center-ui",
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "typescript": "5.5.0",
    
    // UI Framework
    "tailwindcss": "3.4.0",
    "@radix-ui/react-*": "latest",  // Base components
    "lucide-react": "0.400.0",      // Icons
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.0",
    "tailwind-merge": "2.3.0",
    
    // State Management
    "zustand": "4.5.0",             // Global state
    "@tanstack/react-query": "5.0.0", // Server state
    
    // Forms & Validation
    "react-hook-form": "7.51.0",
    "zod": "3.23.0",
    
    // API Client
    "axios": "1.7.0",
    "swr": "2.2.0",                 // Alternative to react-query
    
    // Markdown & Rich Text
    "react-markdown": "9.0.0",
    "remark-gfm": "4.0.0",
    "rehype-highlight": "7.0.0"
  }
}
```

#### 1.3 Integración con Dify Existente

**Dify API Base URL**: `http://dify-api.dify.svc.cluster.local:5001` (interno al cluster)

**Cliente Dify** (`lib/dify-client.ts`):

```typescript
// lib/dify-client.ts
import axios from 'axios';

const DIFY_API_URL = process.env.DIFY_API_URL || 'http://dify-api.dify.svc.cluster.local:5001';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

export class DifyClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: DIFY_API_URL,
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Chat Completion
  async chat(message: string, conversationId?: string) {
    const response = await this.client.post('/v1/chat-messages', {
      inputs: {},
      query: message,
      conversation_id: conversationId,
      user: 'default-user'
    });
    return response.data;
  }

  // Knowledge Base Search
  async searchKnowledge(query: string, datasetId: string) {
    const response = await this.client.post(`/v1/datasets/${datasetId}/retrieve`, {
      query,
      retrieval_model: {
        top_k: 5,
        score_threshold: 0.7
      }
    });
    return response.data;
  }

  // Workflows
  async runWorkflow(workflowId: string, inputs: Record<string, any>) {
    const response = await this.client.post(`/v1/workflows/${workflowId}/run`, {
      inputs,
      user: 'default-user'
    });
    return response.data;
  }

  // App Info
  async getAppInfo(appId: string) {
    const response = await this.client.get(`/v1/apps/${appId}`);
    return response.data;
  }
}

export const difyClient = new DifyClient();
```

#### 1.4 Despliegue en AKS (namespace: cloudmind)

**Kubernetes Manifests** (`kubernetes/control-center/`):

```yaml
# kubernetes/control-center/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: control-center-ui
  namespace: cloudmind
  labels:
    app: control-center-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: control-center-ui
  template:
    metadata:
      labels:
        app: control-center-ui
    spec:
      containers:
      - name: ui
        image: dxccloudmindx0sa6l.azurecr.io/control-center-ui:latest
        ports:
        - containerPort: 3000
        env:
        - name: DIFY_API_URL
          value: "http://dify-api.dify.svc.cluster.local:5001"
        - name: DIFY_API_KEY
          valueFrom:
            secretKeyRef:
              name: dify-api-key
              key: api-key
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: control-center-ui
  namespace: cloudmind
spec:
  selector:
    app: control-center-ui
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: control-center-ui
  namespace: cloudmind
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: cloudcontrol.internal.dxc.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: control-center-ui
            port:
              number: 80
```

### Semana 3: Implementar Dashboard Básico

#### 3.1 Dashboard Home (`app/page.tsx`)

**Diseño**:

```typescript
// app/page.tsx
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Cloud Control Center</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered platform for Cloud Engineers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Projects"
          value="12"
          icon="folder"
          trend="+3 this month"
        />
        <StatsCard
          title="Deployments"
          value="47"
          icon="rocket"
          trend="+8 this week"
        />
        <StatsCard
          title="Cost This Month"
          value="€4,250"
          icon="dollar-sign"
          trend="-12% vs last month"
        />
        <StatsCard
          title="Security Score"
          value="87/100"
          icon="shield"
          trend="+5 pts this month"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
```

#### 3.2 Chat Widget Integrado

```typescript
// components/chat/ChatWidget.tsx
'use client';

import { useState } from 'react';
import { difyClient } from '@/lib/dify-client';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState<string>();

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);

    // Call Dify API
    const response = await difyClient.chat(message, conversationId);
    
    // Add AI response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.answer,
      timestamp: new Date()
    }]);

    // Store conversation ID for context
    if (!conversationId) {
      setConversationId(response.conversation_id);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle className="w-6 h-6 mx-auto" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">CloudMind Assistant</h3>
            <p className="text-sm text-muted-foreground">Ask me anything</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} />
          </div>
          
          <div className="p-4 border-t">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      )}
    </>
  );
}
```

### Semana 4: CI/CD y Testing

#### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy-control-center-ui.yml
name: 🎨 Deploy Control Center UI

on:
  push:
    branches: [main]
    paths:
      - 'apps/control-center-ui/**'
      - 'kubernetes/control-center/**'
  workflow_dispatch:

env:
  ACR_NAME: dxccloudmindx0sa6l
  IMAGE_NAME: control-center-ui
  AKS_NAME: dify-aks
  AKS_RG: dify-rg
  NAMESPACE: cloudmind

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔐 Login to Azure
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: 🐳 Login to ACR
        run: az acr login --name ${{ env.ACR_NAME }}
      
      - name: 🏗️ Build Docker Image
        working-directory: apps/control-center-ui
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest .
      
      - name: 📤 Push to ACR
        run: |
          docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
  
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔐 Login to Azure
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: ⚙️ Get AKS Credentials
        run: az aks get-credentials --name ${{ env.AKS_NAME }} --resource-group ${{ env.AKS_RG }}
      
      - name: 🚀 Deploy to AKS
        run: |
          kubectl apply -f kubernetes/control-center/
          kubectl rollout status deployment/control-center-ui -n ${{ env.NAMESPACE }}
      
      - name: 📢 Notify Teams
        if: always()
        run: |
          # Send notification to Teams webhook
          # (reuse existing script)
```

---

## 📋 FASE 2: Knowledge Portal con RAG (Semana 5-7)

### Objetivo: Documentación técnica consultable via chat

### 5.1 Crear Knowledge Base en Dify

**Pasos**:

1. Acceder a Dify Web UI: `http://10.0.2.62` (LoadBalancer interno)
2. Crear nuevo Dataset: "Cloud Control Center Docs"
3. Configurar embedding model (si no está configurado)
4. Cargar documentación inicial

**Contenido inicial a indexar**:
```
docs/
├── PRODUCT_VISION.md
├── architecture/
│   ├── overview.md
│   ├── ai-rag-system.md
│   └── deployed-resources.md
├── use-cases/
│   └── README.md
├── guides/
│   ├── secrets-setup.md
│   └── teams-troubleshooting.md
└── costs/
    ├── analysis.md
    └── optimization.md
```

### 5.2 Script de Sincronización Automática

```python
# scripts/sync-docs-to-dify.py
import os
import requests
from pathlib import Path

DIFY_API_URL = os.getenv('DIFY_API_URL')
DIFY_API_KEY = os.getenv('DIFY_API_KEY')
DATASET_ID = os.getenv('DIFY_DATASET_ID')

def sync_documentation():
    """Sync markdown files to Dify knowledge base"""
    
    docs_path = Path('docs')
    markdown_files = list(docs_path.rglob('*.md'))
    
    print(f"Found {len(markdown_files)} markdown files")
    
    for file_path in markdown_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Upload to Dify
        response = requests.post(
            f'{DIFY_API_URL}/v1/datasets/{DATASET_ID}/documents',
            headers={
                'Authorization': f'Bearer {DIFY_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'name': str(file_path),
                'text': content,
                'indexing_technique': 'high_quality',
                'process_rule': {
                    'mode': 'automatic'
                }
            }
        )
        
        if response.status_code == 200:
            print(f"✅ Synced: {file_path}")
        else:
            print(f"❌ Failed: {file_path} - {response.text}")

if __name__ == '__main__':
    sync_documentation()
```

### 5.3 Integrar Knowledge Search en UI

```typescript
// app/knowledge/page.tsx
'use client';

import { useState } from 'react';
import { difyClient } from '@/lib/dify-client';
import { Search } from 'lucide-react';

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    const response = await difyClient.searchKnowledge(
      query,
      process.env.NEXT_PUBLIC_DATASET_ID
    );
    setResults(response.records);
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Knowledge Portal</h1>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-3 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-3 top-2 px-4 py-1 bg-primary text-white rounded"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, idx) => (
          <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition">
            <h3 className="font-semibold mb-2">{result.document.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {result.content.substring(0, 200)}...
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Score: {(result.score * 100).toFixed(1)}%</span>
              <a href="#" className="text-primary hover:underline">
                View Full Document →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 FASE 3: Code Generation - Vibe Coding MVP (Semana 8-12)

### Objetivo: Generar proyectos básicos con IA

**Por definir en detalle más adelante**, pero el outline sería:

1. **Templates Repository**: Crear repo con templates base (FastAPI, NextJS)
2. **Code Gen Service**: Servicio Python que usa LangChain + OpenAI
3. **UI para Vibe Coding**: Formulario de descripción + preview de código
4. **Integration con GitHub**: Auto-crear repos con código generado

---

## 💰 Estimación de Costes por Fase

### Fase 1: UI Foundation

| Recurso | Coste/Mes | Notas |
|---------|-----------|-------|
| AKS (existente) | €0 | Ya desplegado |
| Control Center UI (2 pods) | €10 | Incluido en AKS |
| Ingress/LB | €15 | Compartido |
| **TOTAL INCREMENTAL** | **€25/mes** | |

### Fase 2: Knowledge Portal

| Recurso | Coste/Mes | Notas |
|---------|-----------|-------|
| Dify (existente) | €0 | Ya desplegado |
| Azure OpenAI (embeddings) | €20 | ~1M tokens/mes |
| Azure OpenAI (chat) | €30 | ~500K tokens/mes |
| **TOTAL INCREMENTAL** | **€50/mes** | |

### Fase 3: Code Generation

| Recurso | Coste/Mes | Notas |
|---------|-----------|-------|
| Azure OpenAI (code gen) | €150 | Uso intensivo de GPT-4 |
| Code Gen Service | €20 | Pod adicional |
| Storage (templates) | €5 | Blob storage |
| **TOTAL INCREMENTAL** | **€175/mes** | |

**Total Acumulado Fase 3**: €250/mes (dentro de budget)

---

## 🎯 Recomendación Final

### ✅ EMPEZAR POR:

**FASE 1 - Semana 1-2: Crear UI Foundation**

**Tareas concretas esta semana**:

1. **Día 1-2**: Setup proyecto NextJS en `apps/control-center-ui/`
2. **Día 3-4**: Implementar layout base y componentes UI
3. **Día 5**: Integrar cliente Dify y hacer primera llamada API
4. **Día 6-7**: Dashboard básico con stats hardcoded
5. **Día 8-9**: Chat widget básico funcionando
6. **Día 10**: Deploy a AKS namespace `cloudmind`

**Resultado**: UI funcional accesible desde el cluster, conectada a Dify

### 🔧 Comandos para Empezar Hoy

```bash
# 1. Crear directorio del proyecto
mkdir -p apps/control-center-ui
cd apps/control-center-ui

# 2. Inicializar NextJS con TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# 3. Instalar dependencias adicionales
npm install zustand @tanstack/react-query axios lucide-react class-variance-authority clsx tailwind-merge

# 4. Instalar shadcn/ui
npx shadcn-ui@latest init

# 5. Agregar componentes base de shadcn
npx shadcn-ui@latest add button card input textarea

# 6. Crear estructura de carpetas
mkdir -p components/chat components/dashboard components/layout lib

# 7. Crear Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
EOF

echo "✅ Proyecto inicializado en apps/control-center-ui/"
```

---

## 📊 Métricas de Éxito - Fase 1

| Métrica | Target |
|---------|--------|
| **Time to Deploy** | < 5 min |
| **UI Response Time** | < 200ms |
| **Chat Response Time** | < 3s |
| **Uptime** | > 99% |
| **User Satisfaction** | > 4/5 |

---

## ❓ Preguntas Antes de Empezar

1. **¿Tienes acceso a Dify Web UI actualmente?** (http://10.0.2.62)
2. **¿Ya tienes Azure OpenAI configurado?** (necesario para chat)
3. **¿Prefieres empezar con chat o con knowledge search?**
4. **¿Quieres que cree el setup inicial del proyecto NextJS ahora?**

**¿Procedemos con crear el proyecto NextJS?** 🚀
