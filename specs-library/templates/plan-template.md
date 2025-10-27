# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]  
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

---

## Summary

[Extraer de feature spec: requisito principal + aproximación técnica]

---

## Technical Stack

<!--
  ACTION REQUIRED: Especificar decisiones tecnológicas concretas.
-->

- **Backend**: [Framework/lenguaje, ej: Next.js 14, Express, FastAPI]
- **Frontend**: [Framework, ej: React 18, Vue 3, Angular]
- **Database**: [Sistema + versión, ej: PostgreSQL 15, MongoDB 6, Azure Cosmos DB]
- **Auth**: [Solución, ej: next-auth, Auth0, Azure AD B2C]
- **API Integration**: [Servicios externos, ej: SendGrid, Stripe, Azure OpenAI]
- **Infrastructure**: [Cloud provider + servicios, ej: Azure App Service, AKS, Azure Functions]
- **Message Queue** *(si aplicable)*: [Sistema, ej: Azure Service Bus, RabbitMQ]
- **Cache** *(si aplicable)*: [Sistema, ej: Redis, Azure Cache for Redis]
- **Monitoring**: [Herramientas, ej: Application Insights, Prometheus, Datadog]

### Justification

- **¿Por qué este stack?** [Razones: performance, experiencia del equipo, compatibilidad]
- **Alternativas consideradas**: [Qué otras opciones se evaluaron y por qué se descartaron]

---

## Constitution Check

<!--
  Esta sección verifica cumplimiento con specs aplicadas (Git Flow, Security, etc.)
  Si el proyecto tiene constitution.md, listar requisitos de cada spec aplicada.
-->

**Specs aplicadas a este proyecto:**
- [ ] Git Flow Best Practices
- [ ] Security Best Practices
- [ ] IaC Best Practices
- [ ] FinOps Best Practices
- [ ] [Otras specs]

### Compliance Requirements

**Git Flow:**
- [ ] Branch naming sigue patrón `feature/ISSUE-ID-description`
- [ ] Commits usan Conventional Commits
- [ ] PR template configurado

**Security:**
- [ ] Pre-commit hooks para secrets scanning configurados
- [ ] SAST tool integrado en CI/CD
- [ ] Dependency scanning habilitado
- [ ] Security headers configurados

**[Otros specs]:**
- [ ] [Requisitos específicos]

---

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── spec.md              # Este archivo - requisitos y user stories
├── plan.md              # Este archivo - decisiones técnicas
├── tasks.md             # Generado con /tasks - lista de tareas
├── constitution.md      # Specs aplicadas combinadas
├── research.md          # (Opcional) Investigación y decisiones técnicas
├── data-model.md        # (Opcional) Modelos de datos detallados
├── contracts/           # (Opcional) Contratos de API
│   ├── api-endpoints.md
│   └── websocket-events.md
└── quickstart.md        # (Opcional) Escenarios de validación clave
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Definir estructura de directorios del proyecto.
  Elegir y adaptar una de las opciones según el tipo de proyecto.
-->

**Opción 1: Single Project (default para CLIs, libs, servicios pequeños)**

```text
src/
├── models/           # Entidades de dominio
├── services/         # Lógica de negocio
├── api/              # API routes/controllers
├── lib/              # Utilities compartidas
└── config/           # Configuración

tests/
├── unit/             # Tests unitarios
├── integration/      # Tests de integración
└── e2e/              # Tests end-to-end
```

**Opción 2: Web Application (frontend + backend separados)**

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   ├── api/
│   └── middleware/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── lib/
└── tests/
```

**Opción 3: Microservices (multiple services)**

```text
services/
├── auth-service/
│   ├── src/
│   └── tests/
├── user-service/
│   ├── src/
│   └── tests/
└── notification-service/
    ├── src/
    └── tests/

shared/
└── lib/              # Código compartido entre services
```

**Opción 4: Infrastructure as Code**

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

tests/
└── terratest/
```

---

## API Contracts

<!--
  ACTION REQUIRED: Documentar endpoints/eventos clave.
  Usar formato OpenAPI/Swagger para APIs REST.
-->

### REST API Endpoints

#### **POST /api/[resource]/create**

**Propósito**: [Qué hace este endpoint]

**Request:**
```json
{
  "field1": "value",
  "field2": 123,
  "nested": {
    "field3": true
  }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "created",
  "created_at": "2025-10-27T10:00:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Field 'field1' is required"
  }
}
```

**Authentication**: Bearer token required  
**Rate Limiting**: 100 requests/min per user  
**Idempotency**: No / Yes (if Yes, explain key)

---

#### **GET /api/[resource]/{id}**

[Repetir estructura para otros endpoints...]

---

### WebSocket Events *(si aplicable)*

#### **Event: `notification.received`**

**Direction**: Server → Client  
**Payload:**
```json
{
  "type": "notification",
  "data": {
    "message": "New comment on your post",
    "timestamp": "2025-10-27T10:00:00Z"
  }
}
```

---

## Data Models

<!--
  ACTION REQUIRED: Definir entidades principales y sus relaciones.
  Incluir esquemas de base de datos si es relevante.
-->

### Entity: [EntityName]

**Descripción**: [Qué representa esta entidad]

**Attributes:**
- `id` (UUID): Identificador único
- `name` (string): [Descripción]
- `created_at` (timestamp): Fecha de creación
- `updated_at` (timestamp): Última modificación
- `status` (enum): [Valores posibles: active, inactive, pending]

**Relationships:**
- Tiene muchos [OtherEntity]
- Pertenece a [ParentEntity]

### Database Schema (PostgreSQL)

```sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_[table]_status ON [table_name](status);
CREATE INDEX idx_[table]_created ON [table_name](created_at DESC);
```

---

## Implementation Phases

<!--
  ACTION REQUIRED: Dividir implementación en fases lógicas.
  Cada fase debe ser deployable y testeable de forma independiente.
-->

### Phase 0: Setup & Infrastructure

**Goal**: Preparar entorno y dependencias

**Tasks:**
- Setup project structure
- Configure database
- Setup CI/CD pipeline
- Configure monitoring/logging

**Deliverable**: Proyecto base con CI/CD funcionando

---

### Phase 1: Core Functionality (MVP)

**Goal**: Implementar user stories de prioridad P1

**User Stories incluidas:**
- [US-001: Brief title]
- [US-002: Brief title]

**Tasks:** (se generarán en tasks.md con /tasks command)

**Deliverable**: MVP funcional con features core

**Acceptance Criteria** (from spec.md):
- [SC-001: Criteria]
- [SC-002: Criteria]

---

### Phase 2: Enhanced Features

**Goal**: Añadir user stories P2

**User Stories incluidas:**
- [US-003: Brief title]

**Deliverable**: Features adicionales implementadas

---

### Phase 3: Polish & Optimization

**Goal**: Implementar P3, optimizaciones, analytics

**Tasks:**
- Performance optimization
- Analytics/monitoring dashboards
- Edge case handling

---

## Testing Strategy

<!--
  ACTION REQUIRED: Definir approach de testing.
-->

### Test Pyramid

```
       /\        E2E Tests (10%)
      /  \       - Critical user flows
     /────\      
    /      \     Integration Tests (30%)
   /────────\    - API endpoints, DB queries
  /          \   
 /────────────\  Unit Tests (60%)
                 - Business logic, utilities
```

### Test Coverage Goals

- **Unit tests**: 80%+ coverage
- **Integration tests**: All API endpoints
- **E2E tests**: Critical user journeys (P1 user stories)

### Testing Tools

- **Unit**: [Jest, pytest, xUnit]
- **Integration**: [Supertest, Testcontainers]
- **E2E**: [Playwright, Cypress, Selenium]
- **Performance**: [k6, JMeter, Artillery]

---

## Security Considerations

<!--
  Si Security spec aplicada, referenciar requisitos específicos.
-->

### Authentication & Authorization

- **Auth method**: [OAuth2, JWT, session-based]
- **Password policy**: [Requisitos de complejidad]
- **Session management**: [Duración, refresh tokens]
- **RBAC**: [Roles y permisos]

### Data Protection

- **Encryption at rest**: [Método]
- **Encryption in transit**: [TLS version]
- **PII handling**: [GDPR compliance, data retention]
- **Secrets management**: [Azure Key Vault, AWS Secrets Manager]

### Security Scanning

- **SAST**: [Tool, ej: SonarQube, Checkmarx]
- **DAST**: [Tool, ej: OWASP ZAP]
- **Dependency scanning**: [npm audit, Snyk]
- **Secrets scanning**: [gitleaks, trufflehog]

---

## Performance Requirements

<!--
  Traducir success criteria de spec.md a requisitos técnicos.
-->

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API Response Time (p95) | <200ms | Application Insights |
| Database Query Time (p95) | <50ms | Query logs |
| Concurrent Users | 10,000 | Load testing |
| Throughput | 1000 requests/sec | Performance tests |
| Uptime | 99.9% | Monitoring alerts |

---

## Monitoring & Observability

### Metrics to Track

- **Application**: Request count, error rate, response time
- **Infrastructure**: CPU, memory, disk usage
- **Business**: [KPIs específicos, ej: usuarios activos, conversiones]

### Logging Strategy

- **Structured logging**: JSON format
- **Log levels**: ERROR, WARN, INFO, DEBUG
- **Retention**: 30 days (production), 7 days (dev)

### Alerting

- **Critical**: Response time >1s, error rate >5%, downtime
- **Warning**: Response time >500ms, error rate >1%

---

## Deployment Strategy

### Environments

- **Development**: Auto-deploy on merge to `dev` branch
- **Staging**: Auto-deploy on merge to `staging` branch
- **Production**: Manual approval + deploy on merge to `main`

### Deployment Process

1. Run all tests (unit, integration, e2e)
2. Build Docker image / compile artifacts
3. Push to registry
4. Deploy to environment
5. Run smoke tests
6. Monitor for 15 minutes

### Rollback Plan

- **Automated rollback** if health checks fail
- **Manual rollback** via CI/CD pipeline
- **Database migrations**: Use versioned migrations with rollback scripts

---

## Dependencies & Risks

### External Dependencies

- [API/Service name]: [Purpose, SLA, fallback plan]
- [Third-party library]: [Version, maintenance status]

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk description] | High/Medium/Low | High/Medium/Low | [Plan de mitigación] |

---

## Open Questions

<!--
  Decisiones técnicas pendientes que necesitan research/clarificación.
-->

- [ ] [Question 1]
- [ ] [Question 2]

---

## References

- Spec: [link to spec.md]
- Constitution: [link to constitution.md]
- Research: [link to research.md if exists]
- External docs: [Links a documentación relevante]

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | [Name] | [Date] | ✅ / ⏳ |
| Security | [Name] | [Date] | ✅ / ⏳ |
| DevOps | [Name] | [Date] | ✅ / ⏳ |

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| [DATE] | 1.0 | [AUTHOR] | Initial plan |
