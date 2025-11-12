# 📋 Project Wizard - Guía Completa

## 🎯 ¿Qué es el Project Wizard?

El Project Wizard es una herramienta de **planificación automática de proyectos** que utiliza IA (GPT-4o) para generar planes completos de proyecto siguiendo metodologías Agile y desplegarlos automáticamente en GitHub.

### Características Principales

✅ **Jerarquía Completa**: Epic → Feature → Story → Enabler → Test  
✅ **Priorización Automática**: P0 (Crítico) → P3 (Bajo) basado en valor de negocio  
✅ **Estimaciones**: Fibonacci (1,2,3,5,8,13) para stories, T-shirt (XS-XXL) para epics  
✅ **Dependencias**: Identifica y mapea bloqueadores y prerequisitos  
✅ **GitHub Integration**: Crea issues, labels, y project boards automáticamente  
✅ **Tracking**: Base de datos con historial completo de generación y deployment  

---

## 🔄 Flujo del Wizard (4 Pasos)

```
┌─────────────────┐
│  1. Project Info│  ← Describes tu proyecto
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. AI Generation│  ← GPT-4o genera el plan completo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   3. Preview    │  ← Revisas Epics, Features, Stories
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   4. Deploy     │  ← Crea issues en GitHub automáticamente
└─────────────────┘
```

### Paso 1: Project Info
Defines:
- **Nombre del proyecto**
- **Descripción detallada**
- **Timeline** (opcional): "3 meses", "6 sprints"
- **Constraints** (opcional): "Debe soportar 1M usuarios"
- **Must-Have Features**: Lista de features críticos (P0/P1)
- **Nice-to-Have Features**: Lista de features deseables (P2/P3)

### Paso 2: AI Generation
El sistema:
1. Lee el prompt del agente: `project-planner.agent.md`
2. Combina el prompt con tu input
3. Llama a GitHub Models API (gpt-4o)
4. Parsea la respuesta JSON
5. Guarda todo en la DB (`project_generation_logs`)

### Paso 3: Preview
Muestra:
- Resumen del proyecto
- Conteo de: Epics, Features, Stories, Enablers, Tests
- Lista de Epics con prioridades
- Success metrics

### Paso 4: Deploy to GitHub
1. Verifica acceso al repositorio
2. Crea entrada en `github_projects` table
3. Crea issues en GitHub con jerarquía
4. Guarda tracking en `github_issues_tracking`
5. Crea GitHub Project Board (opcional)
6. Vincula dependencias mediante comentarios

---

## 🏗️ Estructura de la Jerarquía

### Epic (Nivel 0)
- **Objetivo**: Capacidad de negocio completa
- **Ejemplo**: "User Authentication System"
- **Tamaño**: XS-XXL (basado en número de features/stories)
- **Contiene**: 3-10 Features

### Feature (Nivel 1)
- **Objetivo**: Capacidad orientada al usuario
- **Ejemplo**: "Social Login Integration"
- **Estimación**: Suma de story points
- **Contiene**: 2-8 Stories/Enablers/Tests

### Story (Nivel 2)
- **Objetivo**: Valor entregable al usuario
- **Formato**: "Como [rol], quiero [acción], para [beneficio]"
- **Ejemplo**: "Como usuario, quiero login con Google, para acceder rápidamente"
- **Estimación**: 1-13 puntos (Fibonacci)

### Enabler (Nivel 2)
- **Objetivo**: Fundación técnica sin valor directo de usuario
- **Ejemplo**: "Setup OAuth2 client configuration"
- **Estimación**: 1-13 puntos

### Test (Nivel 2)
- **Objetivo**: Validación de calidad
- **Ejemplo**: "E2E tests for login flow"
- **Estimación**: 1-8 puntos

---

## 🎯 Sistema de Prioridades

| Prioridad | Significado | Criterio | Ejemplo |
|-----------|-------------|----------|---------|
| **P0** | Crítico | Bloquea lanzamiento, seguridad, legal | "Implement HTTPS encryption" |
| **P1** | Alto | Core user journey, diferenciador clave | "User registration flow" |
| **P2** | Medio | Importante pero no bloqueante | "Email notifications" |
| **P3** | Bajo | Nice-to-have, optimización | "Dark mode UI" |

---

## 💾 Almacenamiento en Base de Datos

### Tablas Involucradas

#### 1. `project_generation_logs`
Almacena cada generación de IA:
```sql
- id: UUID único
- user_input: Input del usuario
- agent_prompt: Prompt del agente usado
- ai_response: Respuesta completa de GPT-4o
- generated_plan: JSON parseado del plan
- model_used: "gpt-4o"
- tokens_used: Conteo de tokens
- generation_time_ms: Tiempo de generación
- status: "success" | "error"
- project_id: FK a github_projects (si se despliega)
- created_at: Timestamp
```

#### 2. `github_projects`
Proyectos desplegados:
```sql
- id: UUID
- name: Nombre del proyecto
- description: Descripción
- repository_owner: "AlbertoLacambra"
- repository_name: "my-project"
- status: "planning" | "active" | "completed"
- github_project_id: ID del Project Board
- github_project_number: Número del Project Board
- success_metrics: JSON array
- timeline_start/end: Fechas
- created_by: Usuario
- deployed_at: Timestamp de deployment
```

#### 3. `github_issues_tracking`
Cada issue creado:
```sql
- id: UUID
- project_id: FK a github_projects
- github_issue_number: #123 en GitHub
- github_issue_id: ID interno de GitHub
- issue_type: "epic" | "feature" | "story" | "enabler" | "test"
- title: Título del issue
- body: Descripción completa
- state: "open" | "closed"
- priority: "P0" | "P1" | "P2" | "P3"
- value: "high" | "medium" | "low"
- estimate: Puntos o tamaño
- labels: JSON array
- hierarchy_level: 0 (epic), 1 (feature), 2 (story/enabler/test)
- hierarchy_path: "1.2.3" (epic.feature.story)
- parent_issue_id: FK a parent issue
- dependencies: JSON array de paths dependientes
- metadata: JSON con sprint, milestone, assignees, etc.
- created_at/updated_at: Timestamps
```

#### 4. `project_board_columns`
Columnas del tablero:
```sql
- id: UUID
- project_id: FK
- column_name: "Backlog", "In Progress", "Done", etc.
- column_order: Orden de la columna
```

---

## 🧪 Ejemplo de Prueba

### Escenario: E-Commerce Checkout System

**URL**: http://localhost:3000/projects/new/wizard

### Paso 1: Datos del Proyecto

**Project Name:**
```
E-Commerce Smart Checkout
```

**Description:**
```
Modernizar el sistema de checkout para reducir abandono de carrito y aumentar conversión. 
Incluye checkout de un solo paso, múltiples métodos de pago, optimización mobile-first, 
y personalización basada en historial de compras.
```

**Timeline:**
```
3 meses (6 sprints de 2 semanas)
```

**Constraints:**
```
Debe soportar 10,000 transacciones concurrentes, tiempo de carga < 2s, 
compatibilidad con PCI-DSS, integración con sistemas legacy de inventario
```

**Must-Have Features:**
```
- Checkout de una sola página
- Pago con tarjeta de crédito/débito
- PayPal integration
- Cálculo automático de impuestos
- Validación de stock en tiempo real
- Confirmación por email
- Mobile responsive design
- Guardar carrito para después
```

**Nice-to-Have Features:**
```
- Apple Pay / Google Pay
- Checkout como invitado
- Cupones y descuentos
- Recomendaciones de productos
- Chat de soporte en vivo
- Múltiples direcciones de envío
- Programa de puntos de lealtad
```

### Paso 2: AI Generation
Click en **"Generate Plan with AI"**

El sistema genera algo como:

```json
{
  "project": {
    "name": "E-Commerce Smart Checkout",
    "description": "...",
    "timeline": "3 months / 6 sprints",
    "success_metrics": [
      "Reduce cart abandonment from 70% to 45%",
      "Increase conversion rate by 25%",
      "Achieve < 2s page load time",
      "Handle 10K concurrent transactions",
      "Reach 95% mobile usability score"
    ]
  },
  "epics": [
    {
      "title": "Epic 1: Core Checkout Flow",
      "description": "Single-page checkout with payment processing",
      "priority": "P0",
      "size": "L",
      "value": "high"
    },
    {
      "title": "Epic 2: Payment Methods Integration",
      "description": "Multiple payment gateways and wallets",
      "priority": "P0",
      "size": "M",
      "value": "high"
    },
    {
      "title": "Epic 3: Mobile Optimization",
      "description": "Mobile-first responsive design",
      "priority": "P1",
      "size": "M",
      "value": "high"
    }
  ],
  "features": [
    {
      "title": "Single-Page Checkout UI",
      "epic_path": "1",
      "feature_number": 1,
      "priority": "P0",
      "estimate": "21 points"
    },
    {
      "title": "Credit/Debit Card Processing",
      "epic_path": "2",
      "feature_number": 1,
      "priority": "P0",
      "estimate": "13 points"
    }
  ],
  "stories": [
    {
      "title": "As a customer, I want to see all checkout fields on one page, so I can complete purchase quickly",
      "feature_path": "1.1",
      "story_number": 1,
      "priority": "P0",
      "estimate": 5,
      "acceptance_criteria": [
        "All fields visible without scrolling",
        "Clear visual hierarchy",
        "Real-time validation"
      ]
    }
  ],
  "enablers": [
    {
      "title": "Setup Stripe API integration",
      "feature_path": "2.1",
      "enabler_number": 1,
      "priority": "P0",
      "estimate": 3,
      "description": "Configure Stripe SDK and webhook handlers"
    }
  ],
  "tests": [
    {
      "title": "E2E tests for complete checkout flow",
      "feature_path": "1.1",
      "test_number": 1,
      "priority": "P0",
      "estimate": 5,
      "test_type": "e2e"
    }
  ],
  "dependencies": [
    {
      "from_path": "1.1.1",
      "to_path": "2.1.E1",
      "type": "blocks",
      "description": "Payment UI depends on Stripe integration"
    }
  ],
  "sprint_plan": [
    {
      "sprint": 1,
      "theme": "Foundation & Core Flow",
      "stories": ["1.1.1", "1.1.2", "2.1.E1"],
      "capacity": 21
    }
  ]
}
```

### Paso 3: Preview
Revisa:
- ✅ **3 Epics** identificados
- ✅ **8 Features** planificadas
- ✅ **25 Stories** creados
- ✅ **6 Enablers** técnicos
- ✅ **10 Tests** de calidad
- ✅ Success metrics definidos

### Paso 4: Deploy to GitHub

**Repository Owner:**
```
AlbertoLacambra
```

**Repository Name:**
```
ecommerce-smart-checkout
```

Click en **"Deploy to GitHub"**

---

## 🚀 Resultado en GitHub

El sistema crea automáticamente:

### Issues Creados (ejemplo):
```
#1 [Epic] Core Checkout Flow (P0) 🎯
#2 [Epic] Payment Methods Integration (P0) 🎯
#3 [Epic] Mobile Optimization (P1) ⭐

#4 [Feature] Single-Page Checkout UI (P0) - Parent: #1
#5 [Feature] Credit/Debit Card Processing (P0) - Parent: #2

#6 [Story] As a customer, I want to see all checkout fields... (P0, 5pts) - Parent: #4
#7 [Enabler] Setup Stripe API integration (P0, 3pts) - Parent: #5
#8 [Test] E2E tests for complete checkout flow (P0, 5pts) - Parent: #4
```

### Labels Automáticos:
- `epic`, `feature`, `story`, `enabler`, `test`
- `P0`, `P1`, `P2`, `P3`
- `value-high`, `value-medium`, `value-low`

### Project Board:
Columnas: Backlog → Sprint Ready → In Progress → Review → Testing → Done

### Comentarios de Dependencias:
```
Issue #6 → Comment: "**Dependency**: blocks #7"
```

---

## 📊 Base de Datos Resultante

### `project_generation_logs`
```sql
id: "550e8400-e29b-41d4-a716-446655440000"
user_input: "Project Name: E-Commerce Smart Checkout..."
ai_response: "{\"project\": {...}}"
generated_plan: {...}
model_used: "gpt-4o"
tokens_used: 3247
generation_time_ms: 12450
status: "success"
project_id: "660e8400-e29b-41d4-a716-446655440000"
```

### `github_projects`
```sql
id: "660e8400-e29b-41d4-a716-446655440000"
name: "E-Commerce Smart Checkout"
repository_owner: "AlbertoLacambra"
repository_name: "ecommerce-smart-checkout"
status: "active"
github_project_number: 1
success_metrics: ["Reduce cart abandonment...", ...]
deployed_at: "2025-11-10 15:30:00"
```

### `github_issues_tracking` (49 registros)
```sql
# Ejemplo de Epic
id: "770e8400..."
project_id: "660e8400..."
github_issue_number: 1
issue_type: "epic"
title: "Epic 1: Core Checkout Flow"
priority: "P0"
hierarchy_level: 0
hierarchy_path: "1"
parent_issue_id: null

# Ejemplo de Story
id: "880e8400..."
project_id: "660e8400..."
github_issue_number: 6
issue_type: "story"
title: "As a customer, I want to see all checkout fields..."
priority: "P0"
estimate: 5
hierarchy_level: 2
hierarchy_path: "1.1.1"
parent_issue_id: "770e8400..." (Feature #4)
dependencies: ["2.1.E1"]
metadata: {"sprint": 1, "assignees": [], ...}
```

---

## 🔍 Verificación del Deployment

### 1. Verifica GitHub Issues
```bash
# Ve a tu repositorio
https://github.com/AlbertoLacambra/ecommerce-smart-checkout/issues

# Deberías ver todos los issues con labels correctos
```

### 2. Verifica Project Board
```bash
https://github.com/AlbertoLacambra/ecommerce-smart-checkout/projects/1
```

### 3. Verifica Base de Datos
```sql
-- Ver el proyecto creado
SELECT * FROM github_projects 
WHERE repository_name = 'ecommerce-smart-checkout';

-- Ver todos los issues creados
SELECT 
  issue_type,
  COUNT(*) as count,
  AVG(estimate::int) as avg_estimate
FROM github_issues_tracking
WHERE project_id = '660e8400-e29b-41d4-a716-446655440000'
GROUP BY issue_type;

-- Ver jerarquía completa
SELECT 
  hierarchy_path,
  issue_type,
  title,
  priority,
  estimate
FROM github_issues_tracking
WHERE project_id = '660e8400-e29b-41d4-a716-446655440000'
ORDER BY hierarchy_path;
```

---

## 🎓 Basado en GitHub Copilot Prompt

El agente está basado en:
https://github.com/github/awesome-copilot/blob/main/prompts/breakdown-plan.prompt.md

### Adaptaciones DXC:
1. ✅ **Agile Completo**: Epic → Feature → Story → Enabler → Test
2. ✅ **Prioridades**: P0-P3 con framework de valor de negocio
3. ✅ **Estimaciones**: Fibonacci + T-shirt sizing
4. ✅ **GitHub Native**: Issues, labels, project boards automáticos
5. ✅ **Base de Datos**: Tracking completo y auditabilidad
6. ✅ **Dependencies**: Mapeo automático con comentarios
7. ✅ **AI Powered**: GPT-4o con prompts especializados

---

## 🚦 Próximos Pasos

1. **Prueba el ejemplo**: Usa los datos del e-commerce checkout
2. **Verifica GitHub**: Revisa issues, labels, y project board
3. **Consulta DB**: Explora las tablas para ver el tracking
4. **Itera**: Prueba con diferentes tipos de proyectos
5. **Extiende**: Añade más features como sprint planning automático

¿Listo para probarlo? 🚀
