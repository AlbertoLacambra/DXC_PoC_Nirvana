/**
 * FinOps Toolkit - Cost Optimizer Types
 * 
 * Types for Azure Monitor metrics, resource utilization analysis,
 * right-sizing recommendations, and Reserved Instance optimization
 * 
 * Based on Microsoft FinOps Toolkit:
 * https://microsoft.github.io/finops-toolkit/
 */

// ============================================
// Azure Monitor Metrics
// ============================================

/**
 * Azure Monitor Metric Types
 */
export type AzureMetricName = 
  | 'Percentage CPU'
  | 'Available Memory Bytes'
  | 'Network In Total'
  | 'Network Out Total'
  | 'Disk Read Bytes'
  | 'Disk Write Bytes'
  | 'OS Disk Queue Depth'
  | 'Data Disk Queue Depth';

/**
 * Time aggregation for metrics
 */
export type MetricAggregation = 'Average' | 'Minimum' | 'Maximum' | 'Total' | 'Count';

/**
 * Azure Monitor Metric Data Point
 */
export interface MetricDataPoint {
  timestamp: string;
  average?: number;
  minimum?: number;
  maximum?: number;
  total?: number;
  count?: number;
}

/**
 * Azure Monitor Metric Result
 */
export interface AzureMetric {
  name: AzureMetricName;
  unit: string; // 'Percent', 'Bytes', 'BytesPerSecond', etc.
  timeseries: Array<{
    data: MetricDataPoint[];
  }>;
}

// ============================================
// Resource Utilization
// ============================================

/**
 * Resource Utilization Metrics (last 7 days average)
 */
export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: string;
  location: string;
  sku: string;
  
  // Metrics (% or absolute values)
  cpuAverage: number; // Percentage
  cpuPeak: number; // Percentage
  memoryAverage: number; // Percentage
  memoryPeak: number; // Percentage
  diskReadAverage: number; // MB/s
  diskWriteAverage: number; // MB/s
  networkInAverage: number; // MB/s
  networkOutAverage: number; // MB/s
  
  // Analysis period
  analysisStartDate: string;
  analysisEndDate: string;
  dataPoints: number;
  
  // Cost info
  monthlyCost: number;
  currency: string;
}

/**
 * Utilization Status
 */
export type UtilizationStatus = 
  | 'underutilized'    // < 20% average usage
  | 'optimal'          // 20-70% average usage
  | 'high'             // 70-90% average usage
  | 'overutilized';    // > 90% average usage

// ============================================
// Right-Sizing Recommendations
// ============================================

/**
 * Azure VM SKU Information
 */
export interface VMSku {
  name: string; // e.g., 'Standard_D4s_v3'
  tier: string; // 'Standard', 'Basic'
  size: string; // e.g., 'D4s_v3'
  family: string; // e.g., 'standardDSv3Family'
  vCPUs: number;
  memoryGB: number;
  maxDataDisks: number;
  maxNics: number;
  estimatedMonthlyCost: number; // EUR
  isSpotEligible: boolean;
  supportsPremiumStorage: boolean;
}

/**
 * Right-Sizing Recommendation
 */
export interface RightSizingRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: string;
  
  // Current state
  currentSku: VMSku;
  currentUtilization: ResourceUtilization;
  utilizationStatus: UtilizationStatus;
  
  // Recommendation
  recommendedSku: VMSku;
  recommendationType: 'downsize' | 'upsize' | 'rightsize' | 'shutdown';
  
  // Impact
  monthlySavings: number; // Positive = savings, Negative = additional cost
  annualSavings: number;
  savingsPercentage: number;
  
  // Risk assessment
  impactLevel: 'low' | 'medium' | 'high';
  confidence: 'low' | 'medium' | 'high';
  
  // Details
  reason: string;
  details: string;
  actionRequired: string;
  
  // Metadata
  generatedAt: string;
  priority: number; // 1-10, higher = more important
}

// ============================================
// Reserved Instance Analysis
// ============================================

/**
 * Reserved Instance Coverage
 */
export interface ReservedInstanceCoverage {
  subscriptionId: string;
  subscriptionName: string;
  
  // Current RI usage
  totalVMs: number;
  reservedVMs: number;
  onDemandVMs: number;
  coveragePercentage: number; // % of VMs covered by RIs
  
  // Cost analysis
  totalMonthlyCost: number;
  reservedInstanceCost: number;
  onDemandCost: number;
  
  // Potential savings
  potentialMonthlySavings: number; // If all on-demand → RI
  potentialAnnualSavings: number;
  recommendedRICount: number;
}

/**
 * Reserved Instance Recommendation
 */
export interface ReservedInstanceRecommendation {
  id: string;
  vmSize: string; // SKU name
  location: string;
  quantity: number; // Number of RIs to purchase
  
  // Term options
  term: '1year' | '3year';
  paymentOption: 'upfront' | 'monthly' | 'no-upfront';
  
  // Costs
  onDemandMonthlyCost: number;
  reservedMonthlyCost: number;
  monthlySavings: number;
  totalSavingsOverTerm: number;
  savingsPercentage: number;
  
  // Break-even
  breakEvenMonths: number;
  
  // Confidence
  utilizationPattern: 'stable' | 'growing' | 'variable';
  confidence: 'low' | 'medium' | 'high';
  
  reason: string;
}

// ============================================
// Spot Instance Analysis
// ============================================

/**
 * Spot Instance Eligibility
 */
export interface SpotInstanceEligibility {
  resourceId: string;
  resourceName: string;
  currentSku: string;
  
  // Workload analysis
  isEligible: boolean;
  workloadType: 'production' | 'development' | 'testing' | 'batch' | 'unknown';
  interruptionTolerance: 'high' | 'medium' | 'low' | 'none';
  
  // Potential savings
  currentMonthlyCost: number;
  spotMonthlyCost: number;
  monthlySavings: number;
  savingsPercentage: number;
  
  // Risk factors
  riskLevel: 'low' | 'medium' | 'high';
  evictionRate: number; // Historical eviction rate %
  
  reason: string;
  recommendation: string;
}

// ============================================
// Optimization Summary
// ============================================

/**
 * Cost Optimizer Summary
 */
export interface CostOptimizerSummary {
  // Analysis metadata
  analysisDate: string;
  resourcesAnalyzed: number;
  
  // Utilization breakdown
  underutilizedCount: number;
  optimalCount: number;
  highUtilizationCount: number;
  overutilizedCount: number;
  
  // Recommendations
  rightsizingRecommendations: number;
  reservedInstanceRecommendations: number;
  spotInstanceOpportunities: number;
  
  // Savings potential
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  
  // Breakdown by type
  savingsFromRightSizing: number;
  savingsFromReservedInstances: number;
  savingsFromSpotInstances: number;
  
  // Optimization score (0-100)
  optimizationScore: number;
  
  currency: string;
}

/**
 * Complete Optimizer Response
 */
export interface OptimizerResponse {
  success: boolean;
  summary: CostOptimizerSummary;
  rightsizing: RightSizingRecommendation[];
  reservedInstances: ReservedInstanceRecommendation[];
  spotInstances: SpotInstanceEligibility[];
  utilization: ResourceUtilization[];
  error?: string;
}
