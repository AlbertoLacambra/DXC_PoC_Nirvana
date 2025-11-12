# 🧪 Ejemplo Práctico: E-Commerce Smart Checkout

## 📋 Datos para el Wizard

### ✅ Paso 1: Project Info

**Copia y pega estos datos en el wizard:**

#### Project Name
```
E-Commerce Smart Checkout
```

#### Description
```
Modernizar el sistema de checkout para reducir el abandono de carrito del 70% al 45% y aumentar la tasa de conversión en un 25%. El sistema incluirá checkout de un solo paso, múltiples métodos de pago (tarjeta, PayPal, wallets digitales), optimización mobile-first, validación de stock en tiempo real, y personalización basada en el historial de compras del usuario. Debe integrarse con sistemas legacy de inventario y cumplir con PCI-DSS.
```

#### Timeline
```
3 meses (6 sprints de 2 semanas)
```

#### Constraints
```
Debe soportar 10,000 transacciones concurrentes con latencia < 500ms, tiempo de carga de página < 2 segundos, disponibilidad 99.9%, compatibilidad con PCI-DSS Level 1, integración con SAP para inventario en tiempo real, y soporte para 15 países con múltiples divisas e impuestos
```

#### Must-Have Features (Añade uno por uno)

1. `Checkout de una sola página sin recargas`
2. `Procesamiento de tarjeta crédito/débito con Stripe`
3. `Integración con PayPal Express Checkout`
4. `Cálculo automático de impuestos por jurisdicción`
5. `Validación de stock en tiempo real desde SAP`
6. `Confirmación de pedido por email con PDF`
7. `Diseño responsive mobile-first`
8. `Guardar carrito para completar después`
9. `Detección y prevención de fraude`
10. `Recuperación automática de sesión`

#### Nice-to-Have Features (Añade uno por uno)

1. `Apple Pay y Google Pay integration`
2. `Checkout como invitado sin registro`
3. `Sistema de cupones y códigos de descuento`
4. `Recomendaciones de productos relacionados`
5. `Chat de soporte en vivo durante checkout`
6. `Múltiples direcciones de envío en un pedido`
7. `Programa de puntos de lealtad`
8. `Estimación de tiempo de entrega en tiempo real`
9. `Opción de regalo con mensaje personalizado`
10. `Guardado automático de métodos de pago`

---

## 🎯 Paso 2: AI Generation

Click en **"Generate Plan with AI"**

⏱️ Espera ~15-30 segundos mientras GPT-4o genera el plan completo.

### Lo que sucede internamente:

1. ✅ Lee el prompt del agente (`project-planner.agent.md`)
2. ✅ Combina con tu input
3. ✅ Llama a GitHub Models API
4. ✅ Parsea JSON con estructura Epic > Feature > Story
5. ✅ Guarda en `project_generation_logs`

---

## 👀 Paso 3: Preview

### Deberías ver algo como:

#### Project Overview
- **Name**: E-Commerce Smart Checkout
- **Timeline**: 3 months / 6 sprints
- **Success Metrics**:
  - ✅ Reduce cart abandonment from 70% to 45%
  - ✅ Increase conversion rate by 25%
  - ✅ Achieve < 2s page load time
  - ✅ Handle 10K concurrent transactions
  - ✅ Reach 99.9% uptime
  - ✅ Achieve 95% mobile usability score

#### Issue Breakdown
- **3-4 Epics** (Level 0)
- **10-15 Features** (Level 1)
- **30-40 Stories** (Level 2)
- **8-12 Enablers** (Level 2)
- **12-18 Tests** (Level 2)

#### Epics Esperados
1. 🎯 **Epic 1: Core Checkout Flow** (P0, Size: L)
   - Single-page checkout UI
   - Shopping cart management
   - Order confirmation workflow

2. 🎯 **Epic 2: Payment Processing** (P0, Size: L)
   - Credit/Debit card integration
   - PayPal integration
   - Fraud detection system

3. ⭐ **Epic 3: Mobile Optimization** (P1, Size: M)
   - Responsive design
   - Touch-optimized controls
   - Performance optimization

4. 💡 **Epic 4: Enhanced Features** (P2, Size: M)
   - Guest checkout
   - Wallet integrations
   - Recommendations engine

---

## 🚀 Paso 4: Deploy to GitHub

### Configuración del Repositorio

**IMPORTANTE**: Antes de deployar, debes:

1. **Crear el repositorio en GitHub**:
   ```bash
   # Opción 1: Desde GitHub UI
   https://github.com/new
   
   # Opción 2: Desde CLI
   gh repo create ecommerce-smart-checkout --public
   ```

2. **Asegúrate de tener permisos**: El GITHUB_TOKEN debe tener acceso de escritura

### Datos para el Deployment

#### Repository Owner
```
AlbertoLacambra
```

#### Repository Name
```
ecommerce-smart-checkout
```

### Click "Deploy to GitHub"

⏱️ Espera ~30-60 segundos mientras crea todos los issues.

---

## ✅ Verificación del Deployment

### 1. Verifica GitHub Issues

Ve a: `https://github.com/AlbertoLacambra/ecommerce-smart-checkout/issues`

Deberías ver issues como:

```
#1 🎯 [Epic] Core Checkout Flow
   Labels: epic, P0, value-high

#2 🎯 [Epic] Payment Processing  
   Labels: epic, P0, value-high

#3 ⭐ [Epic] Mobile Optimization
   Labels: epic, P1, value-high

#4 [Feature] Single-Page Checkout UI
   Labels: feature, P0, value-high
   Parent: #1

#5 [Story] As a customer, I want to see all checkout fields on one page...
   Labels: story, P0, value-high
   Parent: #4
   Estimate: 5 points

#6 [Enabler] Setup Stripe API integration and webhook handlers
   Labels: enabler, P0
   Parent: #4
   Estimate: 3 points

#7 [Test] E2E tests for complete checkout flow
   Labels: test, P0
   Parent: #4
   Estimate: 5 points
```

### 2. Verifica Labels

Deberías ver estos labels creados automáticamente:

- **Tipo**: `epic`, `feature`, `story`, `enabler`, `test`
- **Prioridad**: `P0`, `P1`, `P2`, `P3`
- **Valor**: `value-high`, `value-medium`, `value-low`

### 3. Verifica Project Board

Ve a: `https://github.com/AlbertoLacambra/ecommerce-smart-checkout/projects/1`

Deberías ver:
- Columnas: **Backlog** | **Sprint Ready** | **In Progress** | **Review** | **Testing** | **Done**
- Todos los issues en **Backlog** inicialmente

### 4. Verifica Dependencias

Abre algunos stories y verifica comentarios de dependencia:

```
Issue #5 (Story) → Tiene comentario:
"**Dependency**: blocks #6 (Enabler - Setup Stripe)"
```

---

## 📊 Verifica Base de Datos

### Conecta a PostgreSQL

```bash
# WSL
psql -h localhost -U postgres -d nirvana_agent_hub
```

### Queries de Verificación

#### 1. Ver el proyecto creado
```sql
SELECT 
  id,
  name,
  repository_owner,
  repository_name,
  status,
  github_project_number,
  deployed_at,
  (SELECT COUNT(*) FROM github_issues_tracking WHERE project_id = github_projects.id) as total_issues
FROM github_projects
WHERE repository_name = 'ecommerce-smart-checkout';
```

**Esperado**:
```
name: E-Commerce Smart Checkout
repository_owner: AlbertoLacambra
repository_name: ecommerce-smart-checkout
status: active
total_issues: 45-60
```

#### 2. Ver breakdown por tipo de issue
```sql
SELECT 
  issue_type,
  COUNT(*) as count,
  AVG(estimate::int) as avg_estimate,
  COUNT(CASE WHEN priority = 'P0' THEN 1 END) as p0_count,
  COUNT(CASE WHEN priority = 'P1' THEN 1 END) as p1_count
FROM github_issues_tracking
WHERE project_id = (
  SELECT id FROM github_projects 
  WHERE repository_name = 'ecommerce-smart-checkout'
)
GROUP BY issue_type
ORDER BY 
  CASE issue_type
    WHEN 'epic' THEN 1
    WHEN 'feature' THEN 2
    WHEN 'story' THEN 3
    WHEN 'enabler' THEN 4
    WHEN 'test' THEN 5
  END;
```

**Esperado**:
```
epic     | 3-4  | NULL | 2-3 | 1-2
feature  | 12   | 15   | 8   | 4
story    | 25   | 5    | 15  | 10
enabler  | 8    | 3    | 5   | 3
test     | 12   | 4    | 8   | 4
```

#### 3. Ver jerarquía completa de un Epic
```sql
WITH RECURSIVE hierarchy AS (
  -- Epic raíz
  SELECT 
    id,
    github_issue_number,
    issue_type,
    title,
    priority,
    estimate,
    hierarchy_level,
    hierarchy_path,
    parent_issue_id,
    ARRAY[hierarchy_path] as path_array
  FROM github_issues_tracking
  WHERE issue_type = 'epic' 
    AND hierarchy_path = '1'
    AND project_id = (SELECT id FROM github_projects WHERE repository_name = 'ecommerce-smart-checkout')
  
  UNION ALL
  
  -- Hijos recursivos
  SELECT 
    t.id,
    t.github_issue_number,
    t.issue_type,
    t.title,
    t.priority,
    t.estimate,
    t.hierarchy_level,
    t.hierarchy_path,
    t.parent_issue_id,
    h.path_array || t.hierarchy_path
  FROM github_issues_tracking t
  INNER JOIN hierarchy h ON t.parent_issue_id = h.id
)
SELECT 
  REPEAT('  ', hierarchy_level) || issue_type || ' #' || github_issue_number as hierarchy,
  title,
  priority,
  estimate
FROM hierarchy
ORDER BY hierarchy_path;
```

**Esperado**:
```
epic #1              | Core Checkout Flow                          | P0   | L
  feature #4         | Single-Page Checkout UI                     | P0   | 21
    story #5         | As a customer, I want to see all fields...  | P0   | 5
    story #6         | As a customer, I want real-time validation  | P0   | 3
    enabler #7       | Setup React form state management           | P0   | 3
    test #8          | E2E tests for checkout form                 | P0   | 5
  feature #9         | Shopping Cart Management                    | P0   | 13
    story #10        | As a customer, I want to update quantities  | P1   | 3
    ...
```

#### 4. Ver todas las dependencias
```sql
SELECT 
  from_issue.github_issue_number as from_issue,
  from_issue.title as from_title,
  to_issue.github_issue_number as to_issue,
  to_issue.title as to_title,
  deps.type as dependency_type
FROM github_issues_tracking from_issue,
     jsonb_array_elements(
       CASE 
         WHEN jsonb_typeof(from_issue.dependencies) = 'array' 
         THEN from_issue.dependencies 
         ELSE '[]'::jsonb 
       END
     ) as dep_obj,
     LATERAL (
       SELECT 
         dep_obj->>'from_path' as from_path,
         dep_obj->>'to_path' as to_path,
         dep_obj->>'type' as type
     ) deps
     LEFT JOIN github_issues_tracking to_issue 
       ON to_issue.hierarchy_path = deps.to_path
       AND to_issue.project_id = from_issue.project_id
WHERE from_issue.project_id = (
  SELECT id FROM github_projects 
  WHERE repository_name = 'ecommerce-smart-checkout'
)
AND from_issue.dependencies != '[]'::jsonb;
```

#### 5. Ver log de generación con métricas
```sql
SELECT 
  id,
  model_used,
  tokens_used,
  generation_time_ms,
  status,
  created_at,
  (SELECT COUNT(*) FROM github_issues_tracking WHERE project_id = project_generation_logs.project_id) as issues_created
FROM project_generation_logs
WHERE project_id = (
  SELECT id FROM github_projects 
  WHERE repository_name = 'ecommerce-smart-checkout'
);
```

**Esperado**:
```
model_used: gpt-4o
tokens_used: 3000-4000
generation_time_ms: 12000-25000
status: success
issues_created: 45-60
```

---

## 🎯 Métricas de Éxito

### ✅ Checklist de Verificación

- [ ] **Repositorio GitHub creado**: `AlbertoLacambra/ecommerce-smart-checkout`
- [ ] **Issues creados**: 45-60 issues totales
- [ ] **Epics**: 3-4 epics con prioridad P0/P1
- [ ] **Features**: 10-15 features balanceadas
- [ ] **Stories**: 25-40 stories con acceptance criteria
- [ ] **Enablers**: 8-12 enablers técnicos
- [ ] **Tests**: 12-18 tests con cobertura
- [ ] **Labels**: epic, feature, story, enabler, test, P0-P3, value-*
- [ ] **Hierarchy**: Paths correctos (1.2.3)
- [ ] **Dependencies**: Comentarios con links
- [ ] **Project Board**: Creado con 6 columnas
- [ ] **Database**: Registro en `github_projects`
- [ ] **Database**: 45-60 registros en `github_issues_tracking`
- [ ] **Database**: Log en `project_generation_logs`

### 📈 KPIs Esperados

| Métrica | Valor Esperado |
|---------|----------------|
| Tiempo de generación AI | 12-25 segundos |
| Tiempo de deployment GitHub | 30-60 segundos |
| Tokens consumidos | 3,000-4,000 |
| Issues totales creados | 45-60 |
| Ratio Epic:Feature | 1:3-4 |
| Ratio Feature:Story | 1:2-3 |
| Cobertura de tests | ~30% de stories |
| Issues P0 | ~40% |
| Issues P1 | ~35% |
| Issues P2-P3 | ~25% |

---

## 🐛 Troubleshooting

### Error: "Cannot access repository"
**Solución**: 
1. Verifica que el repo existe: `gh repo view AlbertoLacambra/ecommerce-smart-checkout`
2. Verifica permisos del GITHUB_TOKEN
3. Crea el repo si no existe: `gh repo create ecommerce-smart-checkout --public`

### Error: "Failed to parse AI response as JSON"
**Solución**: 
1. Revisa `project_generation_logs.ai_response`
2. El sistema guarda el raw response
3. Puedes re-procesar manualmente

### Error: "Database connection failed"
**Solución**:
1. Verifica que PostgreSQL está corriendo: `sudo service postgresql status`
2. Verifica las variables de entorno en `.env`
3. Prueba conexión: `psql -h localhost -U postgres -d nirvana_agent_hub`

### Issues no vinculados correctamente
**Solución**:
1. Verifica `hierarchy_path` en la DB
2. Verifica `parent_issue_id` matches
3. Re-corre el deployment si es necesario

---

## 🚀 Próximos Pasos

1. **Prueba el ejemplo**: Usa exactamente los datos de arriba
2. **Verifica cada paso**: Issues, labels, project board, DB
3. **Experimenta**: Modifica los must-have/nice-to-have
4. **Compara**: Genera 2-3 variantes del mismo proyecto
5. **Mejora**: Da feedback sobre el prompt del agente

---

## 📚 Referencias

- **Wizard URL**: http://localhost:3000/projects/new/wizard
- **Guía Completa**: `docs/features/project-wizard-guide.md`
- **Agent Prompt**: `docs/features/agent-hub/agents/dxc-custom/project-planner.agent.md`
- **API Generate**: `apps/control-center-ui/app/api/projects/generate-plan/route.ts`
- **API Deploy**: `apps/control-center-ui/app/api/projects/deploy-github/route.ts`
- **Database Schema**: `database/migrations/001_create_agent_hub_schema.sql`

---

¡Listo para probar! 🎉
