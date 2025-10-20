# FinOps Analytics Platform

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Implementación](#implementación)
- [Guías de Usuario](#guías-de-usuario)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)

## 🎯 Visión General

La plataforma **FinOps Analytics** de DXC Cloud Mind - Nirvana proporciona análisis completo de costos Cloud siguiendo los estándares de la industria:

- **FOCUS Framework v1.0** (FinOps Open Cost and Usage Specification)
- **Microsoft FinOps Toolkit** (6 módulos principales)
- **Multi-cloud ready** (Azure, AWS, GCP)

### Estado de Implementación

| Módulo | Estado | Fecha Completado | Documentación |
|--------|--------|------------------|---------------|
| 🏠 Overview Dashboard | ✅ Completado | Oct 2025 | [Ver docs](./01-overview.md) |
| 💰 FOCUS Cost Analysis | ✅ Completado | Oct 2025 | [Ver docs](./02-focus-framework.md) |
| ⚡ Cost Optimizer | ✅ Completado | Oct 2025 | [Ver docs](./03-cost-optimizer.md) |
| 💎 Rate Optimization | ✅ Completado | Ene 2025 | [Ver docs](./04-rate-optimization.md) |
| 🛡️ Governance | ⏳ Pendiente | - | [Ver docs](./05-governance.md) |
| 📊 Reporting | ⏳ Pendiente | - | [Ver docs](./06-reporting.md) |
| 🤖 Auto-Optimization PR | ✅ Completado | Ene 2025 | [Ver docs](./05-auto-optimization-pr.md) |

## 🏗️ Arquitectura

### Frontend Structure

```
/finops
├── Overview Tab          → KPIs, status general
├── Cost Analysis Tab     → FOCUS data visualization
├── Optimization Tab      → Cost Optimizer recommendations
├── Governance Tab        → Policies, tagging, budgets
└── Reporting Tab         → Showback, Chargeback, Power BI
```

### Backend Architecture

```
apps/control-center-ui/app/api/finops/
├── route.ts                      → Main API endpoint
├── focus-types.ts                → FOCUS v1.0 TypeScript types
├── azure-cost-service.ts         → Azure Cost Management integration
├── optimizer-types.ts            → Cost Optimizer types
├── azure-monitor-service.ts      → Azure Monitor metrics integration
└── optimizer-engine.ts           → Recommendations engine
```

### Data Flow

```mermaid
graph LR
    A[User] --> B[/finops Page]
    B --> C[/api/finops]
    C --> D[Azure Cost Management API]
    C --> E[Azure Monitor API]
    C --> F[Azure Resource Graph]
    
    D --> G[FOCUS Transformer]
    E --> H[Utilization Analyzer]
    F --> I[Resource Inventory]
    
    G --> J[Cost Summary]
    H --> K[Optimization Recommendations]
    I --> K
    
    J --> B
    K --> B
```

## 📊 Características Principales

### 1. FOCUS Framework Compliance

- **Multi-cloud normalization**: Estructura de datos común para Azure, AWS, GCP
- **Core Dimensions**: BillingPeriod, Provider, ServiceCategory, PricingCategory
- **9 Service Categories**: Compute, Storage, Network, Database, AI/ML, Analytics, Security, Management, Other
- **5 Pricing Categories**: On-Demand, Reserved, Spot, Savings Plan, Commitment-Based

### 2. Cost Optimizer (Microsoft FinOps Toolkit)

**Right-Sizing Engine:**
- Análisis de 7 días de métricas (CPU, memoria, red, disco)
- Detección de recursos infrautilizados (<20% utilización)
- Detección de recursos sobreutilizados (>90% utilización)
- Recomendaciones de downsize/upsize/shutdown
- Cálculo de ahorros mensuales y anuales
- Sistema de priorización (1-10)

**Reserved Instance Analysis:**
- Cobertura actual de RIs
- Agrupación por SKU y región
- Comparación 1 año vs 3 años
- Estimación de ahorros (30% y 50%)
- Cálculo de break-even

**Spot Instance Eligibility:**
- Clasificación de workloads (dev/test/batch/prod)
- Análisis de tolerancia a interrupciones
- Estimación de savings (70-90%)
- Evaluación de riesgos

### 3. Rate Optimization (NEW)

**Savings Plans Analysis:**
- Azure Compute Savings Plans (1-year: 17%, 3-year: 28%)
- Hourly commitment calculation
- ROI Analysis con NPV, IRR y payback period
- Break-even chart generation (36 meses)
- Confidence level scoring

**Reserved Instances vs Savings Plans:**
- Comparación de flexibilidad
- Trade-off analysis (50% savings vs alta flexibilidad)
- Recomendación inteligente basada en savings gap
- VM family grouping

**Commitment Portfolio Optimization:**
- Target: 70% coverage (FinOps best practice)
- Strategy: 40% Savings Plans + 30% RI + 30% On-Demand
- Potential savings calculation

**Spot Pricing & Fleet:**
- 30-day price history analysis
- Volatility ratio calculation
- Eviction rate estimation (2-10%)
- Spot Fleet optimization (80/20 mix)
- SKU diversification strategy
- 99.7% availability target

### 4. Auto-Optimization con PR (LEVEL 2)

**Automatic PR Generation:**
- Detección de recomendaciones High Priority (7+)
- Generación de código Terraform validado
- Creación automática de GitHub PR
- PR description con análisis detallado y savings
- Integración con workflow DRIFT existente

**Features:**
- Dry-run mode (preview sin crear PR)
- Execute mode (auto-create PR)
- Terraform code generation para downsize/upsize/shutdown
- Impact assessment (low/medium/high)
- Assignees automáticos (CloudOps + FinOps)
- Testing checklist incluido
- Rollback strategy documented

**Threshold Configuration:**
- Min monthly savings: €50
- Min priority: 7/10
- Confidence level: High
- Require manual approval before merge

### 5. Visualization & Reporting

- 📈 6-month cost trend with variance analysis
- 📊 Service Category breakdown (horizontal bars)
- 💳 Pricing Category cards (color-coded)
- 🏢 Resource Group cost allocation
- ⚡ Optimization score (0-100)
- 💰 Potential savings calculator

## 🚀 Quick Start

### Acceder a FinOps Analytics

1. Navegar a la página principal de DXC Cloud Mind - Nirvana
2. Click en la tarjeta **"FinOps Analytics"**
3. Seleccionar el tab deseado:
   - **Overview**: Vista general de KPIs y toolkit status
   - **Cost Analysis**: Análisis FOCUS completo con breakdowns
   - **Optimization**: Recomendaciones de Cost Optimizer

### API Usage

**Obtener datos FOCUS:**
```bash
GET /api/finops
```

**Obtener análisis completo con optimizer:**
```bash
GET /api/finops?optimizer=true
```

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-10-20T10:00:00Z",
  "summary": {
    "totalResources": 45,
    "totalMonthlyCost": 3456.78,
    "underutilizedCount": 12,
    "potentialSavings": 890.50,
    "optimizationScore": 65,
    "currency": "EUR"
  },
  "costs": {
    "focus": { /* FOCUS data */ },
    "trend": [ /* 6-month trend */ ]
  },
  "optimizer": {
    "summary": { /* Optimizer summary */ },
    "rightsizing": [ /* Recommendations */ ],
    "reservedInstances": [ /* RI recommendations */ ],
    "spotInstances": [ /* Spot opportunities */ ]
  }
}
```

## 📚 Documentación Detallada

1. [**Overview Dashboard**](./01-overview.md) - Vista general y KPIs
2. [**FOCUS Framework**](./02-focus-framework.md) - Implementación FOCUS v1.0 completa
3. [**Cost Optimizer**](./03-cost-optimizer.md) - Right-sizing, RI, Spot analysis detallado
4. [**Rate Optimization**](./04-rate-optimization.md) - ✅ Savings Plans, ROI, NPV/IRR, Portfolio (800+ líneas)
5. [**Auto-Optimization PR**](./05-auto-optimization-pr.md) - ✅ Terraform PR automation (900+ líneas)
6. [**Governance**](./06-governance.md) - Policies, tagging, budgets (WIP)
7. [**Reporting**](./07-reporting.md) - Showback, Chargeback, Power BI (WIP)

## 🔧 Configuración

### Variables de Entorno

```bash
# Azure Configuration
AZURE_SUBSCRIPTION_ID=739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
AZURE_TENANT_ID=<your-tenant-id>

# Terraform Path
TERRAFORM_PATH=c:\PROYECTS\DXC_PoC_Nirvana\terraform\hub

# Data Source Mode
FINOPS_DATA_MODE=simulated  # simulated | real
```

### Azure CLI Setup

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Set subscription
az account set --subscription "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"

# Install cost management extension
az extension add --name costmanagement
```

## 🎨 Demo Data

La implementación actual utiliza **datos simulados** para propósitos de PoC y demos:

### ¿Por qué datos simulados?

1. **Azure CLI limitation**: La extensión `costmanagement v1.0.0` solo soporta `export`, no `query` en tiempo real
2. **Consistencia**: Resultados predecibles para demos y testing
3. **Privacy**: No expone datos reales de costos en demos públicas
4. **FOCUS-compliant**: Estructura idéntica a datos reales

### Indicadores en UI

Todas las vistas muestran claramente:
- 🧪 **DEMO DATA** badge en el hero banner
- Nota al final de cada tab explicando que son datos simulados
- Documentación de cómo cambiar a datos reales

### Datos Simulados Incluyen

- **20 recursos** distribuidos en 3 resource groups
- **€3,456.78** costo mensual total
- Breakdowns por:
  - Service Category (Compute: €1,850, Storage: €650, etc.)
  - Pricing Category (On-Demand: €2,500, Reserved: €800, Spot: €156.78)
  - Resource Group (rg-hub-prod, rg-hub-dev, rg-shared)
- **12 recursos infrautilizados** (<20% CPU/Memory)
- **Ahorros potenciales**: €890.50/mes

## 🔄 Migration to Real Data

Para cambiar a datos reales de Azure:

### Opción 1: Azure Cost Management REST API

```typescript
// apps/control-center-ui/app/api/finops/azure-cost-service.ts

async function getCurrentMonthCosts() {
  // Comment out simulated data
  // return getSimulatedCosts();
  
  // Use real Azure API
  const response = await fetch(
    `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'Usage',
        timeframe: 'MonthToDate',
        dataset: {
          granularity: 'Daily',
          aggregation: { totalCost: { name: 'Cost', function: 'Sum' } }
        }
      })
    }
  );
  
  const data = await response.json();
  return transformToFOCUS(data);
}
```

### Opción 2: Power BI Connector

Integración directa con Power BI para reportes:
```typescript
// Próximamente en Task 7: Reporting
```

## 📈 Métricas de Éxito

### KPIs Principales

- **Optimization Score**: 0-100 (objetivo: >80)
- **Underutilized Resources**: % de recursos con <20% utilización (objetivo: <10%)
- **RI Coverage**: % de VMs con Reserved Instances (objetivo: >70%)
- **Monthly Savings**: € ahorrados vs baseline (objetivo: >20%)
- **Time to Insight**: Tiempo para generar recomendaciones (objetivo: <5 min)

### Dashboard Metrics

```typescript
{
  optimizationScore: 65,           // Actual
  targetScore: 80,                 // Objetivo
  
  utilizationBreakdown: {
    underutilized: 30%,           // Reducir a <10%
    optimal: 55%,                 // Mantener >60%
    high: 10%,                    // Aceptable <15%
    overutilized: 5%              // Crítico: actuar inmediatamente
  },
  
  savingsOpportunities: {
    rightsizing: 450.50,          // €/mes
    reservedInstances: 350.00,    // €/mes
    spotInstances: 90.00          // €/mes
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. "No optimizer data available"**
```bash
# Verificar que el endpoint funciona
curl http://localhost:3000/api/finops?optimizer=true

# Check logs
npm run dev
# Buscar errores de Azure CLI o permisos
```

**2. Azure CLI authentication fails**
```bash
# Re-login
az login --use-device-code

# Verify subscription
az account show
```

**3. Slow optimizer response**
```bash
# El análisis completo puede tomar 30-60 segundos
# Considera implementar caching o background jobs
```

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [docs/features/finops/](./README.md)
- **Contact**: finops@dxc.com

## 🗓️ Roadmap

### ✅ Phase 1: Foundation (Completed - Oct 2025)
- [x] Independent FinOps page
- [x] FOCUS Framework implementation
- [x] Azure Cost Management integration
- [x] Cost Optimizer engine
- [x] Right-sizing recommendations
- [x] Reserved Instance analysis
- [x] Spot Instance eligibility

### 🚧 Phase 2: Advanced Features (In Progress)
- [ ] Rate Optimization module
- [ ] Savings Plans analysis
- [ ] ROI calculator
- [ ] Governance module
- [ ] Azure Policy integration
- [ ] Tagging strategy validation

### 📅 Phase 3: Reporting & Automation (Planned)
- [ ] Showback/Chargeback reports
- [ ] Power BI integration
- [ ] Anomaly detection
- [ ] Multi-tenant dashboards
- [ ] Auto-optimization with Terraform PRs
- [ ] Webhook notifications

## 📄 License

Copyright © 2025 DXC Technology. All rights reserved.

---

**Last Updated**: October 20, 2025  
**Version**: 1.0.0  
**Contributors**: Alberto Lacambra, DXC Cloud Mind Team
