# Terraform con Terragrunt - Cloud Control Center

## 📋 Estructura

```
terraform/
├── terragrunt.hcl                    # Root config (state, provider)
├── modules/                          # Módulos Terraform reutilizables
│   ├── container-registry/           # ACR module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── monitoring/                   # Log Analytics + App Insights
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aks/                          # TODO: AKS cluster module
│   └── vnet-peering/                 # TODO: VNet peering module
├── environments/                     # Terraform code por environment
│   ├── hub/
│   │   ├── main.tf                   # Data sources Dify + new resources
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── spoke-prod/                   # TODO
│   └── spoke-dev/                    # TODO
├── hub/
│   └── terragrunt.hcl                # Hub config (inputs, dependencies)
├── spoke-prod/
│   └── terragrunt.hcl                # TODO: Spoke-Prod config
└── spoke-dev/
    └── terragrunt.hcl                # TODO: Spoke-Dev config
```

## 🚀 Pre-requisitos

### 1. Instalar Terragrunt

```bash
# Linux/WSL
wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.55.0/terragrunt_linux_amd64
sudo mv terragrunt_linux_amd64 /usr/local/bin/terragrunt
sudo chmod +x /usr/local/bin/terragrunt

# Verificar
terragrunt --version
```

### 2. Instalar Terraform

```bash
# Terraform ya debería estar instalado
terraform --version  # >= 1.6.0
```

### 3. Azure CLI autenticado

```bash
az login
az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7

# Verificar
az account show
```

### 4. Storage Account para Terraform State

**✅ YA CONFIGURADO**: Reutilizamos infraestructura existente con estrategia de múltiples containers.

**Estrategia de State Management**:
```
Storage Account: tfstate9a448729 (existente en terraform-state-rg)
├── Container: tfstate          → Legacy (dify-private.tfstate)
├── Container: cc-hub           → Cloud Control Center Hub ✅
├── Container: cc-spoke-prod    → Spoke Producción ✅
└── Container: cc-spoke-dev     → Spoke Desarrollo ✅
```

**Ventajas de esta estrategia**:
- ✅ Un Storage Account, múltiples containers (aislamiento por environment)
- ✅ Reutilización de infraestructura existente
- ✅ Costes mínimos (~0.05€/mes)
- ✅ Gestión centralizada (un solo RBAC)
- ✅ Blast radius limitado por container

**Si necesitas crear containers adicionales**:
```bash
# Ejemplo para nuevo proyecto
az storage container create \
  --name cc-nuevo-proyecto \
  --account-name tfstate9a448729 \
  --auth-mode login
```

### 5. Variables de Entorno

```bash
# Opcional: para autenticación
export ARM_SUBSCRIPTION_ID="739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
export ARM_TENANT_ID="your-tenant-id"

# Para Terragrunt remote state
export AZURE_SUBSCRIPTION_SHORT="hub"
```

## 📦 Comandos Terragrunt

### Hub (Phase 0 - Actual)

```bash
cd /mnt/c/PROYECTS/DXC_PoC_Nirvana/terraform

# 1. Inicializar Hub
cd hub/
terragrunt init

# 2. Ver plan
terragrunt plan

# 3. Aplicar cambios
terragrunt apply

# 4. Ver outputs
terragrunt output

# 5. Destruir (solo si necesario)
terragrunt destroy
```

### Todos los Environments (Futuro - cuando Spokes estén listos)

```bash
cd /mnt/c/PROYECTS/DXC_PoC_Nirvana/terraform

# Plan all
terragrunt run-all plan

# Apply all (Hub primero, luego Spokes automáticamente)
terragrunt run-all apply --terragrunt-non-interactive

# Destroy all (orden reverso automático)
terragrunt run-all destroy
```

### Comandos Útiles

```bash
# Ver dependency graph
terragrunt graph-dependencies | dot -Tpng > dependencies.png

# Validate configuración
terragrunt run-all validate

# Format código
terragrunt run-all fmt

# Ver outputs de Hub desde Spoke-Prod
cd spoke-prod/
terragrunt output --terragrunt-source-path=../hub

# Forzar re-init si cambios en backend
terragrunt init -reconfigure
```

## 🔍 Qué hace el código actual

### Hub (`terraform/hub/`)

**Data Sources** (recursos existentes de Dify - NO los crea):
- ✅ `azurerm_resource_group.dify` → RG: `dify-rg`
- ✅ `azurerm_kubernetes_cluster.dify_aks` → AKS: `dify-aks`
- ✅ `azurerm_virtual_network.dify_vnet` → VNet: `dify-vnet`
- ✅ `azurerm_postgresql_flexible_server.dify_postgres` → PostgreSQL: `dify-postgres-9107e36a`
- ✅ `azurerm_storage_account.dify_storage` → Storage: `difyprivatest9107e36a`
- ✅ `azurerm_key_vault.dify_kv` → Key Vault: `dify-private-kv`

**Nuevos Recursos** (los crea Terragrunt):
- ✅ `azurerm_resource_group.hub` → RG: `cc-hub-rg`
- ✅ `module.acr` → Container Registry compartido
  - Resource Group: `cc-acr-rg`
  - ACR: `ccacr{random}` (ej: `ccacr3f7a2b`)
  - AcrPull role assignment para Dify AKS
  - Diagnostics → Log Analytics
- ✅ `module.monitoring` → Monitoreo centralizado
  - Resource Group: `cc-monitoring-rg`
  - Log Analytics Workspace: `cc-logs-workspace`
  - Application Insights: `cc-app-insights`
  - Container Insights solution
  - Action Group: `cc-alerts` con email

**Outputs** (disponibles para Spokes):
- Dify VNet ID → para VNet Peering
- ACR login server → para AKS Spokes pull images
- Log Analytics Workspace ID → para AKS Spokes monitoring
- PostgreSQL FQDN → para connection strings
- Key Vault URI → para secrets

## 🎯 Próximos Pasos (TODO)

### 1. Crear módulos faltantes

```bash
# TODO: AKS module
terraform/modules/aks/
├── main.tf
├── variables.tf
└── outputs.tf

# TODO: VNet Peering module
terraform/modules/vnet-peering/
├── main.tf
├── variables.tf
└── outputs.tf
```

### 2. Crear Spoke-Prod environment

```bash
terraform/spoke-prod/
└── terragrunt.hcl          # Config con dependency en Hub

terraform/environments/spoke-prod/
├── main.tf                 # AKS + VNet + Peering
├── variables.tf
└── outputs.tf
```

### 3. Crear Spoke-Dev environment

```bash
terraform/spoke-dev/
└── terragrunt.hcl          # Config con dependency en Hub

terraform/environments/spoke-dev/
├── main.tf                 # AKS + VNet + Peering
├── variables.tf
└── outputs.tf
```

## 🐛 Troubleshooting

### Error: "Backend initialization required"

```bash
cd terraform/hub/
terragrunt init -reconfigure
```

### Error: "No declaration found for var.X"

Los errores de linting son normales - el linter no reconoce variables generadas por Terragrunt. El código funcionará correctamente.

### Error: "Storage account not found"

Asegúrate de haber creado el Storage Account para Terraform state (ver Pre-requisitos #4).

### Error: "Insufficient privileges"

```bash
# Verificar authentication
az account show

# Re-login
az login
az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
```

### Ver logs detallados

```bash
# Terragrunt debug
terragrunt plan --terragrunt-log-level debug

# Terraform trace
TF_LOG=TRACE terragrunt apply
```

## 📊 Estado Actual (Phase 0)

- ✅ Root `terragrunt.hcl` creado (con estrategia multi-container)
- ✅ Módulo `container-registry` completo
- ✅ Módulo `monitoring` completo
- ✅ Hub environment con data sources Dify
- ✅ Hub `terragrunt.hcl` configurado
- ✅ **Storage Account tfstate configurado** (reutilizado con múltiples containers)
- ✅ Containers creados: `cc-hub`, `cc-spoke-prod`, `cc-spoke-dev`
- 📝 Módulo AKS (TODO)
- 📝 Módulo VNet Peering (TODO)
- 📝 Spoke-Prod environment (TODO)
- 📝 Spoke-Dev environment (TODO)

**📚 Ver detalles**: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) para entender la estrategia de state storage

## 🔗 Referencias

- [Terragrunt Documentation](https://terragrunt.gruntwork.io/docs/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Backend Configuration](https://developer.hashicorp.com/terraform/language/settings/backends/azurerm)

---

**Última actualización**: 12 Octubre 2025  
**Status**: Phase 0 - Hub IaC iniciado
