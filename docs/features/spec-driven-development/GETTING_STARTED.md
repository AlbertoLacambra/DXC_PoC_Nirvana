# Getting Started with Spec-Driven Development

Esta guía te ayudará a empezar a usar la metodología Spec-Driven Development en DXC Cloud Mind - Nirvana.

---

## ¿Qué Necesitas Saber?

Spec-Driven Development (SDD) invierte el proceso tradicional de desarrollo:

**❌ Tradicional:**
```
Código → Documentación → Tests → Requisitos retroactivos
```

**✅ Spec-Driven:**
```
Spec (QUÉ/POR QUÉ) → Plan (CÓMO) → Tasks → Implementación → Validación
```

**Beneficio principal**: Requisitos claros desde el inicio → AI agents generan código correcto → menos refactoring.

---

## Inicio Rápido: Tu Primer Proyecto Spec-Driven

### Opción 1: Usar la UI (Recomendado)

**Tiempo estimado: 15-20 minutos**

1. **Accede a DXC Cloud Mind Control Center**
   - URL: http://localhost:3000 (dev) o https://cloudmind.dxc.com (prod)
   - Navega a sección "Spec-Development Projects"

2. **Click en "+ New Project"**

3. **Wizard Step 1: Información Básica**
   ```
   Nombre: Sistema de Notificaciones
   
   Descripción:
   Sistema para enviar notificaciones push y email a usuarios.
   Los usuarios deben poder configurar sus preferencias (qué 
   notificaciones reciben, por qué canal). El sistema debe
   soportar plantillas de mensajes y tracking de entrega.
   
   Repositorio: [Selecciona tu repo o crea uno nuevo]
   ```

4. **Wizard Step 2: Seleccionar Specs**
   
   El sistema recomendará specs basándose en tu descripción:
   
   - ☑️ **Security Best Practices** (recomendado)
   - ☑️ **API Design Best Practices** (recomendado)
   - ☑️ **Git Flow Best Practices** (siempre útil)
   - ☐ **FinOps Best Practices** (opcional)
   - ☐ **Observability Best Practices** (opcional)

5. **Wizard Step 3: Tech Stack (Opcional)**
   ```
   Stack: Next.js 14, PostgreSQL, SendGrid API, FCM for push
   
   Constraints:
   - Debe soportar 100,000 notificaciones/día
   - Latencia máxima: 5 segundos desde evento a entrega
   - Integración con sistema de usuarios existente
   ```

6. **Wizard Step 4: Review & Create**
   
   Revisa la información y click "Create Project"
   
   **El sistema automáticamente:**
   - ✅ Crea branch `004-notification-system`
   - ✅ Genera `spec.md` con user stories y requisitos
   - ✅ Crea `constitution.md` combinando specs seleccionadas
   - ✅ Hace commit inicial a GitHub
   - ✅ Te lleva al dashboard del proyecto

7. **Dashboard del Proyecto**
   
   Verás el estado actual:
   ```
   [✓] Specify  [⏳] Plan  [ ] Tasks  [ ] Implement
   ▓▓▓░░░░░░░░░ 25% Complete
   ```
   
   **Next Steps:**
   - Review `spec.md` (ya generado por AI)
   - Click "Generate Plan with AI" para crear `plan.md`
   - Una vez plan completo, generar `tasks.md`
   - Implementar tasks usando AI coding agent

---

### Opción 2: Proceso Manual (Sin UI)

Si prefieres trabajar directamente en Git/editor, puedes seguir el proceso manualmente.

**Tiempo estimado: 30-45 minutos**

#### **Paso 1: Setup Inicial**

```bash
# 1. Clone el repositorio si aún no lo tienes
git clone https://github.com/tu-org/tu-repo.git
cd tu-repo

# 2. Descarga los templates de spec-kit
# (Desde DXC_PoC_Nirvana/specs-library/templates/)
mkdir -p .specify/templates
cp path/to/spec-library/templates/* .specify/templates/

# 3. Crea branch para tu feature
git checkout -b 001-notification-system

# 4. Crea estructura de directorios
mkdir -p specs/001-notification-system
cd specs/001-notification-system
```

#### **Paso 2: Crear Specification (spec.md)**

Copia el template y rellénalo:

```bash
cp ../../.specify/templates/spec-template.md spec.md
```

Edita `spec.md` siguiendo esta estructura:

```markdown
# Feature Specification: Sistema de Notificaciones

**Feature Branch**: `001-notification-system`
**Created**: 2025-10-27
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Usuario configura preferencias (Priority: P1)

**Descripción**: Como usuario, quiero configurar qué notificaciones recibo 
y por qué canal (email/push) para controlar la cantidad de mensajes que recibo.

**Why this priority**: Funcionalidad core - sin esto, usuarios reciben todas 
las notificaciones y puede resultar en spam.

**Independent Test**: Puede testearse creando un usuario, cambiando preferencias,
y verificando que solo recibe notificaciones configuradas.

**Acceptance Scenarios**:

1. **Given** usuario está en página de configuración
   **When** deshabilita notificaciones de "Comentarios"
   **Then** no recibe más notificaciones de comentarios por ningún canal

2. **Given** usuario tiene email deshabilitado pero push habilitado
   **When** ocurre un evento que genera notificación
   **Then** recibe notificación push pero no email

### User Story 2 - Sistema envía notificación (Priority: P1)

**Descripción**: Como sistema, cuando ocurre un evento relevante, debo enviar
notificación al usuario por el canal configurado.

**Why this priority**: Core functionality - razón de ser del sistema.

**Independent Test**: Trigger evento (ej: nuevo comentario), verificar que
notificación se envía al usuario correcto por canal correcto.

**Acceptance Scenarios**:

1. **Given** usuario tiene push notifications habilitadas
   **When** recibe un nuevo mensaje
   **Then** notificación push es enviada en <5 segundos

2. **Given** usuario tiene email habilitado
   **When** recibe notificación de bajo prioridad
   **Then** email es enviado usando plantilla correcta

### User Story 3 - Admin ve analytics de entregas (Priority: P2)

**Descripción**: Como admin, quiero ver estadísticas de entregas de 
notificaciones para monitorear la salud del sistema.

**Why this priority**: Importante para ops pero no bloquea MVP.

**Acceptance Scenarios**:

1. **Given** admin accede a dashboard
   **When** visualiza métricas de últimas 24h
   **Then** ve: total enviadas, entregadas, fallidas, tasa de apertura

## Requirements

### Functional Requirements

- **FR-001**: Sistema MUST almacenar preferencias de usuario por tipo de notificación
  - Tipos: comentarios, mensajes, menciones, sistema
  - Canales: email, push, ninguno
- **FR-002**: Sistema MUST validar que usuario tiene canal configurado antes de enviar
- **FR-003**: Sistema MUST usar plantillas para formatear mensajes
  - Soporte variables dinámicas (usuario, evento, timestamp)
- **FR-004**: Sistema MUST trackear estado de entrega (enviada, entregada, fallida, abierta)
- **FR-005**: Sistema MUST implementar retry logic para fallos transitorios
  - Max 3 reintentos con backoff exponencial
- **FR-006**: API MUST exponer endpoint para disparar notificaciones
  - POST /api/notifications con payload: user_id, type, data
- **FR-007**: Sistema MUST soportar 100,000 notificaciones/día sin degradación

### Success Criteria

- **SC-001**: 95% de notificaciones entregadas en <5 segundos desde evento
- **SC-002**: Tasa de fallo <1% (excluyendo fallos de proveedores externos)
- **SC-003**: Usuarios pueden cambiar preferencias y cambios aplican inmediatamente
- **SC-004**: Dashboard de analytics accesible en <2 segundos
- **SC-005**: Zero notificaciones enviadas a usuarios que deshabilitaron ese tipo

## Assumptions

- Integración con SendGrid (email) y Firebase Cloud Messaging (push) ya configurada
- Sistema de usuarios existente provee user_id válidos
- Plantillas de mensajes gestionadas por equipo de producto (no auto-servicio)

## Out of Scope (for this iteration)

- SMS notifications (futuro)
- In-app notifications (futuro)
- Scheduling de notificaciones (enviar en X tiempo)
- A/B testing de mensajes
```

**✅ Checklist de calidad para spec.md:**

Antes de pasar a plan.md, verifica:

- [ ] User stories tienen prioridades claras (P1, P2, P3)
- [ ] Cada user story es independiente y testable
- [ ] Requisitos son específicos y no ambiguos
- [ ] Success criteria son medibles (con números/porcentajes)
- [ ] Success criteria NO mencionan tecnologías (tech-agnostic)
- [ ] Assumptions documentadas
- [ ] Out of scope explícito

#### **Paso 3: Crear Constitution (constitution.md)**

Si seleccionaste specs predefinidas (Git Flow, Security), combínalas en `constitution.md`:

```markdown
# Project Constitution: Notification System

Este proyecto adhiere a los siguientes principios y prácticas:

## 1. Git Flow Best Practices

**Branch Naming:**
- feature/ISSUE-001-add-notification-preferences
- bugfix/ISSUE-045-fix-email-retry-logic

**Commit Convention:**
- feat(notifications): add user preferences endpoint
- fix(email): handle SendGrid rate limit errors

**PR Requirements:**
- Min 1 reviewer approval
- All CI checks must pass
- Include description and screenshots if UI changes

## 2. Security Best Practices

**Secrets Management:**
- Never commit API keys (SendGrid, FCM) to repo
- Use environment variables or Azure Key Vault
- Pre-commit hook scans for secrets

**API Security:**
- All endpoints require authentication
- Rate limiting: 100 requests/min per user
- Input validation on all parameters

**Dependencies:**
- Run `npm audit` before every PR
- Block merge if critical vulnerabilities found

## 3. API Design Best Practices (si aplicable)

**Versioning:**
- API uses `/v1/` prefix
- Breaking changes increment major version

**Documentation:**
- OpenAPI 3.0 spec auto-generated
- Example requests/responses for all endpoints

**Error Handling:**
- Standard error format: `{ "error": { "code": "...", "message": "..." } }`
- HTTP status codes: 400 (bad request), 401 (unauthorized), 500 (server error)
```

#### **Paso 4: Generar Plan con AI (Dify Bot)**

**Opción A: Usar Dify UI**

1. Abre Dify chatbot en Control Center
2. Ejecuta comando `/plan` con contexto:

```
/plan

Proyecto: Sistema de Notificaciones
Spec: [pega link a spec.md en GitHub]

Tech Stack:
- Backend: Next.js 14 API routes
- Database: PostgreSQL con tablas: user_preferences, notifications, delivery_logs
- Email: SendGrid API
- Push: Firebase Cloud Messaging
- Queue: Azure Service Bus para procesamiento asíncrono

Constraints:
- Debe integrarse con sistema de usuarios existente (API /api/users/{id})
- Soportar 100,000 notificaciones/día
- Latencia <5 segundos
```

3. Bot generará `plan.md` con:
   - Technical Stack detallado
   - Project Structure (directorios)
   - API Contracts (endpoints)
   - Data Models (schemas)
   - Implementation phases

**Opción B: Manual**

Copia template y rellena:

```bash
cp ../../.specify/templates/plan-template.md plan.md
```

Secciones clave a completar:

```markdown
# Implementation Plan: Notification System

## Technical Stack

- **Backend**: Next.js 14 with API routes
- **Database**: PostgreSQL 15
  - Tables: user_preferences, notifications, delivery_logs, templates
- **Message Queue**: Azure Service Bus (for async processing)
- **Email Provider**: SendGrid API
- **Push Provider**: Firebase Cloud Messaging (FCM)
- **Monitoring**: Application Insights

## Project Structure

```
src/
├── notifications/
│   ├── preferences.ts      # User preferences logic
│   ├── sender.ts           # Send notification logic
│   ├── templates.ts        # Template management
│   └── tracking.ts         # Delivery tracking
├── queue/
│   ├── consumer.ts         # Service Bus message consumer
│   └── publisher.ts        # Publish to queue
└── api/
    └── routes/
        ├── preferences.ts  # GET/PUT /api/notifications/preferences
        ├── send.ts         # POST /api/notifications/send
        └── analytics.ts    # GET /api/notifications/analytics
```

## API Contracts

### POST /api/notifications/send

Request:
```json
{
  "user_id": "uuid",
  "type": "comment" | "message" | "mention" | "system",
  "data": {
    "title": "New comment on your post",
    "body": "User X commented...",
    "action_url": "/posts/123"
  }
}
```

Response:
```json
{
  "notification_id": "uuid",
  "status": "queued",
  "estimated_delivery": "2025-10-27T10:05:00Z"
}
```

## Data Models

### user_preferences
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY,
    notification_type VARCHAR(50),
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20), -- 'email' | 'push'
    status VARCHAR(20),  -- 'queued' | 'sent' | 'delivered' | 'failed'
    payload JSONB,
    created_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP
);
```
```

#### **Paso 5: Generar Tasks**

Una vez tienes `spec.md` y `plan.md` completos:

```bash
cp ../../.specify/templates/tasks-template.md tasks.md
```

Organiza tasks por user story con prioridades:

```markdown
# Tasks: Notification System

## Phase 1: Setup (Shared Infrastructure)

- [ ] TASK-001 [P0] Setup PostgreSQL schema (tables: user_preferences, notifications, templates)
- [ ] TASK-002 [P0] Configure SendGrid API credentials in Azure Key Vault
- [ ] TASK-003 [P0] Configure FCM credentials
- [ ] TASK-004 [P0] Setup Azure Service Bus queue

## Phase 2: User Story 1 - Usuario configura preferencias (P1) 🎯 MVP

- [ ] TASK-005 [P1] Implement GET /api/notifications/preferences endpoint
- [ ] TASK-006 [P1] Implement PUT /api/notifications/preferences endpoint
- [ ] TASK-007 [P1] Create frontend component PreferencesForm
- [ ] TASK-008 [P1] Write integration tests for preferences endpoints
- [ ] TASK-009 [P1] Add database indexes on user_id, notification_type

## Phase 3: User Story 2 - Sistema envía notificación (P1) 🎯 MVP

- [ ] TASK-010 [P1] Implement POST /api/notifications/send endpoint
  - Validate user_id exists
  - Check user preferences
  - Queue message to Service Bus
- [ ] TASK-011 [P1] Implement Service Bus consumer
  - Read message from queue
  - Determine channel (email/push) based on preferences
  - Call appropriate sender
- [ ] TASK-012 [P1] Implement EmailSender class
  - Use SendGrid API
  - Apply template
  - Handle rate limits
- [ ] TASK-013 [P1] Implement PushSender class
  - Use FCM API
  - Handle token refresh
- [ ] TASK-014 [P1] Implement retry logic with exponential backoff
- [ ] TASK-015 [P1] Write unit tests for sender classes
- [ ] TASK-016 [P1] Write e2e test: trigger event → verify notification delivered

## Phase 4: User Story 3 - Admin analytics (P2)

- [ ] TASK-017 [P2] Implement GET /api/notifications/analytics endpoint
  - Aggregate by date, type, channel, status
- [ ] TASK-018 [P2] Create analytics dashboard component
- [ ] TASK-019 [P2] Add charts (sent vs delivered, failure rate)

## Dependencies

- TASK-005 depends on TASK-001 (DB schema)
- TASK-010 depends on TASK-004 (Service Bus setup)
- TASK-011 depends on TASK-012, TASK-013 (sender implementations)
```

#### **Paso 6: Implementar con AI Coding Agent**

Ahora que tienes spec.md, plan.md, y tasks.md completos, puedes usar AI coding agents:

**GitHub Copilot:**

1. Abre VS Code con Copilot habilitado
2. Abre `tasks.md`
3. Para cada task, crea un archivo y deja que Copilot sugiera implementación
4. Copilot usará contexto de spec.md y plan.md para generar código correcto

**Ejemplo:**

```typescript
// src/notifications/preferences.ts

// Copilot suggestion basado en spec.md FR-001:
export interface UserPreferences {
  user_id: string;
  notification_type: 'comment' | 'message' | 'mention' | 'system';
  email_enabled: boolean;
  push_enabled: boolean;
}

// Copilot suggestion basado en plan.md API contract:
export async function getPreferences(userId: string): Promise<UserPreferences[]> {
  const result = await db.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}
```

**Claude / ChatGPT:**

Puedes pasar spec.md + plan.md + task description para generar código:

```
Context:
- Spec: [paste relevant user story + requirements]
- Plan: [paste API contract + data model]

Task: Implement POST /api/notifications/send endpoint

Requirements from spec:
- FR-002: Validate user has channel configured
- FR-006: Endpoint accepts user_id, type, data
- SC-001: Process in <5 seconds

Generate the implementation in Next.js API route format.
```

---

## Specs Disponibles (Fase 1)

Actualmente tenemos 3 specs predefinidas. Úsalas seleccionándolas en el wizard o copiando manualmente a `constitution.md`:

### 1. Git Flow Best Practices

**Cuándo usar**: Siempre (recomendado para todos los proyectos)

**Qué incluye**:
- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Commit conventions: Conventional Commits format
- PR templates y proceso de review
- Protección de ramas principales

**Archivo**: `/specs-library/git-flow.md`

---

### 2. Security Best Practices

**Cuándo usar**: Proyectos con APIs públicas, manejo de datos sensibles, autenticación

**Qué incluye**:
- Pre-commit hooks para detectar secretos
- SAST/DAST tools configuration
- OWASP Top 10 mitigations
- Security headers (CSP, HSTS, etc.)
- Dependency scanning

**Archivo**: `/specs-library/security.md`

---

### 3. IaC Best Practices (Terraform)

**Cuándo usar**: Proyectos de infraestructura, módulos Terraform

**Qué incluye**:
- Module structure standard
- Naming conventions para resources
- State management (Azure Storage backend)
- Variable validation patterns
- Tagging strategy
- Drift detection setup

**Archivo**: `/specs-library/iac-terraform.md`

---

## Tips & Best Practices

### ✅ DO

1. **Start with Spec**: No escribas código hasta tener spec.md revisada
2. **User Stories Independientes**: Cada user story debe ser testeable por separado
3. **Success Criteria Medibles**: Usa números (tiempo, %, tasa, etc.)
4. **Tech-Agnostic Specs**: No menciones frameworks en spec.md (va en plan.md)
5. **Prioriza**: Usa P1 para MVP, P2 para "nice to have", P3 para futuro
6. **Revisa con Equipo**: Valida spec con stakeholders antes de implementar
7. **Usa AI**: Deja que AI genere código basado en specs claras

### ❌ DON'T

1. **No "Vibe Code"**: No empieces a codificar sin spec
2. **No Specs Vagas**: "Sistema debe ser rápido" → "95% requests <200ms"
3. **No Mixing**: No mezcles QUÉ (spec) con CÓMO (plan) en mismo documento
4. **No Skipping Tests**: Cada user story debe tener acceptance scenarios
5. **No Tech in Specs**: "Usar React hooks" → va en plan.md, no en spec.md
6. **No Skipping Constitution**: Si usas specs predefinidas, documéntalas

---

## Troubleshooting

### "El bot de Dify no genera una spec completa"

**Causa**: Descripción del proyecto muy vaga

**Solución**: Sé más específico en el wizard:
- ✅ "Sistema de notificaciones push y email con preferencias de usuario y tracking de entregas"
- ❌ "Sistema de notificaciones"

Incluye: quién usa el sistema, qué problema resuelve, escala esperada.

---

### "No sé qué specs seleccionar"

**Guía rápida:**

| Tipo de Proyecto | Specs Recomendadas |
|-----------------|-------------------|
| API Backend | Security, API Design, Git Flow |
| Frontend App | Git Flow, Testing, API Design |
| Infraestructura | IaC, Security, FinOps, Git Flow |
| Microservicio | Security, API Design, Observability, Git Flow |
| Data Pipeline | Testing, Observability, Git Flow |

**Regla general**: Siempre incluye Git Flow + 1-2 specs relevantes al dominio.

---

### "La spec generada tiene [NEEDS CLARIFICATION]"

**Causa**: Aspecto ambiguo que AI no puede inferir

**Solución**: Responde las preguntas marcadas. Ejemplo:

```markdown
- **FR-006**: Sistema MUST autenticar usuarios vía 
  [NEEDS CLARIFICATION: método de auth - email/password, SSO, OAuth?]
```

Reemplaza con:

```markdown
- **FR-006**: Sistema MUST autenticar usuarios vía OAuth2 (Google, GitHub)
```

Máximo 3 clarificaciones por spec (si hay más, la descripción era muy vaga).

---

### "Tasks son muy grandes, no sé por dónde empezar"

**Causa**: User story muy compleja, debería dividirse

**Solución**: 
1. Divide user story en 2-3 stories más pequeñas
2. O divide task en subtasks más granulares

**Regla**: Una task debe ser implementable en 2-4 horas.

Ejemplo de división:

**❌ Task grande:**
```
- [ ] TASK-010 [P1] Implement notification system
```

**✅ Tasks granulares:**
```
- [ ] TASK-010 [P1] Implement POST /api/notifications/send endpoint (validate input)
- [ ] TASK-011 [P1] Implement Service Bus publisher (queue message)
- [ ] TASK-012 [P1] Implement Service Bus consumer (read and process)
- [ ] TASK-013 [P1] Implement email sender (SendGrid integration)
- [ ] TASK-014 [P1] Add retry logic with exponential backoff
```

---

## Siguiente Paso

¿Listo para crear tu primer proyecto spec-driven?

**Opción A (UI)**: Ve a http://localhost:3000/spec-projects y click "+ New Project"

**Opción B (Manual)**: Sigue los pasos en [Opción 2: Proceso Manual](#opción-2-proceso-manual-sin-ui)

**Necesitas ayuda?** Consulta:
- [Documentación completa](./README.md)
- [ADR-009: Decisión técnica](../../architecture/adr/ADR-009-spec-driven-development-platform.md)
- Specs predefinidas en `/specs-library/`

---

**Happy Spec-Driven Development! 🚀**
