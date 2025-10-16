# Análisis de Costes

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Coste Mensual Total** | €227 |
| **Coste Incremental (CloudMind)** | €5 |
| **Ahorro vs Multi-AKS** | €450/mes |
| **ROI Anual** | €5,400 |

## Desglose de Costes

### Infraestructura Existente (Dify)

| Recurso | SKU/Tier | Coste Mensual |
|---------|----------|---------------|
| AKS Cluster (dify-aks) | Standard_D2s_v3 (2 nodes) | €200 |
| PostgreSQL Flexible Server | Burstable B1ms | €15 |
| Storage Account | Standard LRS | €5 |
| Key Vault | Standard | €2 |
| Virtual Network | Standard | €0 |
| Container Insights | Free tier | €0 |
| **SUBTOTAL** | | **€222** |

### Recursos Nuevos (CloudMind)

| Recurso | SKU/Tier | Coste Mensual |
|---------|----------|---------------|
| Resource Groups (2) | N/A | €0 |
| Azure Container Registry | Basic | €5 |
| Namespace cloudmind | N/A | €0 |
| Resource Quotas | N/A | €0 |
| Role Assignments | N/A | €0 |
| **SUBTOTAL** | | **€5** |

**TOTAL**: €227/mes (€5 incremental)

## Comparativa de Arquitecturas

### Opción A: Multi-AKS (Descartada)

```text
Hub Subscription:
├── Hub AKS Cluster (Standard_D2s_v3 × 2)    €200
├── PostgreSQL Flexible Server               €15
├── Azure Firewall                           €120
└── VPN Gateway                              €30
    SUBTOTAL:                                €365

Spoke-Prod Subscription:
├── Spoke AKS Cluster (Standard_D2s_v3 × 2)  €200
├── Container Insights                       €25
└── Load Balancer                            €20
    SUBTOTAL:                                €245

Spoke-Dev Subscription:
├── Spoke AKS Cluster (Standard_B2s × 2)     €90
└── Container Insights                       €25
    SUBTOTAL:                                €115

TOTAL MULTI-AKS:                             €725/mes
```

### Opción B: Single-AKS (Implementada)

```text
Existing Infrastructure (Dify):
├── AKS Cluster (shared)                     €200
├── PostgreSQL (shared)                      €15
├── Storage (shared)                         €5
└── Others                                   €2
    SUBTOTAL EXISTING:                       €222

New Resources (CloudMind):
└── ACR Basic                                €5
    SUBTOTAL NEW:                            €5

TOTAL SINGLE-AKS:                            €227/mes
```

### Ahorro

```text
Multi-AKS:     €725/mes
Single-AKS:    €227/mes
---------------
AHORRO:        €498/mes (68.7%)
ROI Anual:     €5,976
```

## Proyección de Costes

### Phase 1: Application Deployment (+2 meses)

```text
Recursos adicionales:
├── Load Balancer Standard                   €20
├── Public IP Standard                       €3
└── Managed Identities                       €0
    INCREMENTO:                              €23/mes

TOTAL PHASE 1:                               €250/mes
```

### Phase 2: Scale-out (si >85% utilización)

```text
Trigger: Utilización cluster >85% durante 7 días

Recursos adicionales:
├── Nuevo AKS Cluster                        €200
├── Container Insights adicional             €25
└── Additional storage                       €10
    INCREMENTO:                              €235/mes

TOTAL PHASE 2:                               €485/mes
  (aún €240/mes menos que Multi-AKS original)
```

## Optimizaciones Aplicadas

### 1. Shared AKS Cluster

**Ahorro**: €400/mes (2 clusters evitados)

**Estrategia**: Namespace isolation con resource quotas

### 2. Free Tier Container Insights

**Ahorro**: €50/mes

**Límite**: Primeros 10GB/mes gratis

**Uso actual**: ~3GB/mes

### 3. ACR Basic SKU

**Ahorro**: €15/mes vs Standard

**Límite**: 10GB storage

**Uso actual**: ~2GB

### 4. Shared PostgreSQL

**Ahorro**: €30/mes (1 instancia evitada)

**Estrategia**: Schemas separados por proyecto

## Monitorizac ión de Costes

### Azure Cost Management

```bash
# Ver costes últimos 30 días
az consumption usage list \
  --start-date $(date -d '30 days ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[].{Resource:instanceName, Cost:pretaxCost}" \
  -o table
```

### Budget Alerts

**Configurados**:

- ⚠️ Warning at 80% (€182/mes)
- 🔴 Critical at 100% (€227/mes)
- 🚨 Exceeded at 120% (€272/mes)

### Cost Anomaly Detection

**Habilitado**: Azure Cost Management Anomaly Detection

**Notificaciones**: Email + Teams

## Referencias

- [Cost Optimization](optimization.md)
- [ROI Analysis](roi.md)
- [Architecture](../architecture/overview.md)
