/**
 * Rate Optimization Engine
 * 
 * Advanced pricing analysis and commitment optimization
 * Savings Plans, Reserved Instances comparison, ROI calculator
 */

import type {
  SavingsPlanRecommendation,
  RIvsSavingsPlanComparison,
  ROIAnalysis,
  BreakEvenChart,
  CommitmentPortfolio,
  SpotPricingHistory,
  SpotFleetRecommendation,
  RateOptimizationSummary,
} from './rate-optimization-types';

import type { ResourceUtilization } from './optimizer-types';
import { getUtilizationStatus } from './azure-monitor-service';

// ============================================
// Savings Plans Engine
// ============================================

/**
 * Generate Savings Plan recommendations based on usage patterns
 */
export function generateSavingsPlanRecommendations(
  utilizations: ResourceUtilization[]
): SavingsPlanRecommendation[] {
  const recommendations: SavingsPlanRecommendation[] = [];
  
  // Calculate total compute spend
  const totalMonthlyCost = utilizations.reduce((sum, u) => sum + u.monthlyCost, 0);
  
  // Recommend Savings Plan if monthly cost > €500
  if (totalMonthlyCost < 500) {
    return [];
  }
  
  // Analyze usage stability (last 7 days avg should be representative)
  const stableUsage = utilizations.filter(u => {
    const status = getUtilizationStatus(u.cpuAverage, u.memoryAverage);
    return status === 'optimal' || status === 'high';
  });
  
  const stableMonthlyCost = stableUsage.reduce((sum, u) => sum + u.monthlyCost, 0);
  
  // 1-Year Compute Savings Plan
  const hourlyCommitment1y = (stableMonthlyCost * 0.7) / 730; // 70% coverage, 730 hours/month
  const rec1y: SavingsPlanRecommendation = {
    id: `sp-compute-1y-${Date.now()}`,
    planType: 'Compute',
    term: '1year',
    paymentOption: 'NoUpfront',
    
    currentMonthlyCost: stableMonthlyCost,
    currentAnnualCost: stableMonthlyCost * 12,
    
    hourlyCommitment: hourlyCommitment1y,
    monthlyCommitment: hourlyCommitment1y * 730,
    estimatedCoverage: 70,
    
    monthlySavings: stableMonthlyCost * 0.17,        // 17% savings typical
    annualSavings: stableMonthlyCost * 0.17 * 12,
    totalSavingsOverTerm: stableMonthlyCost * 0.17 * 12,
    savingsPercentage: 17,
    
    upfrontCost: 0,
    breakEvenMonths: 2,
    roi: 204,                                        // (savings / commitment) * 100
    netPresentValue: stableMonthlyCost * 0.17 * 11.5, // Discounted
    
    utilizationRisk: 'low',
    confidenceLevel: 'high',
    
    reason: `Stable usage pattern identified. Compute Savings Plan covers VMs, App Service, Container Instances.`,
    recommendation: `Commit to €${(hourlyCommitment1y * 730).toFixed(2)}/month for 17% savings. Flexible across instance families and regions.`,
  };
  
  // 3-Year Compute Savings Plan
  const hourlyCommitment3y = (stableMonthlyCost * 0.7) / 730;
  const rec3y: SavingsPlanRecommendation = {
    id: `sp-compute-3y-${Date.now()}`,
    planType: 'Compute',
    term: '3year',
    paymentOption: 'NoUpfront',
    
    currentMonthlyCost: stableMonthlyCost,
    currentAnnualCost: stableMonthlyCost * 12,
    
    hourlyCommitment: hourlyCommitment3y,
    monthlyCommitment: hourlyCommitment3y * 730,
    estimatedCoverage: 70,
    
    monthlySavings: stableMonthlyCost * 0.28,        // 28% savings typical
    annualSavings: stableMonthlyCost * 0.28 * 12,
    totalSavingsOverTerm: stableMonthlyCost * 0.28 * 36,
    savingsPercentage: 28,
    
    upfrontCost: 0,
    breakEvenMonths: 3,
    roi: 336,                                        // Over 3 years
    netPresentValue: stableMonthlyCost * 0.28 * 32,  // Discounted
    
    utilizationRisk: 'medium',
    confidenceLevel: 'high',
    
    reason: `Long-term stable workload. 3-year commitment offers maximum savings.`,
    recommendation: `Commit to €${(hourlyCommitment3y * 730).toFixed(2)}/month for 3 years = 28% savings.`,
  };
  
  recommendations.push(rec1y, rec3y);
  
  return recommendations;
}

// ============================================
// RI vs Savings Plan Comparison
// ============================================

/**
 * Compare Reserved Instances vs Savings Plans for each resource type
 */
export function compareRIvsSavingsPlans(
  utilizations: ResourceUtilization[]
): RIvsSavingsPlanComparison[] {
  const comparisons: RIvsSavingsPlanComparison[] = [];
  
  // Group by SKU family (e.g., "D-series", "E-series")
  const groupedByFamily = new Map<string, ResourceUtilization[]>();
  
  utilizations.forEach(u => {
    const family = extractVMFamily(u.sku);
    if (!groupedByFamily.has(family)) {
      groupedByFamily.set(family, []);
    }
    groupedByFamily.get(family)!.push(u);
  });
  
  groupedByFamily.forEach((vms, family) => {
    const totalCost = vms.reduce((sum, v) => sum + v.monthlyCost, 0);
    
    if (totalCost < 100) return; // Skip small families
    
    const comparison: RIvsSavingsPlanComparison = {
      resourceType: `${family} VM Family`,
      currentMonthlyCost: totalCost,
      
      riOption: {
        term: '3year',
        monthlyCost: totalCost * 0.50,           // 50% discount
        monthlySavings: totalCost * 0.50,
        savingsPercentage: 50,
        flexibility: 'low',
        breakEvenMonths: 6,
      },
      
      savingsPlanOption: {
        term: '3year',
        monthlyCost: totalCost * 0.72,           // 28% discount
        monthlySavings: totalCost * 0.28,
        savingsPercentage: 28,
        flexibility: 'high',
        breakEvenMonths: 3,
      },
      
      recommendedOption: 'SavingsPlan',
      reason: 'Savings Plan offers better flexibility with only 22% less savings. Allows SKU changes within family.',
    };
    
    // If savings difference is huge (>30%), recommend RI
    if (comparison.riOption.monthlySavings - comparison.savingsPlanOption.monthlySavings > totalCost * 0.30) {
      comparison.recommendedOption = 'ReservedInstance';
      comparison.reason = 'Reserved Instance offers significantly higher savings (50% vs 28%). Worth the reduced flexibility.';
    }
    
    comparisons.push(comparison);
  });
  
  return comparisons;
}

function extractVMFamily(sku: string): string {
  // Extract family from SKU name (e.g., "Standard_D4s_v3" -> "D-series")
  if (sku.includes('_D')) return 'D-series';
  if (sku.includes('_E')) return 'E-series';
  if (sku.includes('_F')) return 'F-series';
  if (sku.includes('_B')) return 'B-series';
  return 'Other';
}

// ============================================
// ROI Analysis Engine
// ============================================

/**
 * Calculate detailed ROI analysis for a commitment
 */
export function calculateROI(
  investmentType: 'ReservedInstance' | 'SavingsPlan' | 'Spot',
  term: '1year' | '3year',
  upfrontCost: number,
  monthlyCommitment: number,
  monthlySavings: number
): ROIAnalysis {
  const termMonths = term === '1year' ? 12 : 36;
  const totalInvestment = upfrontCost + (monthlyCommitment * termMonths);
  const totalSavings = monthlySavings * termMonths;
  
  // ROI = (Total Savings - Total Investment) / Total Investment * 100
  const roi = ((totalSavings - totalInvestment) / totalInvestment) * 100;
  
  // Payback period (months to break even)
  let paybackPeriod = 0;
  let cumulativeSavings = 0;
  const monthlyBreakdown: ROIAnalysis['monthlyBreakdown'] = [];
  
  for (let month = 1; month <= termMonths; month++) {
    cumulativeSavings += monthlySavings;
    const breakEvenReached = cumulativeSavings >= upfrontCost;
    
    if (paybackPeriod === 0 && breakEvenReached) {
      paybackPeriod = month;
    }
    
    monthlyBreakdown.push({
      month,
      cumulativeSavings,
      breakEvenReached,
    });
  }
  
  // NPV calculation (5% discount rate)
  const discountRate = 0.05 / 12; // Monthly
  let npv = -upfrontCost;
  for (let month = 1; month <= termMonths; month++) {
    npv += monthlySavings / Math.pow(1 + discountRate, month);
  }
  
  // IRR calculation (simplified)
  const irr = (Math.pow(totalSavings / totalInvestment, 1 / termMonths) - 1) * 12 * 100;
  
  return {
    investmentType,
    term,
    upfrontCost,
    monthlyCommitment,
    totalInvestment,
    monthlySavings,
    totalSavings,
    roi,
    paybackPeriod,
    netPresentValue: npv,
    internalRateOfReturn: irr,
    monthlyBreakdown,
  };
}

// ============================================
// Break-Even Chart Data
// ============================================

/**
 * Generate break-even chart data for visualization
 */
export function generateBreakEvenChart(
  onDemandMonthlyCost: number,
  riMonthlyCost: number,
  riUpfront: number,
  spMonthlyCost: number,
  spotMonthlyCost: number,
  termMonths: number = 36
): BreakEvenChart {
  const months: number[] = [];
  const onDemandCost: number[] = [];
  const reservedCost: number[] = [];
  const savingsPlanCost: number[] = [];
  const spotCost: number[] = [];
  
  let riBreakEven = 0;
  let spBreakEven = 0;
  let spotBreakEven = 0;
  
  for (let month = 0; month <= termMonths; month++) {
    months.push(month);
    onDemandCost.push(onDemandMonthlyCost * month);
    reservedCost.push(riUpfront + (riMonthlyCost * month));
    savingsPlanCost.push(spMonthlyCost * month);
    spotCost.push(spotMonthlyCost * month);
    
    // Find break-even points
    if (riBreakEven === 0 && reservedCost[month] <= onDemandCost[month]) {
      riBreakEven = month;
    }
    if (spBreakEven === 0 && savingsPlanCost[month] <= onDemandCost[month]) {
      spBreakEven = month;
    }
    if (spotBreakEven === 0 && spotCost[month] <= onDemandCost[month]) {
      spotBreakEven = month;
    }
  }
  
  return {
    months,
    onDemandCost,
    reservedCost,
    savingsPlanCost,
    spotCost,
    breakEvenPoints: {
      reserved: riBreakEven,
      savingsPlan: spBreakEven,
      spot: spotBreakEven,
    },
  };
}

// ============================================
// Commitment Portfolio Optimizer
// ============================================

/**
 * Optimize commitment portfolio for maximum savings
 */
export function optimizeCommitmentPortfolio(
  utilizations: ResourceUtilization[]
): CommitmentPortfolio {
  const totalMonthlyCost = utilizations.reduce((sum, u) => sum + u.monthlyCost, 0);
  
  // Current state (simulated - in reality, query Azure)
  const currentCommitments = {
    reservedInstances: totalMonthlyCost * 0.10,  // 10% currently on RI
    savingsPlans: 0,                              // 0% on SP
    total: totalMonthlyCost * 0.10,
  };
  
  const onDemandCost = totalMonthlyCost - currentCommitments.total;
  const onDemandPercentage = (onDemandCost / totalMonthlyCost) * 100;
  
  // Recommended portfolio: 70% commitment
  // Strategy: 40% Savings Plans (flexible) + 30% Reserved Instances (max savings)
  const recommendedCommitments = {
    savingsPlans: totalMonthlyCost * 0.40 * 0.72,      // 40% coverage at 28% discount
    reservedInstances: totalMonthlyCost * 0.30 * 0.50, // 30% coverage at 50% discount
    total: 0,
  };
  recommendedCommitments.total = recommendedCommitments.savingsPlans + recommendedCommitments.reservedInstances;
  
  // Calculate savings
  const currentSavings = (totalMonthlyCost * 0.10) * 0.50; // 10% RI at 50% discount
  const recommendedSavingsRI = (totalMonthlyCost * 0.30) * 0.50;
  const recommendedSavingsSP = (totalMonthlyCost * 0.40) * 0.28;
  const totalRecommendedSavings = recommendedSavingsRI + recommendedSavingsSP;
  
  const potentialSavings = totalRecommendedSavings - currentSavings;
  
  return {
    totalMonthlyCost,
    currentCommitments,
    onDemandCost,
    onDemandPercentage,
    recommendedCommitments,
    potentialSavings,
    targetCoveragePercentage: 70,
    currentCoveragePercentage: 10,
  };
}

// ============================================
// Spot Pricing Analysis
// ============================================

/**
 * Analyze Spot pricing history and volatility
 */
export function analyzeSpotPricing(
  sku: string,
  location: string,
  onDemandPrice: number
): SpotPricingHistory {
  // Simulated data - in reality, query Azure Spot pricing API
  const averageSpotPrice = onDemandPrice * 0.25;  // 75% average discount
  const minSpotPrice = onDemandPrice * 0.10;      // Best case: 90% discount
  const maxSpotPrice = onDemandPrice * 0.60;      // Worst case: 40% discount
  const currentSpotPrice = onDemandPrice * 0.20;  // Current: 80% discount
  
  const averageSavingsPercentage = 75;
  const currentSavingsPercentage = 80;
  
  // Volatility based on price range
  const priceRange = maxSpotPrice - minSpotPrice;
  const volatilityRatio = priceRange / averageSpotPrice;
  
  let priceVolatility: 'low' | 'medium' | 'high';
  if (volatilityRatio < 1) priceVolatility = 'low';
  else if (volatilityRatio < 2) priceVolatility = 'medium';
  else priceVolatility = 'high';
  
  // Eviction rate (simulated)
  const evictionRate = priceVolatility === 'low' ? 2 : 
                       priceVolatility === 'medium' ? 5 : 10;
  
  const isRecommended = priceVolatility !== 'high' && averageSavingsPercentage > 60;
  const maxBidPrice = averageSpotPrice * 1.5; // Bid 50% above average
  
  return {
    sku,
    location,
    averageSpotPrice,
    minSpotPrice,
    maxSpotPrice,
    currentSpotPrice,
    onDemandPrice,
    averageSavingsPercentage,
    currentSavingsPercentage,
    priceVolatility,
    evictionRate,
    isRecommended,
    maxBidPrice,
    reason: isRecommended 
      ? `Spot pricing is stable (${priceVolatility} volatility) with ${averageSavingsPercentage}% average savings.`
      : `High price volatility detected. Consider Reserved Instances instead.`,
  };
}

// ============================================
// Spot Fleet Optimizer
// ============================================

/**
 * Recommend optimal Spot + On-Demand mix
 */
export function optimizeSpotFleet(
  workloadName: string,
  currentCost: number,
  availabilityRequirement: number = 99.5
): SpotFleetRecommendation {
  // Strategy: 80% Spot + 20% On-Demand for high availability
  const spotPercentage = 80;
  const onDemandPercentage = 20;
  
  const spotMonthlyCost = (currentCost * spotPercentage / 100) * 0.25;  // 75% discount
  const onDemandMonthlyCost = currentCost * onDemandPercentage / 100;
  
  const totalNewCost = spotMonthlyCost + onDemandMonthlyCost;
  const totalSavings = currentCost - totalNewCost;
  const savingsPercentage = (totalSavings / currentCost) * 100;
  
  // With 80/20 mix and diversification, estimated availability: 99.7%
  const estimatedAvailability = 99.7;
  
  return {
    workloadName,
    currentCost,
    recommendedMix: {
      onDemand: {
        percentage: onDemandPercentage,
        monthlyCost: onDemandMonthlyCost,
      },
      spot: {
        percentage: spotPercentage,
        monthlyCost: spotMonthlyCost,
        expectedSavings: currentCost * spotPercentage / 100 * 0.75,
      },
    },
    skuDiversification: {
      primary: 'Standard_D4s_v3',
      fallback1: 'Standard_D4as_v4',
      fallback2: 'Standard_E4s_v3',
    },
    totalMonthlySavings: totalSavings,
    savingsPercentage,
    availabilityTarget: availabilityRequirement,
    estimatedAvailability,
  };
}

// ============================================
// Summary Generator
// ============================================

/**
 * Generate Rate Optimization summary
 */
export function generateRateOptimizationSummary(
  utilizations: ResourceUtilization[],
  savingsPlanRecs: SavingsPlanRecommendation[],
  riRecs: any[],
  spotRecs: any[]
): RateOptimizationSummary {
  const totalMonthlyCost = utilizations.reduce((sum, u) => sum + u.monthlyCost, 0);
  
  // Calculate savings
  const savingsFromSP = Math.max(...savingsPlanRecs.map(r => r.monthlySavings), 0);
  const savingsFromRI = riRecs.reduce((sum, r) => sum + r.monthlySavings, 0);
  const savingsFromSpot = spotRecs.filter((s: any) => s.isEligible)
    .reduce((sum: number, s: any) => sum + s.monthlySavings, 0);
  
  const totalMonthlySavings = savingsFromSP + savingsFromRI + savingsFromSpot;
  
  // ROI metrics
  const avgROI = savingsPlanRecs.length > 0 
    ? savingsPlanRecs.reduce((sum, r) => sum + r.roi, 0) / savingsPlanRecs.length
    : 0;
  
  const avgPayback = savingsPlanRecs.length > 0
    ? savingsPlanRecs.reduce((sum, r) => sum + r.breakEvenMonths, 0) / savingsPlanRecs.length
    : 0;
  
  // Priority actions
  const allSavings = [
    ...savingsPlanRecs.map(r => r.monthlySavings),
    ...riRecs.map(r => r.monthlySavings),
    ...spotRecs.filter((s: any) => s.isEligible).map((s: any) => s.monthlySavings),
  ];
  
  const highPriority = allSavings.filter(s => s > 500).length;
  const mediumPriority = allSavings.filter(s => s >= 100 && s <= 500).length;
  const lowPriority = allSavings.filter(s => s < 100).length;
  
  return {
    analysisDate: new Date().toISOString(),
    totalMonthlyCost,
    currentCommitmentCoverage: 10, // Simulated
    onDemandPercentage: 90,
    
    reservedInstanceOpportunities: riRecs.length,
    savingsPlanOpportunities: savingsPlanRecs.length,
    spotOpportunities: spotRecs.filter((s: any) => s.isEligible).length,
    
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    savingsFromRI,
    savingsFromSavingsPlans: savingsFromSP,
    savingsFromSpot,
    
    averageROI: avgROI,
    averagePaybackPeriod: avgPayback,
    
    highPriorityActions: highPriority,
    mediumPriorityActions: mediumPriority,
    lowPriorityActions: lowPriority,
  };
}
