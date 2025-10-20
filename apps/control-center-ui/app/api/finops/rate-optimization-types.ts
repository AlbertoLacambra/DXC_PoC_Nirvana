/**
 * Rate Optimization Module - Types
 * 
 * Advanced pricing analysis: Reserved Instances, Savings Plans, Spot Instances
 * ROI calculation, break-even analysis, commitment optimization
 * 
 * Part of Microsoft FinOps Toolkit
 */

// ============================================
// Savings Plans Types
// ============================================

export type SavingsPlanType = 'Compute' | 'EC2Instance' | 'SageMaker';
export type SavingsPlanTerm = '1year' | '3year';
export type SavingsPlanPayment = 'NoUpfront' | 'PartialUpfront' | 'AllUpfront';

export interface SavingsPlan {
  id: string;
  type: SavingsPlanType;
  term: SavingsPlanTerm;
  paymentOption: SavingsPlanPayment;
  hourlyCommitment: number;              // $/hour
  monthlyCommitment: number;             // Monthly equivalent
  coveragePercentage: number;            // % of usage covered
  utilizationPercentage: number;         // % of commitment utilized
  monthlySavings: number;
  annualSavings: number;
  breakEvenMonths: number;
  effectiveDiscount: number;             // % effective discount
}

export interface SavingsPlanRecommendation {
  id: string;
  planType: SavingsPlanType;
  term: SavingsPlanTerm;
  paymentOption: SavingsPlanPayment;
  
  // Current state
  currentMonthlyCost: number;
  currentAnnualCost: number;
  
  // With Savings Plan
  hourlyCommitment: number;
  monthlyCommitment: number;
  estimatedCoverage: number;             // % of usage covered
  
  // Savings
  monthlySavings: number;
  annualSavings: number;
  totalSavingsOverTerm: number;
  savingsPercentage: number;
  
  // ROI Analysis
  upfrontCost: number;
  breakEvenMonths: number;
  roi: number;                           // Return on Investment %
  netPresentValue: number;               // NPV of savings
  
  // Risk assessment
  utilizationRisk: 'low' | 'medium' | 'high';
  confidenceLevel: 'low' | 'medium' | 'high';
  
  reason: string;
  recommendation: string;
}

// ============================================
// Reserved Instances vs Savings Plans
// ============================================

export interface RIvsSavingsPlanComparison {
  resourceType: string;                  // VM family or service
  currentMonthlyCost: number;
  
  // Reserved Instance option
  riOption: {
    term: '1year' | '3year';
    monthlyCost: number;
    monthlySavings: number;
    savingsPercentage: number;
    flexibility: 'low';                  // Specific SKU
    breakEvenMonths: number;
  };
  
  // Savings Plan option
  savingsPlanOption: {
    term: '1year' | '3year';
    monthlyCost: number;
    monthlySavings: number;
    savingsPercentage: number;
    flexibility: 'high';                 // Any SKU in family
    breakEvenMonths: number;
  };
  
  // Recommendation
  recommendedOption: 'ReservedInstance' | 'SavingsPlan' | 'OnDemand';
  reason: string;
}

// ============================================
// ROI & Break-Even Analysis
// ============================================

export interface ROIAnalysis {
  investmentType: 'ReservedInstance' | 'SavingsPlan' | 'Spot';
  term: '1year' | '3year';
  
  // Investment
  upfrontCost: number;
  monthlyCommitment: number;
  totalInvestment: number;               // Over term
  
  // Returns
  monthlySavings: number;
  totalSavings: number;                  // Over term
  
  // Metrics
  roi: number;                           // % return on investment
  paybackPeriod: number;                 // Months to break even
  netPresentValue: number;               // NPV at 5% discount rate
  internalRateOfReturn: number;          // IRR %
  
  // Cash flow
  monthlyBreakdown: {
    month: number;
    cumulativeSavings: number;
    breakEvenReached: boolean;
  }[];
}

export interface BreakEvenChart {
  months: number[];                      // [1, 2, 3, ..., 36]
  onDemandCost: number[];               // Cumulative
  reservedCost: number[];               // Cumulative
  savingsPlanCost: number[];            // Cumulative
  spotCost: number[];                   // Cumulative
  breakEvenPoints: {
    reserved: number;                   // Month number
    savingsPlan: number;
    spot: number;
  };
}

// ============================================
// Commitment Optimization
// ============================================

export interface CommitmentPortfolio {
  totalMonthlyCost: number;
  
  // Current commitments
  currentCommitments: {
    reservedInstances: number;          // Monthly cost
    savingsPlans: number;
    total: number;
  };
  
  // On-Demand exposure
  onDemandCost: number;
  onDemandPercentage: number;
  
  // Optimization opportunity
  recommendedCommitments: {
    reservedInstances: number;
    savingsPlans: number;
    total: number;
  };
  
  potentialSavings: number;
  targetCoveragePercentage: number;      // Target: 70%
  currentCoveragePercentage: number;
}

// ============================================
// Spot Instance Enhanced Analysis
// ============================================

export interface SpotPricingHistory {
  sku: string;
  location: string;
  
  // Historical data (last 30 days)
  averageSpotPrice: number;
  minSpotPrice: number;
  maxSpotPrice: number;
  currentSpotPrice: number;
  onDemandPrice: number;
  
  // Savings analysis
  averageSavingsPercentage: number;
  currentSavingsPercentage: number;
  
  // Volatility
  priceVolatility: 'low' | 'medium' | 'high';
  evictionRate: number;                  // % evictions per month
  
  // Recommendation
  isRecommended: boolean;
  maxBidPrice: number;                   // Recommended max bid
  reason: string;
}

export interface SpotFleetRecommendation {
  workloadName: string;
  currentCost: number;                   // All On-Demand
  
  // Recommended mix
  recommendedMix: {
    onDemand: {
      percentage: number;
      monthlyCost: number;
    };
    spot: {
      percentage: number;
      monthlyCost: number;
      expectedSavings: number;
    };
  };
  
  // Diversification strategy
  skuDiversification: {
    primary: string;
    fallback1: string;
    fallback2: string;
  };
  
  totalMonthlySavings: number;
  savingsPercentage: number;
  availabilityTarget: number;            // 99.5%
  estimatedAvailability: number;         // 99.7%
}

// ============================================
// Rate Optimization Summary
// ============================================

export interface RateOptimizationSummary {
  analysisDate: string;
  
  // Current state
  totalMonthlyCost: number;
  currentCommitmentCoverage: number;     // %
  onDemandPercentage: number;
  
  // Opportunities
  reservedInstanceOpportunities: number;
  savingsPlanOpportunities: number;
  spotOpportunities: number;
  
  // Potential savings
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsFromRI: number;
  savingsFromSavingsPlans: number;
  savingsFromSpot: number;
  
  // ROI metrics
  averageROI: number;
  averagePaybackPeriod: number;          // months
  
  // Recommendations priority
  highPriorityActions: number;           // >$500/month savings
  mediumPriorityActions: number;         // $100-500/month
  lowPriorityActions: number;            // <$100/month
}

// ============================================
// Main Response
// ============================================

export interface RateOptimizationResponse {
  success: boolean;
  summary: RateOptimizationSummary;
  
  // Reserved Instances (from Cost Optimizer)
  reservedInstanceRecommendations: any[];
  
  // Savings Plans (new)
  savingsPlanRecommendations: SavingsPlanRecommendation[];
  
  // Comparisons
  riVsSavingsPlans: RIvsSavingsPlanComparison[];
  
  // ROI Analysis
  roiAnalysis: ROIAnalysis[];
  breakEvenChart: BreakEvenChart;
  
  // Commitment Portfolio
  commitmentPortfolio: CommitmentPortfolio;
  
  // Spot Enhanced
  spotPricingHistory: SpotPricingHistory[];
  spotFleetRecommendations: SpotFleetRecommendation[];
  
  error?: string;
}
