/**
 * Azure Cost Management Service
 * 
 * Integración con Azure Cost Management API para obtener datos de costos
 * y transformarlos al formato FOCUS (FinOps Open Cost and Usage Specification)
 * 
 * Azure Cost Management API Docs:
 * https://learn.microsoft.com/en-us/rest/api/cost-management/
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import type {
  FOCUSCostRecord,
  FOCUSCostSummary,
  FOCUSCostTrend,
  FOCUSServiceCategory,
  FOCUSPricingCategory,
  FOCUSChargeType,
  AzureCostManagementResponse,
} from './focus-types';

const execFileAsync = promisify(execFile);

// Helper para ejecutar comandos Azure CLI en WSL
async function executeAzCommand(command: string): Promise<string> {
  const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
  const fullCommand = `${pathSetup} && ${command}`;
  
  console.log('Ejecutando Azure CLI:', command);
  
  try {
    const { stdout, stderr } = await execFileAsync('wsl', [
      'bash',
      '-c',
      fullCommand
    ]);
    
    if (stderr && !stderr.includes('WARNING')) {
      console.warn('STDERR:', stderr);
    }
    
    return stdout;
  } catch (error: any) {
    console.error('Error ejecutando Azure CLI:', error);
    throw new Error(`Azure CLI error: ${error.message}`);
  }
}

/**
 * Obtener costos del mes actual usando Azure Cost Management API
 */
export async function getCurrentMonthCosts(subscriptionId?: string): Promise<FOCUSCostSummary> {
  try {
    // Si no se provee subscriptionId, obtenemos el subscription activo
    if (!subscriptionId) {
      const accountOutput = await executeAzCommand('az account show --output json');
      const account = JSON.parse(accountOutput);
      subscriptionId = account.id;
      console.log(`📋 Usando subscription: ${account.name} (${subscriptionId})`);
    }
    
    // Calcular fechas del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const fromDate = startOfMonth.toISOString().split('T')[0];
    const toDate = endOfMonth.toISOString().split('T')[0];
    
    console.log(`📅 Obteniendo costos: ${fromDate} a ${toDate}`);
    
    // Query para Azure Cost Management API
    const query = {
      type: 'ActualCost',
      timeframe: 'Custom',
      timePeriod: {
        from: fromDate,
        to: toDate,
      },
      dataset: {
        granularity: 'None',
        aggregation: {
          totalCost: {
            name: 'Cost',
            function: 'Sum',
          },
        },
        grouping: [
          {
            type: 'Dimension',
            name: 'ServiceName',
          },
          {
            type: 'Dimension',
            name: 'ResourceGroup',
          },
          {
            type: 'Dimension',
            name: 'ResourceLocation',
          },
        ],
      },
    };
    
    // Guardar query en archivo temporal
    const queryJson = JSON.stringify(query);
    const queryFile = '/tmp/cost-query.json';
    await executeAzCommand(`echo '${queryJson}' > ${queryFile}`);
    
    // Ejecutar query usando Azure CLI
    const costOutput = await executeAzCommand(
      `az costmanagement query --type ActualCost ` +
      `--scope "/subscriptions/${subscriptionId}" ` +
      `--timeframe Custom ` +
      `--time-period from="${fromDate}" to="${toDate}" ` +
      `--dataset-aggregation totalCost=Cost ` +
      `--dataset-grouping name=ServiceName type=Dimension ` +
      `--dataset-grouping name=ResourceGroup type=Dimension ` +
      `--output json`
    );
    
    const costData: AzureCostManagementResponse = JSON.parse(costOutput);
    
    // Transformar a formato FOCUS
    const focusSummary = transformToFOCUS(costData, fromDate, toDate);
    
    return focusSummary;
    
  } catch (error: any) {
    console.error('❌ Error obteniendo costos:', error);
    
    // Si falla Azure CLI, retornar datos simulados
    console.warn('⚠️ Usando datos simulados debido a error en Azure CLI');
    return getSimulatedCosts();
  }
}

/**
 * Transformar respuesta de Azure Cost Management API a formato FOCUS
 */
function transformToFOCUS(
  azureData: AzureCostManagementResponse,
  fromDate: string,
  toDate: string
): FOCUSCostSummary {
  const { columns, rows } = azureData.properties;
  
  // Mapear columnas
  const columnMap: Record<string, number> = {};
  columns.forEach((col, idx) => {
    columnMap[col.name] = idx;
  });
  
  // Inicializar summary
  const summary: FOCUSCostSummary = {
    totalBilledCost: 0,
    totalEffectiveCost: 0,
    currency: 'EUR',
    billingPeriod: {
      start: fromDate,
      end: toDate,
      month: fromDate.substring(0, 7), // YYYY-MM
    },
    byProvider: {
      'Microsoft Azure': 0,
      'AWS': 0,
      'GCP': 0,
      'Other': 0,
    },
    byServiceCategory: {
      'Compute': 0,
      'Storage': 0,
      'Network': 0,
      'Database': 0,
      'AI/ML': 0,
      'Analytics': 0,
      'Security': 0,
      'Management': 0,
      'Other': 0,
    },
    byPricingCategory: {
      'On-Demand': 0,
      'Reserved': 0,
      'Spot': 0,
      'Savings Plan': 0,
      'Commitment-Based': 0,
      'Other': 0,
    },
    byChargeType: {
      'Usage': 0,
      'Purchase': 0,
      'Tax': 0,
      'Credit': 0,
      'Adjustment': 0,
      'Refund': 0,
    },
    byResourceGroup: {},
    byRegion: {},
  };
  
  // Procesar cada fila
  rows.forEach(row => {
    const cost = parseFloat(row[columnMap['Cost']] || '0');
    const serviceName = row[columnMap['ServiceName']] || 'Unknown';
    const resourceGroup = row[columnMap['ResourceGroup']] || 'Unknown';
    const region = row[columnMap['ResourceLocation']] || 'Unknown';
    
    // Acumular totales
    summary.totalBilledCost += cost;
    summary.totalEffectiveCost += cost;
    summary.byProvider['Microsoft Azure'] += cost;
    summary.byChargeType['Usage'] += cost; // Por defecto, asumimos Usage
    
    // Mapear servicio a categoría FOCUS
    const category = mapServiceToCategory(serviceName);
    summary.byServiceCategory[category] += cost;
    
    // Asumir On-Demand por defecto (podemos mejorar esto analizando SKU)
    summary.byPricingCategory['On-Demand'] += cost;
    
    // Acumular por resource group
    if (!summary.byResourceGroup![resourceGroup]) {
      summary.byResourceGroup![resourceGroup] = 0;
    }
    summary.byResourceGroup![resourceGroup] += cost;
    
    // Acumular por región
    if (!summary.byRegion![region]) {
      summary.byRegion![region] = 0;
    }
    summary.byRegion![region] += cost;
  });
  
  return summary;
}

/**
 * Mapear nombre de servicio Azure a categoría FOCUS
 */
function mapServiceToCategory(serviceName: string): FOCUSServiceCategory {
  const serviceNameLower = serviceName.toLowerCase();
  
  if (serviceNameLower.includes('virtual machines') || 
      serviceNameLower.includes('compute') ||
      serviceNameLower.includes('container')) {
    return 'Compute';
  }
  
  if (serviceNameLower.includes('storage') || 
      serviceNameLower.includes('blob') ||
      serviceNameLower.includes('disk')) {
    return 'Storage';
  }
  
  if (serviceNameLower.includes('network') || 
      serviceNameLower.includes('vpn') ||
      serviceNameLower.includes('load balancer')) {
    return 'Network';
  }
  
  if (serviceNameLower.includes('database') || 
      serviceNameLower.includes('sql') ||
      serviceNameLower.includes('cosmos')) {
    return 'Database';
  }
  
  if (serviceNameLower.includes('cognitive') || 
      serviceNameLower.includes('machine learning') ||
      serviceNameLower.includes('ai')) {
    return 'AI/ML';
  }
  
  if (serviceNameLower.includes('analytics') || 
      serviceNameLower.includes('synapse') ||
      serviceNameLower.includes('data factory')) {
    return 'Analytics';
  }
  
  if (serviceNameLower.includes('security') || 
      serviceNameLower.includes('key vault') ||
      serviceNameLower.includes('sentinel')) {
    return 'Security';
  }
  
  if (serviceNameLower.includes('monitor') || 
      serviceNameLower.includes('log analytics') ||
      serviceNameLower.includes('management')) {
    return 'Management';
  }
  
  return 'Other';
}

/**
 * Obtener tendencia de costos de los últimos 6 meses
 */
export async function getCostTrend(subscriptionId?: string): Promise<FOCUSCostTrend[]> {
  try {
    const trend: FOCUSCostTrend[] = [];
    const now = new Date();
    
    // Obtener costos de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
      
      // Por ahora, retornamos datos simulados
      // TODO: Implementar query real por cada mes
      const cost = Math.random() * 5000 + 1000;
      const prevCost = i < 5 ? trend[trend.length - 1]?.billedCost || cost : cost;
      
      trend.push({
        month: monthStr,
        billedCost: cost,
        effectiveCost: cost * 0.95, // 5% descuento simulado
        variance: ((cost - prevCost) / prevCost) * 100,
        varianceAmount: cost - prevCost,
      });
    }
    
    return trend;
    
  } catch (error: any) {
    console.error('❌ Error obteniendo tendencia:', error);
    return [];
  }
}

/**
 * Datos simulados para desarrollo/testing
 */
function getSimulatedCosts(): FOCUSCostSummary {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    totalBilledCost: 3456.78,
    totalEffectiveCost: 3234.56,
    currency: 'EUR',
    billingPeriod: {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0],
      month: startOfMonth.toISOString().substring(0, 7),
    },
    byProvider: {
      'Microsoft Azure': 3456.78,
      'AWS': 0,
      'GCP': 0,
      'Other': 0,
    },
    byServiceCategory: {
      'Compute': 1850.00,
      'Storage': 650.00,
      'Network': 450.00,
      'Database': 350.00,
      'AI/ML': 100.00,
      'Analytics': 56.78,
      'Security': 0,
      'Management': 0,
      'Other': 0,
    },
    byPricingCategory: {
      'On-Demand': 2500.00,
      'Reserved': 800.00,
      'Spot': 156.78,
      'Savings Plan': 0,
      'Commitment-Based': 0,
      'Other': 0,
    },
    byChargeType: {
      'Usage': 3456.78,
      'Purchase': 0,
      'Tax': 0,
      'Credit': 0,
      'Adjustment': 0,
      'Refund': 0,
    },
    byResourceGroup: {
      'rg-hub-prod': 2100.00,
      'rg-hub-dev': 890.00,
      'rg-shared': 466.78,
    },
    byRegion: {
      'westeurope': 2800.00,
      'northeurope': 656.78,
    },
  };
}
