# Architecture Decision Records (ADR)

## Introducción

Este documento registra las **decisiones arquitecturales clave** del proyecto DXC Cloud Mind - Nirvana PoC, siguiendo el formato ADR (Architecture Decision Record).

Cada decisión incluye:

- **Contexto**: Situación que requería una decisión
- **Decisión**: Qué se decidió
- **Consecuencias**: Impactos positivos y negativos
- **Estado**: Actual, superseded, deprecated

---

## ADR-001: Single-AKS Strategy

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra, Equipo CloudMind

### Contexto

Necesitábamos decidir si crear nuevos clusters AKS o aprovechar el cluster existente `dify-aks` para los workloads CloudMind.

**Opciones evaluadas**:

1. **Multi-AKS**: 2 nuevos clusters (Hub + Spoke) - Coste: +€455/mes
2. **Single-AKS**: Namespaces en cluster existente - Coste: +€5/mes
3. **Hybrid**: 1 nuevo cluster + namespace - Coste: +€205/mes

### Decisión

✅ **Implementar Single-AKS Strategy** usando namespace isolation.

**Rationale**:

- Minimizar costes (€450/mes ahorro vs Multi-AKS)
- Aprovechar infraestructura existente
- Reducir complejidad operacional
- Acelerar time-to-market

### Consecuencias

**Positivas**:

- ✅ Ahorro de €5,400/año
- ✅ Deployment 90% más rápido (6 min vs 65 min)
- ✅ Container Insights compartido (free tier)
- ✅ Operaciones simplificadas (1 cluster vs 3)

**Negativas**:

- ⚠️ Dependencia en cluster existente
- ⚠️ Riesgo de "noisy neighbor"
- ⚠️ Límites de escalabilidad futura

**Mitigaciones**:

- Resource quotas estrictos por namespace
- Network policies para aislamiento
- Monitoring continuo de utilización
- Plan de migración a Multi-AKS si >85% utilization

**Estado Actual**: Implementado y operacional desde Enero 2025.

---

## ADR-002: OIDC Authentication (No Secrets)

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

GitHub Actions requiere autenticación con Azure para desplegar recursos. Opciones tradicionales usaban Service Principal secrets almacenados en GitHub Secrets.

**Riesgos de Service Principal Secrets**:

- Secretos pueden filtrarse si comprometen el repositorio
- Rotación manual requerida
- Compliance issues (secretos de larga duración)

### Decisión

✅ **Implementar OIDC (OpenID Connect)** con federated credentials.

**Configuración**:

```bash
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-oidc-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:AlbertoLacambra/DXC_PoC_Nirvana:ref:refs/heads/master",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### Consecuencias

**Positivas**:

- ✅ Zero secretos almacenados en GitHub
- ✅ Tokens de corta duración (1 hora)
- ✅ Rotación automática
- ✅ Mejor compliance y seguridad
- ✅ Trazabilidad de accesos

**Negativas**:

- ⚠️ Configuración inicial más compleja
- ⚠️ Requiere Azure AD application registration

**Estado Actual**: Implementado. Cero secretos de Azure en GitHub Secrets.

---

## ADR-003: Terraform State en Azure Storage

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Terraform requiere almacenar el estado de la infraestructura. Opciones evaluadas:

1. **Local state**: Archivo local `.tfstate`
2. **Remote state (Azure Storage)**: Blob Storage con locking
3. **Terraform Cloud**: SaaS de HashiCorp

### Decisión

✅ **Usar Azure Storage Backend** con blob storage y state locking.

**Configuración**:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate<random>"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
```

### Consecuencias

**Positivas**:

- ✅ State compartido entre team members
- ✅ State locking previene conflictos
- ✅ Versionado automático (blob snapshots)
- ✅ Encryption at rest
- ✅ Integración nativa con Azure

**Negativas**:

- ⚠️ Coste adicional (~€1/mes)
- ⚠️ Requiere setup inicial

**Estado Actual**: Implementado. State en `tfstate-dxc-cloudmind`.

---

## ADR-004: GitHub Actions para CI/CD

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos plataforma CI/CD para automatizar despliegues. Opciones:

1. **GitHub Actions**: Nativo en GitHub
2. **Azure DevOps**: Plataforma Microsoft
3. **Jenkins**: Self-hosted
4. **GitLab CI**: Requiere migración a GitLab

### Decisión

✅ **Usar GitHub Actions** como plataforma CI/CD principal.

**Rationale**:

- Repositorio ya en GitHub
- OIDC integration nativa
- Costo-efectivo (2,000 minutos gratis/mes)
- Marketplace rico en actions
- YAML-based configuration

### Consecuencias

**Positivas**:

- ✅ Integración perfecta con GitHub
- ✅ OIDC authentication built-in
- ✅ Reusable workflows
- ✅ Free tier generoso
- ✅ Matrix builds para multi-env

**Negativas**:

- ⚠️ Vendor lock-in a GitHub
- ⚠️ Limitaciones en self-hosted runners (no usados aún)

**Workflows Implementados**:

- `deploy.yml`: Production deployment
- `pr-validation.yml`: PR validation (7 gates)
- `drift-detection.yml`: Daily drift detection
- `gh-pages.yml`: Documentation deployment

**Estado Actual**: 5 workflows activos y operacionales.

---

## ADR-005: Multi-Gate PR Validation

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos garantizar calidad del código Infrastructure-as-Code antes de merge a master.

### Decisión

✅ **Implementar 7 security gates** en PR validation.

**Gates Implementados**:

1. `terraform fmt` - Validar formato
2. `terraform validate` - Validar sintaxis
3. `tfsec` - Security scanning
4. `checkov` - Policy compliance
5. `tflint` - Linting avanzado
6. `terraform plan` - Preview de cambios
7. Manual approval - Gate humano (producción)

### Consecuencias

**Positivas**:

- ✅ Calidad de código garantizada
- ✅ Detección temprana de security issues
- ✅ Compliance automático
- ✅ Documentación de cambios (plan)

**Negativas**:

- ⚠️ PR validation más lento (~3-5 mins)
- ⚠️ Posibles falsos positivos

**Métricas**:

- Security issues detectados: 12 (pre-merge)
- PRs bloqueados por gates: 3
- Tiempo promedio validación: 4 mins

**Estado Actual**: Activo en todos los PRs.

---

## ADR-006: ACR Basic SKU

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos Azure Container Registry para almacenar imágenes. Opciones:

| SKU | Coste | Storage | Throughput | Geo-replication |
|-----|-------|---------|------------|-----------------|
| **Basic** | €5/mes | 10 GB | 10 MBps | No |
| **Standard** | €20/mes | 100 GB | 100 MBps | No |
| **Premium** | €80/mes | 500 GB | 800 MBps | Sí |

### Decisión

✅ **Usar ACR Basic SKU** para fase PoC.

**Rationale**:

- PoC con pocas imágenes (<5 imágenes)
- No requiere geo-replication
- Throughput suficiente para deployments manuales
- Budget constraint (minimizar costes)

### Consecuencias

**Positivas**:

- ✅ Coste mínimo (€5/mes)
- ✅ Suficiente para PoC
- ✅ Upgrade path a Standard/Premium

**Negativas**:

- ⚠️ Storage limitado (10 GB)
- ⚠️ Throughput limitado (puede ralentizar pulls masivos)

**Plan de Upgrade**:

- Trigger: >8 GB storage o >5 imágenes desplegadas
- Target: Standard SKU (+€15/mes)

**Estado Actual**: Basic SKU, ~2 GB utilizado.

---

## ADR-007: Teams Notifications con Adaptive Cards

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos notificaciones de workflows CI/CD en Microsoft Teams.

**Opciones**:

1. **Incoming Webhook + Simple JSON**: Texto plano
2. **Incoming Webhook + Adaptive Cards**: Rich formatting
3. **Power Automate**: No-code integration
4. **Teams Bot**: Custom bot application

### Decisión

✅ **Usar Incoming Webhook con Adaptive Cards**.

**Implementación**:

```yaml
- name: 🔔 Notify Teams
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
  run: |
    curl -H "Content-Type: application/json" -d '{
      "type": "message",
      "attachments": [{
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": { ... }
      }]
    }' $TEAMS_WEBHOOK_URL
```

### Consecuencias

**Positivas**:

- ✅ Rich formatting (colores, botones, iconos)
- ✅ Configuración simple
- ✅ Sin coste adicional
- ✅ Soporte para acciones (approve/reject)

**Negativas**:

- ⚠️ Requiere webhook URL en GitHub Secrets
- ⚠️ Adaptive Cards requieren más JSON

**Tipos de Notificaciones**:

- ✅ Deployment success
- ✅ Deployment failure
- ⚠️ Drift detected
- 🔔 PR approval required

**Estado Actual**: Implementado en 3 workflows.

---

## ADR-008: Namespace Resource Quotas

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos evitar "noisy neighbor" problems en Single-AKS strategy.

### Decisión

✅ **Implementar Resource Quotas estrictos** por namespace.

**Configuración**:

```yaml
# cloudmind namespace
hard:
  requests.cpu: "4"        # Max 4 CPU solicitados
  requests.memory: 8Gi     # Max 8Gi memory solicitado
  limits.cpu: "6"          # Max 6 CPU límite
  limits.memory: 12Gi      # Max 12Gi memory límite
  pods: "30"               # Max 30 pods
```

### Consecuencias

**Positivas**:

- ✅ Protección contra resource exhaustion
- ✅ Garantiza recursos para Dify namespace
- ✅ Facilita capacity planning
- ✅ Cost control por namespace

**Negativas**:

- ⚠️ Puede limitar escalabilidad
- ⚠️ Requiere ajustes según uso real

**Monitorización**:

- Alertas si >85% quota utilizado
- Review mensual de quotas
- Ajuste según métricas reales

**Estado Actual**: Quotas activos, utilización <15%.

---

## ADR-009: Documentation con MkDocs Material

**Fecha**: Enero 2025  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Necesitábamos documentación técnica accesible y bien estructurada.

**Opciones**:

1. **Markdown en GitHub**: Simple pero básico
2. **MkDocs Material**: Static site generator
3. **Docusaurus**: React-based
4. **GitBook**: SaaS platform

### Decisión

✅ **Usar MkDocs Material** con GitHub Pages.

**Rationale**:

- Markdown-based (familiar)
- Tema Material moderno
- Search integrado
- Mermaid diagrams support
- GitHub Pages hosting gratuito

### Consecuencias

**Positivas**:

- ✅ Documentación profesional
- ✅ Search functionality
- ✅ Mobile-friendly
- ✅ Dark mode support
- ✅ Hosting gratuito

**Negativas**:

- ⚠️ Requiere Python dependencies
- ⚠️ Build step adicional

**Características Implementadas**:

- Navigation tabs
- Code copy buttons
- Git revision dates
- Mermaid diagrams
- Light/dark theme
- Spanish language

**Estado Actual**: Desplegado en GitHub Pages.

---

## ADR-010: Hybrid Resource Management

**Fecha**: Diciembre 2024  
**Estado**: ✅ Aprobado e Implementado  
**Decisores**: Alberto Lacambra

### Contexto

Recursos Dify ya existían antes del proyecto CloudMind. Necesitábamos decidir cómo gestionarlos.

**Opciones**:

1. **Import a Terraform**: Gestionar todo con Terraform
2. **Data Sources Only**: No tocar recursos existentes
3. **Manual Management**: No usar IaC para existentes

### Decisión

✅ **Usar Data Sources Only** (opción no invasiva).

**Estrategia**:

```hcl
# Existing resources - READ ONLY
data "azurerm_kubernetes_cluster" "dify" {
  name                = "dify-aks"
  resource_group_name = "dify-rg"
}

# New resources - MANAGED
resource "azurerm_container_registry" "cloudmind" {
  name = "cloudmind${random_string.suffix.result}"
  ...
}
```

### Consecuencias

**Positivas**:

- ✅ Zero risk para Dify platform
- ✅ Rollback seguro (eliminar CloudMind no afecta Dify)
- ✅ Evolución independiente
- ✅ Clear separation of concerns

**Negativas**:

- ⚠️ No drift detection para recursos Dify
- ⚠️ Configuración duplicada (manual + Terraform)

**Principios**:

- NO importar recursos existentes
- NO modificar recursos existentes
- SÍ leer como data sources
- SÍ gestionar recursos nuevos

**Estado Actual**: Implementado, cero modificaciones a Dify.

---

## Histórico de Decisiones Descartadas

### ❌ Multi-AKS Architecture

**Rechazada**: Diciembre 2024  
**Razón**: Coste excesivo (€455/mes) para fase PoC  
**Superseded by**: ADR-001 (Single-AKS)

### ❌ Terraform Cloud

**Rechazada**: Diciembre 2024  
**Razón**: Coste adicional innecesario  
**Superseded by**: ADR-003 (Azure Storage Backend)

### ❌ Service Principal Secrets

**Rechazada**: Diciembre 2024  
**Razón**: Riesgo de seguridad  
**Superseded by**: ADR-002 (OIDC)

---

## Template para Nuevas ADRs

```markdown
## ADR-XXX: [Título de la Decisión]

**Fecha**: [Mes Año]
**Estado**: [Propuesto | Aprobado | Rechazado | Superseded | Deprecated]
**Decisores**: [Nombres]

### Contexto
[Situación que requiere decisión]

### Decisión
[Qué se decidió hacer]

### Consecuencias
**Positivas**:
- [Lista de beneficios]

**Negativas**:
- [Lista de trade-offs]

**Estado Actual**: [Descripción del estado de implementación]
```

---

## Referencias

- [Architecture Overview](overview.md)
- [Single-AKS Strategy](single-aks.md)
- [Deployed Resources](deployed-resources.md)
