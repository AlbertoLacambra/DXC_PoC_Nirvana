# Stack Tecnológico - Cloud Control Center

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Infrastructure as Code (IaC)](#infrastructure-as-code-iac)
- [Frontend](#frontend)
- [Backend](#backend)
- [AI y LLM](#ai-y-llm)
- [Datos y Almacenamiento](#datos-y-almacenamiento)
- [Observabilidad](#observabilidad)
- [CI/CD](#cicd)
- [Networking y Seguridad](#networking-y-seguridad)
- [Justificación de Elecciones](#justificación-de-elecciones)

## Visión General

El Cloud Control Center utiliza un stack moderno, cloud-native y AI-first diseñado para:

- **Escalabilidad**: Arquitectura distribuida multi-subscription
- **Mantenibilidad**: IaC declarativo con Terragrunt, código limpio y testeado
- **Performance**: React Server Components, caching, async operations
- **Seguridad**: Zero-trust, secrets management, audit logging
- **Cost efficiency**: Recursos compartidos, auto-scaling, FinOps automation

## Infrastructure as Code (IaC)

### Terragrunt + Terraform

**Versiones:**

- Terragrunt: `>= 0.55.0`
- Terraform: `>= 1.6.0`
- Azure Provider: `~> 3.80`

**¿Por qué Terragrunt?**

✅ **Multi-subscription DRY**: Configuración compartida entre Hub y Spokes  
✅ **Dependencies automáticas**: Spoke-Prod espera outputs de Hub  
✅ **State management simplificado**: Backend auto-configurado por ambiente  
✅ **Un comando deploy**: `terragrunt run-all apply` despliega todo en orden  
✅ **Mantiene ecosystem Terraform**: Todos los módulos community funcionan  
✅ **Curva de aprendizaje mínima**: Wrapper sobre Terraform HCL familiar

**Estructura:**

```
terraform/
├── terragrunt.hcl              # Root config (remote state, provider)
├── _envcommon/                 # Configuración compartida
├── modules/                    # Terraform modules reutilizables
│   ├── aks/
│   ├── vnet-peering/
│   ├── postgresql/
│   └── monitoring/
├── hub/                        # Hub subscription config
├── spoke-prod/                 # Spoke-Prod config + dependencies
└── spoke-dev/                  # Spoke-Dev config + dependencies
```

**Comandos clave:**

```bash
# Deploy completo
terragrunt run-all apply

# Deploy solo Hub
cd hub/ && terragrunt apply

# Dependency graph
terragrunt graph-dependencies
```

**Alternativas consideradas:**

- ❌ **Terraform puro**: Código duplicado entre subscriptions, state management manual
- ❌ **Pulumi Python**: Overhead mantener DOS paradigmas IaC (HCL + Python), FinOps puede ser Python scripts separados
- ❌ **Bicep**: Lock-in Azure, menos portable que Terraform, comunidad menor

## Frontend

### Next.js 14+ con App Router

**Versión:** `^14.2.0`

**Features clave:**

- **React Server Components**: Reduce bundle size, mejora performance
- **App Router**: Layouts anidados, streaming, Suspense
- **MDX Native**: Documentación como código con componentes React
- **Server Actions**: Mutations sin API endpoints explícitos
- **Edge Runtime**: Deploy en Edge locations para latencia mínima

**Librerías principales:**

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@next/mdx": "^14.2.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.344.0",
    "@radix-ui/react-*": "latest",
    "next-themes": "^0.3.0",
    "recharts": "^2.12.0",
    "react-markdown": "^9.0.0",
    "date-fns": "^3.3.0"
  }
}
```

**UI Components:**

- **Radix UI**: Primitivos accesibles (Dialog, Dropdown, Tabs, etc.)
- **Lucide Icons**: Iconos SVG modernos y ligeros
- **Tailwind CSS**: Utility-first CSS framework
- **Dark mode**: next-themes con soporte sistema

**Estructura:**

```
apps/control-center-ui/
├── app/
│   ├── (dashboard)/           # Layout dashboard
│   │   ├── page.tsx           # Dashboard home
│   │   ├── infrastructure/
│   │   ├── finops/
│   │   └── docs/
│   ├── api/                   # API routes (proxies a FastAPI)
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Radix UI wrappers
│   ├── dashboard/             # Dashboard components
│   └── docs/                  # MDX components
├── lib/
│   ├── dify-client.ts         # Dify API client
│   ├── api-client.ts          # FastAPI client
│   └── utils.ts
└── content/                   # MDX documentation
    ├── architecture/
    ├── runbooks/
    └── use-cases/
```

**¿Por qué Next.js App Router vs Pages Router?**

✅ **Future-proof**: Dirección oficial de Next.js  
✅ **Performance**: RSC reduce JavaScript enviado al cliente  
✅ **DX mejorado**: Layouts, loading, error states simplificados  
✅ **MDX integration**: Primera clase con App Router  
⚠️ **Learning curve**: App Router diferente a Pages, requiere adaptación

## Backend

### FastAPI (Python)

**Versión:** `^0.110.0`

**Features clave:**

- **Async/await**: Performance con operaciones I/O bound
- **Type hints**: Validación automática con Pydantic
- **OpenAPI auto-gen**: Swagger UI out-of-the-box
- **Dependency Injection**: DI system elegante
- **WebSockets**: Real-time updates para dashboards

**Librerías principales:**

```python
# requirements.txt

fastapi==0.110.0
uvicorn[standard]==0.29.0
pydantic==2.6.0
pydantic-settings==2.2.0

# Azure SDKs
azure-identity==1.15.0
azure-mgmt-resource==23.0.0
azure-mgmt-costmanagement==4.0.0
azure-mgmt-monitor==6.0.0
azure-storage-blob==12.19.0

# Database
asyncpg==0.29.0        # PostgreSQL async driver
redis==5.0.0           # Redis client

# HTTP clients
httpx==0.27.0          # Async HTTP (para Dify API)
aiohttp==3.9.0

# Utilities
python-jose[cryptography]==3.3.0  # JWT
passlib[bcrypt]==1.7.4            # Password hashing
python-multipart==0.0.9           # File uploads
```

**Estructura:**

```
apps/api-gateway/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── infrastructure.py
│   │       │   ├── finops.py
│   │       │   ├── dify.py
│   │       │   └── auth.py
│   │       └── router.py
│   ├── core/
│   │   ├── config.py          # Settings from env
│   │   ├── security.py        # JWT, auth
│   │   └── logging.py         # Structured logging
│   ├── integrations/
│   │   ├── dify.py            # Dify API client
│   │   ├── azure_cost.py      # Cost Management API
│   │   └── azure_monitor.py   # Azure Monitor API
│   ├── models/
│   │   ├── schemas.py         # Pydantic models
│   │   └── database.py        # SQLAlchemy models
│   ├── services/
│   │   ├── infrastructure_service.py
│   │   └── finops_service.py
│   └── main.py
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
└── requirements.txt
```

**Ejemplo endpoint:**

```python
# app/api/v1/endpoints/finops.py

from fastapi import APIRouter, Depends, HTTPException
from app.integrations.azure_cost import AzureCostClient
from app.integrations.dify import DifyClient
from app.models.schemas import UnderutilizationReport

router = APIRouter()

@router.get("/underutilization", response_model=UnderutilizationReport)
async def analyze_underutilization(
    subscription_id: str,
    cost_client: AzureCostClient = Depends(),
    dify_client: DifyClient = Depends()
):
    """Analiza recursos infrautilizados con AI recommendations."""
    
    # Query Azure Cost Management API
    usage_data = await cost_client.get_resource_usage(subscription_id)
    
    # Analizar con Dify AI
    dify_response = await dify_client.run_workflow(
        workflow_id="finops-underutilization-analysis",
        inputs={
            "usage_data": usage_data,
            "threshold_cpu": 40,
            "threshold_memory": 40,
            "lookback_days": 7
        }
    )
    
    return UnderutilizationReport(
        resources=dify_response["underutilized_resources"],
        savings_eur_month=dify_response["potential_savings"],
        recommendations=dify_response["recommendations"]
    )
```

**¿Por qué FastAPI vs alternativas?**

✅ **Performance**: Uno de los frameworks Python más rápidos  
✅ **Modern Python**: Async/await, type hints, Pydantic validation  
✅ **OpenAPI auto**: Documentación interactiva sin esfuerzo  
✅ **Azure SDK compatible**: Todas las librerías Azure funcionan  
❌ **vs Django REST**: Django más pesado, menos async-first  
❌ **vs Flask**: Flask no async nativo, menos features out-of-the-box

## AI y LLM

### Dify (Orchestrator)

**Versión:** `0.6.13` (existente en Hub)  
**URL:** `http://10.0.2.62/` (VPN required)

**Uso en Control Center:**

1. **Documentation RAG Bot**
   - Knowledge Base con MDX content
   - Q&A conversacional sobre arquitectura, runbooks
   - Integrado en Next.js UI vía API

2. **FinOps Recommendations**
   - Workflow analiza underutilization data
   - Genera PRs automáticos con Terragrunt changes
   - Risk analysis antes de aplicar cambios

3. **IaC Drift Analysis**
   - Compara Terraform state vs realidad Azure
   - AI decide severity y auto-remediation strategy
   - Notificaciones Slack con contexto enriquecido

4. **Engineering Homologation**
   - Code review AI-driven
   - Compliance checking contra normativas internas
   - Automated testing suggestions

**Dify Workflows creados:**

```
Dify Workflows (http://10.0.2.62/workflows):
├── documentation-rag          # RAG sobre docs MDX
├── finops-underutilization    # Análisis costes + recommendations
├── iac-drift-detection        # Terraform drift + remediation
└── code-review-compliance     # Engineering homologation
```

**Integración FastAPI:**

```python
# app/integrations/dify.py

import httpx
from app.core.config import settings

class DifyClient:
    def __init__(self):
        self.base_url = "http://10.0.2.62/api"
        self.api_key = settings.DIFY_API_KEY
        
    async def run_workflow(self, workflow_id: str, inputs: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/workflows/run",
                json={"workflow_id": workflow_id, "inputs": inputs},
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            return response.json()
```

### Azure OpenAI (vía Dify)

- **Modelos**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Embeddings**: text-embedding-3-large (para RAG)
- **Configurado en Dify**: Endpoint + API Key en Key Vault

## Datos y Almacenamiento

### PostgreSQL Flexible Server

**Versión:** `14`  
**SKU:** Burstable B2s (Hub shared)  
**Servidor:** `dify-postgres-9107e36a.postgres.database.azure.com`

**Databases:**

```sql
-- Existing
dify_db                 -- Dify platform data

-- A crear (Control Center)
control_center_db       -- Metadata, configs, audit logs
  ├── infrastructure_state    -- Cache Terraform state summaries
  ├── finops_reports          -- Historical cost analysis
  ├── audit_logs              -- User actions, deployments
  └── dify_workflow_runs      -- Workflow execution history
```

**Connection pooling:**

- FastAPI usa `asyncpg` con pool size 10-20
- Connection string en Key Vault: `cc-prod-db-connection-string`

### Redis (Cache)

**Versión:** `7.x`  
**Deployment:** Pod en AKS Hub  
**Pod:** `redis-6b56696c4b-d89lp`

**Uso:**

- Session storage (JWT tokens)
- API response caching (Azure Cost API queries)
- Rate limiting
- WebSocket pub/sub (real-time dashboard updates)

```python
# FastAPI cache example
from redis.asyncio import Redis
import json

redis_client = Redis(host="redis-service.dify.svc.cluster.local", port=6379)

@router.get("/infrastructure/summary")
async def get_infrastructure_summary(subscription_id: str):
    # Check cache
    cache_key = f"infra_summary:{subscription_id}"
    cached = await redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Query Azure, compute summary
    summary = await compute_infrastructure_summary(subscription_id)
    
    # Cache for 5 minutes
    await redis_client.setex(cache_key, 300, json.dumps(summary))
    
    return summary
```

### Azure Blob Storage

**Storage Account:** `difyprivatest9107e36a`  
**Container:** `control-center` (a crear)

**Uso:**

- Terraform state files (via Terragrunt backend)
- FinOps reports exports (CSV, JSON)
- Backup de configuraciones
- Logs archivados (>30 días)

## Observabilidad

### Grafana + Prometheus

**Deployment:** Kubernetes en Hub AKS  
**Access:** Via VPN, port-forward o Ingress interno

**Dashboards:**

1. **Infrastructure Overview**
   - AKS cluster health (Hub + Spokes)
   - PostgreSQL performance
   - Redis hit rate
   - VNet traffic

2. **Application Performance**
   - Next.js response times
   - FastAPI endpoint latencies
   - Dify workflow execution times
   - Error rates

3. **Cost Monitoring**
   - Daily spend per subscription
   - Resource utilization trends
   - Anomaly detection alerts
   - Budget vs actual

**Prometheus exporters:**

- `kube-state-metrics`: Kubernetes objects
- `node-exporter`: Node-level metrics
- `postgres-exporter`: PostgreSQL metrics
- `redis-exporter`: Redis metrics

### Azure Monitor + Application Insights

**Log Analytics Workspace:** `cc-logs-workspace` (Hub)  
**Application Insights:** `cc-app-insights` (Hub)

**Logs centralizados:**

- AKS container logs (Hub + Spokes)
- NSG flow logs
- Key Vault access logs
- Cost Management API queries

**APM (Application Performance Monitoring):**

- Next.js frontend telemetry
- FastAPI backend traces
- Distributed tracing (OpenTelemetry)
- Custom metrics (FinOps savings, drift detection)

**Kusto queries:**

```kql
// Top 10 most expensive resources last 7 days
AzureCosts
| where TimeGenerated > ago(7d)
| summarize TotalCost = sum(Cost) by ResourceId
| top 10 by TotalCost desc

// Failed Dify workflow runs
AppTraces
| where Message contains "dify_workflow_failed"
| project TimeGenerated, WorkflowId, ErrorMessage
| order by TimeGenerated desc
```

## CI/CD

### GitHub Actions

**Workflows principales:**

1. **Terraform Validation & Plan**

```yaml
# .github/workflows/terraform-plan.yml

name: Terraform Plan

on:
  pull_request:
    paths:
      - 'terraform/**'

jobs:
  plan:
    runs-on: self-hosted  # Runner en Hub AKS
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terragrunt
        uses: gruntwork-io/terragrunt-action@v2
        with:
          terragrunt_version: 0.55.0
      
      - name: Terragrunt Plan
        run: |
          cd terraform/
          terragrunt run-all plan --terragrunt-non-interactive
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
      
      - name: Post Plan to PR
        uses: actions/github-script@v7
        with:
          script: |
            // Post Terragrunt plan output como PR comment
```

2. **Next.js Build & Deploy**

```yaml
# .github/workflows/nextjs-deploy.yml

name: Deploy Next.js

on:
  push:
    branches: [main]
    paths:
      - 'apps/control-center-ui/**'

jobs:
  build-and-deploy:
    runs-on: self-hosted
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Next.js
        run: |
          cd apps/control-center-ui/
          npm ci
          npm run build
      
      - name: Build Docker Image
        run: |
          docker build -t ccacr.azurecr.io/control-center-ui:${{ github.sha }} .
          docker push ccacr.azurecr.io/control-center-ui:${{ github.sha }}
      
      - name: Deploy to AKS Spoke-Prod
        run: |
          kubectl set image deployment/control-center-ui \
            ui=ccacr.azurecr.io/control-center-ui:${{ github.sha }} \
            -n control-center
```

3. **FinOps Daily Check**

```yaml
# .github/workflows/finops-daily.yml

name: FinOps Daily Check

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC daily

jobs:
  analyze:
    runs-on: self-hosted
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Underutilization Analysis
        run: |
          python scripts/finops/daily_cost_check.py
        env:
          AZURE_SUBSCRIPTION_HUB: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
          AZURE_SUBSCRIPTION_PROD: 353a6255-27a8-4733-adf0-1c531ba9f4e9
          AZURE_SUBSCRIPTION_DEV: 0987a8ce-7f7d-4a28-8db2-5c2c3115dfa4
      
      - name: Create PRs if needed
        run: |
          python scripts/finops/generate_optimization_prs.py
```

**Self-hosted runner:**

- Deployment en Hub AKS (DaemonSet o Deployment)
- Acceso VPN + VNet peering → puede alcanzar Spokes
- Pre-installed: Terragrunt, Terraform, Docker, kubectl, Azure CLI

## Networking y Seguridad

### VPN (OpenVPN)

**Gateway:** `52.178.149.106` (public)  
**Internal:** `10.0.1.10`  
**Network:** `10.0.0.0/16` (Hub VNet)

**Acceso:**

- Todo el tráfico a Control Center pasa por VPN
- No public IPs en Spokes (solo internal IPs)
- LoadBalancers tipo `Internal` únicamente

### VNet Peering

**Hub ↔ Spoke-Prod:**

- `hub-to-spoke-prod`: Hub puede iniciar conexiones a Spoke-Prod
- `spoke-prod-to-hub`: Spoke-Prod puede iniciar a Hub (PostgreSQL, Redis, Dify)
- Allow forwarded traffic: `true`
- Allow gateway transit: `true` (Hub VPN gateway)

**Hub ↔ Spoke-Dev:**

- Similar configuration a Spoke-Prod

### Azure Key Vault

**Key Vault:** `dify-private-kv` (Hub)

**Secrets para Control Center:**

```
Key Vault Secrets:
├── cc-prod-db-connection-string    # PostgreSQL connection
├── cc-api-jwt-secret               # FastAPI JWT signing key
├── dify-api-key                    # Dify API authentication
├── azure-openai-api-key            # Azure OpenAI (vía Dify)
└── github-actions-token            # GitHub PAT para PRs
```

**Access:**

- FastAPI usa Managed Identity para leer secrets
- Kubernetes CSI driver monta secrets como volumes
- GitHub Actions self-hosted runner usa Service Principal

### Kubernetes Secrets CSI Driver

```yaml
# kubernetes/control-center/secret-provider-class.yaml

apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: cc-secrets
spec:
  provider: azure
  parameters:
    keyvaultName: dify-private-kv
    tenantId: <tenant-id>
    objects: |
      array:
        - objectName: cc-prod-db-connection-string
          objectType: secret
        - objectName: cc-api-jwt-secret
          objectType: secret
        - objectName: dify-api-key
          objectType: secret
```

## Justificación de Elecciones

### ¿Por qué este stack vs alternativas?

| Decisión | Alternativas Consideradas | Justificación |
|----------|---------------------------|---------------|
| **Terragrunt** | Terraform puro, Pulumi, Bicep | Multi-subscription DRY, mantiene Terraform ecosystem, curva aprendizaje mínima |
| **Next.js 14 App Router** | Next.js Pages, Remix, SvelteKit | Future-proof, RSC performance, MDX native, ecosystem maduro |
| **FastAPI** | Django REST, Flask, Node.js | Async-first, type hints, OpenAPI auto, Azure SDK compatible |
| **Dify existing** | LangChain custom, Azure AI Studio | Ya operacional, ahorro tiempo setup, conocimiento existente |
| **PostgreSQL shared** | PostgreSQL per-spoke, CosmosDB | Cost optimization 40%, control center no data-intensive |
| **Redis in-cluster** | Azure Cache for Redis | Cost optimization (pod vs managed), latencia menor |
| **Grafana + Prometheus** | Azure Monitor only, Datadog | Open-source, customizable, no vendor lock-in |
| **GitHub Actions** | Azure DevOps, GitLab CI | Git-native, free for private repos, YAML simple |

### Trade-offs Aceptados

| Trade-off | Impacto | Mitigación |
|-----------|---------|------------|
| **Terragrunt layer adicional** | Debugging más complejo | Terragrunt genera .tf files inspeccionables |
| **PostgreSQL shared** | Contention potencial | QoS settings, migration a dedicado si load > 80% |
| **Redis in-cluster** | No managed backups | Snapshots diarios a Blob Storage |
| **Single region** | Regional failure = downtime | Acceptable para PoC, multi-region en Phase 4+ |
| **VPN único** | VPN down = no access | High availability VPN config (future), Azure Bastion alternativo |

---

## Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/docs/)
- [Dify Documentation](https://docs.dify.ai/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/)

**Última actualización**: 12 Octubre 2025  
**Versión**: 1.0  
**Autor**: Alberto Lacambra
