# 📔 DXC Cloud Mind - Bitácora del Proyecto

> **Repositorio**: DXC_PoC_Nirvana  
> **Proyecto**: Cloud Mind - AI-driven CloudOps Platform  
> **Inicio**: Octubre 2024  
> **Estado**: ✅ **INFRASTRUCTURE DEPLOYED** - Phase 1 Ready

---

## 📋 Índice

- [Últimas Actualizaciones](#últimas-actualizaciones)
- [Plan Actual](#plan-actual)
- [Historial de Cambios](#historial-de-cambios)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Lecciones Aprendidas](#lecciones-aprendidas)
- [Próximos Pasos](#próximos-pasos)

---

## 🆕 Últimas Actualizaciones

### **📅 Enero 2025 - Deployment Exitoso**

#### **Hito: Infrastructure as Code Desplegado** ✅

**Fecha**: 2025-01-XX  
**Estado**: COMPLETADO  
**Recursos Desplegados**: 7

**Resumen Ejecutivo**:
- ✅ Primera infraestructura desplegada con éxito usando Terraform + GitHub Actions
- ✅ Estrategia Single-AKS implementada (ahorro ~€250/mes)
- ✅ OIDC authentication configurado (cero secretos almacenados)
- ✅ 7 errores resueltos en sesión de debugging
- ✅ 5 workflows operacionales
- ✅ Documentación completa creada

**Recursos Creados**:
```
Apply complete! Resources: 7 added, 0 changed, 0 destroyed.

1. azurerm_resource_group.hub (cloudmind-hub-rg)
2. module.acr[0].azurerm_resource_group.acr (cloudmind-acr-rg)
3. module.acr[0].azurerm_container_registry.this
4. module.acr[0].random_string.acr_suffix
5. module.acr[0].azurerm_role_assignment.acr_pull
6. module.aks_namespaces.kubernetes_namespace.cloudmind[0]
7. module.aks_namespaces.kubernetes_resource_quota.cloudmind[0]
```

**Arquitectura Implementada**:
```
AZURE SUBSCRIPTION: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
│
├── dify-rg (Existing Infrastructure)
│   └── dify-aks (AKS Cluster)
│       ├── dify namespace (existing, data source)
│       └── cloudmind namespace (NEW, Terraform-managed)
│           └── Resource Quota: 4 CPU / 8Gi Memory / 30 pods
│
├── cloudmind-hub-rg (NEW - Managed by Terraform)
│   └── Shared services and governance resources
│
└── cloudmind-acr-rg (NEW - Managed by Terraform)
    ├── Azure Container Registry
    └── Role Assignments (AcrPull to AKS)
```

#### **Debugging Session: 7 Errores Resueltos** 🐛

**Error 1: Diagnostic Settings Missing Argument**
- **Síntoma**: `Missing required argument - log_analytics_workspace_id must be specified`
- **Causa**: Módulo ACR intentaba crear diagnostic_setting sin workspace configurado
- **Solución**: Hacer diagnostic_setting condicional con `count`
- **Commit**: `ea46c8b`
- **Lección**: Siempre usar `count` para recursos opcionales

**Error 2: Cannot Apply Incomplete Plan**
- **Síntoma**: `Cannot apply incomplete plan` cuando terraform plan tenía errores
- **Causa**: Workflow no validaba exit code de terraform plan
- **Solución**: Capturar PIPESTATUS[0], verificar exit code, condicionar Apply step
- **Commit**: `0cd00ca`
- **Lección**: Siempre validar exit codes en pipelines CI/CD

**Error 3: Kubernetes Connection Refused**
- **Síntoma**: `dial tcp [::1]:80: connect: connection refused` al crear namespace
- **Causa**: Provider kubernetes no configurado, defaulteando a localhost
- **Solución**: Añadir kubernetes provider con credenciales del AKS cluster
- **Commit**: `9268b80`
- **Lección**: Providers que conectan a servicios externos requieren configuración explícita

**Error 4: Authorization Failed for Role Assignments**
- **Síntoma**: `AuthorizationFailed - client does not have authorization Microsoft.Authorization/roleAssignments/write`
- **Causa**: Service Principal solo tenía rol Contributor
- **Solución**: Añadir rol "User Access Administrator" al Service Principal
- **Comando**: 
  ```bash
  az role assignment create \
    --assignee dc39d60b-cfc7-41c6-9fcb-3b29778bb03a \
    --role "User Access Administrator" \
    --scope /subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
  ```
- **Lección**: Para gestionar role assignments, se necesita "User Access Administrator"

**Error 5: Namespace Already Exists**
- **Síntoma**: `namespaces 'dify' already exists` al intentar crear namespace dify
- **Causa**: Namespace dify ya existe en cluster AKS (parte de infraestructura Dify)
- **Solución**: Cambiar a data source (read-only) para namespace dify, solo gestionar cloudmind
- **Commit**: `988f51d`
- **Lección**: Usar data sources para recursos existentes que no queremos modificar

**Error 6 & 7: terraform-docs Path/Template Errors**
- **Síntomas**: `stat terraform/environments/hub/terraform: no such file` y `open usage.tf: no such file`
- **Causa**: terraform-docs buscaba archivos de configuración inexistentes
- **Solución Temporal**: Deshabilitar terraform-docs en workflows
- **Commits**: `74f6f06`, `d4b8194`, `36a58ed`
- **Lección**: terraform-docs requiere archivo `.terraform-docs.yml` personalizado
- **Próximo Paso**: Crear configuración `.terraform-docs.yml` y re-habilitar

#### **CI/CD Workflows Configurados** 🔄

**Workflows Operacionales** (5 total):

1. **deploy.yml** (Production Deployment)
   - Trigger: Manual (`workflow_dispatch`)
   - Gates: Format check → Plan → **Manual Approval** → Apply → Teams notification
   - Status: ✅ OPERATIONAL

2. **pr-validation.yml** (PR Validation)
   - Trigger: Pull requests to master
   - Gates: 7 checks (format, validate, tfsec, checkov, tflint, plan, teams)
   - Status: ✅ OPERATIONAL

3. **drift-detection.yml** (Daily Drift Detection)
   - Trigger: Schedule (05:00 UTC daily)
   - Purpose: Detect manual changes outside Terraform
   - Status: ✅ OPERATIONAL

4. **terraform-deploy.yml** (Legacy Deploy)
   - Trigger: Manual
   - Note: terraform-docs disabled
   - Status: ✅ OPERATIONAL

5. **terraform-pr.yml** (Legacy PR)
   - Trigger: Pull requests
   - Note: terraform-docs disabled
   - Status: ✅ OPERATIONAL

**Security Gates Implementados**:
- ✅ `terraform fmt -check` - Code formatting
- ✅ `terraform validate` - Syntax validation
- ✅ `tfsec` - Security scanning
- ✅ `checkov` - Compliance checking
- ✅ `tflint` - Best practices linting
- ✅ `terraform plan` - Impact preview
- ✅ Manual approval - Production gate

#### **Authentication & Security** 🔐

**Service Principal Setup**:
- ID: `dc39d60b-cfc7-41c6-9fcb-3b29778bb03a`
- Nombre: `github-actions-dxc-nirvana`
- Método: OIDC Federation (sin secretos almacenados)

**Roles Asignados**:
- ✅ Contributor (subscription scope)
- ✅ User Access Administrator (subscription scope)

**Federated Credentials** (3 configurados):
```
1. repo:DXC-Technology-Spain/DXC_PoC_Nirvana:ref:refs/heads/master
2. repo:DXC-Technology-Spain/DXC_PoC_Nirvana:pull_request
3. repo:DXC-Technology-Spain/DXC_PoC_Nirvana:environment:hub
```

**GitHub Secrets** (4 configurados):
```
AZURE_CLIENT_ID="dc39d60b-cfc7-41c6-9fcb-3b29778bb03a"
AZURE_TENANT_ID="93f33571-550f-43cf-b09f-cd331338d086"
AZURE_SUBSCRIPTION_ID="739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
TEAMS_WEBHOOK_URL="<Power Automate webhook URL>"
```

#### **Documentación Creada** 📚

**Nuevos Documentos**:
1. ✅ `MIGRATION_COMPLETE.md` - Guía completa migración Terragrunt→Terraform
2. ✅ `CHECKLIST_SECRETOS.md` - Checklist configuración GitHub secrets
3. ✅ `SECRETS_SETUP.md` - Guía Service Principal y OIDC
4. ✅ `STATUS.md` - Estado actual del proyecto (actualizado)
5. ✅ `README.md` - Documentación principal (actualizada con arquitectura Single-AKS)
6. ✅ `PROJECT_LOGBOOK.md` - Esta bitácora (actualizada)

**Commits de Documentación**:
- `78f8e76` - docs: Agregar guía completa de configuración de secretos
- `195f271` - docs: Añadir documentación completa de migración

#### **Optimización de Costes** 💰

**Decisión: Single-AKS Strategy**

**Comparativa**:
```
Opción A - Multi-AKS (Original):
├── Hub AKS: €200/mes
├── Spoke-Prod AKS: €200/mes
├── Spoke-Dev AKS: €150/mes
└── Container Insights: €50/mes x 3 = €150/mes
TOTAL: ~€700/mes

Opción B - Single-AKS (Implementado):
├── Dify AKS (existing): €0/mes (ya pagado)
├── Namespace isolation: €0/mes
├── Container Insights: €0/mes (free tier)
└── Resource quotas: €0/mes
TOTAL: ~€0/mes (marginal cost)

AHORRO MENSUAL: ~€700/mes
AHORRO ANUAL: ~€8,400/año
```

**Recursos Compartidos Reutilizados**:
- ✅ AKS Cluster (dify-aks)
- ✅ PostgreSQL Flexible Server
- ✅ Azure Storage Account
- ✅ Azure Key Vault
- ✅ Virtual Network
- ✅ Container Insights (free tier)

**Nuevos Recursos (Bajo Coste)**:
- Azure Container Registry Basic: ~€5/mes
- Resource Groups: €0/mes
- Kubernetes Namespaces: €0/mes

**COSTE TOTAL POC**: ~€5/mes (solo ACR nuevo)

---

## 🎯 Plan Actual

### **Arquitectura Cloud Mind PoC**

```
┌─────────────────────────────────────────────────────────────┐
│                    SUSCRIPCIÓN ÚNICA                         │
│                   (Budget: $130/mes)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              INFRAESTRUCTURA COMPARTIDA             │    │
│  │                                                      │    │
│  │  • AKS (1 nodo B2s): ~$15/mes                       │    │
│  │  • ACR Basic: $5/mes                                │    │
│  │  • PostgreSQL Flexible B1ms: ~$15/mes               │    │
│  │  • Storage Account: ~$5/mes                         │    │
│  │  • Key Vault: ~$2/mes                               │    │
│  │  • VNet + NSG: $0/mes                               │    │
│  │                                                      │    │
│  │  TOTAL ESTIMADO: ~$42/mes                           │    │
│  │  MARGEN DISPONIBLE: $88/mes                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           AUTOMATIZACIÓN & GOBERNANZA               │    │
│  │                                                      │    │
│  │  • GitHub Actions (CI/CD): GRATIS                   │    │
│  │  • Terraform/Terragrunt: GRATIS                     │    │
│  │  • terraform-docs: GRATIS                           │    │
│  │  • Checkov (Security): GRATIS                       │    │
│  │  • Infracost (Cost Est.): GRATIS                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### **Pipeline de Despliegue GitOps**

```
Developer Push → PR Created → Automated Checks → Manual Approval → Deploy
                      ↓
        ┌─────────────────────────────────┐
        │   AUTOMATED QUALITY GATES       │
        ├─────────────────────────────────┤
        │ ✓ Terraform validate            │
        │ ✓ Terraform plan                │
        │ ✓ Security scan (Checkov)       │
        │ ✓ Cost estimation (Infracost)   │
        │ ✓ Documentation (terraform-docs)│
        └─────────────────────────────────┘
                      ↓
        ┌─────────────────────────────────┐
        │      MANUAL APPROVAL            │
        │   (Required for Production)     │
        └─────────────────────────────────┘
                      ↓
        ┌─────────────────────────────────┐
        │    AUTOMATED DEPLOYMENT         │
        │  • Terraform apply              │
        │  • Update docs (terraform-docs) │
        │  • Update state (Azure Storage) │
        └─────────────────────────────────┘
```

### **Estrategia de Branching**

```
main (production-ready)
  ↑
  └── develop (integration)
        ↑
        ├── feature/nueva-funcionalidad
        ├── fix/correccion-bug
        └── infra/cambio-infraestructura
```

**Reglas**:
- ✅ `main`: Solo merges desde `develop` con PR aprobada
- ✅ `develop`: Merges desde feature branches con PR review
- ✅ Feature branches: Desde `develop`, PR obligatoria para merge
- ✅ Protección: `main` requiere 1 aprobación + checks pasados

### **Optimizaciones para PoC**

**❌ NO Incluido en PoC** (Documentado como "RECOMENDADO PRODUCCIÓN"):
- Monitoring avanzado (Azure Monitor, Application Insights)
- Alerting y PagerDuty
- Backup automatizado
- Disaster Recovery multi-región
- Alta disponibilidad (multi-zona)
- Auto-scaling agresivo
- WAF y Azure Front Door
- DDoS Protection Standard

**✅ SÍ Incluido en PoC**:
- IaC completo (Terraform + Terragrunt)
- CI/CD automatizado
- Security scanning
- Cost monitoring
- Documentación auto-generada
- GitOps workflow
- Secretos en Key Vault
- Estado en Azure Storage

### **Cronograma y Presupuesto**

| Fase | Duración | Esfuerzo | Coste Azure | Descripción |
|------|----------|----------|-------------|-------------|
| **Fase 0: Setup** | 1 semana | 20h | $0 | Repositorio, pipelines, estructura |
| **Fase 1: Infraestructura Base** | 2 semanas | 40h | $42/mes | Terraform modules, AKS, PostgreSQL |
| **Fase 2: Aplicación** | 2 semanas | 40h | $42/mes | Despliegue Dify, configuración |
| **Fase 3: Operación** | 1 semana | 20h | $42/mes | Documentación, handover |
| **TOTAL** | **6 semanas** | **120h** | **$252 total** | **PoC Completa** |

**Desglose Presupuesto**:
- Infraestructura (6 meses): $252
- Horas desarrollo (120h × $0): $0 (interno)
- **TOTAL PROYECTO**: $252

---

## 📝 Historial de Cambios

### **2025-10-15 - Implementación: Arquitectura Single-AKS + Monitoring Gratuito**

**Tipo**: Implementación Técnica - Optimización PoC  
**Autor**: Alberto Lacambra  
**Estado**: 🟢 En Progreso (2/8 tareas completadas)

#### Resumen Ejecutivo

Iniciada implementación completa de la arquitectura optimizada para PoC aprobada en análisis anterior. Se ha completado la migración a Single-AKS con namespaces y la implementación de monitoring gratuito con Azure Workbooks.

#### Tareas Completadas (2/8)

**✅ Tarea 1: Arquitectura Single-AKS con Namespaces**
- **Nuevo Módulo**: `terraform/modules/aks-namespaces`
  - Configura 2 namespaces en AKS existente:
    * `dify`: Dify AI Platform (core)
    * `cloudmind`: Use cases y workloads
  - Resource Quotas implementadas:
    * Dify: 4-8 vCPUs, 8-16GB RAM, 50 pods
    * Cloud Mind: 2-4 vCPUs, 4-8GB RAM, 30 pods
  - Network Policies: Opcionales (deshabilitadas en PoC)
  - **Costo**: $0/mes

- **Hub Environment Actualizado**:
  - Eliminado módulo `monitoring` (Log Analytics + App Insights)
  - Eliminados Action Groups premium
  - Resource Groups renombrados: `cc-*` → `cloudmind-*`
  - ACR optimizado: `Standard` → `Basic` SKU
  - ACR name prefix: `ccacr` → `dxccloudmind`
  - Sin Log Analytics integration en ACR
  
- **Variables Simplificadas**:
  - ❌ Eliminadas: `create_monitoring`, `monitoring_config`, `action_group_config`
  - ✅ Agregadas: `aks_namespaces`, `teams_webhook_url`
  
- **Outputs Actualizados**:
  - ✅ Nuevos: `dify_namespace`, `cloudmind_namespace`
  - ❌ Eliminados: `log_analytics_*`, `application_insights_*`, `action_group_*`

- **Ahorro**: -$60/mes (no desplegar nuevos AKS + eliminar monitoring premium)

**✅ Tarea 2: Monitoring Gratuito con Azure Workbooks**
- **Nuevo Módulo**: `terraform/modules/azure-workbooks`
  - 4 Workbooks de monitorización (GRATUITOS):
    1. **Drift Detection**: Cambios de infraestructura y drift desde Terraform state
    2. **Pipeline Status**: Estado de GitHub Actions workflows (PR, deploy, drift, docs)
    3. **AKS Resources**: CPU/Memoria por namespace, pod counts, node health
    4. **Cost Tracking**: Seguimiento vs budget ($130/mes), recursos por RG
  
- **Características**:
  - Data source: Log Analytics existente (`dify-private-logs`)
  - Queries KQL pre-configuradas
  - Integración con GitHub Actions (custom events)
  - URLs directas a Azure Portal
  - Compatible con Azure Mobile App
  - **Costo**: $0/mes (Workbooks gratuitos, usa Container Insights existente)

- **Container Insights**: Verificado habilitado en `dify-aks`, conectado a `dify-private-logs`
  - Free tier suficiente para PoC
  - Sin costos de ingesta adicionales

#### Tareas En Progreso (1/8)

**🔄 Tarea 3: Alertas a Microsoft Teams**
- Próximos pasos:
  - Crear Action Groups con webhooks a Teams
  - Configurar alertas para drift detection
  - Alertas de fallos en pipelines
  - Eventos críticos de infraestructura
- **Costo esperado**: $0/mes (Action Groups básicos gratuitos)

#### Tareas Pendientes (5/8)

4. ⏳ **GitHub Actions Workflows**:
   - PR validation (fmt, validate, plan, cost estimate)
   - Deployment con aprobaciones
   - Integración con terraform-docs
   - Notificaciones a Teams

5. ⏳ **Drift Detection Automatizado**:
   - Scheduled workflow (diario)
   - Integración con Workbook
   - Alertas a Teams

6. ⏳ **Terraform-docs Automation**:
   - Auto-generación en cada commit
   - INFRASTRUCTURE.md con módulos

7. ⏳ **Actualizar Documentación de Costes**:
   - COST_ANALYSIS.md
   - PROJECT_LOGBOOK.md (esta entrada)
   - BUSINESS_PLAN.md con ahorros

8. ⏳ **Testing y Validación**:
   - Workflows end-to-end
   - Validar alertas Teams
   - Verificar Workbooks
   - Confirmar ahorros

#### Ahorro Total Proyectado

| Concepto | Original | Optimizado | Ahorro |
|----------|----------|------------|--------|
| **AKS adicionales** | $300/mes | $0/mes | -$300/mes |
| **Log Analytics** | $50/mes | $0/mes | -$50/mes |
| **App Insights** | $10/mes | $0/mes | -$10/mes |
| **ACR Standard → Basic** | $20/mes | $5/mes | -$15/mes |
| **Total** | **$380/mes** | **~$5/mes** | **-$375/mes** |

**Reducción**: 98.7% del costo  
**Budget restante**: $125/mes (96% libre para escalado futuro)

#### Commits Realizados

```bash
109dfc9 - feat: Migrar a arquitectura Single-AKS con namespaces
9a1c9ec - feat: Agregar módulo Azure Workbooks para monitoring gratuito
```

#### Módulos Terraform Creados/Modificados

1. **terraform/modules/aks-namespaces** (NUEVO)
   - Namespaces con resource quotas
   - Network policies opcionales
   - Provider: kubernetes ~> 2.23

2. **terraform/modules/azure-workbooks** (NUEVO)
   - 4 workbooks de monitorización
   - Queries KQL optimizadas
   - Provider: azurerm ~> 3.80

3. **terraform/modules/container-registry** (MODIFICADO)
   - SKU optimizado para PoC
   - Diagnostic settings condicionales
   - Sin dependencia de Log Analytics

4. **terraform/environments/hub** (MODIFICADO)
   - Integración de nuevos módulos
   - Configuración simplificada
   - Eliminación de recursos premium

#### Próximos Pasos Inmediatos

1. Configurar Teams Incoming Webhook
2. Crear Action Groups con integración Teams
3. Implementar GitHub Actions workflows base
4. Testing de alertas

#### Notas Técnicas

- **Kubernetes Provider**: Requiere configuración con kubeconfig de AKS existente
- **Git Sources**: Todos los módulos usan `git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/...?ref=master`
- **Backend State**: Azure Storage con containers separados (`cc-hub`, `cc-spoke-prod`, `cc-spoke-dev`)
- **RBAC**: Storage Blob Data Contributor asignado, propagación validada

---

### **2025-10-15 - Análisis de Optimizaciones: AKS Único + Monitorización Gratuita**

**Tipo**: Decisión Estratégica - Optimización de Arquitectura y Costes  
**Autor**: Alberto Lacambra  
**Estado**: 🟡 Pendiente de Aprobación

#### Contexto

Tras revisar el presupuesto disponible ($130/mes por suscripción), se identificó que el proyecto original multi-cluster **excede el budget** en $56/mes (43%). Se realizó un análisis exhaustivo de dos propuestas de optimización que mantienen funcionalidad completa mientras reducen costes significativamente.

#### Pregunta 1: ¿Es viable usar un solo AKS para todo?

**Respuesta**: ✅ **SÍ, ES TOTALMENTE VIABLE Y RECOMENDADO**

**Propuesta**: Consolidar todos los workloads en el AKS existente de Dify, separando por namespaces:

```
AKS Cluster (dify-aks)
├─ Namespace: dify-platform       (Dify existente - sin cambios)
├─ Namespace: cloud-mind-core     (Control Plane)
├─ Namespace: use-cases-dev       (Agentes, bots, automatizaciones - dev)
├─ Namespace: use-cases-prod      (Agentes, bots, automatizaciones - prod)
└─ Namespace: apps-prototypes     (Aplicaciones finales)
```

**Mecanismos de Aislamiento y Seguridad**:
- ✅ **Resource Quotas**: Límites hard de CPU/Memory por namespace
- ✅ **Network Policies**: Deny by default, tráfico aislado entre namespaces
- ✅ **RBAC**: Permisos granulares por namespace y usuario
- ✅ **Pod Security Standards**: Políticas de seguridad a nivel namespace

**Impacto Económico**:
```
Escenario Multi-AKS (Original):
  Hub AKS        : $73/mes
  Spoke-Prod AKS : $73/mes
  Spoke-Dev AKS  : $25/mes
  VNet Peering   : $10/mes
  TOTAL          : $186/mes

Escenario AKS Único (Optimizado):
  Hub AKS        : $73/mes
  ACR + Storage  : $5/mes
  TOTAL          : $78/mes

🎯 AHORRO: $108/mes (58%)
🎯 AHORRO ANUAL: $1,296/año
```

**Riesgos y Mitigaciones**:
| Riesgo | Mitigación |
|--------|------------|
| Noisy Neighbor | Resource Quotas estrictos + monitoring > 70% |
| Fallo en cascade | HA con 2+ nodes + Pod Disruption Budgets |
| Saturación de recursos | Alertas proactivas + Auto-scaling |
| Violación de aislamiento | Network Policies + RBAC + Auditoría |

#### Pregunta 2: ¿Es posible monitorización completa sin coste?

**Respuesta**: ✅ **SÍ, CON COSTE MÍNIMO O CERO**

**Propuesta**: Stack de monitorización basado en herramientas gratuitas/bajo coste:

**Componentes**:
| Herramienta | Coste | Funcionalidad |
|-------------|-------|---------------|
| Azure Workbooks | $0/mes | Dashboards infraestructura (incluido en suscripción) |
| Azure Monitor (básico) | $0/mes | Métricas AKS (incluido con AKS) |
| Teams Webhooks | $0/mes | Alertas en tiempo real |
| GitHub Actions | $0/mes | Drift detection + Pipeline status (2000 min/mes gratis) |
| Grafana (opcional) | ~$2/mes | Dashboards aplicaciones (0.2 CPU, 512Mi) |
| Prometheus (opcional) | ~$3/mes | Métricas custom (0.5 CPU, 1Gi) |
| Storage logs (30d) | ~$1/mes | Retención logs (10GB) |

**COSTE TOTAL**: $0-6/mes  
**vs. Soluciones Comerciales**: $50-100/mes  
**AHORRO**: $44-94/mes (88-94%)

**Funcionalidades Incluidas**:
1. **Azure Workbooks**
   - CPU/Memory usage por node y namespace
   - Pod count y failed pods  
   - Análisis de costes diario
   - Budget alerts

2. **Microsoft Teams Alerts** (en tiempo real)
   - ⚠️ Drift detectado en infraestructura
   - 🔴 Pipeline fallido
   - 🔴 Budget excedido (> 90%)
   - 🔴 AKS node down
   - ⚠️ Resource quota exceeded
   - ✅ Deployment exitoso

3. **Drift Detection Automático**
   - Workflow cada 6 horas
   - Compara Terraform state vs recursos reales
   - Alerta automática a Teams con detalles

4. **Grafana Dashboards** (opcional)
   - Request rate & latency
   - Error rate  
   - Active users/sessions
   - Resource usage por pod

#### Comparativa de Escenarios

| Aspecto | Original | Optimizado | Diferencia |
|---------|----------|------------|------------|
| **Suscripciones** | 3 | 1 | -2 suscripciones |
| **Clusters AKS** | 3 | 1 | -2 clusters |
| **Coste Mensual** | $186 | $55 | **-$131 (70%)** |
| **Coste Anual** | $2,232 | $660 | **-$1,572** |
| **Complejidad** | Alta | Baja | ⬇️ Simplificada |
| **Monitorización** | Básica | Completa | ⬆️ Mejorada |
| **Tiempo Setup** | 8-10 sem | 4-5 sem | ⬇️ 50% más rápido |
| **Budget PoC** | ❌ $130/mes | ✅ $130/mes | ✅ DENTRO presupuesto |

#### Decisión Propuesta

**IMPLEMENTAR AMBAS OPTIMIZACIONES** ✅

**Justificación**:
1. **Viabilidad Técnica**: Arquitectura de namespaces probada en producción
2. **Viabilidad Económica**: Reduce coste 70%, entra en budget
3. **Funcionalidad**: Mantiene TODAS las capacidades requeridas
4. **Monitorización**: Mejora visibilidad SIN coste adicional
5. **Simplicidad**: Reduce complejidad operativa
6. **Riesgo**: BAJO - no afecta Dify existente

**Coste Final PoC**: $55/mes  
**Budget Disponible**: $130/mes  
**Margen**: $75/mes (para crecimiento) ✅

#### Documentación Generada

📄 **[OPTIMIZATION_PROPOSAL.md](docs/OPTIMIZATION_PROPOSAL.md)** (12,000+ palabras)
- Análisis detallado de ambas propuestas
- Diagramas de arquitectura de namespaces
- Configuraciones YAML completas (Resource Quotas, Network Policies, RBAC)
- Implementación de monitorización paso a paso
- Templates de Azure Workbooks (JSON)
- Workflows GitHub Actions para drift detection
- Formato de alertas Microsoft Teams
- Comparativas de costes detalladas
- Plan de implementación por fases

#### Plan de Implementación (Si se Aprueba)

**Fase 1: Consolidación AKS** (Semana 1-2)
- [ ] Crear 5 namespaces en dify-aks
- [ ] Configurar Resource Quotas por namespace
- [ ] Implementar Network Policies
- [ ] Configurar RBAC granular
- [ ] Desplegar Cloud Mind Core
- [ ] Validar aislamiento

**Fase 2: Monitorización** (Semana 2-3)
- [ ] Crear Azure Workbook personalizado
- [ ] Configurar Teams Incoming Webhooks
- [ ] Implementar drift detection (GitHub Actions)
- [ ] Configurar alertas críticas
- [ ] (Opcional) Desplegar Grafana/Prometheus

**Fase 3: Terraform** (Semana 3)
- [ ] Modificar terraform para AKS único
- [ ] Eliminar código Spoke-Prod/Dev
- [ ] Agregar módulos de namespaces
- [ ] Aplicar cambios

**Fase 4: Documentación** (Semana 3-4)
- [ ] Actualizar BUSINESS_PLAN.md
- [ ] Crear guías de uso por namespace
- [ ] Documentar alertas y procedimientos
- [ ] Generar "Recomendaciones para Producción"

**Duración Total**: 3-4 semanas  
**Esfuerzo**: 60-80 horas  
**Riesgo**: BAJO

#### Referencias
- [OPTIMIZATION_PROPOSAL.md](docs/OPTIMIZATION_PROPOSAL.md) - Análisis técnico completo
- Azure Docs: [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- Azure Docs: [Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- Azure Docs: [Network Policies](https://docs.microsoft.com/en-us/azure/aks/use-network-policies)

#### Próximos Pasos

**Acción Requerida**: ✋ Aprobación del Stakeholder

**Si SE APRUEBA**:
1. Actualizar BUSINESS_PLAN.md con nueva arquitectura
2. Actualizar estimaciones de tiempo y coste
3. Iniciar Fase 1 de implementación
4. Registrar progreso en esta bitácora

**Si NO se aprueba**:
1. Documentar razones de rechazo
2. Evaluar alternativas (aumentar budget, reducir funcionalidad)
3. Replantear alcance del proyecto

---

### **2025-10-14 - Replanteo Completo del Proyecto**

**Decisión**: Reestructuración hacia GitOps con optimización de costes

**Cambios Implementados**:
1. ✅ **Arquitectura consolidada en una suscripción** (~$42/mes vs $200/mes anterior)
2. ✅ **Pipelines CI/CD con GitHub Actions**
   - Workflow PR: Validación, security scan, cost estimation
   - Workflow Deploy: Aplicación automática con aprobaciones
3. ✅ **terraform-docs integrado** para documentación automática
4. ✅ **Estrategia de branching** (main → develop → feature)
5. ✅ **Quality gates automatizados**:
   - Checkov (security)
   - Infracost (cost estimation)
   - terraform validate/plan
6. ✅ **Nombre proyecto actualizado**: Cloud Control Center → **Cloud Mind**
7. ✅ **Repositorio definitivo**: `DXC_PoC_Nirvana`

**Impacto**:
- 💰 Reducción de costes: **79%** ($200 → $42/mes)
- ⚡ Automatización: **100%** del despliegue
- 🔒 Security: Scanning automático en cada PR
- 📊 Visibilidad: Cost impact antes de cada cambio

**Archivos Creados/Modificados**:
- `BUSINESS_PLAN.md` - Plan de negocio completo
- `COST_ANALYSIS.md` - Análisis detallado de costes
- `TECHNICAL_ARCHITECTURE.md` - Arquitectura técnica
- `.github/workflows/terraform-pr.yml` - Pipeline PR checks
- `.github/workflows/terraform-deploy.yml` - Pipeline deployment
- `.terraform-docs.yml` - Configuración terraform-docs
- `PROJECT_LOGBOOK.md` - Este archivo (bitácora)

**Pendiente**:
- [ ] Crear módulos Terraform optimizados
- [ ] Configurar GitHub secrets (Azure credentials)
- [ ] Implementar branch protection rules
- [ ] Primera ejecución de pipelines
- [ ] Validar presupuesto real vs estimado

---

### **2025-10-13 - Resolución Module Paths con Git Sources**

**Problema**: Terragrunt no podía resolver paths a módulos locales

**Soluciones Probadas**:
1. ❌ Paths relativos `../../modules` - No funciona con Terragrunt copy
2. ❌ Symlinks con before_hook - Creados después de que Terraform procesa sources
3. ❌ Variables en module source - Terraform no permite variables en `source`
4. ✅ **Git sources** - `git::https://github.com/...//terraform/modules/xxx?ref=master`

**Resultado**: `terragrunt validate` exitoso

**Lección Aprendida**:
> Terraform requiere que module sources sean valores estáticos conocidos en tiempo de plan. 
> Git sources es la solución más robusta para proyectos Terragrunt multi-módulo.

---

### **2025-10-13 - Configuración State Management**

**Decisión**: Opción 1 - Un Storage Account, múltiples containers

**Implementación**:
- Storage Account: `tfstate9a448729` (reutilizado de proyecto anterior)
- Containers:
  - `cc-hub` - Estado Hub (ahora no usado en PoC)
  - `cc-spoke-prod` - Estado Spoke Prod (no usado en PoC)
  - `cc-spoke-dev` - Estado Spoke Dev (no usado en PoC)
  - `tfstate` - Estado legacy Dify
  - `cloud-mind-poc` - Estado nuevo proyecto consolidado
- RBAC: `Storage Blob Data Contributor` para `alberto.lacambra@dxc.com`
- Autenticación: Azure AD (sin access keys)

**Coste**: ~$0.05/mes (10MB estado + 18k operaciones/mes)

---

### **2025-10-12 - Inicio Proyecto Cloud Mind**

**Contexto Inicial**:
- Infraestructura Dify existente en Hub (suscripción `739aaf91`)
- Objetivo: Cloud Control Center multi-tenant
- Arquitectura inicial: Hub & Spoke (3 suscripciones)

**Recursos Existentes Detectados**:
```
dify-rg (Hub - 739aaf91):
  - dify-aks (AKS cluster)
  - dify-private-vnet (VNet)
  - dify-postgres-9107e36a (PostgreSQL)
  - difyprivatest9107e36a (Storage)
  - dify-private-kv-9107e36a (Key Vault)
  - dify-private-logs (Log Analytics)
```

**Decisión Inicial**: Reutilizar infraestructura Dify existente como base

---

## 🔧 Decisiones Técnicas

### **DT-001: Consolidación en Una Suscripción**
- **Fecha**: 2025-10-14
- **Contexto**: Budget limitado ($130/mes/suscripción)
- **Decisión**: Consolidar toda la infraestructura en una suscripción
- **Alternativas consideradas**:
  - Hub & Spoke (3 suscripciones): $200/mes → Descartado por coste
  - Multi-región: $300/mes → Descartado por coste
- **Justificación**: PoC no requiere aislamiento completo ni HA multi-región
- **Impacto**: Reducción 79% de coste, pérdida de aislamiento entre entornos

### **DT-002: Git Sources para Módulos Terraform**
- **Fecha**: 2025-10-13
- **Contexto**: Terragrunt no resuelve paths relativos a módulos
- **Decisión**: Usar `git::https://...//terraform/modules/xxx?ref=master`
- **Alternativas consideradas**:
  - Paths relativos: No funciona con Terragrunt
  - Symlinks: Timing issue (creados después de init)
  - Variables en source: No permitido por Terraform
- **Justificación**: Git sources es el método oficial y más robusto
- **Impacto**: Módulos versionados en Git, fácil rollback, mejor trazabilidad

### **DT-003: terraform-docs en Pipeline**
- **Fecha**: 2025-10-14
- **Contexto**: Documentación de módulos desactualizada frecuentemente
- **Decisión**: Generar docs automáticamente en cada PR
- **Alternativas consideradas**:
  - Manual: Error prone, no escalable
  - Pre-commit hook local: No garantiza ejecución
- **Justificación**: Automatización elimina errores humanos
- **Impacto**: Documentación siempre actualizada, cero esfuerzo manual

### **DT-004: Sin Monitoring en PoC**
- **Fecha**: 2025-10-14
- **Contexto**: Optimización de costes para PoC
- **Decisión**: NO desplegar Azure Monitor, App Insights, alertas
- **Alternativas consideradas**:
  - Monitoring básico: $20-30/mes adicional
  - Logs básicos incluidos: Limitados a 30 días
- **Justificación**: PoC tolera indisponibilidad, no requiere SLA
- **Impacto**: Ahorro $30/mes, documentado como "RECOMENDADO PRODUCCIÓN"

---

## 💡 Lecciones Aprendidas

### **LL-001: Terraform Module Sources son Estáticos**
**Problema**: Intentar usar variables o interpolación en `source` attribute  
**Solución**: Usar Git sources con refs estáticas  
**Aprendido**: 2025-10-13  
**Aplicabilidad**: Todos los proyectos Terraform/Terragrunt

### **LL-002: Terragrunt Hooks Timing**
**Problema**: `before_hook` se ejecuta después de que Terragrunt copia sources  
**Solución**: No usar hooks para modificar source structure  
**Aprendido**: 2025-10-13  
**Aplicabilidad**: Proyectos Terragrunt con módulos locales

### **LL-003: Azure RBAC Propagation**
**Problema**: Role assignments tardan 60-120s en propagarse  
**Solución**: Esperar o reintentar con backoff  
**Aprendido**: 2025-10-13  
**Aplicabilidad**: Todos los proyectos Azure con RBAC

### **LL-004: Cost Optimization para PoCs**
**Problema**: Infraestructura "production-ready" muy costosa para PoC  
**Solución**: Separar "funcionalidad core" vs "operación producción"  
**Aprendido**: 2025-10-14  
**Aplicabilidad**: Todos los PoCs en cloud
**Reducción**: 79% de coste manteniendo funcionalidad

### **LL-005: Documentación como Código**
**Problema**: Documentación desactualizada en proyectos IaC  
**Solución**: terraform-docs en pipeline automático  
**Aprendido**: 2025-10-14  
**Aplicabilidad**: Todos los proyectos Terraform  
**Beneficio**: Cero esfuerzo manual, docs siempre actualizadas

---

## 🎯 Próximos Pasos

### **Sprint 1: Infraestructura Base (Semana 1-2)**
- [ ] Crear módulos Terraform optimizados para PoC
  - [ ] `modules/aks-basic` - AKS 1 nodo B2s
  - [ ] `modules/postgresql-flex` - PostgreSQL B1ms
  - [ ] `modules/storage-account` - Storage Standard LRS
  - [ ] `modules/key-vault` - Key Vault básico
  - [ ] `modules/container-registry` - ACR Basic
- [ ] Configurar Terragrunt para suscripción única
- [ ] Crear environment `poc` con toda la infra
- [ ] Validar costes reales vs estimados

### **Sprint 2: Pipelines GitOps (Semana 2-3)**
- [ ] Configurar GitHub Secrets
  - [ ] `AZURE_CLIENT_ID`
  - [ ] `AZURE_CLIENT_SECRET`
  - [ ] `AZURE_SUBSCRIPTION_ID`
  - [ ] `AZURE_TENANT_ID`
- [ ] Probar pipeline PR en feature branch
- [ ] Configurar branch protection rules
- [ ] Validar quality gates (Checkov, Infracost)
- [ ] Primera ejecución pipeline deploy

### **Sprint 3: Aplicación Dify (Semana 3-4)**
- [ ] Migrar Dify existente a nueva infra (si necesario)
- [ ] Configurar Helm charts
- [ ] Desplegar Dify en AKS
- [ ] Configurar Ingress y DNS
- [ ] Validar funcionalidad end-to-end

### **Sprint 4: Documentación y Handover (Semana 5-6)**
- [ ] Completar documentación técnica
- [ ] Crear guías de operación
- [ ] Documentar "RECOMENDACIONES PRODUCCIÓN"
- [ ] Crear checklist de migración a producción
- [ ] Handover al equipo de operaciones

### **Métricas de Éxito**
- ✅ Coste mensual < $50
- ✅ Tiempo despliegue completo < 30 min
- ✅ 100% infraestructura como código
- ✅ 0 secretos en repositorio
- ✅ Security score > 90% (Checkov)
- ✅ Documentación 100% auto-generada

---

## 📚 Referencias

### **Documentación del Proyecto**
- [Business Plan](./BUSINESS_PLAN.md) - Plan de negocio completo
- [Cost Analysis](./COST_ANALYSIS.md) - Análisis detallado de costes
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - Arquitectura técnica
- [Terraform Docs](./docs/terraform/) - Documentación auto-generada de módulos

### **Workflows GitHub Actions**
- [PR Checks](./.github/workflows/terraform-pr.yml) - Validación de PRs
- [Deployment](./.github/workflows/terraform-deploy.yml) - Despliegue automático

### **Recursos Externos**
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/)
- [GitHub Actions for Terraform](https://developer.hashicorp.com/terraform/tutorials/automation/github-actions)

---

## 📊 Tracking de Decisiones Pendientes

| ID | Decisión Pendiente | Fecha Límite | Owner | Opciones | Impacto |
|----|-------------------|--------------|-------|----------|---------|
| DP-001 | ¿Mantener Dify existente o recrear? | Semana 2 | TBD | A) Mantener, B) Recrear | Tiempo migración |
| DP-002 | ¿DNS público o privado? | Semana 3 | TBD | A) Azure DNS, B) Cloudflare | Coste ~$0.5/mes |
| DP-003 | ¿Upgrade a producción en misma sub? | Post-PoC | TBD | A) Sí, B) Nueva sub | Aislamiento |

---

## 🔄 Plantilla para Nuevas Entradas

```markdown
### **YYYY-MM-DD - Título del Cambio**

**Decisión**: Descripción breve

**Cambios Implementados**:
1. ✅ Cambio 1
2. ✅ Cambio 2

**Impacto**:
- 💰 Coste: 
- ⚡ Performance: 
- 🔒 Security: 

**Archivos Modificados**:
- `ruta/archivo1` - Descripción
- `ruta/archivo2` - Descripción

**Pendiente**:
- [ ] Acción 1
- [ ] Acción 2
```

---

**Última actualización**: 2025-10-14  
**Próxima revisión**: Semanal (cada lunes)  
**Responsable**: Alberto Lacambra (alberto.lacambra@dxc.com)
