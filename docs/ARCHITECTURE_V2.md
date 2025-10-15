# Arquitectura Cloud Control Center PoC v2.0

**Fecha**: 14 Octubre 2025  
**Versión**: 2.0 - Optimizada para Costes  
**Estado**: En Revisión

---

## 📐 Decisiones de Arquitectura

### ADR-001: Single Subscription Architecture
**Status**: Propuesto  
**Context**: Budget limitado ($130/mes), PoC sin requisitos HA  
**Decision**: Consolidar toda infraestructura en 1 suscripción  
**Consequences**:
- ✅ Coste reducido 52% ($205 → $97/mes)
- ✅ Menor complejidad operacional
- ✅ Networking simplificado (VNet peering interno)
- ⚠️ Sin aislamiento total entre environments
- ⚠️ Límite de quotas compartido

**Migration Path to Production**:
```
PoC (1 subscription) → Dev (dedicated sub) → Prod (dedicated sub)
Cost: $97/mes     → $130/mes           → $200/mes
```

---

### ADR-002: Eliminar Servicios de Observability
**Status**: Propuesto  
**Context**: Log Analytics cuesta $100-150/mes, excede budget PoC  
**Decision**: NO desplegar Azure Monitor stack en PoC  
**Alternatives Evaluated**:
1. ✅ **Prometheus + Grafana self-hosted** (usa recursos AKS, $0 extra)
2. ✅ **Container Insights free tier** (500MB/día, suficiente PoC)
3. ❌ Azure Monitor full stack (fuera de budget)

**Documentation**: `docs/production-readiness/01-monitoring.md`

---

### ADR-003: Standard SKUs vs Premium
**Status**: Propuesto  
**Context**: Premium SKUs multiplican costes sin valor PoC  
**Decision**: Usar Standard/Burstable para todos los servicios

| Servicio | Premium | Standard | Savings |
|----------|---------|----------|---------|
| ACR | $25/mes | $5/mes | -$20 |
| PostgreSQL | $90/mes (GP) | $12/mes (B1ms) | -$78 |
| AKS Nodes | D4s_v3 | B2s | -$40/node |

**Total Savings**: ~$138/mes

**Trade-offs**:
- ⚠️ Sin geo-replication (ACR)
- ⚠️ Performance limitado (PostgreSQL burstable)
- ⚠️ Sin SLA 99.99% (solo 99.9%)

---

### ADR-004: GitOps con GitHub Actions
**Status**: Propuesto  
**Context**: Necesidad de CI/CD robusto sin coste adicional  
**Decision**: GitHub Actions como orchestrator principal  
**Alternatives Considered**:
- ❌ Azure DevOps (complejidad, otro sistema)
- ❌ Jenkins (self-hosted, maintenance overhead)
- ❌ GitLab CI (migration cost)
- ✅ GitHub Actions (native integration, 2000min/mes free)

**Workflows**:
```
PR → terraform-plan.yml → Security scan → Cost check → Approve → Merge
Merge → terraform-apply.yml → Deploy dev → Smoke tests → Notify
Schedule → drift-detection.yml → Compare state → Create issue if drift
```

---

### ADR-005: Git Sources para Terraform Modules
**Status**: Approved ✅  
**Context**: Local paths no funcionan con Terragrunt remote sources  
**Decision**: Usar Git sources con semantic versioning

```hcl
module "aks" {
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/aks?ref=v1.0.0"
}
```

**Benefits**:
- ✅ Versioning explícito (rollback fácil)
- ✅ Module reusability across repos
- ✅ Immutable infrastructure (tagged releases)

**Costs**:
- ⚠️ Slower init (Git clone)
- ⚠️ Requires GitHub access (PAT for private repos)

---

## 🏗️ Arquitectura Física

### Opción 1: PoC Consolidada (RECOMENDADA)

```
┌────────────────────────────────────────────────────────────────┐
│  Azure Subscription: Hub (739aaf91-5cb2-45a6-ab4f-abf883e9d3f7)│
│                                                                │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   dify-rg        │  │   shared-rg     │  │   apps-rg    │ │
│  │                  │  │                 │  │              │ │
│  │ ┌──────────────┐ │  │ ┌─────────────┐│  │ ┌──────────┐ │ │
│  │ │ AKS (Dify)   │ │  │ │ ACR         ││  │ │ AKS      │ │ │
│  │ │ • 2x B4ms    │ │  │ │ • Standard  ││  │ │ • 1x B2s │ │ │
│  │ │ • Dify app   │◄─┼──┼─│ • Shared    ││◄─┼─│ • Apps   │ │ │
│  │ └──────────────┘ │  │ └─────────────┘│  │ └──────────┘ │ │
│  │                  │  │                 │  │              │ │
│  │ ┌──────────────┐ │  │ ┌─────────────┐│  │ ┌──────────┐ │ │
│  │ │ PostgreSQL   │ │  │ │ Key Vault   ││  │ │ VNet     │ │ │
│  │ │ • Flexible   │ │  │ │ • Standard  ││  │ │ Apps     │ │ │
│  │ │ • B1ms       │ │  │ │ • Secrets   ││  │ │          │ │ │
│  │ └──────────────┘ │  │ └─────────────┘│  │ └──────────┘ │ │
│  │                  │  │                 │  │       │      │ │
│  │ ┌──────────────┐ │  │ ┌─────────────┐│  │       │      │ │
│  │ │ Storage      │ │  │ │ Storage Acc ││  │       │      │ │
│  │ │ • Dify data  │ │  │ │ • TF State  ││  │       │      │ │
│  │ └──────────────┘ │  │ │ • Backups   ││  │       │      │ │
│  │                  │  │ └─────────────┘│  │       │      │ │
│  │ ┌──────────────┐ │  │                 │  │       │      │ │
│  │ │ VNet Dify    │◄┼──┼─────────────────┼──┼───────┘      │ │
│  │ │ 10.0.0.0/16  │ │  │    VNet Peering │  │              │ │
│  │ └──────────────┘ │  │                 │  │              │ │
│  └──────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                                │
│  💰 Cost: ~$97/mes                                            │
│  📊 Monitoring: Prometheus (self-hosted, $0)                  │
│  🔒 Backups: Manual scripts (free tier, $0)                   │
│  🌐 Networking: Single region (North Europe, $3/mes)          │
└────────────────────────────────────────────────────────────────┘
```

**Características**:
- ✅ Todo en 1 región (North Europe)
- ✅ VNet peering entre Dify y Apps (sin VPN Gateway)
- ✅ ACR compartido (pull desde ambos AKS)
- ✅ Key Vault común (secrets centralizados)
- ✅ State en Azure Storage (ya existente)

---

### Opción 2: Hub & Spoke (PRODUCCIÓN FUTURA)

```
┌─────────────────────────────────────────────────────────────────┐
│  Subscription: Hub (739aaf91...)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Shared Services                                           │  │
│  │ • ACR Premium (geo-replication)                          │  │
│  │ • Log Analytics + App Insights                           │  │
│  │ • Azure Firewall                                         │  │
│  │ • VPN Gateway (S2S + P2S)                                │  │
│  │ • Key Vault Premium (HSM)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                      │                      │          │
│         │ VNet Peering         │ VNet Peering         │          │
│         ▼                      ▼                      ▼          │
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
┌────────┴────────┐   ┌────────┴────────┐   ┌────────┴────────┐
│ Spoke: Prod     │   │ Spoke: Dev      │   │ Spoke: Staging  │
│ (353a6255...)   │   │ (0987a8ce...)   │   │ (New)           │
│                 │   │                 │   │                 │
│ • AKS (D4s_v3)  │   │ • AKS (B2s)    │   │ • AKS (B4ms)    │
│ • PostgreSQL GP │   │ • PostgreSQL B │   │ • PostgreSQL B  │
│ • Storage       │   │ • Storage      │   │ • Storage       │
│ • Private EP    │   │ • Public EP    │   │ • Public EP     │
│                 │   │                 │   │                 │
│ Cost: $150/mes  │   │ Cost: $50/mes  │   │ Cost: $70/mes   │
└─────────────────┘   └─────────────────┘   └─────────────────┘

Total: $95 (Hub) + $150 (Prod) + $50 (Dev) + $70 (Staging) = $365/mes
```

**Solo para PRODUCCIÓN** - Documentado en `docs/production-readiness/`

---

## 🔀 Network Architecture

### VNet Design (PoC)

```
┌────────────────────────────────────────────────────────────┐
│  dify-private-vnet (10.0.0.0/16)                          │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ aks-subnet (10.0.1.0/24)                            │  │
│  │ • Dify AKS nodes (2x B4ms)                          │  │
│  │ • Network Policy: Calico                            │  │
│  │ • Outbound: NAT Gateway (optional, $30/mes)         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ postgresql-subnet (10.0.2.0/28)                     │  │
│  │ • Delegated to Microsoft.DBforPostgreSQL            │  │
│  │ • Private Endpoint (optional, $7/mes)               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ vpn-subnet (10.0.3.0/27)                            │  │
│  │ • OpenSense VM (existing)                           │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                              │
                              │ VNet Peering ($0.01/GB)
                              │
┌────────────────────────────────────────────────────────────┐
│  apps-vnet (10.1.0.0/16)                                  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ aks-subnet (10.1.1.0/24)                            │  │
│  │ • Apps AKS nodes (1x B2s)                           │  │
│  │ • Pulls images from ACR (via peering)               │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Security**:
- ✅ NSGs en cada subnet
- ✅ Service Endpoints (PostgreSQL, Storage, ACR)
- ❌ Private Endpoints (PoC: público con firewall rules)
- ❌ Azure Firewall (PoC: NSGs suficiente)

**Cost Optimization**:
- Skip NAT Gateway ($30/mes) → Use AKS default outbound
- Skip Private Endpoints ($7/mes each) → Use Service Endpoints ($0)
- Skip Azure Firewall ($1/hora = $730/mes) → NSGs

**Savings**: ~$767/mes vs full private setup

---

## 🔐 Security Architecture

### Identity & Access

```
┌─────────────────────────────────────────────────────────┐
│  Azure AD Tenant                                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Service Principal: github-actions-sp              │ │
│  │ • Contributor (Subscription level)                │ │
│  │ • Storage Blob Data Contributor (TF State)        │ │
│  │ • Key Vault Secrets User                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Managed Identity: aks-dify-identity               │ │
│  │ • AcrPull (ACR)                                   │ │
│  │ • Key Vault Secrets User                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Managed Identity: aks-apps-identity               │ │
│  │ • AcrPull (ACR)                                   │ │
│  │ • Key Vault Secrets User                          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Secrets Management

```
┌──────────────────────────────────────────────────────────┐
│  Azure Key Vault: poc-shared-kv-xxxxx                   │
│                                                          │
│  Secrets:                                                │
│  ├─ postgresql-admin-password (auto-rotated 90d)        │
│  ├─ acr-webhook-token (for CI/CD)                       │
│  ├─ github-pat (for private module access)              │
│  └─ dify-api-keys (application secrets)                 │
│                                                          │
│  Access Policies:                                        │
│  ├─ github-actions-sp: Get, List                        │
│  ├─ aks-dify-identity: Get                              │
│  └─ aks-apps-identity: Get                              │
│                                                          │
│  Auditing:                                               │
│  ✅ Diagnostic logs → Storage Account (7 days retention)│
│  ❌ Log Analytics (PoC: fuera de budget)                │
└──────────────────────────────────────────────────────────┘
```

**Cost**: $0.10/mes (Standard tier, minimal operations)

---

### Security Scanning Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  PR Created                                             │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: security-scan.yml                      │
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ 1. tfsec                                           ││
│  │    • Checks: AWS/Azure/GCP misconfigurations      ││
│  │    • Output: SARIF format → Security tab          ││
│  │    • Threshold: 0 CRITICAL, max 5 HIGH            ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ 2. Checkov                                         ││
│  │    • Checks: CIS benchmarks, compliance           ││
│  │    • Output: JSON → PR comment                    ││
│  │    • Custom policies: Budget limits, tags         ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ 3. Gitleaks                                        ││
│  │    • Checks: Hardcoded secrets, API keys          ││
│  │    • Output: Block merge if secrets found         ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ 4. Trivy (IaC + Container scanning)                ││
│  │    • Checks: Terraform + Docker images            ││
│  │    • Output: Vulnerability report                 ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  All Checks Pass? → ✅ Allow Merge                      │
│  Any Check Fails? → ❌ Block Merge + Comment PR         │
└─────────────────────────────────────────────────────────┘
```

**Cost**: $0 (todas las herramientas son open-source)

---

## 📊 Data Flow

### Terraform State Management

```
┌─────────────────────────────────────────────────────────┐
│  Developer Local / GitHub Actions Runner                │
└────────────┬────────────────────────────────────────────┘
             │
             │ terraform init/plan/apply
             ▼
┌─────────────────────────────────────────────────────────┐
│  Terragrunt (Wrapper)                                   │
│  • Generates backend config                             │
│  • Injects variables                                    │
│  • Manages dependencies                                 │
└────────────┬────────────────────────────────────────────┘
             │
             │ Azure authentication (Azure AD)
             ▼
┌─────────────────────────────────────────────────────────┐
│  Azure Storage Account: tfstate9a448729                 │
│                                                         │
│  Containers (1 per environment):                        │
│  ├─ cc-poc/terraform.tfstate                           │
│  ├─ cc-dev/terraform.tfstate (future)                  │
│  └─ cc-prod/terraform.tfstate (future)                 │
│                                                         │
│  Features:                                              │
│  ✅ State locking (Azure Blob lease)                    │
│  ✅ Encryption at rest (Azure-managed keys)             │
│  ✅ Versioning enabled (30 days retention)              │
│  ✅ Soft delete (7 days recovery window)                │
│                                                         │
│  Access Control:                                        │
│  • github-actions-sp: Storage Blob Data Contributor     │
│  • Developers: Storage Blob Data Reader (read-only)     │
└─────────────────────────────────────────────────────────┘
```

**Cost**: $0.05/mes (10MB state + 18k operations/mes)

---

### CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────┐
│  Developer                                              │
└────────────┬────────────────────────────────────────────┘
             │
             │ git push feature/new-module
             ▼
┌─────────────────────────────────────────────────────────┐
│  Pre-commit Hooks (Local)                               │
│  • terraform fmt                                        │
│  • terraform validate                                   │
│  • tflint                                               │
└────────────┬────────────────────────────────────────────┘
             │
             │ git push origin feature/new-module
             ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub PR Created                                      │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────────────┬──────────────────────┐
             ▼                      ▼                      ▼
      ┌────────────┐         ┌────────────┐        ┌────────────┐
      │ terraform- │         │ security-  │        │ cost-      │
      │ plan.yml   │         │ scan.yml   │        │ check.yml  │
      └─────┬──────┘         └─────┬──────┘        └─────┬──────┘
            │                      │                      │
            │ terragrunt plan      │ tfsec+checkov       │ infracost
            ▼                      ▼                      ▼
      ┌────────────┐         ┌────────────┐        ┌────────────┐
      │ Plan saved │         │ SARIF →    │        │ Cost diff  │
      │ as artifact│         │ Security   │        │ → Comment  │
      └────────────┘         │ tab        │        └────────────┘
                             └────────────┘
             │
             │ All checks ✅
             ▼
┌─────────────────────────────────────────────────────────┐
│  PR Approved + Merged to main                           │
└────────────┬────────────────────────────────────────────┘
             │
             │ Trigger: terraform-apply.yml
             ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: terraform-apply.yml                    │
│                                                         │
│  Jobs:                                                  │
│  1. Checkout code                                       │
│  2. Setup Terraform + Terragrunt                        │
│  3. Azure Login (OIDC with github-actions-sp)           │
│  4. Terragrunt apply (auto-approve)                     │
│  5. Smoke tests (curl endpoints)                        │
│  6. Slack notification (success/failure)                │
└────────────┬────────────────────────────────────────────┘
             │
             │ Deploy to Azure
             ▼
┌─────────────────────────────────────────────────────────┐
│  Azure Resources Created/Updated                        │
│  • State saved to Azure Storage                         │
│  • Outputs available for next modules                   │
└─────────────────────────────────────────────────────────┘
```

**Duration**:
- PR checks: 5-8 minutos
- Apply: 10-15 minutos (first deploy), 3-5 min (updates)

**Cost**: $0 (dentro de free tier 2000 min/mes)

---

## 🔄 Disaster Recovery

### Backup Strategy (PoC - Manual)

```bash
#!/bin/bash
# scripts/backup-all.sh

# 1. PostgreSQL Backup (built-in, free tier: 7 days retention)
az postgres flexible-server backup create \
  --resource-group dify-rg \
  --name dify-postgres-9107e36a \
  --backup-name "manual-$(date +%Y%m%d_%H%M%S)"

# 2. AKS PersistentVolume Snapshots (if any)
kubectl get pv -o json | \
  jq -r '.items[] | select(.spec.storageClassName=="managed-premium") | .metadata.name' | \
  xargs -I {} kubectl snapshot create {}-snapshot --pvc={}

# 3. Terraform State Backup (versioning enabled, auto)
# Already handled by Azure Storage versioning (30 days)

# 4. Key Vault Secrets Backup (manual export)
az keyvault secret list --vault-name poc-shared-kv-xxxxx \
  --query "[].id" -o tsv | \
  xargs -I {} az keyvault secret backup --id {} --file {}.bak
```

**Automation**: GitHub Actions scheduled workflow (daily 2 AM)

**Cost**: $0 (dentro de free tiers)

---

### Recovery Procedures

**RTO/RPO**:
| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| PostgreSQL corruption | 30 min | 24h | Restore from auto-backup |
| AKS cluster failure | 2 hours | 0 (stateless) | Recreate via Terraform |
| Terraform state lost | 15 min | 0 | Restore from version history |
| Complete subscription loss | 4 hours | 24h | Re-deploy + restore backups |

**Production**: Implementar Geo-replication, Azure Backup → RTO < 15min, RPO < 5min

---

## 📏 Compliance & Governance

### Tagging Strategy

```hcl
locals {
  common_tags = {
    Environment  = var.environment          # poc/dev/prod
    ManagedBy    = "Terraform"
    Repository   = "DXC_PoC_Nirvana"
    CostCenter   = var.cost_center          # shared-services/apps
    Owner        = "alberto.lacambra@dxc.com"
    Project      = "CloudControlCenter"
    Criticality  = var.criticality          # low/medium/high
    Compliance   = "CIS-Azure-1.4.0"
    LastModified = timestamp()
  }
}

# Enforcement via Azure Policy (production)
resource "azurerm_policy_assignment" "require_tags" {
  count                = var.environment == "prod" ? 1 : 0
  name                 = "require-mandatory-tags"
  scope                = data.azurerm_subscription.current.id
  policy_definition_id = "/providers/Microsoft.Authorization/policyDefinitions/1e30110a-5ceb-460c-a204-c1c3969c6d62"
  
  parameters = jsonencode({
    tagNames = ["Environment", "ManagedBy", "CostCenter", "Owner"]
  })
}
```

---

### Cost Controls

```hcl
# Budget Alert (per subscription)
resource "azurerm_consumption_budget_subscription" "poc" {
  name            = "poc-monthly-budget"
  subscription_id = data.azurerm_subscription.current.id

  amount     = 130  # $130/mes
  time_grain = "Monthly"

  time_period {
    start_date = "2025-10-01T00:00:00Z"
  }

  notification {
    enabled   = true
    threshold = 80  # Alert at 80% ($104)
    operator  = "GreaterThan"

    contact_emails = [
      "alberto.lacambra@dxc.com",
      "finops@dxc.com"
    ]
  }

  notification {
    enabled   = true
    threshold = 100  # Critical alert at 100% ($130)
    operator  = "GreaterThan"

    contact_emails = [
      "alberto.lacambra@dxc.com",
      "finops@dxc.com"
    ]
    
    # Auto-shutdown non-production (optional)
    webhook_url = "https://hooks.slack.com/services/YOUR/WEBHOOK"
  }
}
```

**Enforcement**: Infracost PR checks bloquean si delta > 20%

---

## 🎯 Non-Functional Requirements

### Performance
| Metric | Target (PoC) | Target (Prod) |
|--------|--------------|---------------|
| API Response Time | < 500ms p95 | < 200ms p95 |
| Database Query Time | < 100ms p99 | < 50ms p99 |
| Deployment Time | < 15 min | < 10 min |
| MTTR (rollback) | < 30 min | < 5 min |

### Scalability
| Resource | PoC | Production |
|----------|-----|------------|
| AKS Nodes | 1-2 | 3-10 (autoscale) |
| PostgreSQL | Burstable B1ms | GP 4 vCores |
| Concurrent Users | 10-50 | 500-1000 |

### Availability
- **PoC**: 95% (best effort, no SLA)
- **Production**: 99.9% (multi-zone AKS, Premium SKUs)

---

## 📚 Referencias

- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/)
- [Azure Well-Architected Framework](https://docs.microsoft.com/azure/architecture/framework/)
- [CIS Azure Foundations Benchmark](https://www.cisecurity.org/benchmark/azure)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Infracost Docs](https://www.infracost.io/docs/)

---

*Última actualización: 14 Octubre 2025*
