import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getCurrentMonthCosts, getCostTrend } from './azure-cost-service';
import type { FinOpsResponse } from './focus-types';
import type { OptimizerResponse } from './optimizer-types';
import { getVirtualMachines, analyzeVMUtilization } from './azure-monitor-service';
import { 
  generateRightSizingRecommendation, 
  analyzeReservedInstanceCoverage,
  generateRIRecommendations,
  analyzeSpotEligibility,
  generateOptimizerSummary,
  getVMSku,
} from './optimizer-engine';

const execFileAsync = promisify(execFile);

// Helper para ejecutar comandos en WSL
async function executeCommand(workingDir: string, command: string) {
  const fullCommand = `cd '${workingDir}' && ${command}`;
  console.log('Ejecutando:', fullCommand);
  
  try {
    const { stdout, stderr } = await execFileAsync('wsl', [
      'bash',
      '-c',
      fullCommand
    ]);
    
    if (stderr && !stderr.includes('Refreshing state')) {
      console.warn('STDERR:', stderr);
    }
    
    return stdout;
  } catch (error: any) {
    console.error('Error ejecutando comando:', error);
    throw new Error(`Error ejecutando comando: ${error.message}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando análisis FinOps con FOCUS framework...');
    
    // Check if optimizer mode is requested
    const { searchParams } = new URL(request.url);
    const includeOptimizer = searchParams.get('optimizer') === 'true';
    
    const workingPath = process.env.TERRAFORM_PATH || 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub';
    const wslWorkingPath = workingPath
      .replace(/\\/g, '/')
      .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
    
    // Configurar PATH para Azure CLI y Terraform
    const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
    
    // 1. Obtener lista de recursos desplegados desde Terraform
    console.log('📋 Obteniendo recursos de Terraform...');
    const stateListOutput = await executeCommand(
      wslWorkingPath,
      `${pathSetup} && terragrunt state list`
    );
    
    const resources = stateListOutput.trim().split('\n').filter(r => r);
    console.log(`✅ Encontrados ${resources.length} recursos en Terraform state`);
    
    // 2. Obtener datos de costos usando Azure Cost Management API
    console.log('💰 Obteniendo datos de costos de Azure Cost Management API...');
    const costSummary = await getCurrentMonthCosts();
    console.log(`✅ Costos obtenidos: €${costSummary.totalBilledCost.toFixed(2)}`);
    
    // 3. Obtener tendencia de costos (últimos 6 meses)
    console.log('📈 Obteniendo tendencia de costos...');
    const costTrend = await getCostTrend();
    console.log(`✅ Tendencia obtenida: ${costTrend.length} meses`);
    
    // 4. Si se solicita optimizer, ejecutar análisis completo
    let optimizerData: OptimizerResponse | null = null;
    if (includeOptimizer) {
      console.log('🎯 Ejecutando análisis de Cost Optimizer...');
      optimizerData = await runCostOptimizerAnalysis();
      console.log(`✅ Optimizer completado: ${optimizerData.summary.resourcesAnalyzed} recursos analizados`);
    }
    
    // 5. Calcular métricas FinOps
    const optimizationScore = calculateOptimizationScore(costSummary);
    const potentialSavings = optimizerData 
      ? optimizerData.summary.totalMonthlySavings 
      : calculatePotentialSavings(costSummary);
    
    // 6. Construir respuesta siguiendo formato FOCUS
    const response: FinOpsResponse & { optimizer?: OptimizerResponse } = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalResources: resources.length,
        totalMonthlyCost: costSummary.totalBilledCost,
        underutilizedCount: optimizerData?.summary.underutilizedCount || 0,
        potentialSavings: potentialSavings,
        optimizationScore: optimizationScore,
        currency: costSummary.currency,
        lastUpdated: new Date().toISOString(),
      },
      costs: {
        focus: costSummary,
        trend: costTrend,
      },
      utilization: {
        underutilizedResources: [],
      },
      recommendations: generateRecommendations(costSummary, optimizerData),
    };
    
    // Include optimizer data if requested
    if (optimizerData) {
      response.optimizer = optimizerData;
    }
    
    console.log('✅ Análisis FinOps completado');
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Error en análisis FinOps:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error ejecutando análisis FinOps',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Execute complete Cost Optimizer analysis
 */
async function runCostOptimizerAnalysis(): Promise<OptimizerResponse> {
  const subscriptionId = '739aaf91-5cb2-45a6-ab4f-abf883e9d3f7'; // TODO: Get from env or Azure CLI
  
  console.log('📊 Getting virtual machines...');
  const vms = await getVirtualMachines(subscriptionId);
  console.log(`✅ Found ${vms.length} VMs`);
  
  // Analyze utilization for all VMs
  console.log('📈 Analyzing VM utilization...');
  const utilizationPromises = vms.map(vm => 
    analyzeVMUtilization(
      vm.id,
      vm.name,
      vm.resourceGroup,
      vm.location,
      vm.sku,
      vm.estimatedMonthlyCost
    )
  );
  
  const utilizations = await Promise.all(utilizationPromises);
  console.log(`✅ Analyzed ${utilizations.length} VMs`);
  
  // Generate right-sizing recommendations
  console.log('🔧 Generating right-sizing recommendations...');
  const rightsizingRecs = utilizations
    .map(u => generateRightSizingRecommendation(u, getVMSku(u.sku)))
    .filter(rec => rec !== null);
  console.log(`✅ Generated ${rightsizingRecs.length} right-sizing recommendations`);
  
  // Analyze Reserved Instance opportunities
  console.log('💳 Analyzing Reserved Instance opportunities...');
  const riCoverage = analyzeReservedInstanceCoverage(utilizations);
  const riRecommendations = generateRIRecommendations(utilizations);
  console.log(`✅ Generated ${riRecommendations.length} RI recommendations`);
  
  // Analyze Spot Instance eligibility
  console.log('⚡ Analyzing Spot Instance eligibility...');
  const spotEligibility = utilizations.map(u => analyzeSpotEligibility(u));
  const spotEligibleCount = spotEligibility.filter(s => s.isEligible).length;
  console.log(`✅ Found ${spotEligibleCount} Spot-eligible workloads`);
  
  // Generate summary
  const summary = generateOptimizerSummary(
    utilizations,
    rightsizingRecs,
    riRecommendations,
    spotEligibility
  );
  
  return {
    success: true,
    summary,
    utilization: utilizations,
    rightsizing: rightsizingRecs,
    reservedInstances: riRecommendations,
    spotInstances: spotEligibility,
  };
}

/**
 * Calcular score de optimización (0-100)
 * Basado en:
 * - % de recursos con Reserved Instances
 * - % de Spot instances
 * - Distribución de costos por categoría
 */
function calculateOptimizationScore(costSummary: any): number {
  const { byPricingCategory, totalBilledCost } = costSummary;
  
  // Calcular % de commitment-based pricing (mejor práctica)
  const reservedPct = (byPricingCategory['Reserved'] / totalBilledCost) * 100;
  const spotPct = (byPricingCategory['Spot'] / totalBilledCost) * 100;
  const savingsPlanPct = (byPricingCategory['Savings Plan'] / totalBilledCost) * 100;
  
  const commitmentPct = reservedPct + spotPct + savingsPlanPct;
  
  // Score basado en % de commitment (objetivo: 50%+)
  let score = Math.min(commitmentPct * 2, 100);
  
  // Penalización si hay mucho "Other" (sin clasificar)
  const otherPct = (byPricingCategory['Other'] / totalBilledCost) * 100;
  score -= otherPct * 0.5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calcular ahorros potenciales
 * Basado en:
 * - On-Demand → Reserved (30% savings)
 * - On-Demand → Spot (70% savings en workloads compatibles)
 */
function calculatePotentialSavings(costSummary: any): number {
  const { byPricingCategory } = costSummary;
  
  const onDemandCost = byPricingCategory['On-Demand'] || 0;
  
  // Asumir que 50% de On-Demand puede migrar a Reserved (30% savings)
  const reservedSavings = (onDemandCost * 0.5) * 0.30;
  
  // Asumir que 20% de On-Demand puede migrar a Spot (70% savings)
  const spotSavings = (onDemandCost * 0.2) * 0.70;
  
  return reservedSavings + spotSavings;
}

/**
 * Generar recomendaciones basadas en análisis de costos
 */
function generateRecommendations(costSummary: any, optimizerData?: OptimizerResponse | null): any[] {
  const recommendations = [];
  const { byPricingCategory, byServiceCategory, totalBilledCost } = costSummary;
  
  // Si tenemos datos del optimizer, usar esos
  if (optimizerData && optimizerData.summary.totalMonthlySavings > 0) {
    // Recomendación de right-sizing
    if (optimizerData.summary.rightsizingRecommendations > 0) {
      recommendations.push({
        id: 'rec-optimizer-1',
        severity: 'high',
        category: 'Cost Optimizer',
        title: `${optimizerData.summary.rightsizingRecommendations} recursos con oportunidades de Right-sizing`,
        description: `Se han identificado ${optimizerData.summary.underutilizedCount} recursos infrautilizados. El right-sizing puede reducir costos significativamente.`,
        potentialSavings: optimizerData.summary.savingsFromRightSizing,
        impact: 'high',
        effort: 'medium',
        actionUrl: '/finops?tab=optimization',
      });
    }
    
    // Recomendación de Reserved Instances
    if (optimizerData.summary.reservedInstanceRecommendations > 0) {
      recommendations.push({
        id: 'rec-optimizer-2',
        severity: 'high',
        category: 'Rate Optimization',
        title: `${optimizerData.summary.reservedInstanceRecommendations} oportunidades de Reserved Instances`,
        description: `Puedes ahorrar hasta €${optimizerData.summary.savingsFromReservedInstances.toFixed(2)}/mes con Reserved Instances.`,
        potentialSavings: optimizerData.summary.savingsFromReservedInstances,
        impact: 'high',
        effort: 'low',
        actionUrl: 'https://portal.azure.com/#view/Microsoft_Azure_Reservations',
      });
    }
    
    // Recomendación de Spot Instances
    if (optimizerData.summary.spotInstanceOpportunities > 0) {
      recommendations.push({
        id: 'rec-optimizer-3',
        severity: 'medium',
        category: 'Rate Optimization',
        title: `${optimizerData.summary.spotInstanceOpportunities} workloads elegibles para Spot Instances`,
        description: `Workloads de desarrollo/testing pueden migrar a Spot con ahorros del 70-90%.`,
        potentialSavings: optimizerData.summary.savingsFromSpotInstances,
        impact: 'high',
        effort: 'high',
        actionUrl: '/finops?tab=optimization',
      });
    }
  } else {
    // Fallback: recomendaciones basadas solo en costos
    
    // Recomendación 1: Reserved Instances
    const onDemandPct = (byPricingCategory['On-Demand'] / totalBilledCost) * 100;
    if (onDemandPct > 60) {
      recommendations.push({
        id: 'rec-1',
        severity: 'high',
        category: 'Rate Optimization',
        title: 'Alto uso de On-Demand Pricing',
        description: `${onDemandPct.toFixed(0)}% de tus costos son On-Demand. Considera Reserved Instances o Savings Plans.`,
        potentialSavings: (byPricingCategory['On-Demand'] * 0.5 * 0.30),
        impact: 'high',
        effort: 'medium',
        actionUrl: 'https://portal.azure.com/#view/Microsoft_Azure_Reservations',
      });
    }
    
    // Recomendación 2: Spot instances
    const computeCost = byServiceCategory['Compute'] || 0;
    const spotPct = (byPricingCategory['Spot'] / totalBilledCost) * 100;
    if (computeCost > 500 && spotPct < 10) {
      recommendations.push({
        id: 'rec-2',
        severity: 'medium',
        category: 'Rate Optimization',
        title: 'Oportunidad de Spot Instances',
        description: `Gasto en Compute: €${computeCost.toFixed(2)}. Considera Spot instances para workloads tolerantes a interrupciones.`,
        potentialSavings: (computeCost * 0.2 * 0.70),
        impact: 'high',
        effort: 'high',
        actionUrl: 'https://learn.microsoft.com/azure/virtual-machines/spot-vms',
      });
    }
    
    // Recomendación 3: Right-sizing (si hay muchos recursos)
    recommendations.push({
      id: 'rec-3',
      severity: 'medium',
      category: 'Cost Optimizer',
      title: 'Analizar Right-sizing de recursos',
      description: 'Revisa métricas de utilización para identificar recursos sobredimensionados.',
      potentialSavings: totalBilledCost * 0.15, // Estimado 15%
      impact: 'medium',
      effort: 'medium',
      actionUrl: '/finops?tab=optimization',
    });
  }
  
  return recommendations;
}
