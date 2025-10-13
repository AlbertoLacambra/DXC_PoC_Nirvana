# Terraform State Management Strategy

## 📋 Resumen Ejecutivo

**Estrategia adoptada**: **Un Storage Account, Múltiples Containers**

Esta estrategia balancea simplicidad operacional, aislamiento de ambientes y costes para el proyecto Cloud Control Center.

---

## 🏗️ Arquitectura de State Storage

```
Azure Subscription: Hub (739aaf91-5cb2-45a6-ab4f-abf883e9d3f7)
└── Resource Group: terraform-state-rg
    └── Storage Account: tfstate9a448729
        ├── Container: tfstate          → Legacy projects (dify-private.tfstate)
        ├── Container: cc-hub           → Cloud Control Center Hub
        ├── Container: cc-spoke-prod    → Cloud Control Center Spoke-Prod
        └── Container: cc-spoke-dev     → Cloud Control Center Spoke-Dev
```

### Detalles Técnicos

| Componente | Valor | Notas |
|------------|-------|-------|
| **Resource Group** | `terraform-state-rg` | Existente, reutilizado |
| **Storage Account** | `tfstate9a448729` | Existente, reutilizado |
| **Location** | `northeurope` | Misma región que Hub |
| **SKU** | `Standard_LRS` | Suficiente para state files |
| **Encryption** | Azure-managed keys | Default, encryption at rest |
| **Auth Method** | Azure AD (use_azuread_auth) | Sin access keys en código |
| **Public Access** | Disabled | Seguridad adicional |

---

## 🎯 Por qué esta estrategia

### ✅ Ventajas

1. **Reutilización de Infraestructura**
   - Storage Account `tfstate9a448729` ya existe desde deployments anteriores
   - Resource Group `terraform-state-rg` ya configurado
   - No crear recursos duplicados

2. **Aislamiento por Environment**
   - Cada environment (Hub, Spoke-Prod, Spoke-Dev) en su propio container
   - States separados evitan conflictos
   - Blast radius limitado: si un state se corrompe, no afecta a otros

3. **Simplicidad Operacional**
   - Un solo Storage Account que gestionar
   - Un único punto para RBAC y permisos
   - Backup centralizado
   - Monitoreo unificado

4. **Costes Mínimos**
   - State files son pequeños (~10-50MB típicamente)
   - Standard_LRS: ~€0.018/GB-mes
   - Coste total estimado: **~€0.05/mes** (insignificante)

5. **Soporte Nativo en Terragrunt**
   - Terragrunt soporta múltiples containers nativamente
   - Configuración dinámica vía `locals` y `lookup()`
   - No necesita workarounds

### ⚖️ Trade-offs Considerados

| Estrategia | Ventajas | Desventajas | Decisión |
|------------|----------|-------------|----------|
| **1 SA, múltiples containers** | Simplicidad, costes bajos | SA único = SPOF teórico | ✅ **ELEGIDA** |
| **1 SA por proyecto** | Aislamiento total | Más complejidad, más costes | ❌ Overkill para PoC |
| **1 SA por subscription** | Máxima seguridad | Complejidad multi-sub | ❌ Innecesario |

---

## 🔧 Implementación Terragrunt

### Root Configuration (`terraform/terragrunt.hcl`)

```hcl
locals {
  # Parse environment from directory name
  environment = basename(get_terragrunt_dir())
  
  # Map environment to container name
  container_map = {
    "hub"        = "cc-hub"
    "spoke-prod" = "cc-spoke-prod"
    "spoke-dev"  = "cc-spoke-dev"
  }
  
  # Dynamic container selection
  container_name = lookup(local.container_map, local.environment, "cc-${local.environment}")
}

remote_state {
  backend = "azurerm"
  
  config = {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate9a448729"
    container_name       = local.container_name  # Dynamic!
    key                  = "terraform.tfstate"
    use_azuread_auth     = true
    subscription_id      = "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
  }
}
```

### Cómo Funciona

1. **Terragrunt detecta el environment** basado en el directorio:
   - `terraform/hub/` → `environment = "hub"` → `container_name = "cc-hub"`
   - `terraform/spoke-prod/` → `environment = "spoke-prod"` → `container_name = "cc-spoke-prod"`
   - `terraform/spoke-dev/` → `environment = "spoke-dev"` → `container_name = "cc-spoke-dev"`

2. **Cada environment obtiene su propio container automáticamente**
   - No necesitas especificar container en cada `terragrunt.hcl` individual
   - Configuración DRY (Don't Repeat Yourself)

3. **State locking automático**
   - Azure Blob Storage provee state locking nativo
   - Previene operaciones concurrentes
   - No necesita DynamoDB (como AWS)

---

## 📊 Comparación de Costes

### Coste Mensual por Estrategia

| Estrategia | Storage Accounts | Containers | Operaciones/mes | Almacenamiento | **Coste Total** |
|------------|------------------|------------|-----------------|----------------|-----------------|
| **1 SA, múltiples containers** | 1 | 4 | ~5,000 | ~10MB | **~€0.05** |
| **1 SA por proyecto** | 3 | 1 c/u | ~5,000 | ~10MB c/u | **~€0.15** |
| **1 SA por subscription** | 3 | Múltiples | ~5,000 | ~10MB c/u | **~€0.20** |

*Nota: Diferencias insignificantes vs complejidad operacional*

### Desglose Detallado (Estrategia Elegida)

```
Storage Capacity (LRS, North Europe):
- State files: ~10MB → €0.018/GB × 0.01GB = €0.0002/mes

Operations (Class 1):
- terraform init: 10 ops
- terraform plan: 50 ops
- terraform apply: 100 ops
- Terragrunt 3 environments × 2 runs/día × 30 días = ~180 runs/mes
- Total ops: ~180 × 100 = 18,000 ops
- Coste: €0.0043 per 10k ops → €0.008/mes

Network Egress:
- Minimal (estados pequeños dentro Azure) → €0.001/mes

Total: ~€0.01/mes (redondeado €0.05 con margen)
```

---

## 🔒 Seguridad

### Autenticación

✅ **Azure AD Authentication** (`use_azuread_auth = true`)
- No almacenamos access keys en código
- Usa tu identidad Azure AD actual
- Tokens efímeros (no expuestos)

❌ **NO usamos Access Keys**:
```hcl
# NUNCA hacer esto:
access_key = "XXXXX"  # 🚫 Inseguro!
```

### Permisos Requeridos

**Tu usuario necesita**:
- `Storage Blob Data Contributor` en `tfstate9a448729`
- O `Storage Blob Data Owner`

**Verificar permisos**:
```bash
az role assignment list \
  --assignee "alberto.lacambra@dxc.com" \
  --scope "/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7/resourceGroups/terraform-state-rg/providers/Microsoft.Storage/storageAccounts/tfstate9a448729" \
  --query "[].roleDefinitionName" -o table
```

**Asignar permisos si necesario**:
```bash
az role assignment create \
  --assignee "alberto.lacambra@dxc.com" \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7/resourceGroups/terraform-state-rg/providers/Microsoft.Storage/storageAccounts/tfstate9a448729"
```

### Encryption at Rest

- ✅ **Azure-managed keys** por defecto
- Estado encriptado en disco
- Acceso solo vía Azure AD

### Network Security

- ✅ **Public access disabled** en Storage Account
- ✅ VPN requerido para acceso (10.0.1.10)
- ✅ Firewall rules si necesario

---

## 🛠️ Operaciones

### Ver State Files

```bash
# Listar todos los containers
az storage container list \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --query "[].name" -o table

# Ver state de Hub
az storage blob list \
  --container-name cc-hub \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --query "[].{Name:name, Size:properties.contentLength, Modified:properties.lastModified}" -o table

# Ver state de Spoke-Prod
az storage blob list \
  --container-name cc-spoke-prod \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --query "[].name" -o table
```

### Backup Manual (si necesario)

```bash
# Backup Hub state
az storage blob download \
  --container-name cc-hub \
  --name terraform.tfstate \
  --file hub-state-backup-$(date +%Y%m%d).tfstate \
  --account-name tfstate9a448729 \
  --auth-mode login

# Backup todos los environments
for env in cc-hub cc-spoke-prod cc-spoke-dev; do
  az storage blob download \
    --container-name $env \
    --name terraform.tfstate \
    --file ${env}-backup-$(date +%Y%m%d).tfstate \
    --account-name tfstate9a448729 \
    --auth-mode login
done
```

### Restaurar State (emergencia)

```bash
# Restaurar Hub state desde backup
az storage blob upload \
  --container-name cc-hub \
  --name terraform.tfstate \
  --file hub-state-backup-20251012.tfstate \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --overwrite
```

### State Locking

Azure Blob Storage provee locking automático. Si ves este error:

```
Error: Error acquiring the state lock

Error message: 2 errors occurred:
    * blob lease already held
```

**Solución**:
```bash
# Ver locks activos (Azure Portal)
# Storage Account → Containers → cc-hub → terraform.tfstate → Properties → Lease Status

# Romper lock manualmente (SOLO si proceso muerto)
az storage blob lease break \
  --container-name cc-hub \
  --blob-name terraform.tfstate \
  --account-name tfstate9a448729 \
  --auth-mode login
```

---

## 📈 Escalabilidad Futura

### Agregar Nuevo Environment

```bash
# 1. Crear container
az storage container create \
  --name cc-nuevo-env \
  --account-name tfstate9a448729 \
  --auth-mode login

# 2. Agregar al container_map en terragrunt.hcl
# locals {
#   container_map = {
#     "hub"        = "cc-hub"
#     "spoke-prod" = "cc-spoke-prod"
#     "spoke-dev"  = "cc-spoke-dev"
#     "nuevo-env"  = "cc-nuevo-env"  # <-- AGREGAR
#   }
# }

# 3. Crear directorio terraform/nuevo-env/
```

### Agregar Nuevo Proyecto

**Opción A: Mismo SA, nuevo container**
```bash
az storage container create \
  --name otro-proyecto \
  --account-name tfstate9a448729 \
  --auth-mode login
```

**Opción B: Nuevo SA (si necesitas aislamiento total)**
```bash
az storage account create \
  --name tfstateotroproy \
  --resource-group terraform-state-rg \
  --location northeurope \
  --sku Standard_LRS
```

---

## 🔍 Troubleshooting

### Error: "Backend initialization required"

```bash
cd terraform/hub/
terragrunt init -reconfigure
```

### Error: "Storage account not found"

Verifica que estás autenticado:
```bash
az account show
az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
```

### Error: "Insufficient permissions"

```bash
# Verificar RBAC
az role assignment list \
  --assignee $(az account show --query user.name -o tsv) \
  --scope "/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7/resourceGroups/terraform-state-rg"
```

### Error: "Container does not exist"

```bash
# Verificar containers
az storage container list \
  --account-name tfstate9a448729 \
  --auth-mode login \
  --query "[].name" -o table

# Crear si falta
az storage container create \
  --name cc-hub \
  --account-name tfstate9a448729 \
  --auth-mode login
```

---

## 📚 Referencias

- [Terraform Azure Backend](https://developer.hashicorp.com/terraform/language/settings/backends/azurerm)
- [Store Terraform state in Azure Storage](https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage)
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/docs/)
- [Azure Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/)

---

**Última actualización**: 13 Octubre 2025  
**Status**: ✅ Implementado y operativo  
**Containers activos**: `cc-hub`, `cc-spoke-prod`, `cc-spoke-dev`
