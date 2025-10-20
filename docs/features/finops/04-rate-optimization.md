# Rate Optimization - Análisis Avanzado de Pricing

## 📋 Descripción General

El módulo **Rate Optimization** es una extensión avanzada del Cost Optimizer que se enfoca específicamente en optimizar las tarifas de precios mediante el análisis de:

- **Savings Plans de Azure** (Compute, EC2, SageMaker)
- **Reserved Instances vs Savings Plans** (comparación de flexibilidad)
- **ROI Analysis** con NPV, IRR y Break-Even
- **Commitment Portfolio Optimization** (estrategia 70% de cobertura)
- **Spot Pricing Analysis** (volatilidad y eviction rates)
- **Spot Fleet Optimization** (mix óptimo 80/20)

---

## 🏗️ Arquitectura

### Componentes Principales

```
Rate Optimization Module:
├── rate-optimization-types.ts (300 líneas)
│   ├── SavingsPlan types (Compute, 1y/3y)
│   ├── RIvsSavingsPlanComparison
│   ├── ROIAnalysis (NPV, IRR, payback)
│   ├── BreakEvenChart (36 meses)
│   ├── CommitmentPortfolio (70% target)
│   ├── SpotPricingHistory
│   └── SpotFleetRecommendation
│
├── rate-optimization-engine.ts (500 líneas)
│   ├── generateSavingsPlanRecommendations()
│   ├── compareRIvsSavingsPlans()
│   ├── calculateROI()
│   ├── generateBreakEvenChart()
│   ├── optimizeCommitmentPortfolio()
│   ├── analyzeSpotPricing()
│   ├── optimizeSpotFleet()
│   └── generateRateOptimizationSummary()
│
└── API Integration
    └── GET /api/finops/rate-optimization
```

---

## 💰 Savings Plans Analysis

### Tipos de Savings Plans

Azure ofrece **Compute Savings Plans** que proporcionan descuentos sobre:

- **Virtual Machines** (Azure VMs)
- **App Services**
- **Container Instances**
- **Azure Functions Premium**

#### Términos y Descuentos

| Término | Descuento | Break-Even | ROI (36 meses) |
|---------|-----------|------------|----------------|
| **1 año** | 17% | 2 meses | 204% |
| **3 años** | 28% | 3 meses | 336% |

### Cálculo de Commitment

El engine calcula el **hourly commitment** necesario para cubrir el 70% del workload estable:

```typescript
// Filtrar recursos con utilización óptima/alta (estables)
const stableResources = utilizations.filter(u => 
  getUtilizationStatus(u.cpuAverage, u.memoryAverage) === 'optimal' ||
  getUtilizationStatus(u.cpuAverage, u.memoryAverage) === 'high'
);

// Calcular costo mensual estable
const stableMonthlyCost = stableResources.reduce(
  (sum, u) => sum + u.monthlyCost, 
  0
);

// 70% de cobertura recomendada
const recommendedCoverage = 0.7;
const monthlyCommitment = stableMonthlyCost * recommendedCoverage;

// Commitment horario (730 horas/mes)
const hourlyCommitment = monthlyCommitment / 730;
```

### Savings Plan Recommendation Output

```json
{
  "type": "Compute",
  "term": "3year",
  "paymentOption": "NoUpfront",
  "hourlyCommitment": 0.68,
  "monthlyCommitment": 500.00,
  "estimatedCoverage": 70,
  "monthlySavings": 140.00,
  "annualSavings": 1680.00,
  "savingsPercentage": 28,
  "upfrontCost": 0,
  "breakEvenMonths": 3,
  "roi": 336,
  "netPresentValue": 1512.45,
  "utilizationRisk": "low",
  "confidenceLevel": "high"
}
```

---

## 🔄 Reserved Instances vs Savings Plans

### Comparación de Flexibilidad

El engine compara **RIs** (Reserved Instances) con **Savings Plans** basándose en:

| Característica | Reserved Instances | Savings Plans |
|----------------|-------------------|---------------|
| **Descuento** | 50% (máximo) | 28% (Compute 3y) |
| **Flexibilidad** | Baja (locked to SKU) | Alta (any size, region) |
| **Scope** | VM-specific | Compute-wide |
| **Cambio de SKU** | No permitido | Permitido |
| **Cambio de región** | No permitido | Permitido |

### Algoritmo de Recomendación

```typescript
function compareRIvsSavingsPlans(utilizations) {
  // Agrupar por familia de VM (D-series, E-series, etc.)
  const vmFamilies = groupByVMFamily(utilizations);
  
  const riOption = {
    type: 'Reserved Instance',
    savingsPercentage: 50,
    flexibility: 'low',
    lockedSku: true,
    canChangeRegion: false
  };
  
  const savingsPlanOption = {
    type: 'Compute Savings Plan',
    savingsPercentage: 28,
    flexibility: 'high',
    lockedSku: false,
    canChangeRegion: true
  };
  
  // Decisión basada en diferencia de savings
  const savingsDifference = riOption.savingsPercentage - savingsPlanOption.savingsPercentage;
  
  // Si la diferencia es >30%, recomendar RI
  // Si la diferencia es <=30%, recomendar SP (por flexibilidad)
  const recommendedOption = savingsDifference > 30 ? 'RI' : 'SavingsPlans';
  
  return {
    riOption,
    savingsPlanOption,
    recommendedOption,
    reasoning: 'Flexibility vs Savings trade-off'
  };
}
```

---

## 📊 ROI Analysis - NPV & IRR

### Net Present Value (NPV)

El NPV calcula el valor presente de los ahorros futuros, descontados a una **tasa del 5% anual**:

```typescript
function calculateROI(type, term, upfrontCost, monthlyCommitment, monthlySavings) {
  const termMonths = term === '1year' ? 12 : 36;
  const discountRate = 0.05; // 5% anual
  const monthlyDiscountRate = Math.pow(1 + discountRate, 1/12) - 1;
  
  let npv = -upfrontCost; // Inversión inicial
  
  for (let month = 1; month <= termMonths; month++) {
    const cashFlow = monthlySavings;
    const discountFactor = Math.pow(1 + monthlyDiscountRate, month);
    npv += cashFlow / discountFactor;
  }
  
  return npv;
}
```

#### Ejemplo: 3-Year Savings Plan

```
Inversión inicial: €0 (NoUpfront)
Ahorros mensuales: €140
Plazo: 36 meses
Tasa de descuento: 5% anual

NPV = Σ (€140 / (1.05)^(month/12)) para month = 1 a 36
NPV ≈ €4,536 (valor presente de los ahorros)
```

### Internal Rate of Return (IRR)

El IRR es la **tasa de retorno** que hace que NPV = 0:

```typescript
// Simplified IRR calculation
const totalSavings = monthlySavings * termMonths;
const totalInvestment = upfrontCost + (monthlyCommitment * termMonths);

const irr = Math.pow(totalSavings / totalInvestment, 1 / termMonths) - 1;
const annualizedIRR = (1 + irr) ** 12 - 1;
```

#### Ejemplo Output:

```json
{
  "roi": 336,
  "paybackPeriod": 3,
  "netPresentValue": 4536.24,
  "internalRateOfReturn": 0.28,
  "monthlyBreakdown": [
    { "month": 1, "cumulativeSavings": 140, "breakEvenReached": false },
    { "month": 2, "cumulativeSavings": 280, "breakEvenReached": false },
    { "month": 3, "cumulativeSavings": 420, "breakEvenReached": true },
    // ... hasta month 36
  ]
}
```

---

## 📈 Break-Even Chart

El **Break-Even Chart** genera datos para visualizar cuándo cada opción de pricing se vuelve más económica:

### Estructura de Datos

```typescript
interface BreakEvenChart {
  months: number[];                    // [1, 2, 3, ..., 36]
  onDemandCost: number[];             // Costo acumulado On-Demand
  reservedCost: number[];             // Costo acumulado con RI
  savingsPlanCost: number[];          // Costo acumulado con SP
  spotCost: number[];                 // Costo acumulado con Spot
  breakEvenPoints: {
    reservedInstance: number;         // Mes de break-even RI
    savingsPlan: number;              // Mes de break-even SP
    spot: number;                     // Mes de break-even Spot
  };
}
```

### Ejemplo de Generación

```typescript
function generateBreakEvenChart(costs, termMonths = 36) {
  const chart = {
    months: [],
    onDemandCost: [],
    reservedCost: [],
    savingsPlanCost: [],
    spotCost: []
  };
  
  const onDemandMonthly = costs.onDemand;
  const riMonthly = costs.reserved;
  const spMonthly = costs.savingsPlan;
  const spotMonthly = costs.spot;
  
  for (let month = 1; month <= termMonths; month++) {
    chart.months.push(month);
    chart.onDemandCost.push(onDemandMonthly * month);
    chart.reservedCost.push(riMonthly * month);
    chart.savingsPlanCost.push(spMonthly * month);
    chart.spotCost.push(spotMonthly * month);
  }
  
  // Detectar break-even points
  chart.breakEvenPoints = {
    reservedInstance: findBreakEven(chart.onDemandCost, chart.reservedCost),
    savingsPlan: findBreakEven(chart.onDemandCost, chart.savingsPlanCost),
    spot: findBreakEven(chart.onDemandCost, chart.spotCost)
  };
  
  return chart;
}
```

---

## 🎯 Commitment Portfolio Optimization

### Estrategia de Cobertura 70%

La mejor práctica de FinOps recomienda una **cobertura del 70%** de workloads estables:

```
Target Portfolio:
├── 40% Savings Plans (flexibilidad)
├── 30% Reserved Instances (máximo descuento)
└── 30% On-Demand (burst capacity)
```

### Algoritmo de Optimización

```typescript
function optimizeCommitmentPortfolio(utilizations) {
  const totalMonthlyCost = utilizations.reduce((sum, u) => sum + u.monthlyCost, 0);
  
  // Estado actual (ejemplo)
  const currentCommitments = {
    reservedInstances: totalMonthlyCost * 0.10,  // 10% RI
    savingsPlans: 0,                              // 0% SP
    onDemand: totalMonthlyCost * 0.90             // 90% On-Demand
  };
  
  // Estado recomendado (70% coverage)
  const recommendedCommitments = {
    savingsPlans: totalMonthlyCost * 0.40,        // 40% SP
    reservedInstances: totalMonthlyCost * 0.30,   // 30% RI
    onDemand: totalMonthlyCost * 0.30             // 30% On-Demand
  };
  
  // Calcular ahorros potenciales
  const currentSavings = currentCommitments.reservedInstances * 0.50;
  const recommendedSavings = 
    (recommendedCommitments.savingsPlans * 0.28) + 
    (recommendedCommitments.reservedInstances * 0.50);
  
  const potentialSavings = recommendedSavings - currentSavings;
  
  return {
    currentCommitments,
    recommendedCommitments,
    targetCoveragePercentage: 70,
    potentialSavings
  };
}
```

---

## ⚡ Spot Pricing Analysis

### Volatilidad de Precios

El engine analiza el **historial de precios Spot** para estimar:

- **Precio promedio** (típicamente 70-80% de descuento)
- **Volatilidad** (ratio max-min / average)
- **Eviction rate** (tasa de interrupción)
- **Max bid price** recomendado

### Simulación de Pricing

```typescript
function analyzeSpotPricing(sku, location, onDemandPrice) {
  // Simular 30 días de precios Spot
  const history = [];
  const baseDiscount = 0.75; // 75% descuento base
  
  for (let day = 1; day <= 30; day++) {
    const randomFactor = 0.1 + Math.random() * 0.5; // 10-60% de On-Demand
    const spotPrice = onDemandPrice * randomFactor;
    
    history.push({
      timestamp: new Date(Date.now() - (30 - day) * 24 * 60 * 60 * 1000),
      price: spotPrice,
      availabilityZone: `${location}-1`
    });
  }
  
  // Calcular métricas
  const prices = history.map(h => h.price);
  const averageSpotPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  
  const priceVolatility = (maxPrice - minPrice) / averageSpotPrice;
  
  // Eviction rate basado en volatilidad
  let evictionRate = 0.02; // 2% (low volatility)
  if (priceVolatility > 0.5) evictionRate = 0.10;      // 10% (high)
  else if (priceVolatility > 0.3) evictionRate = 0.05; // 5% (medium)
  
  const isRecommended = priceVolatility < 0.5 && evictionRate < 0.10;
  const maxBidPrice = averageSpotPrice * 1.5; // 150% del promedio
  
  return {
    history,
    averageSpotPrice,
    priceVolatility,
    evictionRate,
    isRecommended,
    maxBidPrice,
    potentialSavings: (onDemandPrice - averageSpotPrice) / onDemandPrice
  };
}
```

---

## 🚀 Spot Fleet Optimization

### Mix Óptimo 80/20

La estrategia recomendada para **alta disponibilidad + máximo ahorro**:

```
Spot Fleet Strategy:
├── 80% Spot Instances (75% discount)
├── 20% On-Demand (backup)
└── 99.7% Estimated Availability
```

### SKU Diversification

Para minimizar interrupciones, el engine recomienda **diversificar entre SKUs**:

```typescript
function optimizeSpotFleet(workloadName, currentCost) {
  const recommendedMix = {
    spot: 0.80,      // 80% Spot
    onDemand: 0.20   // 20% On-Demand
  };
  
  const skuDiversification = [
    { sku: 'Standard_D4s_v3', priority: 1, allocation: 0.50 },
    { sku: 'Standard_D4as_v4', priority: 2, allocation: 0.30 }, // AMD alternative
    { sku: 'Standard_E4s_v3', priority: 3, allocation: 0.20 }   // Memory-optimized
  ];
  
  // Calcular savings
  const spotSavings = currentCost * recommendedMix.spot * 0.75;
  const estimatedMonthlySavings = spotSavings;
  
  // Availability con diversificación
  const estimatedAvailability = 0.997; // 99.7%
  
  return {
    workload: workloadName,
    currentCost,
    recommendedMix,
    skuDiversification,
    estimatedMonthlySavings,
    estimatedAnnualSavings: estimatedMonthlySavings * 12,
    estimatedAvailability,
    exceeds99_5Percent: estimatedAvailability >= 0.995
  };
}
```

---

## 📦 API Integration

### Endpoint

```
GET /api/finops/rate-optimization
```

### Response Structure

```json
{
  "success": true,
  "rateOptimization": {
    "savingsPlans": {
      "oneYear": {
        "hourlyCommitment": 0.42,
        "monthlyCommitment": 306.60,
        "monthlySavings": 52.12,
        "annualSavings": 625.44,
        "savingsPercentage": 17,
        "roi": 204,
        "breakEvenMonths": 2
      },
      "threeYear": {
        "hourlyCommitment": 0.42,
        "monthlyCommitment": 306.60,
        "monthlySavings": 85.85,
        "annualSavings": 1030.20,
        "savingsPercentage": 28,
        "roi": 336,
        "breakEvenMonths": 3
      }
    },
    "riComparison": {
      "riOption": {
        "savingsPercentage": 50,
        "flexibility": "low"
      },
      "savingsPlanOption": {
        "savingsPercentage": 28,
        "flexibility": "high"
      },
      "recommendedOption": "SavingsPlans"
    },
    "commitmentPortfolio": {
      "currentCoverage": 10,
      "targetCoverage": 70,
      "potentialSavings": 120.50
    },
    "spotAnalysis": {
      "eligibleWorkloads": 2,
      "averageDiscount": 75,
      "estimatedSavings": 200.00
    },
    "summary": {
      "totalMonthlySavings": 458.47,
      "totalAnnualSavings": 5501.64,
      "averageROI": 270,
      "averagePaybackPeriod": 2.5
    }
  }
}
```

---

## 🎨 Frontend Visualization

### Break-Even Chart (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function BreakEvenChartComponent({ data }: { data: BreakEvenChart }) {
  const chartData = data.months.map((month, idx) => ({
    month,
    onDemand: data.onDemandCost[idx],
    reserved: data.reservedCost[idx],
    savingsPlan: data.savingsPlanCost[idx],
    spot: data.spotCost[idx]
  }));
  
  return (
    <LineChart width={800} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
      <YAxis label={{ value: 'Cumulative Cost (€)', angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="onDemand" stroke="#94a3b8" name="On-Demand" />
      <Line type="monotone" dataKey="reserved" stroke="#3b82f6" name="Reserved Instance" />
      <Line type="monotone" dataKey="savingsPlan" stroke="#10b981" name="Savings Plan" />
      <Line type="monotone" dataKey="spot" stroke="#8b5cf6" name="Spot Instance" />
    </LineChart>
  );
}
```

---

## 📚 Referencias

- [Azure Compute Savings Plans](https://learn.microsoft.com/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)
- [Reserved Instances vs Savings Plans](https://learn.microsoft.com/azure/cost-management-billing/reservations/reserved-instance-vs-savings-plan)
- [Spot VMs Pricing](https://learn.microsoft.com/azure/virtual-machines/spot-vms)
- [FinOps Best Practices - Commitment Discounts](https://www.finops.org/framework/capabilities/commitment-discounts/)

---

## 🔗 Archivos Relacionados

- `rate-optimization-types.ts` - Type definitions (300 líneas)
- `rate-optimization-engine.ts` - Business logic (500 líneas)
- `azure-cost-service.ts` - Cost data integration
- `optimizer-engine.ts` - Cost Optimizer base
- `/api/finops/route.ts` - API endpoint

---

**Última actualización:** 2025-01-XX  
**Autor:** Cloud Mind - FinOps Team
