import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const terraformPath = process.env.TERRAFORM_PATH;
    const terragruntEnabled = process.env.TERRAGRUNT_ENABLED === 'true';
    const terragruntPath = process.env.TERRAGRUNT_PATH;
    
    // Check if drift monitoring is disabled
    if (!terraformPath && !terragruntPath) {
      return NextResponse.json({
        success: true,
        hasChanges: false,
        stats: {
          totalResources: 0,
          inSync: 0,
          drifted: 0,
          toAdd: 0,
          toChange: 0,
          toDestroy: 0,
          unmanaged: 0,
        },
        driftedResources: [],
        lastCheck: new Date().toISOString(),
        message: 'DRIFT monitoring deshabilitado. Configure TERRAFORM_PATH o TERRAGRUNT_PATH en .env.local',
      });
    }

    const workingPath = terragruntPath || terraformPath;

    // Detect if we're running in WSL or Windows
    const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;
    
    let command: string;
    let workingDir: string;
    
    // Determine which tool to use
    const tfCommand = terragruntEnabled ? 'terragrunt' : 'terraform';
    
    if (isWSL || process.platform === 'linux') {
      // Running in WSL/Linux - use path directly
      workingDir = workingPath!
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      command = `cd '${workingDir}' && ${tfCommand} plan -detailed-exitcode -no-color`;
    } else {
      // Running in Windows - use WSL with absolute paths
      const wslPath = workingPath!
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      
      // Use absolute paths for both terraform and terragrunt
      // Set PATH explicitly to include terraform's directory
      const terraformPath = '/home/alacambra/bin/terraform';
      const terragruntPath = '/usr/local/bin/terragrunt';
      
      // Set PATH without expanding Windows PATH - use a clean minimal PATH
      const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
      
      const tfAbsolutePath = tfCommand === 'terragrunt' ? terragruntPath : terraformPath;
      
      command = `wsl bash -c "${pathSetup} && cd '${wslPath}' && ${tfAbsolutePath} plan -detailed-exitcode -no-color"`;
    }

    console.log('Ejecutando comando:', command);
    console.log('Platform:', process.platform, 'WSL:', isWSL, 'Tool:', tfCommand);
    
    let planOutput = '';
    let hasChanges = false;
    
    try {
      const { stdout } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 120000, // 2 minutes
      });
      planOutput = stdout;
      hasChanges = false; // Exit code 0 = no changes
    } catch (error: any) {
      planOutput = error.stdout || error.stderr || '';
      // Exit code 2 means changes detected (drift)
      if (error.code === 2) {
        hasChanges = true;
      } else {
        // Exit code 1 or other = actual error
        console.error('Terraform plan error:', error);
        return NextResponse.json(
          { 
            error: 'Error ejecutando terraform plan',
            details: error.message,
            output: planOutput 
          },
          { status: 500 }
        );
      }
    }

    // Parsear el output de terraform plan
    const stats = parseTerraformPlan(planOutput);
    const driftedResources = extractDriftedResources(planOutput);

    console.log('=== DRIFT API DEBUG ===');
    console.log('Has changes:', hasChanges);
    console.log('Stats:', JSON.stringify(stats, null, 2));
    console.log('Drifted resources count:', driftedResources.length);
    console.log('Plan output length:', planOutput.length);
    console.log('First 500 chars:', planOutput.substring(0, 500));

    return NextResponse.json({
      success: true,
      hasChanges,
      stats,
      driftedResources,
      lastCheck: new Date().toISOString(),
      planOutput: planOutput.split('\n').slice(0, 50).join('\n'), // Primeras 50 líneas
    });

  } catch (error: any) {
    console.error('Error checking Terraform drift:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar drift de Terraform' },
      { status: 500 }
    );
  }
}

function parseTerraformPlan(output: string): any {
  // Buscar la línea de resumen de terraform plan
  // Ejemplo: "Plan: 2 to add, 3 to change, 1 to destroy."
  const planSummaryRegex = /Plan:\s+(\d+)\s+to\s+add,\s+(\d+)\s+to\s+change,\s+(\d+)\s+to\s+destroy/;
  const match = output.match(planSummaryRegex);

  let toAdd = 0, toChange = 0, toDestroy = 0;
  
  if (match) {
    toAdd = parseInt(match[1], 10);
    toChange = parseInt(match[2], 10);
    toDestroy = parseInt(match[3], 10);
  }

  // Contar recursos totales (aproximado)
  const resourceLines = output.split('\n').filter(line => 
    line.includes('# ') && (line.includes('will be') || line.includes('must be'))
  );

  const totalResources = 50; // Placeholder - necesitarías terraform state list para esto
  const drifted = toAdd + toChange + toDestroy;
  const inSync = Math.max(0, totalResources - drifted);

  return {
    totalResources,
    inSync,
    drifted,
    toAdd,
    toChange,
    toDestroy,
    unmanaged: 0, // Requiere lógica adicional para detectar
  };
}

function extractDriftedResources(output: string): any[] {
  const resources: any[] = [];
  const lines = output.split('\n');

  let currentResource: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar inicio de un recurso con cambios
    // Ejemplo: "  # azurerm_resource_group.hub will be updated in-place"
    const resourceMatch = line.match(/^\s*#\s+(\S+)\s+will\s+be\s+(.+)$/);
    
    if (resourceMatch) {
      if (currentResource) {
        resources.push(currentResource);
      }
      
      const [, resourceAddress, action] = resourceMatch;
      const parts = resourceAddress.split('.');
      const resourceType = parts.slice(0, -1).join('.'); // Puede tener múltiples puntos
      const resourceName = parts[parts.length - 1];
      
      let severity = 'info';
      if (action.includes('destroyed')) severity = 'critical';
      else if (action.includes('replaced')) severity = 'critical';
      else if (action.includes('updated')) severity = 'warning';
      else if (action.includes('created')) severity = 'info';
      
      currentResource = {
        address: resourceAddress,
        name: resourceName || resourceAddress,
        type: resourceType,
        action: action,
        severity,
        changes: [],
      };
    }
    
    // Capturar detalles de cambios (líneas con ~ o + o -)
    if (currentResource && line.trim().match(/^[~+\-]/)) {
      const cleanLine = line.trim();
      // Capturar cambios como "~ tags = { ... }" o "+ DriftTest = "active""
      if (cleanLine && !cleanLine.startsWith('#') && cleanLine.length < 200) {
        currentResource.changes.push(cleanLine);
      }
    }
  }
  
  if (currentResource) {
    resources.push(currentResource);
  }

  console.log('Extracted resources:', resources);

  // Formatear para el frontend
  return resources.map(r => ({
    address: r.address,
    name: r.name,
    type: r.type,
    action: r.action,
    severity: r.severity,
    changes: r.changes.slice(0, 5), // Limitar a 5 cambios más relevantes
  }));
}
