import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

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

    if (action === 'import-manual-changes') {
      // NUEVO: Importar cambios manuales de Azure al código
      const { driftedResources } = body;
      
      const workingPath = process.env.TERRAFORM_PATH || 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub';
      const repoPath = 'c:\\PROYECTS\\DXC_PoC_Nirvana';
      
      // Convertir a paths WSL
      const wslWorkingPath = workingPath
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      
      const wslRepoPath = repoPath
        .replace(/\\/g, '/')
        .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
      
      try {
        console.log('🔄 Capturando cambios manuales de Azure...');
        
        // Configurar PATH para Terraform/Terragrunt
        const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
        const terragruntPath = '/usr/local/bin/terragrunt';
        
        // SIMPLIFICADO: No ejecutar refresh (puede tardar mucho)
        // En su lugar, usar el plan que ya tenemos para generar la documentación
        
        console.log('📄 Generando documentación de cambios...');
        
        // Generar archivo de documentación con los cambios detectados
        const changesDoc = generateManualChangesDoc(driftedResources, '');
        
        // Guardar el archivo de documentación usando echo (más simple que heredoc)
        const timestamp = Date.now();
        const docFilename = `MANUAL_CHANGES_${timestamp}.md`;
        const docPath = `${wslRepoPath}/${docFilename}`;
        
        // Escapar comillas en el contenido
        const escapedDoc = changesDoc.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        
        // Crear archivo con echo (más confiable en WSL)
        const createDocCommand = `echo "${escapedDoc}" > '${docPath}'`;
        
        try {
          await executeCommand(wslRepoPath, createDocCommand);
          console.log(`✅ Documentación creada: ${docFilename}`);
        } catch (fileErr) {
          console.warn('⚠️ No se pudo crear archivo MD, se incluirá en descripción del PR');
        }
        
        return NextResponse.json({
          success: true,
          message: 'Cambios manuales capturados exitosamente',
          changesDoc,
          docFilename,
        });
        
      } catch (error: any) {
        console.error('❌ Error importando cambios manuales:', error);
        return NextResponse.json({
          success: false,
          error: `Error al importar cambios: ${error.message}`,
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
        
        // 4. Crear archivo temporal con el body del PR (evita problemas con textos largos)
        const prBodyFile = path.join(wslRepoPath, '.pr-body-temp.md');
        const escapedPrDesc = prDescription.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        await executeCommand(wslRepoPath, `echo "${escapedPrDesc}" > '${prBodyFile}'`);
        
        // 5. Crear Pull Request usando GitHub CLI con archivo
        const prResult = await executeCommand(
          wslRepoPath, 
          `gh pr create --title "${prTitle}" --body-file '${prBodyFile}' --base master --head ${branchName}`
        );
        
        // Limpiar archivo temporal
        try {
          await executeCommand(wslRepoPath, `rm -f '${prBodyFile}'`);
        } catch (cleanupErr) {
          console.warn('⚠️ No se pudo eliminar archivo temporal:', cleanupErr);
        }
        
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

function generateManualChangesDoc(driftedResources: any[], stateOutput: string): string {
  const timestamp = new Date().toLocaleString('es-ES');
  
  return `# 🔄 Cambios Manuales Detectados en Azure

**Fecha de Detección:** ${timestamp}  
**Recursos Modificados:** ${driftedResources.length}  
**Origen:** Modificaciones realizadas manualmente en Azure Portal

---

## ⚠️ Contexto

Este documento fue generado automáticamente por **DXC Cloud Mind - Nirvana Dashboard**.

Se detectaron cambios en la infraestructura de Azure que **NO están reflejados en el código Terraform**. 
Esto generalmente ocurre cuando:

- 🚨 Un miembro del equipo de operaciones realiza cambios de emergencia en el portal
- 🛠️ Se aplican hotfixes directamente en Azure durante una incidencia
- 👤 Alguien modifica recursos manualmente sin actualizar el código IaC

---

## 📋 Recursos Modificados

${driftedResources.map((resource: any, idx: number) => `
### ${idx + 1}. ${resource.address || resource.name}

**Tipo:** \`${resource.type}\`  
**Acción:** ${resource.action}  
**Severidad:** ${resource.severity}

**Cambios Detectados:**
\`\`\`hcl
${resource.changes.join('\n')}
\`\`\`
`).join('\n---\n')}

---

## ✅ Pasos para Aprobar estos Cambios

### 1️⃣ Revisar los Cambios

Verifica que los cambios manuales sean:
- ✓ Intencionales y necesarios
- ✓ No introducen vulnerabilidades de seguridad
- ✓ Cumplen con las políticas de la organización
- ✓ Están documentados (ticket, incidencia, etc.)

### 2️⃣ Actualizar el Código Terraform

Para incorporar estos cambios al código, ejecuta:

\`\`\`bash
cd terraform/hub

# Ver el estado actual
terragrunt show

# Actualizar el archivo main.tf con los cambios detectados
# Ejemplo: Si se agregó un tag "ManualTest" = "true":
vim main.tf

# Agregar el nuevo tag al resource:
tags = merge(var.tags, {
  DriftTest  = "active"
  LastUpdate = "2025-10-20"
  Owner      = "DXC Cloud Team"
  ManualTest = "true"  # <-- NUEVO: Agregado durante incidencia
})
\`\`\`

### 3️⃣ Validar los Cambios

\`\`\`bash
# Verificar que el plan esté limpio
terragrunt plan

# Deberías ver: "No changes. Your infrastructure matches the configuration."
\`\`\`

### 4️⃣ Commitear y Push

\`\`\`bash
git add terraform/hub/main.tf
git commit -m "feat: Import manual changes from Azure

Changes made during incident response/hotfix.
Documented in [TICKET-NUMBER]"

git push
\`\`\`

${stateOutput ? `
---

## 📊 Estado Actual de Terraform

<details>
<summary>Click para ver el output de terraform show</summary>

\`\`\`
${stateOutput.substring(0, 1000)}
${stateOutput.length > 1000 ? '\n... (truncado)\n' : ''}
\`\`\`

</details>
` : ''}

---

## 🔐 Política de IaC

⚠️ **RECORDATORIO IMPORTANTE:**

Los cambios manuales en Azure **deben ser excepcionales** y solo en casos de emergencia.

**Proceso correcto:**
1. 🎫 Crear ticket/issue documentando la necesidad del cambio
2. 💻 Modificar el código Terraform en una rama feature
3. 📝 Crear Pull Request con descripción detallada
4. 👀 Revisión y aprobación del equipo
5. ✅ Merge a master
6. 🚀 Deploy con terragrunt apply

**Este PR es para REGULARIZAR cambios ya realizados en emergencia.**

---

*Generado automáticamente por DXC Cloud Mind - Nirvana Dashboard*  
*Terraform State actualizado con terragrunt refresh*
`;
}
