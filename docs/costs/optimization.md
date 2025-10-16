# Optimización de Costes

## Optimizaciones Implementadas

### 1. Single-AKS Strategy

**Ahorro**: €400/mes

**Implementación**:

- Namespace isolation en cluster existente
- Resource quotas por namespace
- Shared Container Insights

### 2. ACR Basic SKU

**Ahorro**: €15/mes vs Standard

**Rationale**: PoC con <5 imágenes

**Plan de Upgrade**: Si >8GB storage → Standard

### 3. Shared Resources

**Recursos Compartidos**:

- PostgreSQL: €30/mes ahorrado
- Storage Account: €10/mes ahorrado
- Key Vault: €5/mes ahorrado

**Total Ahorro**: €45/mes

## Oportunidades Futuras

### 1. Reserved Instances

**Potencial Ahorro**: 30-50% en AKS nodes

**Requisito**: Commitment de 1-3 años

**Aplicable a**: Nodes permanentes

### 2. Spot Instances

**Potencial Ahorro**: Hasta 90% en workloads fault-tolerant

**Riesgo**: Preemption possible

**Aplicable a**: Dev/test workloads

### 3. Autoscaling

**Potencial Ahorro**: 20-40% en horas no-pico

**Implementación**: Horizontal Pod Autoscaler

**Status**: Planificado Phase 2

## Monitorización

### Cost Alerts

```yaml
Alerts Configurados:
  - Budget 80%: Warning
  - Budget 100%: Critical
  - Anomaly Detection: Enabled
```

### Weekly Review

```bash
# Script semanal de análisis
az consumption usage list \
  --start-date $(date -d '7 days ago' +%Y-%m-%d) \
  --query "[].{Resource:instanceName, Cost:pretaxCost}" \
  -o table | sort -k2 -n -r
```

## Referencias

- [Cost Analysis](analysis.md)
- [ROI](roi.md)
