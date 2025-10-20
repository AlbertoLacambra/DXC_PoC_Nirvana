# FOCUS Framework Implementation

## 📋 Índice

- [Qué es FOCUS](#qué-es-focus)
- [Implementación en Nirvana](#implementación-en-nirvana)
- [Estructura de Datos](#estructura-de-datos)
- [Transformación Azure → FOCUS](#transformación-azure--focus)
- [Beneficios Multi-Cloud](#beneficios-multi-cloud)

## 🎯 Qué es FOCUS

**FOCUS** (FinOps Open Cost and Usage Specification) es un estándar abierto creado por la FinOps Foundation para normalizar datos de costos y uso entre múltiples proveedores Cloud.

### Versión Implementada: v1.0 (2024)

### Objetivos de FOCUS

1. **Normalización**: Misma estructura de datos para Azure, AWS, GCP
2. **Comparabilidad**: Comparar costos entre clouds sin transformaciones
3. **Portabilidad**: Herramientas FinOps compatibles con cualquier provider
4. **Transparencia**: Estándar abierto con documentación pública

### Columnas Core FOCUS

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **BillingPeriod** | Período de facturación | 2025-10 |
| **Provider** | Proveedor Cloud | Microsoft Azure |
| **ServiceCategory** | Categoría del servicio | Compute, Storage, Network |
| **PricingCategory** | Modelo de pricing | On-Demand, Reserved, Spot |
| **ChargeType** | Tipo de cargo | Usage, Purchase, Tax |
| **ResourceId** | ID único del recurso | /subscriptions/.../vm-01 |
| **BilledCost** | Costo facturado | 159.88 |
| **EffectiveCost** | Costo con descuentos | 119.91 |

## 🏗️ Implementación en Nirvana

### Arquitectura de Datos

```
Azure Cost Management API
          ↓
  [Data Extraction]
          ↓
  [FOCUS Transformer]
          ↓
   [FOCUS Dataset]
          ↓
    [API Response]
          ↓
   [Frontend Viz]
```

### Archivos Implementados

**1. `focus-types.ts`** (200+ líneas)

```typescript
// Core FOCUS types
export interface FOCUSBillingPeriod {
  start: string;              // ISO 8601
  end: string;
  month: string;              // YYYY-MM
}

export type FOCUSProvider = 'Microsoft Azure' | 'AWS' | 'GCP' | 'Other';

export type FOCUSServiceCategory =
  | 'Compute'
  | 'Storage'
  | 'Network'
  | 'Database'
  | 'AI & Machine Learning'
  | 'Analytics'
  | 'Security'
  | 'Management & Governance'
  | 'Other';

export type FOCUSPricingCategory =
  | 'On-Demand'
  | 'Reserved'
  | 'Spot'
  | 'Savings Plan'
  | 'Commitment-Based'
  | 'Other';

export type FOCUSChargeType =
  | 'Usage'
  | 'Purchase'
  | 'Tax'
  | 'Credit'
  | 'Adjustment'
  | 'Refund';

export interface FOCUSCostRecord {
  billingPeriod: FOCUSBillingPeriod;
  provider: FOCUSProvider;
  
  // Resource identification
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: string;
  location: string;
  tags: Record<string, string>;
  
  // Cost classification
  serviceCategory: FOCUSServiceCategory;
  pricingCategory: FOCUSPricingCategory;
  chargeType: FOCUSChargeType;
  
  // Cost amounts
  billedCost: number;
  effectiveCost: number;
  amortizedCost?: number;
  
  // Units
  usageQuantity?: number;
  usageUnit?: string;
  pricingUnit?: string;
  pricingQuantity?: number;
  
  // Metadata
  currency: string;
  timestamp: string;
}
```

**2. `azure-cost-service.ts`** (390+ líneas)

Funciones principales:

```typescript
// Obtener costos del mes actual
export async function getCurrentMonthCosts(): Promise<FOCUSCostSummary>

// Obtener tendencia de 6 meses
export async function getCostTrend(): Promise<FOCUSCostTrend[]>

// Transformar datos Azure → FOCUS
function transformToFOCUS(azureData: any): FOCUSCostRecord[]

// Mapear servicios Azure a categorías FOCUS
function mapServiceToCategory(serviceType: string): FOCUSServiceCategory
```

## 📊 Estructura de Datos

### FOCUSCostSummary

```typescript
{
  billingPeriod: {
    start: "2025-10-01T00:00:00Z",
    end: "2025-10-31T23:59:59Z",
    month: "2025-10"
  },
  provider: "Microsoft Azure",
  
  totalBilledCost: 3456.78,
  totalEffectiveCost: 3200.00,
  savings: 256.78,
  savingsPercentage: 7.43,
  currency: "EUR",
  
  byServiceCategory: {
    "Compute": 1850.00,
    "Storage": 650.00,
    "Network": 450.00,
    "Database": 350.00,
    "AI & Machine Learning": 100.00,
    "Analytics": 56.78
  },
  
  byPricingCategory: {
    "On-Demand": 2500.00,
    "Reserved": 800.00,
    "Spot": 156.78
  },
  
  byResourceGroup: {
    "rg-hub-prod": 2100.00,
    "rg-hub-dev": 890.00,
    "rg-shared": 466.78
  },
  
  topCostResources: [
    {
      resourceName: "vm-prod-app-01",
      cost: 319.76,
      serviceCategory: "Compute"
    }
  ]
}
```

### FOCUSCostTrend

```typescript
[
  {
    month: "2025-05",
    monthName: "May 2025",
    totalCost: 2800.50,
    varianceAmount: -156.28,
    variancePercentage: -5.29,
    trend: "down"
  },
  {
    month: "2025-06",
    monthName: "Jun 2025",
    totalCost: 3100.00,
    varianceAmount: 299.50,
    variancePercentage: 10.70,
    trend: "up"
  }
]
```

## 🔄 Transformación Azure → FOCUS

### Mapeo de Service Categories

```typescript
function mapServiceToCategory(azureServiceType: string): FOCUSServiceCategory {
  const mapping: Record<string, FOCUSServiceCategory> = {
    // Compute
    'Microsoft.Compute': 'Compute',
    'Microsoft.ContainerService': 'Compute',
    'Microsoft.Web/sites': 'Compute',
    
    // Storage
    'Microsoft.Storage': 'Storage',
    'Microsoft.StorageCache': 'Storage',
    
    // Network
    'Microsoft.Network': 'Network',
    'Microsoft.Cdn': 'Network',
    
    // Database
    'Microsoft.Sql': 'Database',
    'Microsoft.DBforPostgreSQL': 'Database',
    'Microsoft.DocumentDB': 'Database',
    
    // AI & ML
    'Microsoft.CognitiveServices': 'AI & Machine Learning',
    'Microsoft.MachineLearningServices': 'AI & Machine Learning',
    
    // Analytics
    'Microsoft.Synapse': 'Analytics',
    'Microsoft.DataFactory': 'Analytics',
    
    // Security
    'Microsoft.Security': 'Security',
    'Microsoft.KeyVault': 'Security',
    
    // Management
    'Microsoft.Monitor': 'Management & Governance',
    'Microsoft.Automation': 'Management & Governance'
  };
  
  return mapping[azureServiceType] || 'Other';
}
```

### Mapeo de Pricing Categories

```typescript
function mapPricingCategory(azurePricingModel: string): FOCUSPricingCategory {
  const mapping: Record<string, FOCUSPricingCategory> = {
    'PayAsYouGo': 'On-Demand',
    'Reservation': 'Reserved',
    'Spot': 'Spot',
    'SavingsPlan': 'Savings Plan',
    'DevTest': 'Commitment-Based'
  };
  
  return mapping[azurePricingModel] || 'On-Demand';
}
```

### Ejemplo de Transformación

**Input (Azure Cost Management API):**

```json
{
  "properties": {
    "cost": 159.88,
    "resourceId": "/subscriptions/.../Microsoft.Compute/virtualMachines/vm-prod-01",
    "resourceLocation": "westeurope",
    "resourceGroupName": "rg-hub-prod",
    "meter": "D4s v3",
    "meterCategory": "Virtual Machines",
    "pricingModel": "PayAsYouGo",
    "date": "2025-10-15"
  }
}
```

**Output (FOCUS):**

```json
{
  "billingPeriod": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-10-31T23:59:59Z",
    "month": "2025-10"
  },
  "provider": "Microsoft Azure",
  "resourceId": "/subscriptions/.../Microsoft.Compute/virtualMachines/vm-prod-01",
  "resourceName": "vm-prod-01",
  "resourceType": "Microsoft.Compute/virtualMachines",
  "resourceGroup": "rg-hub-prod",
  "location": "westeurope",
  "serviceCategory": "Compute",
  "pricingCategory": "On-Demand",
  "chargeType": "Usage",
  "billedCost": 159.88,
  "effectiveCost": 159.88,
  "currency": "EUR",
  "timestamp": "2025-10-15T00:00:00Z"
}
```

## 🌐 Beneficios Multi-Cloud

### 1. Comparabilidad de Costos

**Sin FOCUS:**
```typescript
// AWS
const awsCost = data.cost_USD;

// Azure
const azureCost = data.PreTaxCost;

// GCP
const gcpCost = data.cost;

// ❌ Diferentes campos, diferentes monedas, diferentes estructuras
```

**Con FOCUS:**
```typescript
// Todos los providers
const cost = focusRecord.billedCost;
const category = focusRecord.serviceCategory;
const pricing = focusRecord.pricingCategory;

// ✅ Misma estructura, fácil comparación
```

### 2. Agregación Multi-Cloud

```typescript
// Sumar costos de todos los clouds
const totalCost = [
  ...azureFocusData,
  ...awsFocusData,
  ...gcpFocusData
].reduce((sum, record) => sum + record.billedCost, 0);

// Breakdown por service category (independiente del cloud)
const byCategory = groupBy(allRecords, r => r.serviceCategory);
```

### 3. Portabilidad de Herramientas

Cualquier herramienta que soporte FOCUS puede trabajar con tus datos:

- **Kubecost**: K8s cost allocation
- **CloudHealth**: Multi-cloud governance
- **Vantage**: Cost reporting
- **DXC Cloud Mind**: FinOps analytics ✅

### 4. Futuro: Añadir AWS/GCP

```typescript
// Mismo transformador, diferentes inputs
export async function getAWSCosts(): Promise<FOCUSCostSummary> {
  const awsData = await fetchFromCostExplorer();
  const focusRecords = transformAWSToFOCUS(awsData);
  return aggregateFOCUS(focusRecords);
}

export async function getGCPCosts(): Promise<FOCUSCostSummary> {
  const gcpData = await fetchFromBigQuery();
  const focusRecords = transformGCPToFOCUS(gcpData);
  return aggregateFOCUS(focusRecords);
}

// Frontend no cambia - mismo formato FOCUS
```

## 📈 Visualización FOCUS

### Cost Analysis Tab

**FOCUS Core Dimensions:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <div>
    <label>Billing Period</label>
    <div>{data.billingPeriod.month}</div>
  </div>
  <div>
    <label>Provider</label>
    <div>{data.provider}</div>
  </div>
  <div>
    <label>Total Cost</label>
    <div>€{data.totalBilledCost.toFixed(2)}</div>
  </div>
</div>
```

**Service Category Breakdown:**
```tsx
{Object.entries(data.byServiceCategory).map(([category, cost]) => (
  <div className="flex items-center justify-between">
    <div>{category}</div>
    <div className="flex items-center gap-2">
      <div className="w-32 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${(cost / data.totalBilledCost) * 100}%` }}
        />
      </div>
      <span className="font-semibold">€{cost.toFixed(2)}</span>
      <span className="text-xs text-gray-500">
        ({((cost / data.totalBilledCost) * 100).toFixed(1)}%)
      </span>
    </div>
  </div>
))}
```

**Pricing Category Cards:**
```tsx
<div className="grid grid-cols-3 gap-4">
  {Object.entries(data.byPricingCategory).map(([category, cost]) => (
    <div className={`rounded-lg p-4 ${getCategoryColor(category)}`}>
      <div className="text-sm font-semibold">{category}</div>
      <div className="text-2xl font-bold">€{cost.toFixed(2)}</div>
      <div className="text-xs">
        {((cost / data.totalBilledCost) * 100).toFixed(1)}% of total
      </div>
    </div>
  ))}
</div>
```

## 🔍 Validación FOCUS

### Compliance Checklist

- ✅ **Billing Period**: ISO 8601 format
- ✅ **Provider**: Standardized names (Microsoft Azure, AWS, GCP)
- ✅ **Service Category**: 9 categorías definidas
- ✅ **Pricing Category**: 5 modelos de pricing
- ✅ **Charge Type**: 6 tipos de cargos
- ✅ **Currency**: ISO 4217 codes (EUR, USD)
- ✅ **Cost Fields**: billedCost, effectiveCost, amortizedCost
- ✅ **Resource Identification**: resourceId, resourceName, resourceType

### Data Quality

```typescript
function validateFOCUSRecord(record: FOCUSCostRecord): boolean {
  // Required fields
  if (!record.billingPeriod || !record.provider) return false;
  if (!record.resourceId || !record.serviceCategory) return false;
  
  // Valid enums
  const validProviders = ['Microsoft Azure', 'AWS', 'GCP', 'Other'];
  if (!validProviders.includes(record.provider)) return false;
  
  // Positive costs
  if (record.billedCost < 0) return false;
  
  // Valid dates
  try {
    new Date(record.billingPeriod.start);
    new Date(record.billingPeriod.end);
  } catch {
    return false;
  }
  
  return true;
}
```

## 📚 Referencias

### Documentación Oficial

- **FOCUS Spec**: https://focus.finops.org/
- **GitHub Repo**: https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS_Spec
- **Version 1.0**: https://focus.finops.org/docs/1.0/

### Implementaciones de Referencia

- **Azure**: Azure Cost Management Exports with FOCUS schema
- **AWS**: Cost and Usage Reports (CUR) with FOCUS mapping
- **GCP**: BigQuery Billing Export with FOCUS transformation

### Herramientas Compatibles

- Kubecost
- CloudHealth by VMware
- Vantage
- Apptio Cloudability
- DXC Cloud Mind - Nirvana ✅

## 🚀 Próximos Pasos

### Phase 1: Enhanced Azure Support ✅
- [x] FOCUS types implementation
- [x] Azure Cost Management integration
- [x] Basic transformation
- [x] Frontend visualization

### Phase 2: Advanced Features (In Progress)
- [ ] Amortized cost calculation
- [ ] Commitment discount tracking
- [ ] Tag-based cost allocation
- [ ] Department/project chargeback

### Phase 3: Multi-Cloud (Planned)
- [ ] AWS Cost and Usage Reports integration
- [ ] GCP BigQuery Billing integration
- [ ] Unified multi-cloud dashboard
- [ ] Cross-cloud cost comparison

### Phase 4: Automation (Future)
- [ ] Automated FOCUS data lake
- [ ] Real-time streaming ingestion
- [ ] ML-based anomaly detection
- [ ] Predictive cost forecasting

---

**Last Updated**: October 20, 2025  
**FOCUS Version**: 1.0  
**Implementation Status**: ✅ Production Ready  
**Next Enhancement**: Multi-cloud support
