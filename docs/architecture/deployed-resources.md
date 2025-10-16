# Recursos Desplegados

## Estado Actual de la Infraestructura

**Última actualización**: Enero 2025  
**Estado**: ✅ **INFRASTRUCTURE DEPLOYED**

## Resumen Ejecutivo

### 📊 Métricas Clave

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Recursos Desplegados** | 7 | ✅ Operacional |
| **Resource Groups** | 3 (1 existing + 2 new) | ✅ Active |
| **AKS Namespaces** | 2 | ✅ Running |
| **Workflows CI/CD** | 5 | ✅ Operational |
| **Coste Mensual** | ~€5/mes incremental | ✅ Dentro de presupuesto |
| **Ahorro vs Multi-AKS** | €450/mes | ✅ ROI positivo |

## Recursos por Resource Group

### 1. Resource Group: `dify-rg` (Existing)

**Descripción**: Infraestructura existente de Dify Platform (NO gestionada por Terraform).

| Recurso | Nombre | Tipo | Estado | Uso |
|---------|--------|------|--------|-----|
| **AKS Cluster** | `dify-aks` | Microsoft.ContainerService/managedClusters | ✅ Running | Plataforma compartida |
| **PostgreSQL** | `dify-postgres-9107e36a` | Microsoft.DBforPostgreSQL/flexibleServers | ✅ Running | Base de datos compartida |
| **Storage Account** | `difyprivatest9107e36a` | Microsoft.Storage/storageAccounts | ✅ Active | Almacenamiento compartido |
| **Key Vault** | `dify-private-kv` | Microsoft.KeyVault/vaults | ✅ Active | Secretos compartidos |
| **Virtual Network** | `dify-private-vnet` | Microsoft.Network/virtualNetworks | ✅ Active | Red compartida |
| **Public IP** | `dify-vpn-public-ip` | Microsoft.Network/publicIPAddresses | ✅ Active | VPN Gateway |

**Coste Mensual Estimado**: ~€222/mes (ya existente, no incremental)

**Estrategia Terraform**:

```hcl
# Data sources only - NO management
data "azurerm_kubernetes_cluster" "dify" {
  name                = "dify-aks"
  resource_group_name = "dify-rg"
}

data "azurerm_postgresql_flexible_server" "dify" {
  name                = "dify-postgres-9107e36a"
  resource_group_name = "dify-rg"
}
```

### 2. Resource Group: `cloudmind-acr-rg` (NEW - Managed by Terraform)

**Descripción**: Registro de contenedores para imágenes CloudMind.

| Recurso | Nombre | Tipo | Estado | SKU/Tier |
|---------|--------|------|--------|----------|
| **Container Registry** | `cloudmind<random>` | Microsoft.ContainerRegistry/registries | ✅ Active | Basic |
| **Role Assignment** | `AcrPull-dify-aks` | Microsoft.Authorization/roleAssignments | ✅ Active | AcrPull |

**Coste Mensual**: ~€5/mes

**Terraform Code**:

```hcl
resource "azurerm_resource_group" "acr" {
  name     = "cloudmind-acr-rg"
  location = var.location
  
  tags = {
    Environment = "Production"
    Project     = "CloudMind-PoC"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_container_registry" "cloudmind" {
  name                = "cloudmind${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.acr.name
  location            = azurerm_resource_group.acr.location
  sku                 = "Basic"
  admin_enabled       = false
  
  tags = azurerm_resource_group.acr.tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.cloudmind.id
  role_definition_name = "AcrPull"
  principal_id         = data.azurerm_kubernetes_cluster.dify.kubelet_identity[0].object_id
}
```

**Outputs**:

```hcl
output "acr_login_server" {
  value       = azurerm_container_registry.cloudmind.login_server
  description = "Login server URL for ACR"
}

output "acr_id" {
  value       = azurerm_container_registry.cloudmind.id
  description = "Resource ID of the ACR"
}
```

### 3. Resource Group: `cloudmind-hub-rg` (NEW - Managed by Terraform)

**Descripción**: Servicios compartidos y governance para CloudMind.

| Recurso | Tipo | Estado | Propósito |
|---------|------|--------|-----------|
| **Resource Group** | Microsoft.Resources/resourceGroups | ✅ Active | Contenedor de recursos compartidos |

**Coste Mensual**: €0/mes (solo contenedor)

**Recursos Futuros Planificados**:

- Log Analytics Workspace (si se requiere separado)
- Application Insights (si se requiere separado)
- Storage Account para logs (si se requiere)

**Terraform Code**:

```hcl
resource "azurerm_resource_group" "hub" {
  name     = "cloudmind-hub-rg"
  location = var.location
  
  tags = {
    Environment = "Production"
    Project     = "CloudMind-PoC"
    ManagedBy   = "Terraform"
    Purpose     = "Shared Services"
  }
}
```

## Recursos Kubernetes

### Namespace: `cloudmind`

**Descripción**: Namespace dedicado para workloads CloudMind en AKS existente.

**Especificaciones**:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cloudmind
  labels:
    name: cloudmind
    environment: production
    project: cloudmind-poc
    managed-by: terraform
```

**Resource Quota**:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: cloudmind-quota
  namespace: cloudmind
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "6"
    limits.memory: 12Gi
    pods: "30"
    services: "15"
    persistentvolumeclaims: "5"
    secrets: "20"
    configmaps: "20"
```

**Utilización Actual**:

| Métrica | Uso Actual | Límite | % Utilizado |
|---------|------------|--------|-------------|
| CPU requests | 0.5 CPU | 4 CPU | 12.5% |
| Memory requests | 1Gi | 8Gi | 12.5% |
| Pods | 0 | 30 | 0% |
| Services | 0 | 15 | 0% |

**Estado**: Namespace creado, sin workloads desplegados aún.

### Namespace: `dify` (Existing)

**Descripción**: Namespace existente para Dify Platform (NO gestionado por Terraform).

**Resource Quota**:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dify-quota
  namespace: dify
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 16Gi
    limits.cpu: "12"
    limits.memory: 24Gi
    pods: "50"
    services: "20"
    persistentvolumeclaims: "10"
```

**Utilización Actual**:

| Métrica | Uso Actual | Límite | % Utilizado |
|---------|------------|--------|-------------|
| CPU requests | 6 CPU | 8 CPU | 75% |
| Memory requests | 12Gi | 16Gi | 75% |
| Pods | 25 | 50 | 50% |
| Services | 10 | 20 | 50% |

**Estado**: Producción, ~25 pods activos.

## Network Configuration

### Virtual Network: `dify-private-vnet`

**CIDR**: `10.0.0.0/16`

**Subnets**:

| Subnet | CIDR | Propósito | Recursos |
|--------|------|-----------|----------|
| **aks-subnet** | `10.0.2.0/24` | AKS nodes | dify-aks cluster |
| **vpn-subnet** | `10.0.1.0/24` | VPN Gateway | OpenVPN server |
| **db-subnet** | `10.0.3.0/24` | Database | PostgreSQL Flexible Server |

**Network Security**:

- ✅ Private endpoints habilitados
- ✅ VPN Gateway para acceso seguro
- ✅ Network Security Groups configurados
- ✅ Service endpoints para Azure services

## RBAC y Seguridad

### Service Principal: GitHub Actions OIDC

**Configuración**:

```json
{
  "appId": "<redacted>",
  "displayName": "GitHub-OIDC-DXC-PoC-Nirvana",
  "servicePrincipalId": "<redacted>",
  "federatedCredentials": [
    {
      "subject": "repo:AlbertoLacambra/DXC_PoC_Nirvana:ref:refs/heads/master",
      "issuer": "https://token.actions.githubusercontent.com"
    }
  ]
}
```

**Roles Asignados**:

| Scope | Role | Justificación |
|-------|------|---------------|
| Subscription | Contributor | Deploy y gestión de recursos |
| `cloudmind-acr-rg` | Owner | Gestión completa ACR |
| `cloudmind-hub-rg` | Owner | Gestión completa Hub |
| `dify-rg` | Reader | Lectura de data sources |
| `dify-aks` | Azure Kubernetes Service Cluster User | Gestión de namespaces |

**Secretos en GitHub**:

| Secret Name | Tipo | Uso |
|-------------|------|-----|
| `AZURE_CLIENT_ID` | OIDC App ID | Autenticación GitHub Actions |
| `AZURE_TENANT_ID` | Tenant ID | Autenticación Azure AD |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | Target subscription |
| `TEAMS_WEBHOOK_URL` | Webhook URL | Notificaciones a Teams |

## Monitorización

### Container Insights

**Configuración**:

- ✅ Habilitado en `dify-aks` cluster
- ✅ Free tier (primeros 10GB/mes gratis)
- ✅ Dashboards pre-configurados
- ✅ Alertas configuradas

**Métricas Monitorizadas**:

- CPU usage por namespace
- Memory usage por namespace
- Pod count y restarts
- Node health status
- Network traffic
- Storage I/O

**Dashboards Disponibles**:

1. Cluster overview
2. Namespace performance
3. Pod metrics
4. Node health
5. Container logs

### Log Analytics Workspace

**Workspace**: Compartido con Dify Platform

**Retención**: 30 días (free tier)

**Queries Frecuentes**:

```kusto
// CPU usage por namespace
KubePodInventory
| where TimeGenerated > ago(1h)
| summarize avg(CpuUsageNanoCores) by Namespace, bin(TimeGenerated, 5m)
| render timechart

// Memory usage por namespace
KubePodInventory
| where TimeGenerated > ago(1h)
| summarize avg(MemoryWorkingSetBytes) by Namespace, bin(TimeGenerated, 5m)
| render timechart

// Pod restarts últimas 24h
KubePodInventory
| where TimeGenerated > ago(24h)
| where RestartCount > 0
| summarize TotalRestarts = sum(RestartCount) by Namespace, PodName
| order by TotalRestarts desc
```

## CI/CD Workflows

### Workflows Activos

| Workflow | Archivo | Trigger | Estado |
|----------|---------|---------|--------|
| **Production Deploy** | `deploy.yml` | Manual | ✅ Active |
| **PR Validation** | `pr-validation.yml` | Pull Request | ✅ Active |
| **Drift Detection** | `drift-detection.yml` | Cron (daily 05:00 UTC) | ✅ Active |
| **Terraform Deploy** | `terraform-deploy.yml` | Push to master | ✅ Active |
| **Terraform PR** | `terraform-pr.yml` | Pull Request | ✅ Active |

**Security Gates Configurados**:

1. ✅ `terraform fmt` - Formato de código
2. ✅ `terraform validate` - Validación sintáctica
3. ✅ `tfsec` - Security scanning
4. ✅ `checkov` - Policy compliance
5. ✅ `tflint` - Linting avanzado
6. ✅ `terraform plan` - Preview de cambios
7. ✅ Manual approval - Gate humano

## Próximos Recursos Planificados

### Phase 1: Application Deployment

**Recursos a Crear**:

- Kubernetes Deployments en namespace `cloudmind`
- Kubernetes Services (ClusterIP, LoadBalancer)
- Ingress Controller configuration
- Certificates y TLS secrets

**Workloads Planificados**:

```yaml
Deployments:
  - cloudmind-ui (Next.js)
  - cloudmind-api (FastAPI)
  - cloudmind-worker (Background jobs)

Services:
  - cloudmind-ui-svc (LoadBalancer)
  - cloudmind-api-svc (ClusterIP)
  - cloudmind-worker-svc (ClusterIP)
```

### Phase 2: Shared Services

**Recursos Potenciales**:

- Application Gateway (si se requiere WAF)
- Azure Front Door (si se requiere CDN)
- Cosmos DB (si se requiere NoSQL)
- Azure Cache for Redis (si se requiere cache dedicado)

**Estimación de Costes**: +€50-100/mes según configuración

## Análisis de Costes

### Coste Actual

```text
INFRASTRUCTURE COSTS (Monthly):

Existing Resources (Dify) - Shared:
├── AKS Cluster (dify-aks)          €200
├── PostgreSQL Flexible Server       €15
├── Storage Account                   €5
├── Key Vault                         €2
├── Virtual Network                   €0
└── Container Insights (Free tier)    €0
    SUBTOTAL (Existing):            €222

New Resources (CloudMind) - Managed by Terraform:
├── Resource Groups                   €0
├── ACR Basic                         €5
├── Namespace (cloudmind)             €0
└── Role Assignments                  €0
    SUBTOTAL (New):                   €5

TOTAL MONTHLY COST:                 €227
  (€5 incremental vs baseline)
```

### ROI vs Multi-AKS

**Ahorro Mensual**: €450/mes  
**Ahorro Anual**: €5,400/año  
**Ahorro 2 Años**: €10,800

## Referencias

- [Arquitectura Overview](overview.md)
- [Single-AKS Strategy](single-aks.md)
- [Workflows CI/CD](../cicd/workflows.md)
- [Análisis de Costes](../costs/analysis.md)
