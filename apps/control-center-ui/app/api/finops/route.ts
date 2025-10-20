import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

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
    console.log('🔍 Analizando costos y utilización de recursos...');
    
    const workingPath = process.env.TERRAFORM_PATH || 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub';
    const wslWorkingPath = workingPath
      .replace(/\\/g, '/')
      .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
    
    // Configurar PATH para Azure CLI
    const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
    
    // 1. Obtener lista de recursos desplegados
    console.log('📋 Obteniendo recursos de Terraform...');
    const stateListOutput = await executeCommand(
      wslWorkingPath,
      `${pathSetup} && terragrunt state list`
    );
    
    const resources = stateListOutput.trim().split('\n').filter(r => r);
    console.log(`✅ Encontrados ${resources.length} recursos`);
    
    // 2. Analizar costos (simulado por ahora, luego integraremos con Azure Cost Management API)
    const costData = {
      totalMonthlyCost: 0,
      byResourceGroup: {} as Record<string, number>,
      byService: {} as Record<string, number>,
      trend: [] as Array<{ month: string; cost: number }>,
    };
    
    // 3. Analizar utilización de recursos (simulado, luego usaremos Azure Monitor)
    const utilizationData = {
      underutilizedResources: [] as Array<{
        name: string;
        type: string;
        resourceGroup: string;
        currentUtilization: number;
        currentSku: string;
        recommendedSku: string;
        potentialSavings: number;
        metrics: {
          cpu: number;
          memory: number;
          disk: number;
        };
      }>,
      optimizationScore: 0,
      totalPotentialSavings: 0,
    };
    
    // 4. Generar recomendaciones
    const recommendations = [
      {
        id: 1,
        severity: 'high',
        resource: 'example-vm',
        type: 'VM',
        issue: 'CPU utilization < 10% for last 7 days',
        recommendation: 'Consider downsizing from Standard_D4s_v3 to Standard_D2s_v3',
        potentialSavings: 87.60,
        impact: 'medium',
      }
    ];
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalResources: resources.length,
        totalMonthlyCost: costData.totalMonthlyCost,
        underutilizedCount: utilizationData.underutilizedResources.length,
        potentialSavings: utilizationData.totalPotentialSavings,
        optimizationScore: utilizationData.optimizationScore,
      },
      costs: costData,
      utilization: utilizationData,
      recommendations,
    });
    
  } catch (error: any) {
    console.error('❌ Error en análisis FinOps:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error ejecutando análisis FinOps',
    }, { status: 500 });
  }
}
