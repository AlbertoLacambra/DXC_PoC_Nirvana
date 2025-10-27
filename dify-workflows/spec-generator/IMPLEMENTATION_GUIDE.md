# Spec Generator Bot - Implementation Guide

**Version**: 1.0  
**Last Updated**: 2025-10-27

---

## Overview

Guía para implementar el bot Spec Generator en Dify.

**Prerequisitos**:
- Acceso a Dify platform (admin)
- Azure OpenAI endpoint configurado
- Knowledge Portal dataset configurado

---

## Step 1: Create Chatbot in Dify

### 1.1 Basic Configuration

1. Login to Dify platform
2. Click **"Create App"** → **"Chatbot"**
3. Configure:
   - **Name**: Spec Generator
   - **Icon**: 📋 (or upload custom icon)
   - **Description**: Generate complete specifications from natural language
   - **Type**: Chatbot

### 1.2 Model Configuration

Go to **Model Settings**:

```json
{
  "provider": "azure_openai",
  "model": "gpt-4o",
  "temperature": 0.3,
  "max_tokens": 16000,
  "top_p": 0.95,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

**Why these settings**:
- **Temperature 0.3**: Low randomness, deterministic outputs (specs need consistency)
- **Max tokens 16000**: Long outputs (3 files can be ~10k tokens)
- **Top_p 0.95**: High quality, avoid outlier tokens

---

## Step 2: Configure System Prompt

### System Prompt

Copy content from `README.md` section "System Prompt" (lines 27-523).

**File**: `system-prompt.md` (create in Dify or paste directly)

**Key sections**:
1. Role & Purpose
2. Core Principles
3. Quality Standards
4. Templates (reference)
5. Workflow Steps (8 steps)
6. Output Format
7. DXC Cloud Mind Context

---

## Step 3: Setup Workflow

### Workflow Nodes

Create 7 nodes in this order:

#### Node 1: Analyze Domain (LLM)

**Type**: LLM  
**Name**: Analyze Domain  
**Prompt**:

```
Analyze the user's feature description and extract:

1. **Feature Category** (auth, data management, integration, infrastructure, etc.)
2. **Feature Name**
3. **Main Goal**
4. **Target Users**
5. **Key Capabilities**

Feature description: {{feature_description}}

Output JSON:
```json
{
  "category": "...",
  "feature_name": "...",
  "main_goal": "...",
  "target_users": [...],
  "key_capabilities": [...]
}
```
```

**Output Variable**: `domain_analysis` (JSON)

---

#### Node 2: Search Knowledge Portal (Knowledge Retrieval)

**Type**: Knowledge Retrieval  
**Dataset**: DXC Cloud Mind Documentation (select your dataset)  
**Query**: `{{domain_analysis.category}} {{domain_analysis.feature_name}}`  
**Top K**: 5  
**Score Threshold**: 0.7  
**Reranking**: Enabled

**Output Variable**: `knowledge_context` (list of documents)

---

#### Node 3: Generate spec.md (LLM)

**Type**: LLM  
**Name**: Generate spec.md  
**System Prompt**: Use full system prompt from `system-prompt.md`  
**User Prompt**:

```
Generate spec.md following the spec-template.md structure.

**Feature Analysis**:
{{domain_analysis}}

**Knowledge Portal Context**:
{{knowledge_context}}

**Applied Specs**: {{applied_specs}}

**Priority Focus**: {{priority_focus}}

Generate complete spec.md with:
- User scenarios (3-7 stories with Given/When/Then)
- Functional requirements (FR-XXX)
- Success criteria (SC-XXX with measurable targets)
- Validation checklist

IMPORTANT:
- Success criteria MUST have numbers (%, ms, hours, etc.)
- No [NEEDS CLARIFICATION] markers
- Tech-agnostic requirements
- P1/P2/P3 priorities assigned
```

**Output Variable**: `spec_md` (markdown string)

---

#### Node 4: Generate plan.md (LLM)

**Type**: LLM  
**Name**: Generate plan.md  
**System Prompt**: Same as Node 3  
**User Prompt**:

```
Generate plan.md following the plan-template.md structure.

**spec.md Content**:
{{spec_md}}

**Tech Stack Preference**: {{tech_stack_preference}}

**Applied Specs**: {{applied_specs}}

Generate complete plan.md with:
- Tech stack (with justification for each choice)
- Constitution check (reference applied specs)
- Project structure (source code layout)
- API contracts (all endpoints with request/response examples)
- Data models (entities, DB schemas)
- Implementation phases (Phase 0-3)
- Testing strategy
- Security considerations

IMPORTANT:
- Justify tech choices (why X over Y?)
- Include JSON examples for API contracts
- SQL schemas for data models
- Map phases to user story priorities
```

**Output Variable**: `plan_md` (markdown string)

---

#### Node 5: Generate tasks.md (LLM)

**Type**: LLM  
**Name**: Generate tasks.md  
**System Prompt**: Same as Node 3  
**User Prompt**:

```
Generate tasks.md following the tasks-template.md structure.

**spec.md Content**:
{{spec_md}}

**plan.md Content**:
{{plan_md}}

Generate complete tasks.md with:
- Tasks organized by user story
- Atomic tasks (2-8 hours each)
- Task dependencies specified
- Definition of done per task
- Files to create/modify
- Phase breakdown
- Testing checklist
- Database migrations (if needed)
- Configuration changes
- Deployment checklist

IMPORTANT:
- Subdivide tasks >8 hours
- Each task links to SC-XXX from spec.md
- Include test requirements (unit, integration, E2E)
- Specify exact file paths
```

**Output Variable**: `tasks_md` (markdown string)

---

#### Node 6: Validate Output (Code)

**Type**: Code (Python)  
**Name**: Validate Output  
**Code**: Copy content from `validate.py`

**Inputs**:
```json
{
  "spec_md": "{{spec_md}}",
  "plan_md": "{{plan_md}}",
  "tasks_md": "{{tasks_md}}"
}
```

**Output Variable**: `validation_result` (JSON)

---

#### Node 7: Format Response (Template)

**Type**: Template  
**Name**: Format Response  
**Template**:

```
✅ **Especificación completa generada**

**Validación**:
{{#if validation_result.valid}}
✅ Todas las validaciones pasaron
{{else}}
❌ Errores encontrados: {{validation_result.summary.total_errors}}
⚠️ Warnings: {{validation_result.summary.total_warnings}}

**Errores**:
{{#each validation_result.spec.errors}}
- {{this}}
{{/each}}
{{#each validation_result.plan.errors}}
- {{this}}
{{/each}}
{{#each validation_result.tasks.errors}}
- {{this}}
{{/each}}
{{/if}}

**Métricas**:
- User Stories: {{validation_result.spec.metrics.user_stories}}
- Success Criteria: {{validation_result.spec.metrics.success_criteria}}
- Tasks: {{validation_result.tasks.metrics.total_tasks}}
- Avg Task Time: {{validation_result.tasks.metrics.avg_time}}h
- Quality Score: {{validation_result.summary.quality_score}}/100

**Specs aplicadas**: {{applied_specs}}

---

# spec.md

{{spec_md}}

---

# plan.md

{{plan_md}}

---

# tasks.md

{{tasks_md}}

---

¿Quieres que ajuste algo específico?
```

**Output Variable**: `formatted_response`

---

### Workflow Flow

```
Start
  ↓
[User Input: feature_description]
  ↓
Node 1: Analyze Domain
  ↓
Node 2: Search Knowledge Portal
  ↓
Node 3: Generate spec.md
  ↓
Node 4: Generate plan.md
  ↓
Node 5: Generate tasks.md
  ↓
Node 6: Validate Output
  ↓
Node 7: Format Response
  ↓
End
```

---

## Step 4: Configure Conversation Variables

Go to **Settings** → **Conversation Variables**:

### Variable 1: feature_description

```json
{
  "name": "feature_description",
  "type": "string",
  "required": true,
  "description": "User's feature description in natural language",
  "input_method": "user_input"
}
```

### Variable 2: applied_specs

```json
{
  "name": "applied_specs",
  "type": "select_multiple",
  "default": ["git-flow", "security"],
  "options": [
    {"value": "git-flow", "label": "Git Flow Best Practices"},
    {"value": "security", "label": "Security Best Practices"},
    {"value": "iac-terraform", "label": "IaC Best Practices (Terraform)"},
    {"value": "finops", "label": "FinOps Best Practices"}
  ],
  "description": "Specs to apply to this feature"
}
```

### Variable 3: tech_stack_preference

```json
{
  "name": "tech_stack_preference",
  "type": "string",
  "default": "auto",
  "description": "Preferred tech stack or 'auto' for AI selection",
  "placeholder": "e.g., 'Next.js + PostgreSQL' or 'auto'"
}
```

### Variable 4: priority_focus

```json
{
  "name": "priority_focus",
  "type": "select",
  "default": "P1",
  "options": [
    {"value": "P1", "label": "P1 only (MVP)"},
    {"value": "P1+P2", "label": "P1 + P2 (Complete feature)"},
    {"value": "all", "label": "All priorities (P1+P2+P3)"}
  ],
  "description": "Which priority user stories to focus on"
}
```

---

## Step 5: Configure Conversation Opener

Go to **Settings** → **Conversation Opener**:

```
¡Hola! Soy el **Spec Generator**. 

Descríbeme la feature que quieres implementar y generaré especificaciones completas siguiendo la metodología Spec-Driven Development.

**Proceso**:
1. 📋 Analizo tu descripción
2. 🔍 Busco contexto en Knowledge Portal
3. ✍️ Genero spec.md, plan.md, tasks.md
4. ✅ Valido calidad

**Ejemplo**: "Necesito un sistema de autenticación OAuth2 con Azure AD para el Control Center."

¿Qué feature quieres especificar?
```

---

## Step 6: Configure Suggested Questions

Go to **Settings** → **Suggested Questions**:

```json
[
  "Sistema de notificaciones en tiempo real con WebSocket",
  "Autenticación OAuth2 con Azure AD B2C",
  "Dashboard de analytics con gráficos interactivos",
  "API REST para gestión de proyectos Spec-Driven",
  "Deploy automático a AKS con Terraform"
]
```

---

## Step 7: Enable Features

Go to **Settings** → **Features**:

- ✅ **Citation**: Enabled (show Knowledge Portal sources)
- ✅ **Annotation Reply**: Enabled (score threshold: 0.8)
- ✅ **Conversation History**: Enabled
- ❌ **Speech-to-Text**: Disabled (not needed)
- ❌ **Text-to-Speech**: Disabled (not needed)

---

## Step 8: Test Bot

### Test Case 1: Authentication System

**Input**:
```
Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. 
Los usuarios deben poder hacer login con sus cuentas corporativas de DXC.
```

**Expected Output**:
- spec.md with 4-5 user stories
- Security spec applied
- Tech stack: NextAuth.js + Azure AD B2C
- Success criteria: <500ms login time, >99.5% availability

### Test Case 2: Notifications

**Input**:
```
Sistema de notificaciones en tiempo real. Cuando un proyecto cambia de estado 
(Specify → Plan → Tasks → Implement), notificar a los miembros del equipo.
```

**Expected Output**:
- spec.md with 3-4 user stories
- Tech stack: WebSocket + Redis + PostgreSQL
- Success criteria: <100ms notification latency

---

## Step 9: Deploy to Production

### 9.1 Publish Bot

1. Click **"Publish"** button
2. Review changes
3. Confirm publication

### 9.2 Get API Endpoint

Go to **API Access**:

```bash
# API Endpoint
https://your-dify-instance.com/v1/chat-messages

# API Key
dify-xxxxxxxxxxxxxxxxxxxxx
```

### 9.3 Test via API

```bash
curl -X POST 'https://your-dify-instance.com/v1/chat-messages' \
  -H 'Authorization: Bearer dify-xxxxxxxxxxxxxxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": {
      "feature_description": "Sistema de autenticación OAuth2 con Azure AD",
      "applied_specs": ["git-flow", "security"],
      "tech_stack_preference": "auto",
      "priority_focus": "P1"
    },
    "query": "Genera la especificación completa",
    "response_mode": "blocking",
    "user": "user-123"
  }'
```

---

## Step 10: Integrate with Control Center

### 10.1 Create API Route

```typescript
// app/api/spec-generator/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { feature_description, applied_specs, tech_stack_preference, priority_focus } = await req.json();
  
  const response = await fetch(
    `${process.env.DIFY_API_ENDPOINT}/v1/chat-messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          feature_description,
          applied_specs: applied_specs || ["git-flow", "security"],
          tech_stack_preference: tech_stack_preference || "auto",
          priority_focus: priority_focus || "P1",
        },
        query: "Genera la especificación completa",
        response_mode: "blocking",
        user: req.headers.get("x-user-id") || "anonymous",
      }),
    }
  );
  
  const data = await response.json();
  
  return NextResponse.json({
    spec_md: extractFile(data.answer, "spec.md"),
    plan_md: extractFile(data.answer, "plan.md"),
    tasks_md: extractFile(data.answer, "tasks.md"),
    validation: extractValidation(data.answer),
  });
}

function extractFile(text: string, filename: string): string {
  const regex = new RegExp(`# ${filename}\\n\\n([\\s\\S]*?)\\n\\n---`, "m");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function extractValidation(text: string): any {
  const regex = /\*\*Métricas\*\*:\n([\s\S]*?)\n\n/;
  const match = text.match(regex);
  if (!match) return null;
  
  const metrics = match[1];
  return {
    user_stories: parseInt(metrics.match(/User Stories: (\d+)/)?.[1] || "0"),
    success_criteria: parseInt(metrics.match(/Success Criteria: (\d+)/)?.[1] || "0"),
    tasks: parseInt(metrics.match(/Tasks: (\d+)/)?.[1] || "0"),
    avg_task_time: parseFloat(metrics.match(/Avg Task Time: ([\d.]+)h/)?.[1] || "0"),
    quality_score: parseFloat(metrics.match(/Quality Score: ([\d.]+)/)?.[1] || "0"),
  };
}
```

### 10.2 Create UI Component

```typescript
// components/SpecGeneratorForm.tsx
"use client";

import { useState } from "react";
import { Button, TextField, Checkbox, FormControlLabel, Paper } from "@mui/material";

export default function SpecGeneratorForm() {
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState(["git-flow", "security"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleGenerate = async () => {
    setLoading(true);
    
    const response = await fetch("/api/spec-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature_description: description,
        applied_specs: specs,
        tech_stack_preference: "auto",
        priority_focus: "P1",
      }),
    });
    
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Feature Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe la feature que quieres implementar..."
      />
      
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={specs.includes("git-flow")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSpecs([...specs, "git-flow"]);
                } else {
                  setSpecs(specs.filter((s) => s !== "git-flow"));
                }
              }}
            />
          }
          label="Git Flow Best Practices"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={specs.includes("security")}
              onChange={(e) => {
                if (e.target.checked) {
                  setSpecs([...specs, "security"]);
                } else {
                  setSpecs(specs.filter((s) => s !== "security"));
                }
              }}
            />
          }
          label="Security Best Practices"
        />
      </div>
      
      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={loading || !description}
      >
        {loading ? "Generando..." : "Generar Especificación"}
      </Button>
      
      {result && (
        <div>
          <h3>Resultado</h3>
          <p>Quality Score: {result.validation.quality_score}/100</p>
          <pre>{result.spec_md}</pre>
          <pre>{result.plan_md}</pre>
          <pre>{result.tasks_md}</pre>
        </div>
      )}
    </Paper>
  );
}
```

---

## Monitoring & Metrics

### Success Metrics

Track in Dify Analytics:

- **Response Time**: <5 minutes (p95)
- **Validation Pass Rate**: >95%
- **Quality Score**: >80/100 average
- **User Satisfaction**: >80% (collect feedback)

### Alerts

Configure alerts for:

- Response time >10 minutes
- Validation errors >10%
- API errors >5%

---

## Troubleshooting

### Issue 1: Validation Errors

**Symptom**: Bot generates specs with validation errors

**Solution**:
1. Check system prompt (ensure it includes quality standards)
2. Increase temperature slightly (0.3 → 0.4) for more creativity
3. Add more examples to system prompt

### Issue 2: Slow Response

**Symptom**: Takes >5 minutes to generate specs

**Solution**:
1. Reduce max_tokens if hitting limits
2. Optimize Knowledge Portal query (reduce top_k)
3. Consider streaming response mode

### Issue 3: Missing Context

**Symptom**: Bot doesn't use Knowledge Portal effectively

**Solution**:
1. Check dataset configuration (ensure documents indexed)
2. Improve query in Node 2 (add more keywords)
3. Lower score_threshold (0.7 → 0.6)

---

## Next Steps

1. ✅ Implement bot in Dify (this guide)
2. ⏳ Test with 3-5 use cases
3. ⏳ Collect feedback from developers
4. ⏳ Iterate based on feedback (target: 80%+ satisfaction)

---

## References

- [Dify Documentation](https://docs.dify.ai/)
- [Azure OpenAI API](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Spec-Driven Development](../../docs/features/spec-driven-development/README.md)
