# 🚀 Quick Start Guide

Esta guía te ayudará a configurar y desplegar DXC Cloud Mind - Nirvana PoC en menos de 30 minutos.

---

## 📋 Prerrequisitos

### Herramientas Requeridas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Terraform** | 1.5.5+ | Infrastructure as Code |
| **Azure CLI** | 2.50+ | Azure authentication |
| **Git** | 2.40+ | Version control |
| **WSL/Linux/macOS** | - | Shell scripting |

### Permisos Requeridos

- ✅ Acceso a Azure Subscription `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7`
- ✅ Permisos de GitHub en repositorio `DXC_PoC_Nirvana`
- ✅ Service Principal configurado (o permisos para crearlo)

---

## 1️⃣ Clonar Repositorio

```bash
# Clone the repository
git clone https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana.git
cd DXC_PoC_Nirvana

# Verify structure
ls -la
```

**Expected output**:
```
.github/
docs/
terraform/
scripts/
README.md
mkdocs.yml
...
```

---

## 2️⃣ Configurar Credenciales

### Opción A: Usar Service Principal Existente

Si ya tienes el Service Principal configurado:

```bash
# Verify Service Principal exists
az ad sp show --id dc39d60b-cfc7-41c6-9fcb-3b29778bb03a

# Login with your Azure account
az login

# Set subscription
az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
```

### Opción B: Crear Nuevo Service Principal

Si necesitas crear uno nuevo:

```bash
# Create Service Principal with OIDC
az ad sp create-for-rbac \
  --name "github-actions-dxc-nirvana" \
  --role Contributor \
  --scopes /subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7

# Save the output (you'll need appId and tenant)
```

Ver [Guía Completa de Secretos](secrets-setup.md) para más detalles.

---

## 3️⃣ Configurar GitHub Secrets

### Acceder a GitHub Settings

1. Ve a: `https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana`
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Agregar Secretos Requeridos

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AZURE_CLIENT_ID` | Service Principal App ID | `dc39d60b-cfc7-41c6-9fcb-3b29778bb03a` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | `93f33571-550f-43cf-b09f-cd331338d086` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7` |
| `TEAMS_WEBHOOK_URL` | Teams webhook URL | `https://prod-XX.westeurope.logic...` |

!!! warning "TEAMS_WEBHOOK_URL"
    Para obtener el webhook URL de Teams:
    
    1. Teams → Canal "DXC Cloud Mind - Nirvana"
    2. ⋯ → Connectors → Incoming Webhook
    3. Configure → Copiar URL

---

## 4️⃣ Validar Configuración Local

### Test 1: Terraform Init

```bash
cd terraform/environments/hub

# Initialize Terraform
terraform init

# Expected output:
# Terraform has been successfully initialized!
```

### Test 2: Terraform Validate

```bash
# Validate configuration
terraform validate

# Expected output:
# Success! The configuration is valid.
```

### Test 3: Terraform Plan

```bash
# Plan changes (dry-run)
terraform plan

# Review the output
# Should show resources to be created
```

---

## 5️⃣ Desplegar con GitHub Actions (Recomendado)

### Opción A: Via Web UI

1. Go to **Actions** tab
2. Select workflow: **🚀 Deploy Infrastructure**
3. Click **Run workflow**
4. Select environment: `hub`
5. Auto approve: `false` (require manual approval)
6. Click **Run workflow** button

### Opción B: Via GitHub CLI

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate
gh auth login

# Trigger deployment
gh workflow run "deploy.yml" \
  --repo DXC-Technology-Spain/DXC_PoC_Nirvana \
  -f environment=hub \
  -f auto_approve=false
```

### Monitor Deployment

```bash
# View workflow runs
gh run list --repo DXC-Technology-Spain/DXC_PoC_Nirvana

# Watch specific run
gh run watch <run-id>
```

---

## 6️⃣ Aprobar Deployment

### Cuando el workflow alcance "Manual Approval":

1. Se creará un **GitHub Issue** automáticamente
2. Revisa el plan de Terraform en el issue
3. Comenta en el issue:
   - `/approve` para aprobar
   - `/deny` para rechazar

!!! info "Plan Summary"
    El issue incluirá:
    
    - ➕ Recursos a crear
    - 🔄 Recursos a modificar
    - ❌ Recursos a destruir
    - 🔗 Link al workflow run

---

## 7️⃣ Verificar Deployment

### Check Azure Portal

```bash
# Open Azure Portal
az portal
```

Navega a:

- Resource Group: `cloudmind-hub-rg`
- Resource Group: `cloudmind-acr-rg`
- Container Registry: `cloudmind<suffix>`

### Check Terraform Outputs

```bash
cd terraform/environments/hub

# View outputs
terraform output

# Expected:
# acr_login_server = "cloudmindXXXXXX.azurecr.io"
# acr_name = "cloudmindXXXXXX"
# cloudmind_namespace = "cloudmind"
# dify_namespace = "dify"
# hub_resource_group_name = "cloudmind-hub-rg"
```

### Check Kubernetes Namespace

```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group dify-rg \
  --name dify-aks

# List namespaces
kubectl get namespaces

# Expected output includes:
# cloudmind    Active   X
# dify         Active   X

# Check resource quota
kubectl describe resourcequota -n cloudmind
```

---

## 8️⃣ Test Teams Notifications

### Manual Test

```bash
# Make script executable
chmod +x scripts/test-teams-webhook.sh

# Run test
export TEAMS_WEBHOOK_URL="<your-webhook-url>"
./scripts/test-teams-webhook.sh

# Check Teams channel for 3 test messages
```

---

## 🎉 ¡Deployment Exitoso!

Si todo funcionó correctamente, deberías tener:

- ✅ 7 recursos creados en Azure
- ✅ Namespace `cloudmind` en AKS con quotas
- ✅ Azure Container Registry operacional
- ✅ Workflow visible en GitHub Actions
- ✅ Notificación en Teams (si webhook configurado)

---

## 🔧 Troubleshooting

### Problema 1: Terraform Init Falla

**Error**: `Error: Failed to get existing workspaces`

**Solución**:
```bash
# Verify Azure login
az account show

# Re-login if needed
az login

# Set correct subscription
az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
```

### Problema 2: Approval No Aparece

**Síntoma**: Workflow esperando approval pero no hay issue

**Solución**:

1. Check GitHub → Issues tab
2. Look for issue titled: "🚀 Aprobar Deployment de Hub"
3. If not found, check workflow logs for errors

### Problema 3: Teams Notification No Llega

**Síntoma**: Deployment exitoso pero sin notificación

**Solución**:

1. Ver [Teams Troubleshooting Guide](teams-troubleshooting.md)
2. Ejecutar `scripts/test-teams-webhook.sh`
3. Verificar Power Automate flow status

---

## 📚 Próximos Pasos

Ahora que tienes la infraestructura desplegada:

1. **Explorar Arquitectura**: [Architecture Overview](../architecture/overview.md)
2. **Entender CI/CD**: [Workflows Guide](../cicd/workflows.md)
3. **Revisar Costes**: [Cost Analysis](../costs/analysis.md)
4. **Planear Use Cases**: [Roadmap](../status.md#roadmap)

---

## 🆘 Necesitas Ayuda?

- **GitHub Issues**: [Reportar problema](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/issues)
- **Teams Channel**: DXC Cloud Mind - Nirvana
- **Contact**: Alberto Lacambra

---

!!! tip "Best Practice"
    Siempre usa GitHub Actions para deployments de producción.  
    Reserva deployments locales solo para testing y debugging.
