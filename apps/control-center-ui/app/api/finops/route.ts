import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getCurrentMonthCosts, getCostTrend } from './azure-cost-service';
import type { FinOpsResponse } from './focus-types';

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
    
    // 4. Calcular métricas FinOps
    const optimizationScore = calculateOptimizationScore(costSummary);
    const potentialSavings = calculatePotentialSavings(costSummary);
    
    // 5. Construir respuesta siguiendo formato FOCUS
    const response: FinOpsResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalResources: resources.length,
        totalMonthlyCost: costSummary.totalBilledCost,
        underutilizedCount: 0, // TODO: Implementar con Azure Monitor
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
      recommendations: generateRecommendations(costSummary),
    };
    
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
function generateRecommendations(costSummary: any): any[] {
  const recommendations = [];
  const { byPricingCategory, byServiceCategory, totalBilledCost } = costSummary;
  
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
  
  return recommendations;
}
