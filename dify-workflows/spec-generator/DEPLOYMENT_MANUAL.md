# Manual de Despliegue - Spec Generator Bot

Este documento proporciona instrucciones paso a paso para desplegar el bot Spec Generator en Dify, tanto de forma automatizada como manual.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Opción A: Despliegue Automatizado](#opción-a-despliegue-automatizado)
3. [Opción B: Despliegue Manual](#opción-b-despliegue-manual)
4. [Verificación del Despliegue](#verificación-del-despliegue)
5. [Integración con Control Center](#integración-con-control-center)
6. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### 1. Acceso a Dify Platform
- URL de tu instancia Dify
- API Key con permisos de administrador
- Rol: Admin o App Developer

### 2. Azure OpenAI
- Recurso Azure OpenAI creado
- Deployment de GPT-4o configurado
- API Key y Endpoint

### 3. Knowledge Portal
- Dataset ID del Knowledge Portal
- Embedding model configurado
- Acceso al portal

### 4. Herramientas Locales
```bash
# Verificar instalaciones
python3 --version  # >= 3.9
jq --version       # Para procesamiento JSON
curl --version     # Para llamadas API
bc --version       # Para cálculos (opcional)
```

---

## Opción A: Despliegue Automatizado

### Paso 1: Configurar Variables de Entorno

```bash
cd dify-workflows/spec-generator

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Configuración requerida en `.env`:
```bash
# Dify Platform
DIFY_API_URL=https://your-dify-instance.com/api
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx

# Azure OpenAI
AZURE_OPENAI_KEY=your-azure-openai-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Knowledge Portal
KNOWLEDGE_PORTAL_DATASET_ID=dataset_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Monitoring (opcional)
MONITORING_ENABLED=true
ALERT_EMAIL=your-email@dxc.com
```

### Paso 2: Ejecutar Script de Despliegue

```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

El script realizará automáticamente:
1. ✅ Validación de configuración
2. ✅ Creación del chatbot en Dify
3. ✅ Configuración del system prompt
4. ✅ Carga del workflow (7 nodos)
5. ✅ Upload del script de validación
6. ✅ Configuración de variables de conversación
7. ✅ Configuración del conversation opener
8. ✅ Configuración de preguntas sugeridas
9. ✅ Habilitación de features (citation, annotation)
10. ✅ Test de despliegue
11. ✅ Publicación a producción

### Paso 3: Verificar Despliegue

```bash
# Revisar deployment-info.json
cat deployment-info.json

# Output esperado:
# {
#     "chatbot_id": "app_xxxxxxxx",
#     "api_endpoint": "https://your-dify-instance.com/api/v1/chat-messages",
#     "version": "1.0.0",
#     "deployed_at": "2025-10-27T10:30:00Z",
#     "features": {
#         "workflow_nodes": 7,
#         "conversation_variables": 4,
#         "suggested_questions": 5,
#         "citation": true,
#         "annotation_reply": true
#     }
# }
```

### Paso 4: Ejecutar Tests

```bash
# Dar permisos
chmod +x test-cases.sh

# Ejecutar suite de tests
./test-cases.sh
```

Tests incluidos:
- ✅ Test 1: Sistema de autenticación OAuth2
- ✅ Test 2: Notificaciones en tiempo real
- ✅ Test 3: IaC para AKS cluster
- ✅ Test 4: Dashboard de analytics
- ✅ Test 5: API REST para especialistas
- ✅ Performance Test: Tiempo de respuesta <5min

**Success Criteria:**
- Pass Rate: ≥80%
- Quality Score: ≥80/100 (promedio)
- Response Time: <300s (5 minutos)

---

## Opción B: Despliegue Manual

Si prefieres desplegar manualmente o no tienes acceso a la API de Dify, sigue estos pasos en la UI de Dify.

### Paso 1: Crear Chatbot en Dify

1. **Acceder a Dify:**
   - URL: https://your-dify-instance.com
   - Login con credenciales de admin

2. **Crear Nueva App:**
   - Click en "Create App" → "Chatbot"
   - Configuración básica:
     ```
     Name: Spec Generator
     Icon: 🤖
     Description: Generador automático de especificaciones técnicas (spec.md, plan.md, tasks.md)
     ```

3. **Configurar Modelo:**
   - Model: Azure OpenAI GPT-4o
   - Temperature: 0.3
   - Max Tokens: 16000
   - Top P: 0.95
   - Frequency Penalty: 0
   - Presence Penalty: 0

### Paso 2: Configurar System Prompt

1. **Copiar System Prompt:**
   - Abrir `README.md`
   - Copiar líneas 27-523 (todo el System Prompt)

2. **Pegar en Dify:**
   - En la app creada, ir a "Settings" → "System Prompt"
   - Pegar el prompt completo
   - Guardar

### Paso 3: Crear Workflow (7 Nodos)

#### Nodo 1: Analyze Domain (LLM)

**Configuración:**
- Type: LLM
- Name: analyze_domain
- Model: GPT-4o
- Temperature: 0.3

**Prompt:**
```
Analiza la siguiente descripción de funcionalidad y extrae información estructurada en formato JSON.

Descripción: {{feature_description}}

Extrae:
1. category: Categoría del dominio (auth, notifications, api, frontend, backend, infrastructure, data, analytics, other)
2. feature_name: Nombre corto de la funcionalidad (kebab-case)
3. goal: Objetivo principal en 1-2 frases
4. target_users: Usuarios objetivo (array)
5. key_capabilities: Capacidades clave (array, 3-5 items)

Responde SOLO con JSON válido:
```

**Output Variable:** `domain_analysis` (JSON)

**Next Node:** search_knowledge

---

#### Nodo 2: Search Knowledge Portal (Knowledge Retrieval)

**Configuración:**
- Type: Knowledge Retrieval
- Name: search_knowledge
- Dataset: {{KNOWLEDGE_PORTAL_DATASET_ID}}
- Retrieval Mode: Semantic Search
- Top K: 5
- Score Threshold: 0.7
- Reranking: Enabled

**Query Template:**
```
{{domain_analysis.category}} {{domain_analysis.feature_name}}
```

**Output Variable:** `knowledge_context` (Array of Documents)

**Next Node:** generate_spec

---

#### Nodo 3: Generate spec.md (LLM)

**Configuración:**
- Type: LLM
- Name: generate_spec
- Model: GPT-4o
- Temperature: 0.3
- Max Tokens: 8000

**Prompt:**
```
Genera spec.md basándote en:

**Domain Analysis:**
{{domain_analysis}}

**Knowledge Portal Context:**
{{knowledge_context}}

**Applied Specs:**
{{applied_specs}}

**Feature Description:**
{{feature_description}}

Sigue el formato de spec-template.md. Incluye:
1. Título y metadata
2. Overview con resumen, usuarios objetivo, valor
3. User Stories (3-7) con formato Given/When/Then
4. Requirements (FR-XXX funcionales, NFR-XXX no funcionales)
5. Success Criteria (SC-XXX) con métricas medibles (números, %, tiempo)
6. Priorities (P1 must-have, P2 should-have, P3 nice-to-have)
7. Out of Scope
8. Dependencies

NO uses [NEEDS CLARIFICATION]. Si falta info, dedúcela del contexto o usa defaults razonables.
```

**Output Variable:** `spec_md` (String)

**Next Node:** generate_plan

---

#### Nodo 4: Generate plan.md (LLM)

**Configuración:**
- Type: LLM
- Name: generate_plan
- Model: GPT-4o
- Temperature: 0.3
- Max Tokens: 8000

**Prompt:**
```
Genera plan.md basándote en:

**spec.md:**
{{spec_md}}

**Tech Stack Preference:**
{{tech_stack_preference}}

**Applied Specs:**
{{applied_specs}}

Sigue el formato de plan-template.md. Incluye:
1. Tech Stack con justificación (por qué cada tecnología)
2. Constitution Check (cómo cumple con specs aplicadas)
3. Architecture (componentes, flujo de datos, diagramas)
4. API Contracts con ejemplos JSON
5. Data Models con schemas SQL/NoSQL
6. Implementation Phases (al menos 2 fases)
7. Testing Strategy (unit, integration, e2e)
8. Security Considerations

Todas las decisiones deben estar justificadas con "because", "why", "reason", o "benefit".
```

**Output Variable:** `plan_md` (String)

**Next Node:** generate_tasks

---

#### Nodo 5: Generate tasks.md (LLM)

**Configuración:**
- Type: LLM
- Name: generate_tasks
- Model: GPT-4o
- Temperature: 0.3
- Max Tokens: 8000

**Prompt:**
```
Genera tasks.md basándote en:

**spec.md:**
{{spec_md}}

**plan.md:**
{{plan_md}}

**Priority Focus:**
{{priority_focus}}

Sigue el formato de tasks-template.md. Para cada user story:
1. Task ID (X.Y donde X = user story, Y = task number)
2. Descripción (qué hacer)
3. Time Estimate (2-8 horas, promedio ideal: 3-6h)
4. Dependencies (otros Task IDs)
5. Files to Modify (rutas completas)
6. Definition of Done (criterios verificables)
7. Tests Required (qué tests crear)
8. Success Criteria Reference (SC-XXX)

Si una tarea >8h, subdivídela. Si <2h, considera combinar con otra.
Ordena por dependencias (tareas sin deps primero).
```

**Output Variable:** `tasks_md` (String)

**Next Node:** validate_output

---

#### Nodo 6: Validate Output (Code - Python)

**Configuración:**
- Type: Code
- Name: validate_output
- Language: Python 3
- Timeout: 30s

**Code:**
```python
# Copiar todo el contenido de validate.py aquí
```

**Input Variables:**
```python
{
    "spec_md": "{{spec_md}}",
    "plan_md": "{{plan_md}}",
    "tasks_md": "{{tasks_md}}"
}
```

**Output Variable:** `validation_result` (JSON con valid, errors, warnings, quality_score)

**Next Node:** format_response

---

#### Nodo 7: Format Response (Template)

**Configuración:**
- Type: Template
- Name: format_response
- Template Engine: Handlebars

**Template:**
```handlebars
# Especificaciones Generadas

{{#if validation_result.valid}}
✅ **Validación:** PASSED (Quality Score: {{validation_result.summary.quality_score}}/100)
{{else}}
❌ **Validación:** FAILED
{{/if}}

---

## 📋 spec.md

```markdown
{{spec_md}}
```

---

## 🏗️ plan.md

```markdown
{{plan_md}}
```

---

## ✅ tasks.md

```markdown
{{tasks_md}}
```

---

## 📊 Validation Report

**Quality Score:** {{validation_result.summary.quality_score}}/100

**Errors:** {{validation_result.summary.total_errors}}
{{#each validation_result.spec.errors}}
- ❌ spec.md: {{this}}
{{/each}}
{{#each validation_result.plan.errors}}
- ❌ plan.md: {{this}}
{{/each}}
{{#each validation_result.tasks.errors}}
- ❌ tasks.md: {{this}}
{{/each}}

**Warnings:** {{validation_result.summary.total_warnings}}
{{#each validation_result.spec.warnings}}
- ⚠️ spec.md: {{this}}
{{/each}}
{{#each validation_result.plan.warnings}}
- ⚠️ plan.md: {{this}}
{{/each}}
{{#each validation_result.tasks.warnings}}
- ⚠️ tasks.md: {{this}}
{{/each}}

**Metrics:**
- User Stories: {{validation_result.spec.metrics.user_stories}}
- Success Criteria: {{validation_result.spec.metrics.success_criteria}}
- Requirements: {{validation_result.spec.metrics.requirements}}
- Tasks: {{validation_result.tasks.metrics.total_tasks}}
- Avg Task Time: {{validation_result.tasks.metrics.avg_time}}h
- Max Task Time: {{validation_result.tasks.metrics.max_time}}h
```

**Output:** Final response to user

---

### Paso 4: Configurar Variables de Conversación

En Dify, ir a "Variables" y crear:

1. **feature_description**
   - Type: String
   - Required: Yes
   - Description: Descripción en lenguaje natural de la funcionalidad a especificar

2. **applied_specs**
   - Type: Array
   - Default: ["git-flow", "security"]
   - Options: git-flow, security, iac-terraform, finops
   - Description: Specs predefinidas a aplicar

3. **tech_stack_preference**
   - Type: String
   - Default: "auto"
   - Description: Stack tecnológico preferido o 'auto' para selección automática

4. **priority_focus**
   - Type: String
   - Default: "P1"
   - Options: P1, P1+P2, all
   - Description: Enfoque de prioridades

### Paso 5: Configurar Conversation Opener

En Dify, ir a "Features" → "Conversation Opener":

```
¡Hola! Soy el Spec Generator de DXC Cloud Mind. Puedo ayudarte a generar especificaciones técnicas completas a partir de descripciones en lenguaje natural.

**¿Qué genera?**
- spec.md: User stories, requisitos, criterios de éxito
- plan.md: Stack técnico, arquitectura, contratos de API
- tasks.md: Tareas implementables (2-8h), dependencias, DoD

**¿Cómo usarme?**
Describe la funcionalidad que necesitas especificar. Puedo aplicar automáticamente specs predefinidas (Git Flow, Security, IaC) según el dominio.

**Ejemplo:** "Necesito implementar autenticación OAuth2 con Azure AD para el Control Center"
```

### Paso 6: Configurar Suggested Questions

En Dify, ir a "Features" → "Suggested Questions" y agregar:

1. Sistema de notificaciones en tiempo real cuando proyectos cambian de estado
2. Autenticación OAuth2 con Azure AD y roles para Control Center
3. Dashboard de analytics con métricas de proyectos y especialistas
4. API REST para gestión de especialistas con búsqueda y filtros
5. Infraestructura como código para cluster AKS con auto-scaling

### Paso 7: Habilitar Features

En Dify, ir a "Features" y habilitar:

- ✅ **Citation:** Enabled
- ✅ **Annotation Reply:**
  - Enabled: Yes
  - Score Threshold: 0.8
- ✅ **Conversation History:**
  - Enabled: Yes
  - Max Turns: 10

### Paso 8: Publicar a Producción

1. **Test en Preview:**
   - Click en "Preview"
   - Probar con: "Sistema de autenticación con OAuth2"
   - Verificar que genera 3 archivos + validation

2. **Publicar:**
   - Click en "Publish"
   - Version: 1.0.0
   - Description: Initial production deployment
   - Click "Confirm"

3. **Obtener API Endpoint:**
   - Ir a "API Access"
   - Copiar endpoint: `https://your-dify-instance.com/api/v1/chat-messages`
   - Copiar API Key

---

## Verificación del Despliegue

### Test Manual en Dify UI

1. **Acceder al Chat:**
   - Ir a tu app en Dify
   - Click en "Preview" o "Chat"

2. **Test Case 1: Autenticación**
   ```
   Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. 
   Los usuarios deben poder hacer login con sus cuentas corporativas, gestionar 
   sesiones, y tener roles (admin, user, viewer).
   ```

   **Resultado esperado:**
   - ✅ spec.md con 4-5 user stories
   - ✅ plan.md con NextAuth.js + Azure AD B2C
   - ✅ tasks.md con tareas de 2-8h
   - ✅ Validation PASSED
   - ✅ Quality Score: ≥80/100

3. **Test Case 2: Notificaciones**
   ```
   Sistema de notificaciones en tiempo real que alerte a los usuarios cuando 
   sus proyectos cambian de estado. Las notificaciones deben mostrarse en el 
   UI sin recargar la página y persistir en base de datos.
   ```

   **Resultado esperado:**
   - ✅ spec.md con 3-4 user stories
   - ✅ plan.md con WebSocket + Redis
   - ✅ Validation PASSED

### Test via API

```bash
# Test con curl
curl -X POST "https://your-dify-instance.com/api/v1/chat-messages" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "feature_description": "Sistema de autenticación OAuth2 con Azure AD",
      "applied_specs": ["security"],
      "tech_stack_preference": "auto",
      "priority_focus": "P1"
    },
    "query": "Sistema de autenticación OAuth2",
    "response_mode": "blocking",
    "conversation_id": "",
    "user": "test-user"
  }'
```

**Success:** Response contiene spec.md, plan.md, tasks.md con validation PASSED

---

## Integración con Control Center

### Paso 1: Crear API Route

Crear archivo: `apps/control-center-ui/app/api/spec-generator/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const DIFY_API_URL = process.env.DIFY_API_URL!;
const DIFY_API_KEY = process.env.DIFY_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          feature_description: body.description,
          applied_specs: body.specs || ['git-flow', 'security'],
          tech_stack_preference: body.techStack || 'auto',
          priority_focus: body.priority || 'P1',
        },
        query: body.description,
        response_mode: 'blocking',
        conversation_id: body.conversationId || '',
        user: body.userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract files from response
    const specMd = extractFile(data.answer, 'spec.md');
    const planMd = extractFile(data.answer, 'plan.md');
    const tasksMd = extractFile(data.answer, 'tasks.md');
    const validation = extractValidation(data.answer);
    
    return NextResponse.json({
      success: true,
      files: { specMd, planMd, tasksMd },
      validation,
      conversationId: data.conversation_id,
    });
  } catch (error) {
    console.error('Spec Generator API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate specs' },
      { status: 500 }
    );
  }
}

function extractFile(text: string, filename: string): string {
  const regex = new RegExp(`## .*${filename}\\s*\`\`\`markdown\\s*([\\s\\S]*?)\`\`\``, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractValidation(text: string): any {
  const regex = /## .*Validation Report[\s\S]*?\*\*Quality Score:\*\* (\d+)\/100/i;
  const match = text.match(regex);
  return match ? { qualityScore: parseInt(match[1]) } : null;
}
```

### Paso 2: Agregar Variables de Entorno

Editar `.env.local`:
```bash
DIFY_API_URL=https://your-dify-instance.com/api/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 3: Crear UI Component

Crear archivo: `apps/control-center-ui/components/SpecGeneratorForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography, Alert } from '@mui/material';

export default function SpecGeneratorForm() {
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState(['git-flow', 'security']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/spec-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, specs }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Spec Generator</Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Descripción de la funcionalidad"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Specs Aplicadas:</Typography>
        <FormControlLabel
          control={<Checkbox checked={specs.includes('git-flow')} onChange={(e) => {
            if (e.target.checked) setSpecs([...specs, 'git-flow']);
            else setSpecs(specs.filter(s => s !== 'git-flow'));
          }} />}
          label="Git Flow"
        />
        <FormControlLabel
          control={<Checkbox checked={specs.includes('security')} onChange={(e) => {
            if (e.target.checked) setSpecs([...specs, 'security']);
            else setSpecs(specs.filter(s => s !== 'security'));
          }} />}
          label="Security"
        />
        <FormControlLabel
          control={<Checkbox checked={specs.includes('iac-terraform')} onChange={(e) => {
            if (e.target.checked) setSpecs([...specs, 'iac-terraform']);
            else setSpecs(specs.filter(s => s !== 'iac-terraform'));
          }} />}
          label="IaC (Terraform)"
        />
      </Box>
      
      <Button type="submit" variant="contained" disabled={loading} fullWidth>
        {loading ? 'Generando...' : 'Generar Specs'}
      </Button>
      
      {result && result.success && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            Quality Score: {result.validation?.qualityScore}/100
          </Alert>
          <Typography variant="h6" sx={{ mt: 2 }}>spec.md</Typography>
          <pre style={{ background: '#f5f5f5', padding: 16, overflow: 'auto' }}>
            {result.files.specMd}
          </pre>
        </Box>
      )}
    </Box>
  );
}
```

### Paso 4: Agregar Ruta en Control Center

Editar `apps/control-center-ui/app/spec-generator/page.tsx`:
```typescript
import SpecGeneratorForm from '@/components/SpecGeneratorForm';

export default function SpecGeneratorPage() {
  return <SpecGeneratorForm />;
}
```

---

## Troubleshooting

### Problema 1: Bot no responde

**Síntomas:**
- Request timeout
- Error 500

**Solución:**
1. Verificar que Azure OpenAI deployment está activo:
   ```bash
   curl https://your-resource.openai.azure.com/openai/deployments?api-version=2023-05-15 \
     -H "api-key: YOUR_KEY"
   ```
2. Aumentar timeout en workflow-config.json (de 30s a 60s)
3. Revisar logs en Dify: Settings → Logs

### Problema 2: Validation siempre falla

**Síntomas:**
- validation_result.valid = false
- Muchos errores en validation report

**Solución:**
1. Revisar validate.py está correctamente cargado en Code Node
2. Test local:
   ```bash
   python3 validate.py '{"spec_md": "...", "plan_md": "...", "tasks_md": "..."}'
   ```
3. Ajustar umbrales en validate.py (ej: min_user_stories de 3 a 2)

### Problema 3: Knowledge Portal no encuentra contexto

**Síntomas:**
- knowledge_context vacío
- Bot genera specs genéricas

**Solución:**
1. Verificar KNOWLEDGE_PORTAL_DATASET_ID:
   ```bash
   curl "$DIFY_API_URL/datasets/$KNOWLEDGE_PORTAL_DATASET_ID" \
     -H "Authorization: Bearer $DIFY_API_KEY"
   ```
2. Reducir score_threshold de 0.7 a 0.5
3. Aumentar top_k de 5 a 10

### Problema 4: Quality Score muy bajo (<60)

**Síntomas:**
- Specs generadas pero quality_score <60
- Muchos warnings

**Solución:**
1. Revisar system prompt está completo (líneas 27-523 de README.md)
2. Aumentar max_tokens en generate_spec/plan/tasks (de 8000 a 12000)
3. Reducir temperature de 0.3 a 0.2 (más determinista)

---

## Monitoreo y Métricas

### Configurar Alertas

Crear archivo: `dify-workflows/spec-generator/monitoring/alerts.yaml`

```yaml
alerts:
  - name: High Response Time
    condition: response_time > 300s
    action: email
    recipients: [your-email@dxc.com]
    
  - name: Low Quality Score
    condition: avg_quality_score < 80
    action: slack
    webhook: ${SLACK_WEBHOOK_URL}
    
  - name: Validation Errors
    condition: validation_error_rate > 10%
    action: email + slack
```

### Dashboards

Métricas clave:
- **Response Time:** p50, p95, p99
- **Quality Score:** avg, min, max
- **Validation Pass Rate:** % de specs que pasan validación
- **User Satisfaction:** feedback score

---

## Próximos Pasos

1. ✅ Bot desplegado en Dify
2. ⏳ Ejecutar test suite (test-cases.sh)
3. ⏳ Integrar con Control Center
4. ⏳ Recoger feedback de 3-5 desarrolladores
5. ⏳ Iterar basado en feedback

**Target Metrics:**
- Response Time: <300s (5 min)
- Validation Pass Rate: >95%
- Quality Score: >80/100
- User Satisfaction: >80%
