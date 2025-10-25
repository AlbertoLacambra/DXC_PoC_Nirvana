# DXC Cloud Mind - Nirvana PoC

[![Terraform](https://img.shields.io/badge/Terraform-1.5.5-623CE4?logo=terraform)](https://www.terraform.io/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

> **AI-driven CloudOps platform leveraging existing Dify infrastructure with shared services architecture**

## 🎯 Vision

Transform cloud operations through AI-driven automation, proactive governance, and cost optimization. This PoC implements a **Cloud Mind Control Center** that enables:

- ✅ **Real-time visibility** of operations, incidents, and alerts
- ✅ **AI-generated action plans** with historical comparison
- ✅ **Proactive insights** to prevent recurring incidents
- ✅ **Zero operational risk** approach (runtime + operations)
- ✅ **Hyper-automation** of complete Cloud solution lifecycle
- ✅ **Automated governance** with policy-as-code compliance
- ✅ **Cost efficiency** through automated FinOps initiatives
- ✅ **CloudOps unification** deprecating ClickOps and legacy operations

---

## 🏗️ Architecture

### Single-AKS Shared Services (Current Implementation)

```
┌────────────────────────────────────────────────────────────────────┐
│  AZURE SUBSCRIPTION: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Resource Group: dify-rg (Existing Infrastructure)          │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  AKS Cluster: dify-aks                                 │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐ │  │  │
│  │  │  │ Namespace:  │  │ Namespace:  │  │  Future:       │ │  │  │
│  │  │  │  dify       │  │ cloudmind   │  │  use-cases     │ │  │  │
│  │  │  │ (Existing)  │  │  (NEW)      │  │                │ │  │  │
│  │  │  │             │  │             │  │                │ │  │  │
│  │  │  │ • Dify API  │  │ • PoC Apps  │  │ • Future       │ │  │  │
│  │  │  │ • Workflows │  │ • Control   │  │   workloads    │ │  │  │
│  │  │  │ • RAG       │  │   Center    │  │                │ │  │  │
│  │  │  └─────────────┘  └─────────────┘  └────────────────┘ │  │  │
│  │  │                                                        │  │  │
│  │  │  Resource Quotas:                                     │  │  │
│  │  │  • dify: 8 CPU / 16Gi Memory / 50 pods               │  │  │
│  │  │  • cloudmind: 4 CPU / 8Gi Memory / 30 pods           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  Shared Resources:                                          │  │
│  │  • PostgreSQL Flexible Server (dify-postgres)              │  │
│  │  • Storage Account (difyprivatest9107e36a)                 │  │
│  │  • Key Vault (dify-private-kv)                             │  │
│  │  • Virtual Network (dify-private-vnet)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Resource Group: cloudmind-hub-rg (NEW - Managed by TF)    │  │
│  │  • Shared services and governance resources                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Resource Group: cloudmind-acr-rg (NEW - Managed by TF)    │  │
│  │  • Azure Container Registry (Shared)                        │  │
│  │  • Role Assignments (AcrPull to AKS)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

#### ✅ **Single-AKS Strategy**
- **Rationale**: Leverage existing Dify AKS cluster to minimize costs
- **Implementation**: Namespace isolation with resource quotas
- **Benefits**: 
  - ~€200/month savings vs new AKS clusters
  - Simplified operations
  - Shared Container Insights (free tier)

#### ✅ **Hybrid Resource Management**
- **Existing Resources**: Dify infrastructure (data sources only)
- **New Resources**: CloudMind services (Terraform managed)
- **Strategy**: Non-invasive approach preserving existing workloads

#### ✅ **GitOps with GitHub Actions**
- **CI/CD**: Fully automated with manual approval gates
- **Security**: OIDC authentication (no secrets stored)
- **Validation**: Multi-gate PR validation (format, security, cost)

---

## 🚀 Current Implementation Status

### ✅ Completed

- [x] **Infrastructure as Code**
  - Terraform modules for ACR, AKS namespaces
  - Backend configuration with Azure Storage
  - OIDC authentication with Service Principal
  
- [x] **GitHub Actions Workflows**
  - `deploy.yml`: Production deployment with approval
  - `pr-validation.yml`: PR validation (7 gates)
  - `drift-detection.yml`: Daily drift detection
  - `terraform-pr.yml`: Legacy PR workflow
  - `terraform-deploy.yml`: Legacy deploy workflow

- [x] **Security & Compliance**
  - Service Principal with OIDC federation
  - Role-based access control (Contributor + User Access Admin)
  - Security scanning (tfsec)
  - Compliance checking (checkov)

- [x] **Monitoring & Alerts**
  - Container Insights (free tier)
  - Microsoft Teams integration
  - Adaptive Cards for notifications
  - Drift detection alerts

- [x] **Documentation**
  - Migration guides (Terragrunt → Terraform)
  - Secrets setup guide
  - Checklist for GitHub configuration
  - Session summaries

### ⏳ In Progress

- [ ] **terraform-docs Automation**
  - Currently disabled
  - Needs `.terraform-docs.yml` configuration
  - Will auto-update README for modules

### ✅ Control Center UI + Chatbot Integration

- [x] **Next.js Application**
  - Modern React app with Tailwind CSS
  - Running on `localhost:3000`
  - Responsive design with dark/light modes
  
- [x] **Dify Chatbot Integration**
  - **Nirvana Tech Support Assistant** integrated
  - Custom React component (`DifyChatButton.tsx`)
  - Floating green button in bottom-right corner
  - Powered by gpt-4o-mini (Azure OpenAI)
  - WebApp approach (iframe embedding)
  - Available on ALL pages globally
  
📖 **Full documentation**: See [`CHATBOT_INTEGRATION.md`](./CHATBOT_INTEGRATION.md)

### 📋 Planned

- [ ] **Use Cases Implementation**
  - Documentation System (Next.js + MDX + Dify RAG)
  - IaC Automation (Drift detection + AI analysis)
  - FinOps Optimization (Cost anomaly detection)
  - Engineering Homologation (AI code review)

---

## 📁 Project Structure

```
DXC_PoC_Nirvana/
├── .github/
│   └── workflows/          # CI/CD Pipelines
│       ├── deploy.yml              # Production deployment (manual approval)
│       ├── pr-validation.yml       # PR validation (7 gates)
│       ├── drift-detection.yml     # Daily drift detection
│       ├── terraform-deploy.yml    # Legacy deploy workflow
│       └── terraform-pr.yml        # Legacy PR workflow
│
├── terraform/
│   ├── modules/            # Reusable Terraform modules
│   │   ├── container-registry/     # ACR with optional diagnostics
│   │   └── aks-namespaces/         # K8s namespaces with quotas
│   │
│   └── environments/       # Environment-specific configurations
│       └── hub/                    # Hub environment (single-AKS)
│           ├── main.tf             # Main configuration
│           ├── providers.tf        # Provider configurations
│           ├── variables.tf        # Variable definitions
│           ├── outputs.tf          # Output values
│           ├── data.tf             # Data sources (Dify resources)
│           ├── backend.tf          # Azure Storage backend
│           └── terraform.tfvars    # Variable values
│
├── docs/                   # Documentation
│   ├── README.md                   # Documentation index
│   ├── BUSINESS_PLAN.md            # Business case and ROI
│   ├── PROJECT_LOGBOOK.md          # Project timeline
│   ├── MIGRATION_COMPLETE.md       # Terragrunt→Terraform migration
│   ├── CHECKLIST_SECRETOS.md       # Secrets setup checklist
│   ├── SECRETS_SETUP.md            # Service Principal guide
│   └── STATUS.md                   # Current status
│
├── apps/                   # Application code (Planned)
│   ├── control-center-ui/          # Next.js 14+ with MDX
│   ├── api-gateway/                # FastAPI backend
│   ├── dify-integrations/          # Dify API connectors
│   └── agents/                     # Specialized agents
│
├── kubernetes/             # Kubernetes manifests (Planned)
│   ├── control-center/             # UI and API deployments
│   └── monitoring/                 # Grafana, Prometheus
│
└── scripts/                # Automation scripts
    ├── setup/                      # Initialization scripts
    ├── finops/                     # Cost analysis automation
    └── governance/                 # Compliance checks
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Infrastructure** | Terraform 1.5.5, Azure Resource Manager |
| **Container Orchestration** | Azure Kubernetes Service (AKS) |
| **Container Registry** | Azure Container Registry (ACR) |
| **CI/CD** | GitHub Actions (OIDC authentication) |
| **Authentication** | Azure AD Service Principal, OIDC |
| **State Management** | Azure Storage Account (Terraform backend) |
| **Monitoring** | Container Insights, Azure Monitor |
| **Notifications** | Microsoft Teams (Adaptive Cards) |
| **Security** | tfsec, checkov, TFLint |
| **Networking** | Azure Virtual Network, Private Endpoints |
| **Database** | Azure PostgreSQL Flexible Server (shared) |
| **Storage** | Azure Storage Account (shared) |
| **Secrets** | Azure Key Vault (shared) |

**Planned:**
- **Frontend**: Next.js 14+, React Server Components, TailwindCSS, MDX
- **Backend**: Python FastAPI, async/await
- **AI/LLM**: Dify orchestrator, Azure OpenAI, RAG pipelines
- **Observability**: Grafana, Prometheus

---

## � CI/CD Workflows

### 1. Production Deployment (`deploy.yml`)
**Trigger**: Manual (`workflow_dispatch`)

**Flow**:
1. Terraform Init & Format Check
2. Terraform Plan (with cost estimation)
3. **Manual Approval** (required)
4. Terraform Apply
5. Teams notification (deployment success)

**Gates**:
- ✅ Format validation (`terraform fmt -check`)
- ✅ Cost estimation preview
- ⚠️ Manual approval required
- ✅ Teams notification

### 2. PR Validation (`pr-validation.yml`)
**Trigger**: Pull Request to `master`

**Flow**:
1. Terraform Format Check
2. Terraform Init
3. Terraform Validate
4. tfsec Security Scan
5. checkov Compliance Scan
6. TFLint
7. Terraform Plan
8. Teams notification (approval pending)

**Gates**:
- ✅ Format: `terraform fmt -check`
- ✅ Syntax: `terraform validate`
- ✅ Security: `tfsec` (no HIGH/CRITICAL)
- ✅ Compliance: `checkov` (policy checks)
- ✅ Linting: `tflint`
- ✅ Plan: No errors, diff preview
- ✅ Notification: Teams card

### 3. Drift Detection (`drift-detection.yml`)
**Trigger**: Daily at 05:00 UTC

**Flow**:
1. Terraform Init
2. Terraform Plan (detect drift)
3. Teams notification if drift detected

**Purpose**: Detect manual changes outside Terraform

---

## 🔐 Security & Authentication

### Service Principal Configuration

**Service Principal ID**: `dc39d60b-cfc7-41c6-9fcb-3b29778bb03a`

**Roles Assigned**:
- ✅ **Contributor** (subscription scope)
- ✅ **User Access Administrator** (subscription scope) - for role assignments

**OIDC Federated Credentials**:
- `repo:DXC-Technology-Spain/DXC_PoC_Nirvana:ref:refs/heads/master`
- `repo:DXC-Technology-Spain/DXC_PoC_Nirvana:pull_request`
- `repo:DXC-Technology-Spain/DXC_PoC_Nirvana:environment:hub`

**GitHub Secrets Required**:
```bash
AZURE_CLIENT_ID="dc39d60b-cfc7-41c6-9fcb-3b29778bb03a"
AZURE_TENANT_ID="93f33571-550f-43cf-b09f-cd331338d086"
AZURE_SUBSCRIPTION_ID="739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
TEAMS_WEBHOOK_URL="<Power Automate webhook URL>"
```

**Authentication Method**: OIDC (no passwords/secrets)

---

## 📊 Deployed Resources

**Total Resources**: 7 (successfully deployed)

### Resource Groups
- `cloudmind-hub-rg` - Hub shared services
- `cloudmind-acr-rg` - Container registry

### Container Registry
- Azure Container Registry (cloudmind + random suffix)
- Role Assignment: AcrPull to AKS managed identity

### Kubernetes Resources
- **Namespace**: `cloudmind` (managed by Terraform)
- **Resource Quota**: 4 CPU / 8Gi Memory / 30 pods
- **Namespace**: `dify` (existing, data source only)

---

## 💰 Cost Optimization

### Current Monthly Estimates

**Single-AKS Strategy Savings**:
- ❌ Avoided: New AKS cluster (~€200/month)
- ❌ Avoided: New Container Insights (~€50/month)
- ✅ Actual: Namespace isolation + shared services (~€0/month marginal cost)

**Total Savings**: ~€250/month vs multi-AKS approach

### Shared Resources (Existing)
- Azure PostgreSQL Flexible Server
- Azure Storage Account
- Azure Key Vault
- Azure Virtual Network
- Container Insights (free tier)

---

## 📖 Quick Start

### Prerequisites
- Azure subscription access
- GitHub repository access
- Terraform 1.5.5+
- Azure CLI

### Initial Setup

1. **Configure GitHub Secrets**:
   ```bash
   # See CHECKLIST_SECRETOS.md for detailed instructions
   ```

2. **Verify Service Principal**:
   ```bash
   az ad sp show --id dc39d60b-cfc7-41c6-9fcb-3b29778bb03a
   ```

3. **Run Deployment**:
   - Go to Actions → "Deploy to Azure" → Run workflow
   - Review plan
   - Approve deployment

### Local Development

```bash
# Navigate to environment
cd terraform/environments/hub

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply (use workflows instead for production)
terraform apply
```

---

## 🔗 Useful Links

- **GitHub Actions**: [Workflows](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/actions)
- **Azure Portal**: [Subscription 739aaf91](https://portal.azure.com/#@93f33571-550f-43cf-b09f-cd331338d086/resource/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7)
- **Service Principal**: [dc39d60b-cfc7-41c6-9fcb-3b29778bb03a](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/dc39d60b-cfc7-41c6-9fcb-3b29778bb03a)
- **Dify Instance**: `http://10.0.2.62/` (requires VPN)

---

## 📚 Documentation

- [Business Plan & ROI](BUSINESS_PLAN.md)
- [Project Timeline](PROJECT_LOGBOOK.md)
- [Migration Guide](MIGRATION_COMPLETE.md)
- [Secrets Setup](CHECKLIST_SECRETOS.md)
- [Current Status](STATUS.md)

---

## 🤝 Contributing

This is a private PoC project for DXC Technology Spain. For contribution guidelines, see [CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## 📄 License

Proprietary - DXC Technology Spain © 2025

---

## 📞 Support

For questions or issues, contact the CloudOps team or open an issue in this repository.
- **VPN única**: Gateway centralizado vs per-subscription (~60% ahorro)
- **Auto-shutdown**: Políticas en Spoke-Dev para entornos no productivos
- **Right-sizing**: FinOps automation identifica y ajusta recursos sobredimensionados
- **Reserved instances**: Análisis de patrones para reservas estratégicas

## 📊 Capacidades del Cloud Control Center

| Capacidad | Descripción | Prioridad |
|-----------|-------------|-----------|
| **Visibilidad** | Dashboards en tiempo real (minutos/segundos) | P0 |
| **Velocidad de acción** | Planes AI con comparación histórica | P0 |
| **Proactividad** | Insights continuos, prevención de incidentes | P1 |
| **Resiliencia** | Zero operational risk focus | P0 |
| **Hiper-automatización** | E2E lifecycle automation | P1 |
| **Gobernanza** | Compliance automatizado | P1 |
| **Eficiencia de costes** | FinOps automation | P0 |
| **Unificación CloudOps** | Deprecate ClickOps, version control | P2 |

## 🤝 Contribución

Este proyecto sigue metodología **trunk-based development**:
- Feature branches de corta duración
- PRs revisados por pares
- CI checks obligatorios (tests, linting, security scans)
- Deployment automático tras merge a `main`

## 📞 Soporte

- **Arquitectura**: docs/architecture/
- **Runbooks**: docs/runbooks/
- **Issues**: GitHub Issues para bugs y feature requests
- **Discussions**: GitHub Discussions para preguntas y propuestas

## 🔗 Enlaces

- **Dify existente**: `http://10.0.2.62/` (VPN requerida)
- **VPN Gateway**: `52.178.149.106`
- **GitHub**: [DXC_PoC_Nirvana](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana) (privado)
- **Azure Portal**: [Hub Subscription](https://portal.azure.com/#@/resource/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7/overview)

---

**Status**: 🚧 En construcción activa - Phase 0 (Setup)  
**Última actualización**: 12 Octubre 2025  
**Maintainer**: Alberto Lacambra (@AlbertoLacambra)
