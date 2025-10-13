# 🚀 Próximos Pasos - Testing Infraestructura

## ✅ Estado Actual (13 Octubre 2025)

### Completado
- ✅ Estrategia de state management definida (múltiples containers)
- ✅ Storage Account reutilizado: `tfstate9a448729`
- ✅ Containers creados: `cc-hub`, `cc-spoke-prod`, `cc-spoke-dev`
- ✅ Root `terragrunt.hcl` configurado con container dinámico
- ✅ Módulos Terraform: ACR, Monitoring
- ✅ Hub environment: data sources para Dify existente

### Issues Pendientes
- ⚠️ **Paths a módulos**: Terragrunt copia código a `.terragrunt-cache`, paths relativos `../../modules` se rompen
- ⚠️ **Variables no declaradas**: `hub/terragrunt.hcl` tiene inputs que no existen en `environments/hub/variables.tf`

---

## 🔧 Problema 1: Paths a Módulos

### Error Actual
```
Error: Unreadable module directory
Unable to evaluate directory symlink: lstat ../../modules: no such file or directory
```

### Causa
Terragrunt copia `environments/hub/` a `.terragrunt-cache/<hash>/`, pero los módulos están en `terraform/modules/` (fuera del path copiado).

### Solución A: Source Absolute Paths (RECOMENDADO)

**Cambiar en `environments/hub/main.tf`**:
```hcl
# ❌ ANTES (path relativo)
module "acr" {
  source = "../../modules/container-registry"
}

# ✅ DESPUÉS (usando get_terraform_commands_that_need_vars)
module "acr" {
  source = "${path.root}/../../modules/container-registry"
}
```

**O mejor aún**, usar variables de Terragrunt:

**En `hub/terragrunt.hcl`**:
```hcl
terraform {
  source = "${get_parent_terragrunt_dir()}/environments/hub"
  
  # Copiar módulos también
  extra_arguments "modules_path" {
    commands = get_terraform_commands_that_need_vars()
    
    env_vars = {
      TF_VAR_modules_path = "${get_parent_terragrunt_dir()}/modules"
    }
  }
}
```

**En `environments/hub/main.tf`**:
```hcl
variable "modules_path" {
  type    = string
  default = "../../modules"
}

module "acr" {
  source = "${var.modules_path}/container-registry"
}
```

### Solución B: Include Before/After Hooks

**En `hub/terragrunt.hcl`**:
```hcl
terraform {
  before_hook "copy_modules" {
    commands = ["init"]
    execute  = ["bash", "-c", "ln -sf ${get_parent_terragrunt_dir()}/modules ${get_terragrunt_dir()}/.terragrunt-cache/*/modules 2>/dev/null || true"]
  }
}
```

### Solución C: Usar Terraform Registry/Git Sources (Producción)

Para entornos de producción, los módulos deberían estar en:
- **Registry privado**: `source = "app.terraform.io/dxc/container-registry/azurerm"`
- **Git**: `source = "git::https://github.com/AlbertoLacambra/terraform-modules.git//modules/container-registry?ref=v1.0.0"`

---

## 🔧 Problema 2: Variables No Declaradas

### Error Actual
```
level=warning msg=The following inputs passed in by terragrunt are unused:
       - create_acr
       - acr_config
       - monitoring_config
       ...
```

### Causa
`hub/terragrunt.hcl` define inputs que no existen como variables en `environments/hub/variables.tf`.

### Solución: Sincronizar Variables

**Actualizar `environments/hub/variables.tf`** para incluir todas las variables de `inputs`:

```hcl
# Variables para crear ACR
variable "create_acr" {
  type        = bool
  description = "Whether to create Container Registry"
  default     = true
}

variable "acr_config" {
  type = object({
    name_prefix                   = string
    sku                           = string
    admin_enabled                 = bool
    public_network_access_enabled = bool
    retention_policy_enabled      = bool
    retention_policy_days         = number
  })
  description = "Container Registry configuration"
}

# Variables para monitoring
variable "create_monitoring" {
  type        = bool
  description = "Whether to create monitoring resources"
  default     = true
}

variable "monitoring_config" {
  type = object({
    log_analytics_name        = string
    log_analytics_sku         = string
    log_analytics_retention   = number
    app_insights_name         = string
    app_insights_type         = string
    enable_container_insights = bool
  })
  description = "Monitoring configuration"
}

# Variables para action group
variable "create_action_group" {
  type        = bool
  description = "Whether to create action group for alerts"
  default     = false
}

variable "action_group_config" {
  type = object({
    name       = string
    short_name = string
    emails     = map(string)
    webhooks   = optional(map(string), {})
  })
  description = "Action group configuration for alerts"
  default = {
    name       = "default-alerts"
    short_name = "default"
    emails     = {}
    webhooks   = {}
  }
}
```

---

## 🎯 Plan de Acción Recomendado

### Paso 1: Arreglar Paths a Módulos (Solución A)

```bash
cd /mnt/c/PROYECTS/DXC_PoC_Nirvana

# Opción 1: Modificar environments/hub/main.tf para usar paths absolutos
# (hacer cambios con editor)

# Opción 2: Crear symlink en .terragrunt-cache (temporal para testing)
cd terraform/hub
terragrunt init --terragrunt-log-level debug
```

### Paso 2: Completar Variables

```bash
# Actualizar environments/hub/variables.tf con todas las variables
# (ya documentado arriba)
```

### Paso 3: Testing Iterativo

```bash
cd /mnt/c/PROYECTS/DXC_PoC_Nirvana/terraform/hub

# 1. Validate inputs
terragrunt validate-inputs

# 2. Init (sin backend primero)
terragrunt init -backend=false

# 3. Validate Terraform
terragrunt validate

# 4. Plan (dry-run)
terragrunt plan

# 5. Apply (crear recursos)
# SOLO después de revisar el plan
terragrunt apply
```

### Paso 4: Verificar Recursos Creados

```bash
# Verificar que el state se guardó en container correcto
az storage blob list \
  --container-name cc-hub \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --query "[].name" -o table

# Listar recursos creados
az resource list \
  --resource-group cc-hub-rg \
  --output table

az resource list \
  --resource-group cc-acr-rg \
  --output table

az resource list \
  --resource-group cc-monitoring-rg \
  --output table
```

---

## 📝 Decisión Requerida

**¿Qué solución prefieres para los paths de módulos?**

### Opción A: Paths Absolutos con `path.root` (MÁS RÁPIDO)
- ✅ Funciona inmediatamente
- ✅ No requiere hooks ni complejidad adicional
- ⚠️ Menos portable si cambias estructura

**Cambio requerido**: Modificar `environments/hub/main.tf`:
```hcl
module "acr" {
  source = "${path.root}/../../modules/container-registry"
}
module "monitoring" {
  source = "${path.root}/../../modules/monitoring"
}
```

### Opción B: Variables con Terragrunt (MÁS LIMPIO)
- ✅ Más flexible
- ✅ DRY (se define una vez en root)
- ⚠️ Requiere más configuración

**Cambios requeridos**:
1. Agregar `extra_arguments` en `hub/terragrunt.hcl`
2. Agregar variable `modules_path` en `environments/hub/variables.tf`
3. Usar `${var.modules_path}` en module sources

### Opción C: Git Sources (PRODUCCIÓN)
- ✅ Ideal para producción
- ✅ Versionado de módulos
- ⚠️ Requiere setup inicial (publicar módulos)

---

## 🚦 Estado de Readiness

| Componente | Status | Blocker |
|------------|--------|---------|
| Storage Account | ✅ Ready | None |
| Containers | ✅ Ready | None |
| Root terragrunt.hcl | ✅ Ready | None |
| Hub terragrunt.hcl | ⚠️ Partial | Module paths |
| Hub main.tf | ⚠️ Partial | Module paths |
| Hub variables.tf | ❌ Incomplete | Missing variables |
| Módulos (ACR, Monitoring) | ✅ Ready | None |

---

## ✅ Next Steps - Tu Decisión

**Quieres que proceda con**:
1. ✅ **Opción A (rápido)**: Arreglar paths con `path.root` y actualizar variables → 10 mins
2. ✅ **Opción B (limpio)**: Configurar variables Terragrunt → 20 mins
3. ✅ **Testing completo**: Después de arreglar paths → 15 mins (plan + apply)

¿Con cuál procedo?

---

**Última actualización**: 13 Octubre 2025, 17:15  
**Bloqueadores**: Paths a módulos, variables incompletas  
**ETA para testing**: < 30 minutos tras decisión
