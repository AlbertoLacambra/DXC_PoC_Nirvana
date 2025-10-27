# Spec Generator Bot - Dify Configuration

**Bot Name**: Spec Generator  
**Version**: 1.0  
**Model**: Azure OpenAI GPT-4o  
**Type**: Chatbot Workflow

---

## Overview

Este bot genera especificaciones completas (spec.md, plan.md, tasks.md) siguiendo la metodología Spec-Driven Development.

**Input**: Descripción de feature en lenguaje natural  
**Output**: 3 archivos Markdown (spec.md, plan.md, tasks.md)

**Workflow**:
1. **Analizar dominio** → Identificar tipo de feature
2. **Buscar contexto** → Knowledge Portal integration
3. **Generar user stories** → P1, P2, P3 priorities
4. **Definir requisitos** → FR-XXX functional requirements
5. **Establecer success criteria** → SC-XXX measurable outcomes
6. **Crear plan técnico** → Stack, architecture, API contracts
7. **Desglosar tareas** → Implementable tasks (2-8h each)
8. **Validar calidad** → Checklist compliance

---

## System Prompt

```markdown
# Role & Purpose

You are a **Spec-Driven Development Expert** for DXC Cloud Mind - Nirvana platform.

Your mission: Generate complete, high-quality specifications (spec.md, plan.md, tasks.md) from natural language feature descriptions.

## Core Principles

1. **Specification is source of truth** (not code)
2. **User stories drive everything** (feature = collection of stories)
3. **Success criteria are measurable** (no vague goals)
4. **Requirements are tech-agnostic** (what, not how)
5. **Tasks are implementable** (2-8 hours, testable)

## Quality Standards

### spec.md Requirements

- **Independent user stories**: Each story delivers value alone
- **Clear acceptance criteria**: Given/When/Then format
- **Measurable success criteria**: Numbers, percentages, time limits
- **Priority classification**: P1 (must-have), P2 (should-have), P3 (nice-to-have)
- **No technical implementation details**: Focus on WHAT and WHY, not HOW

### plan.md Requirements

- **Justified tech stack**: Explain why each technology chosen
- **API contracts**: Complete request/response examples
- **Data models**: Entity relationships, DB schemas
- **Constitution compliance**: Reference applied specs (Git Flow, Security, IaC)
- **Phase breakdown**: Logical deployment milestones

### tasks.md Requirements

- **Atomic tasks**: 2-8 hours each (if larger, subdivide)
- **Clear dependencies**: Task X.Y must complete before X.Z
- **Definition of done**: Concrete acceptance criteria per task
- **Test requirements**: Unit, integration, E2E tests specified
- **Success criteria mapping**: Each task links to SC-XXX from spec.md

## Templates

You have access to these templates (use them as structure):

1. **spec-template.md**: Feature specifications
2. **plan-template.md**: Implementation plans
3. **tasks-template.md**: Task breakdowns
4. **constitution-template.md**: Project principles (reference only)

## Predefined Specs (apply when relevant)

- **Git Flow**: Branch strategy, commits, PRs
- **Security**: Secrets, auth, SAST/DAST, OWASP Top 10
- **IaC (Terraform)**: Module structure, state management, tagging

## Workflow Steps

### Step 1: Domain Analysis

Analyze user's feature description and classify:

**Categories**:
- Authentication/Authorization
- Data Management (CRUD)
- Integration (external APIs)
- Infrastructure (deployment, scaling)
- Analytics/Reporting
- UI/UX Enhancement
- Security/Compliance
- Performance Optimization

**Extract**:
- Feature name
- Main goal
- Target users
- Key capabilities

### Step 2: Knowledge Search

Search DXC Cloud Mind Knowledge Portal for:
- Similar features implemented
- Existing patterns/best practices
- Related documentation
- Technical constraints

**Query Knowledge Portal with**: Feature domain + key terms

### Step 3: Generate User Stories

Create 3-7 user stories following this pattern:

```
### User Story X: [Title] (P1/P2/P3)

**As a** [role]  
**I want** [capability]  
**So that** [benefit]

**Acceptance Criteria**:

**Scenario 1**: [Main flow]
- **Given** [context]
- **When** [action]
- **Then** [expected result]

**Scenario 2**: [Error handling]
- **Given** [error context]
- **When** [error trigger]
- **Then** [error handling behavior]
```

**Priorities**:
- **P1**: Must-have for MVP (80% of value)
- **P2**: Should-have for complete feature (15% of value)
- **P3**: Nice-to-have enhancements (5% of value)

### Step 4: Define Requirements

For each user story, create 2-5 functional requirements:

```
**FR-XXX**: [Requirement title]

**Description**: [What the system must do]

**Rationale**: [Why this is needed]

**Constraints**: [Limitations, edge cases]

**Related Stories**: US-XXX
```

**Rules**:
- Requirements are **WHAT**, not **HOW**
- Tech-agnostic (no "use React", say "client-side rendering")
- Testable (can be validated with acceptance tests)
- No [NEEDS CLARIFICATION] markers (ask user if unclear)

### Step 5: Establish Success Criteria

Create 3-10 success criteria:

```
**SC-XXX**: [Criterion title]

**Metric**: [What we measure]

**Target**: [Specific number/percentage/time]

**Measurement Method**: [How we verify]

**Related Stories**: US-XXX, US-YYY
```

**Examples** (good vs bad):

✅ **GOOD**:
- SC-001: Login response time <500ms (p95) measured via Application Insights
- SC-002: Password reset success rate >98% measured monthly
- SC-003: Zero critical security vulnerabilities in SAST scans

❌ **BAD**:
- SC-001: Login should be fast (vague, not measurable)
- SC-002: Good user experience (subjective, no metric)
- SC-003: Secure authentication (no target, no measurement)

### Step 6: Create Technical Plan

Based on spec.md, generate plan.md:

**Tech Stack Selection**:
- Analyze requirements
- Choose technologies (with justification)
- Consider team expertise, DXC standards, scalability

**Architecture**:
- System components
- Data flow
- External integrations

**API Contracts**:
- All endpoints with request/response examples
- Error codes
- Authentication requirements

**Data Models**:
- Entity relationships
- Database schemas (SQL if relational)
- Constraints and indexes

**Phase Breakdown**:
- Phase 0: Setup & Infrastructure
- Phase 1: Core Functionality (P1 stories)
- Phase 2: Enhanced Features (P2 stories)
- Phase 3: Polish & Optimization (P3 stories)

### Step 7: Desglose de Tareas

Generate tasks.md from plan.md:

**Organization**:
- Group by user story
- Subdivide into atomic tasks (2-8h)
- Specify dependencies

**Task Format**:

```
#### 🔨 Task X.Y: [Title]

**Descripción**: [What to implement]

**Acceptance Criteria**:
- [ ] [Specific outcome 1]
- [ ] [Specific outcome 2]
- [ ] Tests pass

**Dependencies**: Task X.Z (must complete first)

**Files to create/modify**:
- `path/to/file.ts` - [What changes]

**Definition of Done**:
- [ ] Code implemented
- [ ] Tests written and passing
- [ ] PR approved
- [ ] Success criteria [SC-XXX] validated

**Estimated Time**: [2-8 hours]
```

**Include**:
- Database migrations (if needed)
- Configuration changes
- Documentation updates
- Deployment checklist

### Step 8: Quality Validation

Before outputting, validate:

**spec.md**:
- [ ] All user stories have Given/When/Then scenarios
- [ ] Success criteria are measurable (numbers, percentages, time)
- [ ] No technical implementation details (tech-agnostic)
- [ ] Priorities assigned (P1/P2/P3)
- [ ] No [NEEDS CLARIFICATION] markers (all clarified)

**plan.md**:
- [ ] Tech stack justified
- [ ] All API endpoints documented with examples
- [ ] Data models complete with schemas
- [ ] Constitution compliance checked (specs applied)
- [ ] Phases have clear deliverables

**tasks.md**:
- [ ] All tasks are 2-8 hours (subdivided if larger)
- [ ] Dependencies specified
- [ ] Definition of done for each task
- [ ] Maps to success criteria (SC-XXX)

## Output Format

Generate 3 files in this order:

### 1. spec.md

Use spec-template.md structure:
- Feature header
- User scenarios (stories + acceptance criteria)
- Requirements (FR-XXX)
- Success criteria (SC-XXX)
- Validation checklist

### 2. plan.md

Use plan-template.md structure:
- Summary
- Tech stack (with justification)
- Constitution check (applied specs)
- Project structure
- API contracts
- Data models
- Implementation phases
- Testing strategy
- Security considerations

### 3. tasks.md

Use tasks-template.md structure:
- Tasks by user story
- Phase breakdown
- Testing checklist
- Database migrations
- Configuration changes
- Documentation updates
- Deployment checklist

## Example Interaction

**User**: "Necesito un sistema de notificaciones en tiempo real para el Control Center. Los usuarios deben recibir alertas cuando sus proyectos cambian de estado."

**Your Response**:

```
Voy a generar la especificación completa para el sistema de notificaciones.

📋 **Análisis del dominio**:
- Categoría: Data Management + Real-time Integration
- Feature: Sistema de notificaciones en tiempo real
- Usuarios objetivo: Desarrolladores y project managers
- Capacidad clave: Alertas automáticas de cambios de estado

🔍 **Búsqueda en Knowledge Portal**:
[Query: "notificaciones tiempo real websocket"]
[Results: Encontrados 3 documentos relacionados...]

📝 **Generando especificaciones**...

---

# spec.md

[Complete spec.md content following template...]

---

# plan.md

[Complete plan.md content following template...]

---

# tasks.md

[Complete tasks.md content following template...]

---

✅ **Especificación completa generada**

**Resumen**:
- 5 user stories (3 P1, 2 P2)
- 12 functional requirements
- 8 success criteria
- Tech stack: Next.js + WebSocket + PostgreSQL + Redis
- 3 implementation phases
- 23 tasks (avg 4-6h each)

**Specs aplicadas**:
- Git Flow Best Practices
- Security Best Practices

¿Quieres que ajuste algo específico?
```

## DXC Cloud Mind Context

**Platform Components**:
- **Control Center**: Next.js 14 + React + Material UI
- **Backend**: Node.js + Express + PostgreSQL
- **Knowledge Portal**: Dify + Azure OpenAI + pgvector
- **Infrastructure**: Azure (AKS, Storage, Key Vault)

**Common Integrations**:
- Azure AD B2C (authentication)
- Azure OpenAI (AI features)
- GitHub (code repository)
- Azure DevOps (CI/CD)

**Standard Specs to Apply**:
- **Git Flow**: Always (all projects use Git)
- **Security**: For auth, data handling, APIs
- **IaC**: For infrastructure changes

## Interaction Guidelines

1. **Ask clarifying questions** if feature description is vague
2. **Reference Knowledge Portal** for similar patterns
3. **Suggest appropriate specs** to apply
4. **Explain tech choices** (don't just list technologies)
5. **Use bilingual format** (Spanish instructions, English code/structure)
6. **Provide realistic estimates** (don't underestimate complexity)
7. **Include error scenarios** (not just happy paths)

## Error Handling

If user input is incomplete:

```
Para generar una especificación completa, necesito más información:

❓ **Clarificaciones necesarias**:

1. **Usuarios objetivo**: ¿Quién usará esta feature? (roles)
2. **Volumen esperado**: ¿Cuántos usuarios/requests/datos?
3. **Integraciones**: ¿Se conecta con sistemas externos?
4. **Restricciones**: ¿Limitaciones de tecnología, tiempo, presupuesto?
5. **Success criteria**: ¿Cómo mediremos el éxito?

Por favor, proporciona esta información para continuar.
```

## Quality Checks

Before finalizing output, verify:

- [ ] All user stories deliver independent value
- [ ] Success criteria have numbers (not vague goals)
- [ ] Requirements are testable
- [ ] Tech stack is justified (not just "because it's popular")
- [ ] Tasks are atomic (2-8h, subdivided if needed)
- [ ] API contracts have examples (request + response)
- [ ] Security considerations included (auth, encryption, validation)
- [ ] No placeholder text ([TODO], [TBD], [NEEDS CLARIFICATION])

---

You are now ready to generate world-class specifications. Let's build great software! 🚀
```

---

## Knowledge Portal Integration

### Query Strategy

**When to search**:
- User mentions domain (auth, payments, deployment)
- Need examples of similar features
- Clarify best practices
- Find existing patterns

**Query format**:

```json
{
  "query": "[feature domain] [key terms]",
  "top_k": 5,
  "filter": {
    "document_type": "documentation"
  }
}
```

**Example queries**:
- "authentication oauth2 azure ad"
- "real-time notifications websocket"
- "terraform module structure azure"
- "api rate limiting express"

### Context Enrichment

**Use Knowledge Portal results to**:
- Reference existing implementations
- Suggest proven patterns
- Identify constraints (Azure limitations, team preferences)
- Validate tech choices

**Example**:

```
🔍 Knowledge Portal encontró:
- "Azure AD B2C Integration Guide" → Usar para auth
- "WebSocket Best Practices" → Patrón pub/sub con Redis
- "Database Schema Migrations" → Usar Prisma Migrate

Aplicando estos patrones en plan.md...
```

---

## Dify Workflow Configuration

### Workflow Type

**Chatbot** (conversational, multi-turn)

### Nodes

1. **LLM Node**: Main spec generation (GPT-4o)
2. **Knowledge Retrieval**: Search Knowledge Portal
3. **Code Node**: Validate output structure
4. **Template Node**: Format output files
5. **End Node**: Return spec.md, plan.md, tasks.md

### Variables

```json
{
  "feature_description": {
    "type": "string",
    "required": true,
    "description": "User's feature description"
  },
  "applied_specs": {
    "type": "array",
    "default": ["git-flow", "security"],
    "description": "Specs to apply (Git Flow, Security, IaC, FinOps)"
  },
  "tech_stack_preference": {
    "type": "string",
    "default": "auto",
    "description": "Preferred tech stack or 'auto' for AI selection"
  },
  "priority_focus": {
    "type": "string",
    "default": "P1",
    "description": "Which priority to focus on (P1 only, P1+P2, all)"
  }
}
```

### Model Configuration

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
- **Temperature 0.3**: Deterministic, consistent output (specs should be precise)
- **Max tokens 16000**: Long outputs (3 files ~10k tokens)
- **Top_p 0.95**: High quality, avoid random variations

---

## Validation Rules (Code Node)

```python
import re
import json

def validate_spec(spec_md: str) -> dict:
    """Validate spec.md structure and content"""
    
    errors = []
    warnings = []
    
    # Check user stories
    stories = re.findall(r'### User Story \d+:', spec_md)
    if len(stories) < 3:
        warnings.append(f"Only {len(stories)} user stories (recommend 3-7)")
    
    # Check Given/When/Then scenarios
    scenarios = re.findall(r'\*\*Given\*\*.*\*\*When\*\*.*\*\*Then\*\*', spec_md, re.DOTALL)
    if len(scenarios) == 0:
        errors.append("No Given/When/Then scenarios found")
    
    # Check success criteria
    criteria = re.findall(r'\*\*SC-\d+\*\*:', spec_md)
    if len(criteria) < 3:
        warnings.append(f"Only {len(criteria)} success criteria (recommend 3-10)")
    
    # Check for vague success criteria (bad patterns)
    bad_patterns = ['should be', 'good', 'better', 'fast', 'easy', 'simple']
    for pattern in bad_patterns:
        if pattern.lower() in spec_md.lower():
            warnings.append(f"Vague term '{pattern}' found in success criteria")
    
    # Check for [NEEDS CLARIFICATION] markers
    if '[NEEDS CLARIFICATION]' in spec_md:
        errors.append("Contains [NEEDS CLARIFICATION] markers - must resolve")
    
    # Check for numbers in success criteria
    has_numbers = re.search(r'SC-\d+.*?(\d+%|\d+ms|\d+ seconds?|\d+ hours?)', spec_md)
    if not has_numbers:
        warnings.append("Success criteria may lack measurable targets (no numbers found)")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'metrics': {
            'user_stories': len(stories),
            'scenarios': len(scenarios),
            'success_criteria': len(criteria)
        }
    }

def validate_plan(plan_md: str) -> dict:
    """Validate plan.md structure"""
    
    errors = []
    warnings = []
    
    # Check tech stack justification
    if 'Tech Stack' not in plan_md:
        errors.append("Missing Tech Stack section")
    
    # Check API contracts
    if 'API Contracts' not in plan_md:
        warnings.append("No API Contracts section")
    
    # Check for request/response examples
    if '```json' not in plan_md:
        warnings.append("No JSON examples (API contracts should have examples)")
    
    # Check data models
    if 'Data Models' not in plan_md:
        warnings.append("No Data Models section")
    
    # Check constitution compliance
    if 'Constitution Check' not in plan_md:
        warnings.append("No Constitution Check (should reference applied specs)")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }

def validate_tasks(tasks_md: str) -> dict:
    """Validate tasks.md structure"""
    
    errors = []
    warnings = []
    
    # Check task format
    tasks = re.findall(r'#### 🔨 Task \d+\.\d+:', tasks_md)
    if len(tasks) == 0:
        errors.append("No tasks found (should have Task X.Y format)")
    
    # Check for estimated time
    time_estimates = re.findall(r'\*\*Estimated Time\*\*: (\d+)', tasks_md)
    if time_estimates:
        avg_time = sum(int(t) for t in time_estimates) / len(time_estimates)
        if avg_time > 8:
            warnings.append(f"Average task time {avg_time}h (recommend <8h, subdivide large tasks)")
    
    # Check for dependencies
    if 'Dependencies' not in tasks_md:
        warnings.append("No task dependencies specified")
    
    # Check for definition of done
    if 'Definition of Done' not in tasks_md:
        errors.append("Missing Definition of Done for tasks")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'metrics': {
            'total_tasks': len(tasks),
            'avg_time': sum(int(t) for t in time_estimates) / len(time_estimates) if time_estimates else 0
        }
    }

# Main validation function
def validate_all(spec_md: str, plan_md: str, tasks_md: str) -> dict:
    """Validate all three files"""
    
    spec_validation = validate_spec(spec_md)
    plan_validation = validate_plan(plan_md)
    tasks_validation = validate_tasks(tasks_md)
    
    all_valid = (
        spec_validation['valid'] and 
        plan_validation['valid'] and 
        tasks_validation['valid']
    )
    
    return {
        'valid': all_valid,
        'spec': spec_validation,
        'plan': plan_validation,
        'tasks': tasks_validation,
        'summary': {
            'total_errors': (
                len(spec_validation['errors']) + 
                len(plan_validation['errors']) + 
                len(tasks_validation['errors'])
            ),
            'total_warnings': (
                len(spec_validation['warnings']) + 
                len(plan_validation['warnings']) + 
                len(tasks_validation['warnings'])
            )
        }
    }
```

---

## Testing Scenarios

### Test Case 1: Authentication System

**Input**:
```
Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. 
Los usuarios deben poder hacer login con sus cuentas corporativas de DXC.
```

**Expected Output**:
- 4-5 user stories (login, logout, session management, MFA, role assignment)
- Security spec applied (secrets, token management, session security)
- Tech stack: NextAuth.js + Azure AD B2C
- Success criteria: <500ms login time, >99.5% availability, zero password leaks

### Test Case 2: Real-time Notifications

**Input**:
```
Sistema de notificaciones en tiempo real. Cuando un proyecto cambia de estado 
(Specify → Plan → Tasks → Implement), notificar a los miembros del equipo.
```

**Expected Output**:
- 3-4 user stories (subscribe, receive, dismiss, history)
- Tech stack: WebSocket + Redis pub/sub + PostgreSQL
- API contracts: WebSocket events documented
- Success criteria: <100ms notification latency, >98% delivery rate

### Test Case 3: IaC for AKS Cluster

**Input**:
```
Necesito Terraform para crear un cluster AKS en Azure con 3 node pools 
(system, user, gpu). Incluir monitoring, backup y auto-scaling.
```

**Expected Output**:
- IaC spec applied (module structure, state management, tagging)
- Tech stack: Terraform + Azure provider
- Data models: Terraform resource schemas
- Success criteria: <30min deployment time, zero drift incidents

---

## Success Metrics

**Bot Quality**:
- [ ] Specs generated in <5 minutes
- [ ] >95% validation pass rate (no errors)
- [ ] <5 warnings per spec on average
- [ ] 100% of specs have measurable success criteria

**User Satisfaction**:
- [ ] >80% satisfaction rate (Phase 1 goal)
- [ ] <10% regeneration requests
- [ ] >90% of specs used without major edits

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial bot configuration |
