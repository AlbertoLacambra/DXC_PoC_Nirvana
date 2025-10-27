# Project Constitution: [PROJECT NAME]

**Project**: [Project Name] | **Branch**: [feature-branch] | **Created**: [DATE]  
**Repository**: [GitHub/Azure DevOps URL]

---

## Purpose

Este documento define los **principios, estándares y mejores prácticas** que rigen este proyecto.  
Es la combinación de todas las specs aplicadas (Git Flow, Security, IaC, FinOps, etc.).

**¿Por qué existe este archivo?**

- Asegurar consistencia en decisiones técnicas
- Facilitar onboarding de nuevos desarrolladores
- Servir como checklist de calidad antes de merge/deploy
- Documentar el "por qué" de nuestras convenciones

---

## Applied Specifications

<!--
  ACTION REQUIRED: Listar specs aplicadas a este proyecto.
  Cada spec define reglas que deben cumplirse.
-->

Este proyecto sigue las siguientes especificaciones de DXC Cloud Mind - Nirvana:

- ✅ **Git Flow Best Practices** (v1.0)
- ✅ **Security Best Practices** (v1.0)
- ✅ **IaC Best Practices - Terraform** (v1.0)
- ✅ **FinOps Best Practices** (v1.0) *(si aplicable)*
- ✅ **[Custom Spec]** (vX.Y) *(si aplicable)*

**Version History**:

| Spec | Version | Applied Date | Notes |
|------|---------|--------------|-------|
| Git Flow | 1.0 | 2025-10-27 | Initial setup |
| Security | 1.0 | 2025-10-27 | Initial setup |

---

## 1. Git Flow Principles

<!--
  Extraído de: specs-library/predefined-specs/git-flow.md
-->

### Branch Strategy

**Main Branches**:

- `main` (production): Código en producción, deployable en cualquier momento
- `develop` (staging): Integración continua, pre-producción

**Supporting Branches**:

- `feature/*`: Nuevas features, formato `feature/ISSUE-ID-short-description`
- `bugfix/*`: Correcciones en develop, formato `bugfix/ISSUE-ID-short-description`
- `hotfix/*`: Correcciones urgentes en producción, formato `hotfix/ISSUE-ID-description`
- `release/*`: Preparación de release, formato `release/vX.Y.Z`

**Branch Naming Rules**:

```text
✅ CORRECTO:
  feature/123-add-user-authentication
  bugfix/456-fix-login-redirect
  hotfix/789-critical-memory-leak

❌ INCORRECTO:
  my-feature
  fix-bug
  update
```

### Commit Conventions

**Format**: [Conventional Commits](https://www.conventionalcommits.org/)

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, sin cambios de lógica
- `refactor`: Refactorización sin cambiar funcionalidad
- `perf`: Mejoras de performance
- `test`: Añadir o corregir tests
- `chore`: Mantenimiento (deps, config)
- `ci`: Cambios en CI/CD

**Examples**:

```text
feat(auth): add OAuth2 authentication flow

Implement OAuth2 with Azure AD integration.
- Add callback endpoint
- Store tokens in encrypted session

Closes #123
```

```text
fix(api): handle null response from external API

Previously crashed when API returned null.
Now returns empty array with warning log.
```

### Pull Request Process

**PR Template** (mandatory fields):

- [ ] **Description**: ¿Qué cambia y por qué?
- [ ] **Related Issue**: Link a issue/user story
- [ ] **Testing**: ¿Cómo se validó?
- [ ] **Screenshots** *(si UI)*: Before/After
- [ ] **Breaking Changes**: ¿Rompe compatibilidad?
- [ ] **Checklist**:
  - [ ] Tests pass
  - [ ] Linters pass
  - [ ] Documentation updated
  - [ ] Success criteria met

**Review Requirements**:

- Mínimo **1 reviewer aprobado** antes de merge
- **No merge de tu propio PR** (excepto hotfixes críticos con justificación)
- **CI/CD debe estar en verde** (tests, linters, security scans)

**Merge Strategy**:

- `feature/* → develop`: **Squash and merge** (mantener develop limpio)
- `develop → main`: **Merge commit** (preservar historia)
- `hotfix/* → main`: **Merge commit** + cherry-pick a develop

---

## 2. Security Principles

<!--
  Extraído de: specs-library/predefined-specs/security.md
-->

### Secrets Management

**Rules**:

- ❌ **NUNCA commitear secrets** en código (API keys, passwords, tokens)
- ✅ Usar **Azure Key Vault** / AWS Secrets Manager para production
- ✅ Usar **`.env` files** para desarrollo (añadir a `.gitignore`)
- ✅ Usar **pre-commit hooks** (gitleaks) para prevenir leaks

**Environment Variables Naming**:

```bash
# ✅ CORRECTO (prefijos claros)
DATABASE_URL=postgresql://...
AZURE_OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG...

# ❌ INCORRECTO (ambiguo)
URL=...
KEY=...
SECRET=...
```

### Authentication & Authorization

**Requirements**:

- ✅ Usar **OAuth2 / OpenID Connect** para autenticación (no custom auth)
- ✅ Implementar **RBAC** (Role-Based Access Control) para autorización
- ✅ **Password policy** (si aplicable):
  - Mínimo 12 caracteres
  - Requiere mayúsculas, minúsculas, números, símbolos
  - No permitir passwords comunes (usar zxcvbn)
- ✅ **Session management**:
  - Tokens JWT con expiración <1 hora
  - Refresh tokens con rotación
  - Logout invalida tokens

### Security Scanning

**CI/CD Integration** (mandatory):

- ✅ **SAST** (Static Application Security Testing): SonarQube, Checkmarx
- ✅ **Dependency Scanning**: `npm audit`, Snyk, Dependabot
- ✅ **Secrets Scanning**: gitleaks (pre-commit + CI)
- ✅ **Container Scanning** *(si Docker)*: Trivy, Azure Defender

**Pipeline Failure Criteria**:

- **Critical vulnerabilities**: Bloquean merge
- **High vulnerabilities**: Warning + require justification
- **Medium/Low**: No bloquean pero deben tracked

### Data Protection

**Encryption**:

- ✅ **At rest**: Database encryption (TDE), disk encryption
- ✅ **In transit**: TLS 1.3+ (no TLS 1.0/1.1)
- ✅ **PII fields**: Encrypt en DB (nombre, email, teléfono)

**GDPR Compliance** *(si aplicable)*:

- ✅ Data retention policy (max 2 años sin actividad)
- ✅ Right to deletion endpoint (`DELETE /api/users/{id}/gdpr`)
- ✅ Data export endpoint (`GET /api/users/{id}/data`)
- ✅ Consent management (opt-in explícito)

### Security Headers

**HTTP Headers** (mandatory para web apps):

```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: no-referrer-when-downgrade
```

---

## 3. Infrastructure as Code Principles

<!--
  Extraído de: specs-library/predefined-specs/iac-terraform.md
-->

### Terraform Structure

**Module Organization**:

```text
modules/
├── networking/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
├── compute/
└── storage/

environments/
├── dev/
│   ├── main.tf
│   └── terraform.tfvars
├── staging/
└── prod/
```

**Naming Conventions**:

- **Resources**: `<project>-<environment>-<resource_type>-<description>`
  - Example: `nirvana-prod-vnet-main`, `nirvana-dev-aks-cluster`
- **Variables**: `snake_case`
- **Outputs**: `snake_case`

### State Management

**Rules**:

- ✅ **Remote state** obligatorio (Azure Storage Account, AWS S3)
- ✅ **State locking** habilitado (prevenir concurrent writes)
- ✅ **State encryption** at rest
- ❌ **Nunca commitear `terraform.tfstate`** a Git

**Backend Configuration**:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "nirvana-tfstate-rg"
    storage_account_name = "nirvanatfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
    use_azuread_auth     = true
  }
}
```

### Tagging Strategy

**Mandatory Tags** (all resources):

```hcl
tags = {
  Environment = "prod"          # dev | staging | prod
  Project     = "DXC-Nirvana"
  ManagedBy   = "Terraform"
  CostCenter  = "CloudOps"
  Owner       = "team@dxc.com"
  CreatedDate = "2025-10-27"
}
```

### Drift Detection

**Process**:

- ✅ Ejecutar `terraform plan` diariamente en CI/CD
- ✅ Alertar si hay drift (cambios manuales detectados)
- ✅ Documentar drift justificado (emergencias)
- ✅ Reconciliar drift en 48 horas

---

## 4. FinOps Principles *(si aplicable)*

<!--
  Extraído de: specs-library/predefined-specs/finops.md
-->

### Cost Management

**Budget Alerts**:

- ✅ Configurar alerts al 50%, 75%, 90%, 100% del presupuesto
- ✅ Revisar costos semanalmente en dashboard
- ✅ Tagging obligatorio para cost allocation

**Resource Optimization**:

- ✅ Usar **Reserved Instances** para workloads predecibles (30-70% savings)
- ✅ Implementar **auto-scaling** (no over-provisioning)
- ✅ Apagar recursos dev/staging fuera de horario laboral
- ✅ Revisar **rightsizing recommendations** mensualmente

### Cost Approval Workflow

| Estimated Cost/Month | Approval Required |
|----------------------|-------------------|
| < $100 | Developer (auto-approved) |
| $100 - $500 | Tech Lead |
| $500 - $2000 | Engineering Manager |
| > $2000 | CTO + Finance |

---

## 5. Code Quality Standards

<!--
  ACTION REQUIRED: Definir estándares de código específicos del proyecto.
-->

### Linting & Formatting

**Tools**:

- **JavaScript/TypeScript**: ESLint + Prettier
- **Python**: Ruff + Black
- **Terraform**: `terraform fmt`
- **Markdown**: markdownlint

**Pre-commit Hooks**:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
  - repo: https://github.com/gitleaks/gitleaks
    hooks:
      - id: gitleaks
```

### Code Coverage

**Requirements**:

- **Unit tests**: Mínimo 80% coverage
- **Integration tests**: All API endpoints
- **E2E tests**: Critical user journeys (P1 user stories)

**CI/CD Checks**:

- ❌ **Bloquear merge** si coverage cae >5% respecto a main
- ⚠️ **Warning** si nuevas líneas no tienen tests

### Code Review Checklist

**Reviewer Responsibilities**:

- [ ] **Functionality**: ¿El código hace lo que dice hacer?
- [ ] **Tests**: ¿Hay tests suficientes?
- [ ] **Security**: ¿Hay vulnerabilidades evidentes?
- [ ] **Performance**: ¿Hay N+1 queries, loops ineficientes?
- [ ] **Readability**: ¿El código es entendible?
- [ ] **Documentation**: ¿Funciones públicas tienen JSDoc/docstrings?
- [ ] **Success Criteria**: ¿Se cumplen los SC-XXX del spec?

---

## 6. Documentation Standards

### README.md Structure

Todos los proyectos deben tener:

```markdown
# Project Name

## Overview
[1-2 párrafos explicando el proyecto]

## Tech Stack
[Listado de tecnologías]

## Getting Started
### Prerequisites
### Installation
### Running Locally

## Architecture
[Diagrama + explicación]

## API Documentation
[Link a Swagger/OpenAPI]

## Testing
[Cómo ejecutar tests]

## Deployment
[Proceso de deploy]

## Contributing
[Link a CONTRIBUTING.md]
```

### API Documentation

- ✅ Usar **OpenAPI/Swagger** para REST APIs
- ✅ Documentar **todos los endpoints** (request, response, errors)
- ✅ Incluir **ejemplos de uso** (curl, Postman)
- ✅ Mantener docs actualizadas (auto-generar si es posible)

### Architecture Decision Records (ADRs)

Para decisiones técnicas importantes, crear ADR:

```markdown
# ADR-XXX: [Decision Title]

**Status**: Proposed | Accepted | Deprecated  
**Date**: YYYY-MM-DD

## Context
[Por qué necesitamos decidir esto]

## Decision
[Qué decidimos]

## Consequences
[Qué implica esta decisión]

## Alternatives Considered
[Qué otras opciones evaluamos]
```

---

## 7. Testing Strategy

### Test Pyramid

```text
       /\        E2E (10%)
      /  \       - Critical flows
     /────\      
    /      \     Integration (30%)
   /────────\    - API + DB
  /          \   
 /────────────\  Unit (60%)
```

### Testing Tools

- **Unit**: Jest (JS/TS), pytest (Python)
- **Integration**: Supertest, Testcontainers
- **E2E**: Playwright, Cypress
- **Performance**: k6, Artillery

### Test Data

- ✅ Usar **fixtures** para datos de test (no datos reales de producción)
- ✅ **Seed databases** para tests de integración
- ✅ **Cleanup** después de cada test (evitar side effects)

---

## 8. CI/CD Pipeline

### Pipeline Stages

```text
[Commit] → [Lint] → [Build] → [Unit Tests] → [Integration Tests] → 
[Security Scan] → [E2E Tests] → [Deploy to Staging] → [Smoke Tests] → 
[Manual Approval] → [Deploy to Production] → [Monitor]
```

### Deployment Environments

| Environment | Branch | Auto-Deploy | Purpose |
|-------------|--------|-------------|---------|
| **Development** | `develop` | ✅ Yes | Integration testing |
| **Staging** | `release/*` | ✅ Yes | Pre-production validation |
| **Production** | `main` | ❌ Manual approval | Live environment |

### Rollback Plan

- ✅ **Auto-rollback** si health checks fallan
- ✅ **Manual rollback** disponible en CI/CD UI
- ✅ **Database migrations**: Usar versioned migrations con rollback scripts

---

## 9. Monitoring & Observability

### Metrics to Track

**Application**:

- Request count, error rate, response time (p50, p95, p99)
- Database query time
- External API latency

**Infrastructure**:

- CPU, memory, disk usage
- Network I/O
- Container restarts

**Business**:

- [KPIs específicos del proyecto, ej: usuarios activos, conversiones]

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error Rate | >1% | >5% | Page on-call engineer |
| Response Time (p95) | >500ms | >1s | Investigate performance |
| CPU Usage | >70% | >90% | Scale up |
| Uptime | <99.5% | <99% | Emergency response |

### Logging Standards

**Log Format**: Structured JSON

```json
{
  "timestamp": "2025-10-27T10:00:00Z",
  "level": "ERROR",
  "service": "api-gateway",
  "message": "Failed to connect to database",
  "error": {
    "type": "ConnectionError",
    "message": "Timeout after 5s"
  },
  "context": {
    "user_id": "uuid",
    "request_id": "uuid"
  }
}
```

**Log Levels**:

- **ERROR**: Fallos que requieren acción
- **WARN**: Problemas potenciales
- **INFO**: Eventos importantes
- **DEBUG**: Información detallada (solo en dev)

---

## 10. Incident Response

### Severity Levels

| Severity | Impact | Response Time | Example |
|----------|--------|---------------|---------|
| **P1 - Critical** | Service down | <15 min | Complete outage |
| **P2 - High** | Partial degradation | <1 hour | Payment flow broken |
| **P3 - Medium** | Minor issue | <4 hours | UI bug, typo |
| **P4 - Low** | Cosmetic | <1 week | Enhancement request |

### Post-Incident Process

1. **Restore service** (priority #1)
2. **Create incident report** (within 24h)
3. **Root cause analysis** (within 3 days)
4. **Action items** (preventive measures)
5. **Blameless retrospective** (learn, don't blame)

---

## 11. Compliance Checklist

<!--
  Checklist de cumplimiento antes de merge/deploy
-->

### Pre-Merge Checklist

- [ ] **Git Flow**: Branch naming correcto, commits conventional
- [ ] **Tests**: Unit (>80%), integration, E2E pass
- [ ] **Linters**: ESLint, Prettier, markdownlint pass
- [ ] **Security**: No secrets, SAST pass, deps updated
- [ ] **Code Review**: 1+ approval
- [ ] **Documentation**: README, API docs, ADR (si aplica)
- [ ] **Success Criteria**: SC-XXX del spec.md cumplidos

### Pre-Deploy Checklist (Production)

- [ ] **Staging Validation**: Deployed to staging, smoke tests pass
- [ ] **Database Migrations**: Tested, rollback scripts ready
- [ ] **Feature Flags**: Configured (if using feature toggles)
- [ ] **Monitoring**: Dashboards ready, alerts configured
- [ ] **Rollback Plan**: Documented and validated
- [ ] **Stakeholders**: Notified of deployment window
- [ ] **FinOps**: Cost impact reviewed and approved

---

## 12. Project-Specific Rules

<!--
  ACTION REQUIRED: Añadir reglas específicas de este proyecto.
-->

### [Custom Rule 1]

[Descripción de regla específica]

### [Custom Rule 2]

[Descripción...]

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-10-27 | 1.0 | [AUTHOR] | Initial constitution |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | [Name] | [Date] | ✅ / ⏳ |
| Security | [Name] | [Date] | ✅ / ⏳ |
| DevOps | [Name] | [Date] | ✅ / ⏳ |

---

## References

- **Git Flow Spec**: `/specs-library/predefined-specs/git-flow.md`
- **Security Spec**: `/specs-library/predefined-specs/security.md`
- **IaC Spec**: `/specs-library/predefined-specs/iac-terraform.md`
- **FinOps Spec**: `/specs-library/predefined-specs/finops.md`
- **Project Spec**: `/specs/[###-feature]/spec.md`
