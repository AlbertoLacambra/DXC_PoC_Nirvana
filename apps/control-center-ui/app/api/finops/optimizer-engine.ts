/**
 * Cost Optimizer - Recommendations Engine
 * 
 * Generates intelligent right-sizing, Reserved Instance, and Spot instance recommendations
 * based on resource utilization patterns and cost analysis
 * 
 * Based on Microsoft FinOps Toolkit best practices
 */

import type {
  ResourceUtilization,
  RightSizingRecommendation,
  ReservedInstanceRecommendation,
  ReservedInstanceCoverage,
  SpotInstanceEligibility,
  VMSku,
  UtilizationStatus,
  CostOptimizerSummary,
} from './optimizer-types';
import { getUtilizationStatus } from './azure-monitor-service';

// ============================================
// VM SKU Database (simplified for PoC)
// ============================================

const VM_SKU_DATABASE: Record<string, VMSku> = {
  'Standard_B1s': {
    name: 'Standard_B1s',
    tier: 'Standard',
    size: 'B1s',
    family: 'standardBSFamily',
    vCPUs: 1,
    memoryGB: 1,
    maxDataDisks: 2,
    maxNics: 2,
    estimatedMonthlyCost: 10.22,
    isSpotEligible: true,
    supportsPremiumStorage: false,
  },
  'Standard_B2s': {
    name: 'Standard_B2s',
    tier: 'Standard',
    size: 'B2s',
    family: 'standardBSFamily',
    vCPUs: 2,
    memoryGB: 4,
    maxDataDisks: 4,
    maxNics: 3,
    estimatedMonthlyCost: 40.88,
    isSpotEligible: true,
    supportsPremiumStorage: false,
  },
  'Standard_D2s_v3': {
    name: 'Standard_D2s_v3',
    tier: 'Standard',
    size: 'D2s_v3',
    family: 'standardDSv3Family',
    vCPUs: 2,
    memoryGB: 8,
    maxDataDisks: 4,
    maxNics: 2,
    estimatedMonthlyCost: 79.94,
    isSpotEligible: true,
    supportsPremiumStorage: true,
  },
  'Standard_D4s_v3': {
    name: 'Standard_D4s_v3',
    tier: 'Standard',
    size: 'D4s_v3',
    family: 'standardDSv3Family',
    vCPUs: 4,
    memoryGB: 16,
    maxDataDisks: 8,
    maxNics: 2,
    estimatedMonthlyCost: 159.88,
    isSpotEligible: true,
    supportsPremiumStorage: true,
  },
  'Standard_D8s_v3': {
    name: 'Standard_D8s_v3',
    tier: 'Standard',
    size: 'D8s_v3',
    family: 'standardDSv3Family',
    vCPUs: 8,
    memoryGB: 32,
    maxDataDisks: 16,
    maxNics: 4,
    estimatedMonthlyCost: 319.76,
    isSpotEligible: true,
    supportsPremiumStorage: true,
  },
  'Standard_D16s_v3': {
    name: 'Standard_D16s_v3',
    tier: 'Standard',
    size: 'D16s_v3',
    family: 'standardDSv3Family',
    vCPUs: 16,
    memoryGB: 64,
    maxDataDisks: 32,
    maxNics: 8,
    estimatedMonthlyCost: 639.52,
    isSpotEligible: true,
    supportsPremiumStorage: true,
  },
};

// ============================================
// Right-Sizing Engine
// ============================================

/**
 * Generate right-sizing recommendation for a resource
 */
export function generateRightSizingRecommendation(
  utilization: ResourceUtilization,
  currentSku: VMSku
): RightSizingRecommendation | null {
  const utilizationStatus = getUtilizationStatus(
    utilization.cpuAverage,
    utilization.memoryAverage
  );
  
  // Solo recomendamos cambios si está underutilized o overutilized
  if (utilizationStatus === 'optimal' || utilizationStatus === 'high') {
    return null;
  }
  
  let recommendedSku: VMSku;
  let recommendationType: 'downsize' | 'upsize' | 'rightsize' | 'shutdown';
  let reason: string;
  let details: string;
  let impactLevel: 'low' | 'medium' | 'high';
  let confidence: 'low' | 'medium' | 'high';
  
  if (utilizationStatus === 'underutilized') {
    // CPU y Memory < 20% promedio
    if (utilization.cpuAverage < 5 && utilization.memoryAverage < 10) {
      // Casi sin uso - recomendar shutdown
      recommendationType = 'shutdown';
      recommendedSku = currentSku;
      reason = `Utilización extremadamente baja (CPU: ${utilization.cpuAverage.toFixed(1)}%, Memory: ${utilization.memoryAverage.toFixed(1)}%)`;
      details = `Esta VM ha estado prácticamente sin uso durante los últimos 7 días. Considera apagarla o eliminarla si no es necesaria.`;
      impactLevel = 'low';
      confidence = 'high';
    } else {
      // Underutilized - recomendar downsize
      recommendedSku = findSmallerSku(currentSku, utilization);
      recommendationType = 'downsize';
      reason = `Utilización baja sostenida (CPU: ${utilization.cpuAverage.toFixed(1)}%, Memory: ${utilization.memoryAverage.toFixed(1)}%)`;
      details = `Los datos de los últimos 7 días muestran que esta VM está sobredimensionada. Un SKU más pequeño sería suficiente.`;
      impactLevel = 'medium';
      confidence = 'high';
    }
  } else {
    // Overutilized - recomendar upsize
    recommendedSku = findLargerSku(currentSku, utilization);
    recommendationType = 'upsize';
    reason = `Utilización muy alta (CPU: ${utilization.cpuAverage.toFixed(1)}%, Memory: ${utilization.memoryAverage.toFixed(1)}%)`;
    details = `Esta VM está cerca de su límite de capacidad. Considera aumentar el SKU para evitar degradación de rendimiento.`;
    impactLevel = 'high';
    confidence = 'medium';
  }
  
  const monthlySavings = currentSku.estimatedMonthlyCost - recommendedSku.estimatedMonthlyCost;
  const savingsPercentage = (monthlySavings / currentSku.estimatedMonthlyCost) * 100;
  
  let actionRequired: string;
  if (recommendationType === 'shutdown') {
    actionRequired = `1. Verificar si la VM es necesaria\n2. Crear snapshot si es necesario\n3. Apagar o eliminar la VM\n4. Eliminar recursos asociados (discos, IPs)`;
  } else if (recommendationType === 'downsize') {
    actionRequired = `1. Programar ventana de mantenimiento\n2. Crear snapshot antes del cambio\n3. Cambiar SKU a ${recommendedSku.name}\n4. Validar rendimiento post-cambio`;
  } else {
    actionRequired = `1. Analizar picos de uso y tendencias\n2. Planificar aumento de capacidad\n3. Cambiar SKU a ${recommendedSku.name}\n4. Monitorear rendimiento mejorado`;
  }
  
  return {
    id: `rec-${utilization.resourceName}-${Date.now()}`,
    resourceId: utilization.resourceId,
    resourceName: utilization.resourceName,
    resourceType: utilization.resourceType,
    resourceGroup: utilization.resourceGroup,
    
    currentSku,
    currentUtilization: utilization,
    utilizationStatus,
    
    recommendedSku,
    recommendationType,
    
    monthlySavings,
    annualSavings: monthlySavings * 12,
    savingsPercentage,
    
    impactLevel,
    confidence,
    
    reason,
    details,
    actionRequired,
    
    generatedAt: new Date().toISOString(),
    priority: calculatePriority(monthlySavings, impactLevel, confidence),
  };
}

/**
 * Find smaller SKU for downsizing
 */
function findSmallerSku(currentSku: VMSku, utilization: ResourceUtilization): VMSku {
  // Buscar SKU con ~50% menos vCPUs pero en la misma familia
  const targetVCPUs = Math.max(1, Math.ceil(currentSku.vCPUs * 0.5));
  
  const candidates = Object.values(VM_SKU_DATABASE)
    .filter(sku => 
      sku.family === currentSku.family &&
      sku.vCPUs < currentSku.vCPUs &&
      sku.vCPUs >= targetVCPUs
    )
    .sort((a, b) => b.vCPUs - a.vCPUs); // Mayor primero
  
  return candidates[0] || VM_SKU_DATABASE['Standard_B2s'];
}

/**
 * Find larger SKU for upsizing
 */
function findLargerSku(currentSku: VMSku, utilization: ResourceUtilization): VMSku {
  // Buscar SKU con ~50% más vCPUs en la misma familia
  const targetVCPUs = currentSku.vCPUs * 1.5;
  
  const candidates = Object.values(VM_SKU_DATABASE)
    .filter(sku => 
      sku.family === currentSku.family &&
      sku.vCPUs > currentSku.vCPUs &&
      sku.vCPUs <= targetVCPUs * 1.2
    )
    .sort((a, b) => a.vCPUs - b.vCPUs); // Menor primero
  
  return candidates[0] || VM_SKU_DATABASE['Standard_D8s_v3'];
}

/**
 * Calculate recommendation priority (1-10)
 */
function calculatePriority(
  monthlySavings: number,
  impactLevel: 'low' | 'medium' | 'high',
  confidence: 'low' | 'medium' | 'high'
): number {
  let priority = 5; // Base
  
  // Savings contribution (0-4 points)
  if (monthlySavings > 200) priority += 4;
  else if (monthlySavings > 100) priority += 3;
  else if (monthlySavings > 50) priority += 2;
  else if (monthlySavings > 20) priority += 1;
  
  // Confidence contribution (0-3 points)
  if (confidence === 'high') priority += 3;
  else if (confidence === 'medium') priority += 2;
  else priority += 1;
  
  // Impact adjustment (-2 to +2 points)
  if (impactLevel === 'low') priority += 2; // Easy wins
  else if (impactLevel === 'high') priority -= 2; // More risk
  
  return Math.max(1, Math.min(10, priority));
}

// ============================================
// Reserved Instance Engine
// ============================================

/**
 * Analyze Reserved Instance coverage
 */
export function analyzeReservedInstanceCoverage(
  utilizations: ResourceUtilization[]
): ReservedInstanceCoverage {
  // Por ahora, asumimos que todas las VMs son On-Demand
  // En producción, consultaríamos Azure RI API
  
  const totalVMs = utilizations.length;
  const reservedVMs = 0; // TODO: Query Azure RI API
  const onDemandVMs = totalVMs - reservedVMs;
  
  const totalMonthlyCost = utilizations.reduce((sum, u) => sum + u.monthlyCost, 0);
  const onDemandCost = totalMonthlyCost;
  const reservedInstanceCost = 0;
  
  // Estimación: 30% savings con RI
  const potentialMonthlySavings = onDemandCost * 0.30;
  const potentialAnnualSavings = potentialMonthlySavings * 12;
  
  return {
    subscriptionId: 'current',
    subscriptionName: 'Current Subscription',
    totalVMs,
    reservedVMs,
    onDemandVMs,
    coveragePercentage: (reservedVMs / totalVMs) * 100,
    totalMonthlyCost,
    reservedInstanceCost,
    onDemandCost,
    potentialMonthlySavings,
    potentialAnnualSavings,
    recommendedRICount: Math.floor(totalVMs * 0.7), // Recomendar 70% coverage
  };
}

/**
 * Generate Reserved Instance recommendations
 */
export function generateRIRecommendations(
  utilizations: ResourceUtilization[]
): ReservedInstanceRecommendation[] {
  // Agrupar por SKU y location
  const groupedBySkuLocation = new Map<string, ResourceUtilization[]>();
  
  utilizations.forEach(u => {
    const key = `${u.sku}:${u.location}`;
    if (!groupedBySkuLocation.has(key)) {
      groupedBySkuLocation.set(key, []);
    }
    groupedBySkuLocation.get(key)!.push(u);
  });
  
  const recommendations: ReservedInstanceRecommendation[] = [];
  
  groupedBySkuLocation.forEach((vms, key) => {
    const [sku, location] = key.split(':');
    const quantity = vms.length;
    
    // Solo recomendar RI si hay al menos 2 VMs del mismo tipo
    if (quantity < 2) return;
    
    const vmSku = VM_SKU_DATABASE[sku] || VM_SKU_DATABASE['Standard_D2s_v3'];
    const onDemandMonthlyCost = vmSku.estimatedMonthlyCost * quantity;
    
    // RI savings: 30% for 1-year, 50% for 3-year
    const recommendations1Year = {
      id: `ri-${sku}-${location}-1y-${Date.now()}`,
      vmSize: sku,
      location,
      quantity,
      term: '1year' as const,
      paymentOption: 'monthly' as const,
      onDemandMonthlyCost,
      reservedMonthlyCost: onDemandMonthlyCost * 0.70,
      monthlySavings: onDemandMonthlyCost * 0.30,
      totalSavingsOverTerm: onDemandMonthlyCost * 0.30 * 12,
      savingsPercentage: 30,
      breakEvenMonths: 3,
      utilizationPattern: 'stable' as const,
      confidence: 'high' as const,
      reason: `${quantity} VMs del mismo tipo ejecutándose de forma continua. RI de 1 año reduce costos un 30%.`,
    };
    
    const recommendations3Year = {
      ...recommendations1Year,
      id: `ri-${sku}-${location}-3y-${Date.now()}`,
      term: '3year' as const,
      reservedMonthlyCost: onDemandMonthlyCost * 0.50,
      monthlySavings: onDemandMonthlyCost * 0.50,
      totalSavingsOverTerm: onDemandMonthlyCost * 0.50 * 36,
      savingsPercentage: 50,
      breakEvenMonths: 6,
      reason: `${quantity} VMs del mismo tipo ejecutándose de forma continua. RI de 3 años reduce costos un 50%.`,
    };
    
    recommendations.push(recommendations1Year, recommendations3Year);
  });
  
  return recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);
}

// ============================================
// Spot Instance Engine
// ============================================

/**
 * Analyze Spot Instance eligibility
 */
export function analyzeSpotEligibility(
  utilization: ResourceUtilization
): SpotInstanceEligibility {
  const currentSku = VM_SKU_DATABASE[utilization.sku] || VM_SKU_DATABASE['Standard_D2s_v3'];
  
  // Determinar tipo de workload basado en naming convention y resource group
  const rgLower = utilization.resourceGroup.toLowerCase();
  const nameLower = utilization.resourceName.toLowerCase();
  
  let workloadType: 'production' | 'development' | 'testing' | 'batch' | 'unknown' = 'unknown';
  let interruptionTolerance: 'high' | 'medium' | 'low' | 'none' = 'none';
  
  if (rgLower.includes('dev') || nameLower.includes('dev')) {
    workloadType = 'development';
    interruptionTolerance = 'high';
  } else if (rgLower.includes('test') || nameLower.includes('test')) {
    workloadType = 'testing';
    interruptionTolerance = 'high';
  } else if (nameLower.includes('batch') || nameLower.includes('worker')) {
    workloadType = 'batch';
    interruptionTolerance = 'medium';
  } else if (rgLower.includes('prod') || nameLower.includes('prod')) {
    workloadType = 'production';
    interruptionTolerance = 'none';
  }
  
  const isEligible = currentSku.isSpotEligible && interruptionTolerance !== 'none';
  
  // Spot savings: 70-90% typical
  const spotSavingsPercentage = 75;
  const currentMonthlyCost = currentSku.estimatedMonthlyCost;
  const spotMonthlyCost = currentMonthlyCost * (1 - spotSavingsPercentage / 100);
  const monthlySavings = currentMonthlyCost - spotMonthlyCost;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (workloadType === 'batch' || workloadType === 'testing') riskLevel = 'low';
  if (workloadType === 'production') riskLevel = 'high';
  
  let reason = '';
  let recommendation = '';
  
  if (isEligible) {
    reason = `Workload tipo '${workloadType}' con tolerancia ${interruptionTolerance} a interrupciones. Spot puede ahorrar hasta ${spotSavingsPercentage}%.`;
    recommendation = `Migrar a Spot VM con políticas de re-start automático. Configurar health checks y auto-scaling.`;
  } else if (!currentSku.isSpotEligible) {
    reason = `SKU ${currentSku.name} no soporta Spot instances.`;
    recommendation = `Este SKU no es elegible para Spot. Considera otro SKU de la familia.`;
  } else {
    reason = `Workload de producción crítica. No recomendado para Spot debido a riesgo de interrupción.`;
    recommendation = `Mantener On-Demand o considerar Reserved Instances para ahorros sin riesgo.`;
  }
  
  return {
    resourceId: utilization.resourceId,
    resourceName: utilization.resourceName,
    currentSku: currentSku.name,
    isEligible,
    workloadType,
    interruptionTolerance,
    currentMonthlyCost,
    spotMonthlyCost,
    monthlySavings: isEligible ? monthlySavings : 0,
    savingsPercentage: isEligible ? spotSavingsPercentage : 0,
    riskLevel,
    evictionRate: 5, // Historical ~5% eviction rate (simulado)
    reason,
    recommendation,
  };
}

// ============================================
// Summary Generator
// ============================================

/**
 * Generate Cost Optimizer Summary
 */
export function generateOptimizerSummary(
  utilizations: ResourceUtilization[],
  rightsizingRecs: RightSizingRecommendation[],
  riRecs: ReservedInstanceRecommendation[],
  spotRecs: SpotInstanceEligibility[]
): CostOptimizerSummary {
  // Count by utilization status
  const underutilizedCount = utilizations.filter(u => 
    getUtilizationStatus(u.cpuAverage, u.memoryAverage) === 'underutilized'
  ).length;
  
  const optimalCount = utilizations.filter(u => {
    const status = getUtilizationStatus(u.cpuAverage, u.memoryAverage);
    return status === 'optimal' || status === 'high';
  }).length;
  
  const overutilizedCount = utilizations.filter(u => 
    getUtilizationStatus(u.cpuAverage, u.memoryAverage) === 'overutilized'
  ).length;
  
  // Calculate savings
  const savingsFromRightSizing = rightsizingRecs.reduce((sum, r) => sum + Math.max(0, r.monthlySavings), 0);
  const savingsFromReservedInstances = Math.max(...riRecs.map(r => r.monthlySavings), 0);
  const savingsFromSpotInstances = spotRecs.filter(s => s.isEligible).reduce((sum, s) => sum + s.monthlySavings, 0);
  
  const totalMonthlySavings = savingsFromRightSizing + savingsFromReservedInstances + savingsFromSpotInstances;
  
  // Optimization score (0-100)
  const optimalPercentage = (optimalCount / utilizations.length) * 100;
  const optimizationScore = Math.round(optimalPercentage);
  
  return {
    analysisDate: new Date().toISOString(),
    resourcesAnalyzed: utilizations.length,
    underutilizedCount,
    optimalCount,
    highUtilizationCount: 0, // Included in optimalCount
    overutilizedCount,
    rightsizingRecommendations: rightsizingRecs.length,
    reservedInstanceRecommendations: riRecs.length,
    spotInstanceOpportunities: spotRecs.filter(s => s.isEligible).length,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    savingsFromRightSizing,
    savingsFromReservedInstances,
    savingsFromSpotInstances,
    optimizationScore,
    currency: 'EUR',
  };
}

/**
 * Get or create VM SKU
 */
export function getVMSku(skuName: string): VMSku {
  return VM_SKU_DATABASE[skuName] || {
    name: skuName,
    tier: 'Standard',
    size: skuName,
    family: 'unknown',
    vCPUs: 2,
    memoryGB: 8,
    maxDataDisks: 4,
    maxNics: 2,
    estimatedMonthlyCost: 100,
    isSpotEligible: true,
    supportsPremiumStorage: false,
  };
}
