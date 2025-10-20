/**
 * FOCUS Framework Types
 * FinOps Open Cost and Usage Specification (FOCUS)
 * https://focus.finops.org/
 * 
 * Estos tipos están alineados con el estándar FOCUS v1.0
 * para garantizar compatibilidad multi-cloud y normalización de datos de costos
 */

// ============================================
// FOCUS Core Dimensions
// ============================================

/**
 * Billing Period - Periodo de facturación
 * FOCUS Column: BillingPeriodStart, BillingPeriodEnd
 */
export interface FOCUSBillingPeriod {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  month: string; // YYYY-MM format for grouping
}

/**
 * Provider - Proveedor cloud
 * FOCUS Column: Provider
 */
export type FOCUSProvider = 'Microsoft Azure' | 'AWS' | 'GCP' | 'Other';

/**
 * Service Category - Categoría de servicio
 * FOCUS Column: ServiceCategory
 */
export type FOCUSServiceCategory = 
  | 'Compute'
  | 'Storage'
  | 'Network'
  | 'Database'
  | 'AI/ML'
  | 'Analytics'
  | 'Security'
  | 'Management'
  | 'Other';

/**
 * Pricing Category - Modelo de pricing
 * FOCUS Column: PricingCategory
 */
export type FOCUSPricingCategory = 
  | 'On-Demand'
  | 'Reserved'
  | 'Spot'
  | 'Savings Plan'
  | 'Commitment-Based'
  | 'Other';

/**
 * Charge Type - Tipo de cargo
 * FOCUS Column: ChargeType
 */
export type FOCUSChargeType = 
  | 'Usage'
  | 'Purchase'
  | 'Tax'
  | 'Credit'
  | 'Adjustment'
  | 'Refund';

// ============================================
// FOCUS Cost Record
// ============================================

/**
 * FOCUS Cost Record - Registro normalizado de costos
 * Representa una línea de facturación normalizada según FOCUS
 */
export interface FOCUSCostRecord {
  // Required FOCUS columns
  BillingPeriodStart: string;
  BillingPeriodEnd: string;
  ChargeType: FOCUSChargeType;
  BilledCost: number; // Costo facturado
  EffectiveCost?: number; // Costo efectivo (después de descuentos)
  
  // Provider info
  Provider: FOCUSProvider;
  PublisherName?: string;
  
  // Service info
  ServiceCategory: FOCUSServiceCategory;
  ServiceName: string; // Ej: "Virtual Machines", "Storage Accounts"
  
  // Pricing info
  PricingCategory: FOCUSPricingCategory;
  PricingUnit?: string; // Ej: "hours", "GB", "requests"
  PricingQuantity?: number;
  UnitPrice?: number;
  
  // Resource info
  ResourceId?: string; // Azure resource ID
  ResourceName?: string;
  ResourceType?: string; // Ej: "Microsoft.Compute/virtualMachines"
  
  // Location
  Region?: string;
  AvailabilityZone?: string;
  
  // Tags for allocation
  Tags?: Record<string, string>;
  
  // Organizational
  SubscriptionId?: string;
  SubscriptionName?: string;
  ResourceGroup?: string;
  
  // Cost allocation
  CostCenter?: string;
  Project?: string;
  Environment?: string;
  Owner?: string;
}

// ============================================
// FOCUS Aggregated Data
// ============================================

/**
 * Cost Summary - Resumen de costos agregados
 */
export interface FOCUSCostSummary {
  totalBilledCost: number;
  totalEffectiveCost: number;
  currency: string; // EUR, USD, etc.
  billingPeriod: FOCUSBillingPeriod;
  
  // Desglose por dimensiones FOCUS
  byProvider: Record<FOCUSProvider, number>;
  byServiceCategory: Record<FOCUSServiceCategory, number>;
  byPricingCategory: Record<FOCUSPricingCategory, number>;
  byChargeType: Record<FOCUSChargeType, number>;
  
  // Desglose organizacional
  bySubscription?: Record<string, number>;
  byResourceGroup?: Record<string, number>;
  byRegion?: Record<string, number>;
  
  // Cost allocation tags
  byCostCenter?: Record<string, number>;
  byProject?: Record<string, number>;
  byEnvironment?: Record<string, number>;
}

/**
 * Cost Trend - Tendencia de costos mes a mes
 */
export interface FOCUSCostTrend {
  month: string; // YYYY-MM
  billedCost: number;
  effectiveCost: number;
  variance: number; // % change from previous month
  varianceAmount: number; // absolute change
}

// ============================================
// Azure-specific types
// ============================================

/**
 * Azure Cost Management API Response
 * Mapeo de la respuesta de Azure Cost Management API a FOCUS
 */
export interface AzureCostManagementResponse {
  properties: {
    columns: Array<{
      name: string;
      type: string;
    }>;
    rows: Array<any[]>;
  };
}

/**
 * Azure Resource - Información de recurso Azure
 */
export interface AzureResource {
  id: string;
  name: string;
  type: string;
  resourceGroup: string;
  subscriptionId: string;
  location: string;
  tags?: Record<string, string>;
  sku?: {
    name: string;
    tier?: string;
    size?: string;
  };
}

// ============================================
// FinOps Analytics Types
// ============================================

/**
 * FinOps Summary - Métricas clave para dashboard
 */
export interface FinOpsSummary {
  totalResources: number;
  totalMonthlyCost: number;
  underutilizedCount: number;
  potentialSavings: number;
  optimizationScore: number; // 0-100
  currency: string;
  lastUpdated: string;
}

/**
 * FinOps API Response - Respuesta completa del endpoint
 */
export interface FinOpsResponse {
  success: boolean;
  timestamp: string;
  summary: FinOpsSummary;
  costs: {
    focus: FOCUSCostSummary;
    trend: FOCUSCostTrend[];
  };
  utilization?: {
    underutilizedResources: any[];
  };
  recommendations?: any[];
  error?: string;
}
