# Implementation Tasks: [FEATURE]

**Branch**: `[###-feature-name]` | **Spec**: [link to spec.md] | **Plan**: [link to plan.md]  
**Generated from**: Feature specification and implementation plan

---

## Overview

Este documento desglosa la implementación en tareas accionables organizadas por user story.  
Cada tarea debe ser:

- ✅ **Implementable en 2-8 horas** (si toma más, dividir en subtareas)
- ✅ **Testeable de forma independiente**
- ✅ **Asociada a un success criteria** (SC-XXX) de spec.md
- ✅ **Con definition of done clara**

---

## Task Organization

<!--
  ACTION REQUIRED: Organizar tareas por user story.
  Copiar user stories de spec.md y desglosa cada una en tareas.
-->

### User Story 1: [US-001 Title from spec.md]

**Priority**: P1 | **Est. Time**: [X hours/days]  
**Success Criteria**: [SC-001, SC-002 from spec.md]

**Tasks:**

#### 🔨 Task 1.1: [Descriptive title]

**Descripción**: [Qué se implementa exactamente]

**Acceptance Criteria**:

- [ ] [Criterio específico 1]
- [ ] [Criterio específico 2]
- [ ] Unit tests pass with >80% coverage
- [ ] Integration test validates end-to-end flow

**Dependencies**: None / [Task X.Y must be completed first]

**Files to create/modify**:

- `src/services/[service-name].ts` - [Qué se añade]
- `src/api/[endpoint-name].ts` - [Qué se añade]
- `tests/unit/[test-file].test.ts` - [Tests a escribir]

**Definition of Done**:

- [ ] Code implemented and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated (if public API)
- [ ] PR approved by 1+ reviewer
- [ ] Success criteria [SC-XXX] validated

**Estimated Time**: [2-8 hours]

---

#### 🔨 Task 1.2: [Next task for this user story]

[Repetir estructura...]

---

### User Story 2: [US-002 Title]

**Priority**: P1 | **Est. Time**: [X hours/days]  
**Success Criteria**: [SC-003, SC-004]

**Tasks:**

#### 🔨 Task 2.1: [Task title]

[Repetir estructura...]

---

## Phase Breakdown

<!--
  Agrupar tareas por fase de implementación (del plan.md)
-->

### Phase 0: Setup & Infrastructure

| Task ID | Description | Est. Time | Dependencies | Assignee |
|---------|-------------|-----------|--------------|----------|
| 0.1 | Setup project structure | 2h | - | [Name] |
| 0.2 | Configure database | 3h | 0.1 | [Name] |
| 0.3 | Setup CI/CD pipeline | 4h | 0.1 | [Name] |
| 0.4 | Configure monitoring | 2h | 0.3 | [Name] |

**Phase Completion Criteria**:

- [ ] All tasks completed and reviewed
- [ ] CI/CD pipeline runs successfully
- [ ] Database migrations applied
- [ ] Monitoring dashboards accessible

---

### Phase 1: Core Functionality (MVP)

| Task ID | Description | Est. Time | Dependencies | Assignee |
|---------|-------------|-----------|--------------|----------|
| 1.1 | Implement [feature] | 6h | 0.2 | [Name] |
| 1.2 | Add API endpoint | 4h | 1.1 | [Name] |
| 1.3 | Write integration tests | 3h | 1.2 | [Name] |
| 1.4 | Add error handling | 2h | 1.2 | [Name] |

**Phase Completion Criteria**:

- [ ] All P1 user stories implemented
- [ ] All success criteria [SC-001, SC-002, ...] met
- [ ] MVP deployed to staging
- [ ] Smoke tests pass

---

### Phase 2: Enhanced Features

[Repetir estructura...]

---

## Testing Checklist

<!--
  Definir tests específicos por user story
-->

### User Story 1 Tests

#### Unit Tests

- [ ] `services/[service].test.ts`: Test happy path
- [ ] `services/[service].test.ts`: Test error cases
- [ ] `lib/[util].test.ts`: Test edge cases

#### Integration Tests

- [ ] `api/[endpoint].integration.test.ts`: Test full API flow
- [ ] `api/[endpoint].integration.test.ts`: Test validation errors
- [ ] `api/[endpoint].integration.test.ts`: Test authentication

#### E2E Tests

- [ ] `e2e/[feature].spec.ts`: Test critical user journey

---

## Database Migrations

<!--
  Si el plan.md define cambios de DB, listar migraciones necesarias
-->

### Migration 001: Create [table_name]

**File**: `migrations/001_create_[table].sql`

**Up Script**:

```sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Down Script** (rollback):

```sql
DROP TABLE [table_name];
```

**Task**: Create migration file and test locally

---

## Configuration Changes

<!--
  Cambios en environment variables, config files, etc.
-->

### Environment Variables

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host/db` | Yes |
| `API_KEY` | External API key | `sk-xxx` | Yes |
| `LOG_LEVEL` | Logging verbosity | `info` | No (default: `info`) |

**Task**: Update `.env.example` and deployment configs

---

## Documentation Updates

<!--
  Documentación que necesita actualizarse
-->

- [ ] **API Documentation**: Update OpenAPI/Swagger spec
- [ ] **README.md**: Add usage examples for new features
- [ ] **CHANGELOG.md**: Document changes for release notes
- [ ] **Architecture Diagrams**: Update if structure changed

---

## Deployment Checklist

<!--
  Pre-deployment y post-deployment tasks
-->

### Pre-Deployment

- [ ] All tasks completed and reviewed
- [ ] All tests passing (unit, integration, e2e)
- [ ] Database migrations tested in staging
- [ ] Configuration validated
- [ ] Rollback plan documented

### Deployment Steps

1. [ ] Run database migrations
2. [ ] Deploy to staging
3. [ ] Run smoke tests
4. [ ] Monitor for 15 minutes
5. [ ] Deploy to production
6. [ ] Run smoke tests in production
7. [ ] Monitor for 30 minutes

### Post-Deployment

- [ ] Verify monitoring dashboards
- [ ] Check error rates
- [ ] Validate success criteria
- [ ] Update stakeholders

---

## Risk Mitigation Tasks

<!--
  Tareas específicas para mitigar riesgos identificados en plan.md
-->

| Risk | Mitigation Task | Owner | Deadline |
|------|-----------------|-------|----------|
| [Risk from plan.md] | [Specific action] | [Name] | [Date] |

---

## Constitution Compliance Tasks

<!--
  Si el proyecto tiene specs aplicadas (Git Flow, Security, etc.),
  crear tareas específicas para cumplimiento.
-->

### Git Flow Compliance

- [ ] Configure branch protection rules
- [ ] Setup PR template
- [ ] Add commit message linter (commitlint)
- [ ] Document branching strategy in README

### Security Compliance

- [ ] Setup pre-commit hooks (gitleaks)
- [ ] Configure SAST in CI/CD (SonarQube)
- [ ] Enable dependency scanning (npm audit)
- [ ] Add security headers middleware

### IaC Compliance

- [ ] Setup Terraform state backend (Azure Storage)
- [ ] Configure remote state locking
- [ ] Add tagging to all resources
- [ ] Setup drift detection

---

## Task Dependencies Graph

<!--
  Opcional: Visualizar dependencias entre tareas críticas
-->

```text
0.1 (Setup) 
  ├─> 0.2 (Database)
  │     └─> 1.1 (Core Feature)
  │           └─> 1.2 (API)
  │                 └─> 1.3 (Tests)
  └─> 0.3 (CI/CD)
        └─> 1.4 (Deployment)
```

---

## Progress Tracking

<!--
  Actualizar regularmente durante implementación
-->

| Phase | Total Tasks | Completed | In Progress | Blocked | Progress |
|-------|-------------|-----------|-------------|---------|----------|
| Phase 0 | 4 | 0 | 0 | 0 | 0% |
| Phase 1 | 8 | 0 | 0 | 0 | 0% |
| Phase 2 | 5 | 0 | 0 | 0 | 0% |
| **TOTAL** | **17** | **0** | **0** | **0** | **0%** |

**Last Updated**: [DATE]

---

## Blockers & Issues

<!--
  Documentar problemas que bloquean progreso
-->

| Date | Blocker | Impact | Resolution | Status |
|------|---------|--------|------------|--------|
| [DATE] | [Description] | High/Medium/Low | [Plan] | 🔴 Open / 🟡 In Progress / 🟢 Resolved |

---

## Team Assignments

<!--
  Asignar ownership de tareas
-->

| Team Member | Assigned Tasks | Total Est. Time |
|-------------|----------------|-----------------|
| [Name 1] | 0.1, 1.1, 1.3 | 11h |
| [Name 2] | 0.2, 1.2 | 7h |
| [Name 3] | 0.3, 0.4 | 6h |

---

## Sprint Planning *(si aplicable)*

### Sprint 1 (Week 1-2)

**Goal**: Complete Phase 0 and start Phase 1

**Tasks**:

- [x] Task 0.1
- [ ] Task 0.2
- [ ] Task 1.1

**Capacity**: [Total hours available]

---

### Sprint 2 (Week 3-4)

[Repetir estructura...]

---

## Review Schedule

| Milestone | Review Date | Participants | Status |
|-----------|-------------|--------------|--------|
| Phase 0 Complete | [DATE] | Tech Lead, DevOps | ⏳ Pending |
| MVP Ready | [DATE] | Product, Tech Lead | ⏳ Pending |
| Production Launch | [DATE] | All stakeholders | ⏳ Pending |

---

## Notes & Decisions

<!--
  Documentar decisiones técnicas tomadas durante implementación
-->

**[DATE]**: Decidimos usar [Technology X] en lugar de [Y] porque [razón].

---

## References

- Spec: [link to spec.md]
- Plan: [link to plan.md]
- Constitution: [link to constitution.md]
- Project Board: [link to GitHub Projects / Jira]

---

## Task Template (for adding new tasks)

<!--
  Template para añadir nuevas tareas durante implementación
-->

#### 🔨 Task X.Y: [Title]

**Descripción**: [Qué se implementa]

**Acceptance Criteria**:

- [ ] [Criterio 1]
- [ ] Tests pass

**Dependencies**: [Task IDs]

**Files to create/modify**:

- `[path/to/file]` - [Qué se hace]

**Definition of Done**:

- [ ] Code implemented
- [ ] Tests passing
- [ ] PR approved

**Estimated Time**: [Hours]
