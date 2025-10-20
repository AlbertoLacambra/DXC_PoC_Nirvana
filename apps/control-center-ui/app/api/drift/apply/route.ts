import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, driftedResources } = body;

    if (action === 'detect-drift-type') {
      // Detectar el tipo de drift (código adelantado vs cambio manual en Azure)
      const driftType = await detectDriftType(driftedResources);
      
      return NextResponse.json({
        success: true,
        driftType,
      });
    }

    if (action === 'analyze') {
      // Analizar el drift y generar recomendaciones
      const recommendations = generateRecommendations(driftedResources);
      
      return NextResponse.json({
        success: true,
        recommendations,
      });
    }

    if (action === 'apply-terraform') {
      // Ejecutar terragrunt apply automáticamente
      const workingPath = process.env.TERRAFORM_PATH || 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub';
      
      // Convertir a path WSL
      const wslPath = workingPath
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      
      try {
        console.log('🚀 Ejecutando Terragrunt Apply...');
        
        // Configurar PATH para Terraform/Terragrunt
        const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
        const terragruntPath = '/usr/local/bin/terragrunt';
        
        // Ejecutar terragrunt apply con auto-approve
        const applyCommandStr = `${pathSetup} && ${terragruntPath} apply -auto-approve -no-color`;
        
        const result = await executeCommand(wslPath, applyCommandStr);
        
        console.log('✅ Terragrunt Apply completado');
        console.log('Output:', result.substring(0, 500)); // Log primeros 500 chars
        
        return NextResponse.json({
          success: true,
          message: 'Terraform apply ejecutado exitosamente',
          output: result.substring(Math.max(0, result.length - 1000)), // Últimos 1000 chars
        });
        
      } catch (error: any) {
        console.error('❌ Error ejecutando Terragrunt Apply:', error);
        return NextResponse.json({
          success: false,
          error: `Error al ejecutar terraform apply: ${error.message}`,
          details: error.stderr || error.stdout,
        }, { status: 500 });
      }
    }

    if (action === 'create-pr') {
      // Crear Pull Request con las correcciones
      const { branchName, commitMessage, prTitle, prDescription } = body;
      
      const workingPath = process.env.TERRAFORM_PATH || 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub';
      const repoPath = 'c:\\PROYECTS\\DXC_PoC_Nirvana';
      
      // Convertir a path WSL
      const wslRepoPath = repoPath
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      
      try {
        // 1. Crear nueva rama
        await executeCommand(wslRepoPath, `git checkout -b ${branchName}`);
        
        // 2. Hacer commit de los cambios
        await executeCommand(wslRepoPath, `git add .`);
        await executeCommand(wslRepoPath, `git commit -m "${commitMessage}"`);
        
        // 3. Push de la rama
        await executeCommand(wslRepoPath, `git push origin ${branchName}`);
        
        // 4. Crear Pull Request usando GitHub CLI
        const prResult = await executeCommand(
          wslRepoPath, 
          `gh pr create --title "${prTitle}" --body "${prDescription}" --base master --head ${branchName}`
        );
        
        // Extraer URL del PR
        const prUrlMatch = prResult.match(/https:\/\/github\.com\/[^\s]+/);
        const prUrl = prUrlMatch ? prUrlMatch[0] : null;
        
        return NextResponse.json({
          success: true,
          message: 'Pull Request creada exitosamente',
          prUrl,
          branch: branchName,
        });
        
      } catch (gitError: any) {
        console.error('Error en operaciones Git:', gitError);
        
        // Intentar volver a master si algo falla
        try {
          await executeCommand(wslRepoPath, `git checkout master`);
          await executeCommand(wslRepoPath, `git branch -D ${branchName}`);
        } catch (cleanupError) {
          console.error('Error en cleanup:', cleanupError);
        }
        
        return NextResponse.json({
          success: false,
          error: `Error al crear PR: ${gitError.message}`,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Acción no válida',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error en /api/drift/apply:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al procesar la solicitud',
    }, { status: 500 });
  }
}

async function executeCommand(workingDir: string, command: string): Promise<string> {
  const fullCommand = `wsl bash -c "cd '${workingDir}' && ${command}"`;
  console.log('Ejecutando:', fullCommand);
  
  // Determinar timeout basado en el comando
  const isApplyCommand = command.includes('apply');
  const timeout = isApplyCommand ? 300000 : 60000; // 5 min para apply, 1 min para otros
  
  try {
    const { stdout, stderr } = await execFileAsync('wsl', ['bash', '-c', `cd '${workingDir}' && ${command}`], {
      maxBuffer: 10 * 1024 * 1024,
      timeout,
    });
    
    return stdout + stderr;
  } catch (error: any) {
    console.error('Error ejecutando comando:', error);
    throw new Error(error.stderr || error.message);
  }
}

function generateRecommendations(driftedResources: any[]): any {
  if (!driftedResources || driftedResources.length === 0) {
    return {
      summary: 'No hay recursos con drift detectado.',
      actions: [],
      risk: 'low',
    };
  }

  const actions: any[] = [];
  let highestRisk = 'low';

  for (const resource of driftedResources) {
    let actionType = 'update';
    let risk = 'low';
    let description = '';

    if (resource.action.includes('destroyed')) {
      actionType = 'destroy';
      risk = 'critical';
      description = `El recurso ${resource.address} será ELIMINADO. Esto puede causar pérdida de datos o interrupción del servicio.`;
    } else if (resource.action.includes('replaced')) {
      actionType = 'replace';
      risk = 'high';
      description = `El recurso ${resource.address} será REEMPLAZADO (destruido y recreado). Puede causar tiempo de inactividad.`;
    } else if (resource.action.includes('updated')) {
      actionType = 'update';
      risk = 'medium';
      description = `El recurso ${resource.address} será actualizado in-place. Los cambios incluyen modificaciones en configuración.`;
    } else if (resource.action.includes('created')) {
      actionType = 'create';
      risk = 'low';
      description = `Se creará el nuevo recurso ${resource.address}.`;
    }

    // Determinar el riesgo más alto
    if (risk === 'critical') highestRisk = 'critical';
    else if (risk === 'high' && highestRisk !== 'critical') highestRisk = 'high';
    else if (risk === 'medium' && highestRisk === 'low') highestRisk = 'medium';

    actions.push({
      resource: resource.address,
      type: resource.type,
      actionType,
      risk,
      description,
      changes: resource.changes || [],
      recommendation: generateActionRecommendation(actionType, resource),
    });
  }

  return {
    summary: `Se detectaron ${driftedResources.length} recurso(s) con drift. Nivel de riesgo: ${highestRisk.toUpperCase()}.`,
    actions,
    risk: highestRisk,
    recommendation: generateOverallRecommendation(highestRisk, actions),
  };
}

function generateActionRecommendation(actionType: string, resource: any): string {
  switch (actionType) {
    case 'destroy':
      return '⚠️ ACCIÓN CRÍTICA: Revisar manualmente antes de aplicar. Considerar backup si es necesario.';
    case 'replace':
      return '⚠️ ACCIÓN DE ALTO RIESGO: Verificar dependencias y planificar ventana de mantenimiento.';
    case 'update':
      return '✅ ACCIÓN SEGURA: Los cambios se pueden aplicar con bajo riesgo. Revisar los cambios específicos.';
    case 'create':
      return '✅ ACCIÓN SEGURA: Creación de nuevo recurso sin impacto en recursos existentes.';
    default:
      return 'Revisar manualmente antes de proceder.';
  }
}

function generateOverallRecommendation(risk: string, actions: any[]): string {
  const updateCount = actions.filter(a => a.actionType === 'update').length;
  const createCount = actions.filter(a => a.actionType === 'create').length;
  const replaceCount = actions.filter(a => a.actionType === 'replace').length;
  const destroyCount = actions.filter(a => a.actionType === 'destroy').length;

  let recommendation = '';

  if (risk === 'critical') {
    recommendation = `⛔ NO SE RECOMIENDA aplicar automáticamente. Hay ${destroyCount} recurso(s) que será(n) eliminado(s). Se sugiere revisión manual exhaustiva y backup antes de proceder.`;
  } else if (risk === 'high') {
    recommendation = `⚠️ PRECAUCIÓN: Hay ${replaceCount} recurso(s) que será(n) reemplazado(s). Se recomienda:\n1. Revisar el plan de Terraform completo\n2. Planificar ventana de mantenimiento\n3. Notificar a stakeholders\n4. Tener plan de rollback preparado`;
  } else if (risk === 'medium') {
    recommendation = `✅ Se puede proceder con PRECAUCIÓN. Los cambios son principalmente actualizaciones (${updateCount}). Se recomienda:\n1. Revisar los cambios específicos\n2. Aplicar en entorno de prueba primero\n3. Crear Pull Request para revisión por parte del equipo`;
  } else {
    recommendation = `✅ SEGURO PARA APLICAR. Solo hay creaciones o actualizaciones menores (${createCount} creaciones, ${updateCount} actualizaciones). Se recomienda crear Pull Request para documentar los cambios.`;
  }

  return recommendation;
}

async function detectDriftType(driftedResources: any[]): Promise<{
  type: 'code-ahead' | 'manual-change' | 'mixed';
  scenario: string;
  recommendedAction: 'apply-only' | 'create-pr' | 'manual-review';
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}> {
  // Analizar los cambios para determinar el tipo de drift
  
  // HEURÍSTICA: Si todos los cambios son UPDATES con tags/attributes nuevos,
  // probablemente el código está adelantado (Escenario 1)
  const allUpdates = driftedResources.every(r => 
    r.action.includes('updated') || r.action.includes('update')
  );
  
  const hasTagChanges = driftedResources.some(r => 
    r.changes?.some((change: string) => 
      change.toLowerCase().includes('tags') || 
      change.toLowerCase().includes('tag.')
    )
  );
  
  const hasOnlyAdditions = driftedResources.every(r => 
    r.changes?.every((change: string) => 
      change.includes('+ ') || change.includes('~') || !change.includes('- ')
    )
  );
  
  // ESCENARIO 1: Código adelantado (PR mergeado pero no aplicado)
  if (allUpdates && hasTagChanges && hasOnlyAdditions) {
    return {
      type: 'code-ahead',
      scenario: '📝 Código adelantado - PR mergeado pero no aplicado',
      recommendedAction: 'apply-only',
      explanation: 
        'El código en master tiene cambios (probablemente de un PR reciente) que aún NO están aplicados en Azure. ' +
        'La solución es ejecutar "terragrunt apply" para sincronizar la infraestructura con el código.',
      confidence: 'high',
    };
  }
  
  // ESCENARIO 2: Cambio manual en Azure (alguien modificó el portal)
  // Si hay deletions (-) o cambios que no son solo adiciones
  const hasDeletions = driftedResources.some(r => 
    r.changes?.some((change: string) => change.trim().startsWith('- '))
  );
  
  const hasNonTagChanges = driftedResources.some(r => 
    r.changes?.some((change: string) => 
      !change.toLowerCase().includes('tags') && 
      !change.toLowerCase().includes('tag.')
    )
  );
  
  if (hasDeletions || hasNonTagChanges) {
    return {
      type: 'manual-change',
      scenario: '⚠️ Cambio manual en Azure - Modificación fuera de Terraform',
      recommendedAction: 'create-pr',
      explanation: 
        'Se detectaron cambios en Azure que NO están en el código de Terraform. ' +
        'Alguien pudo haber modificado recursos manualmente en el portal de Azure. ' +
        'La solución es crear un PR para actualizar el código Terraform, ' +
        'que requiere revisión y aprobación del equipo antes de hacer merge.',
      confidence: 'high',
    };
  }
  
  // ESCENARIO MIXTO: No está claro
  return {
    type: 'mixed',
    scenario: '🤔 Escenario mixto o complejo',
    recommendedAction: 'manual-review',
    explanation: 
      'Los cambios detectados no se ajustan claramente a un patrón conocido. ' +
      'Se recomienda revisión manual del plan de Terraform para determinar la causa del drift.',
    confidence: 'low',
  };
}
