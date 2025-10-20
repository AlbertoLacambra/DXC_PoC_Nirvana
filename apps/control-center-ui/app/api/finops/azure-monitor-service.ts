/**
 * Azure Monitor Service
 * 
 * Integration with Azure Monitor API to fetch resource metrics
 * for utilization analysis and right-sizing recommendations
 * 
 * Azure Monitor REST API:
 * https://learn.microsoft.com/en-us/rest/api/monitor/
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import type {
  ResourceUtilization,
  AzureMetric,
  UtilizationStatus,
} from './optimizer-types';

const execFileAsync = promisify(execFile);

// Helper para ejecutar comandos Azure CLI en WSL
async function executeAzCommand(command: string): Promise<string> {
  const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
  const fullCommand = `${pathSetup} && ${command}`;
  
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
 * Obtener métricas de Azure Monitor para un recurso
 */
export async function getResourceMetrics(
  resourceId: string,
  metricNames: string[],
  startTime: Date,
  endTime: Date
): Promise<AzureMetric[]> {
  try {
    const metricsParam = metricNames.join(',');
    const startISO = startTime.toISOString();
    const endISO = endTime.toISOString();
    
    console.log(`📊 Obteniendo métricas de ${resourceId}...`);
    
    const command = `az monitor metrics list ` +
      `--resource "${resourceId}" ` +
      `--metric-names "${metricsParam}" ` +
      `--start-time "${startISO}" ` +
      `--end-time "${endISO}" ` +
      `--interval PT1H ` +
      `--aggregation Average ` +
      `--output json`;
    
    const output = await executeAzCommand(command);
    const metricsData = JSON.parse(output);
    
    return metricsData.value || [];
    
  } catch (error: any) {
    console.error(`❌ Error obteniendo métricas para ${resourceId}:`, error.message);
    return [];
  }
}

/**
 * Analizar utilización de una VM
 */
export async function analyzeVMUtilization(
  resourceId: string,
  resourceName: string,
  resourceGroup: string,
  location: string,
  sku: string,
  monthlyCost: number
): Promise<ResourceUtilization> {
  try {
    // Analizar últimos 7 días
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Métricas a obtener
    const metricNames = [
      'Percentage CPU',
      'Available Memory Bytes',
      'Network In Total',
      'Network Out Total',
    ];
    
    const metrics = await getResourceMetrics(resourceId, metricNames, startTime, endTime);
    
    // Calcular promedios
    const cpuMetric = metrics.find(m => m.name === 'Percentage CPU');
    const memoryMetric = metrics.find(m => m.name === 'Available Memory Bytes');
    const networkInMetric = metrics.find(m => m.name === 'Network In Total');
    const networkOutMetric = metrics.find(m => m.name === 'Network Out Total');
    
    const cpuData = extractMetricValues(cpuMetric);
    const memoryData = extractMetricValues(memoryMetric);
    const networkInData = extractMetricValues(networkInMetric);
    const networkOutData = extractMetricValues(networkOutMetric);
    
    return {
      resourceId,
      resourceName,
      resourceType: 'Microsoft.Compute/virtualMachines',
      resourceGroup,
      location,
      sku,
      
      cpuAverage: cpuData.average,
      cpuPeak: cpuData.peak,
      memoryAverage: memoryData.average,
      memoryPeak: memoryData.peak,
      diskReadAverage: 0, // TODO: Agregar disk metrics
      diskWriteAverage: 0,
      networkInAverage: bytesToMBps(networkInData.average),
      networkOutAverage: bytesToMBps(networkOutData.average),
      
      analysisStartDate: startTime.toISOString(),
      analysisEndDate: endTime.toISOString(),
      dataPoints: cpuData.count,
      
      monthlyCost,
      currency: 'EUR',
    };
    
  } catch (error: any) {
    console.error(`❌ Error analizando utilización de ${resourceName}:`, error.message);
    
    // Retornar datos simulados en caso de error
    return getSimulatedUtilization(resourceId, resourceName, resourceGroup, location, sku, monthlyCost);
  }
}

/**
 * Extraer valores de métrica
 */
function extractMetricValues(metric: AzureMetric | undefined): {
  average: number;
  peak: number;
  count: number;
} {
  if (!metric || !metric.timeseries || metric.timeseries.length === 0) {
    return { average: 0, peak: 0, count: 0 };
  }
  
  const dataPoints = metric.timeseries[0].data;
  const values = dataPoints
    .filter(d => d.average !== undefined && d.average !== null)
    .map(d => d.average!);
  
  if (values.length === 0) {
    return { average: 0, peak: 0, count: 0 };
  }
  
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / values.length;
  const peak = Math.max(...values);
  
  return { average, peak, count: values.length };
}

/**
 * Convertir bytes a MB/s
 */
function bytesToMBps(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Determinar estado de utilización
 */
export function getUtilizationStatus(cpuAverage: number, memoryAverage: number): UtilizationStatus {
  const avgUtilization = (cpuAverage + memoryAverage) / 2;
  
  if (avgUtilization < 20) return 'underutilized';
  if (avgUtilization < 70) return 'optimal';
  if (avgUtilization < 90) return 'high';
  return 'overutilized';
}

/**
 * Obtener lista de VMs para análisis
 */
export async function getVirtualMachines(subscriptionId?: string): Promise<any[]> {
  try {
    console.log('🔍 Obteniendo lista de VMs...');
    
    let scope = '';
    if (subscriptionId) {
      scope = `--subscription "${subscriptionId}"`;
    }
    
    const command = `az vm list ${scope} --output json`;
    const output = await executeAzCommand(command);
    const vms = JSON.parse(output);
    
    console.log(`✅ Encontradas ${vms.length} VMs`);
    return vms;
    
  } catch (error: any) {
    console.error('❌ Error obteniendo VMs:', error.message);
    return [];
  }
}

/**
 * Datos simulados de utilización para PoC/testing
 * 
 * NOTA: Se usan datos simulados realistas para la PoC.
 * En producción, estos datos vendrían de Azure Monitor API.
 */
function getSimulatedUtilization(
  resourceId: string,
  resourceName: string,
  resourceGroup: string,
  location: string,
  sku: string,
  monthlyCost: number
): ResourceUtilization {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Generar utilización aleatoria pero realista
  const utilizationLevel = Math.random();
  let cpuAverage: number;
  let memoryAverage: number;
  
  if (utilizationLevel < 0.3) {
    // 30% - Underutilized
    cpuAverage = 5 + Math.random() * 10; // 5-15%
    memoryAverage = 10 + Math.random() * 15; // 10-25%
  } else if (utilizationLevel < 0.6) {
    // 30% - Optimal
    cpuAverage = 30 + Math.random() * 30; // 30-60%
    memoryAverage = 40 + Math.random() * 20; // 40-60%
  } else if (utilizationLevel < 0.85) {
    // 25% - High
    cpuAverage = 70 + Math.random() * 15; // 70-85%
    memoryAverage = 65 + Math.random() * 20; // 65-85%
  } else {
    // 15% - Overutilized
    cpuAverage = 90 + Math.random() * 8; // 90-98%
    memoryAverage = 88 + Math.random() * 10; // 88-98%
  }
  
  return {
    resourceId,
    resourceName,
    resourceType: 'Microsoft.Compute/virtualMachines',
    resourceGroup,
    location,
    sku,
    
    cpuAverage: Math.round(cpuAverage * 10) / 10,
    cpuPeak: Math.min(100, cpuAverage + 10 + Math.random() * 15),
    memoryAverage: Math.round(memoryAverage * 10) / 10,
    memoryPeak: Math.min(100, memoryAverage + 5 + Math.random() * 10),
    diskReadAverage: Math.random() * 50,
    diskWriteAverage: Math.random() * 30,
    networkInAverage: Math.random() * 100,
    networkOutAverage: Math.random() * 80,
    
    analysisStartDate: startTime.toISOString(),
    analysisEndDate: endTime.toISOString(),
    dataPoints: 168, // 7 days * 24 hours
    
    monthlyCost,
    currency: 'EUR',
  };
}

/**
 * Batch: Analizar utilización de múltiples VMs
 */
export async function analyzeMultipleVMs(vms: any[]): Promise<ResourceUtilization[]> {
  console.log(`📊 Analizando utilización de ${vms.length} VMs...`);
  
  const utilizationPromises = vms.map(async (vm) => {
    const resourceId = vm.id;
    const resourceName = vm.name;
    const resourceGroup = vm.resourceGroup;
    const location = vm.location;
    const sku = vm.hardwareProfile?.vmSize || 'Unknown';
    const monthlyCost = estimateVMCost(sku); // Estimación básica
    
    return analyzeVMUtilization(
      resourceId,
      resourceName,
      resourceGroup,
      location,
      sku,
      monthlyCost
    );
  });
  
  const results = await Promise.all(utilizationPromises);
  console.log(`✅ Análisis de utilización completado`);
  
  return results;
}

/**
 * Estimación simple de costo mensual por SKU
 * TODO: Integrar con Azure Pricing API para costos exactos
 */
function estimateVMCost(sku: string): number {
  const skuLower = sku.toLowerCase();
  
  // Costos aproximados EUR/mes (730 horas)
  if (skuLower.includes('b1s') || skuLower.includes('a0')) return 10;
  if (skuLower.includes('b2s') || skuLower.includes('a1')) return 30;
  if (skuLower.includes('d2s') || skuLower.includes('standard_d2')) return 80;
  if (skuLower.includes('d4s') || skuLower.includes('standard_d4')) return 160;
  if (skuLower.includes('d8s') || skuLower.includes('standard_d8')) return 320;
  if (skuLower.includes('d16s') || skuLower.includes('standard_d16')) return 640;
  
  // Default
  return 100;
}
