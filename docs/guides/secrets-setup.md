# Configuración de Secretos GitHub

## Overview

Guía para configurar los secretos necesarios en GitHub Actions para autenticación con Azure y notificaciones Teams.

## Secretos Requeridos

### 1. Azure OIDC Authentication

#### AZURE_CLIENT_ID

**Descripción**: Application (client) ID del Service Principal

**Obtención**:

```bash
az ad app list --display-name "GitHub-OIDC-DXC-PoC-Nirvana" --query "[0].appId" -o tsv
```

#### AZURE_TENANT_ID

**Descripción**: Azure AD Tenant ID

**Obtención**:

```bash
az account show --query tenantId -o tsv
```

#### AZURE_SUBSCRIPTION_ID

**Descripción**: Azure Subscription ID

**Obtención**:

```bash
az account show --query id -o tsv
```

### 2. Teams Notifications

#### TEAMS_WEBHOOK_URL

**Descripción**: URL del Incoming Webhook de Teams

**Obtención**:

1. Abrir Teams → Canal → ⋯ (More options)
2. Connectors → Incoming Webhook
3. Configurar → Copiar URL

## Configurar en GitHub

### Paso 1: Navegar a Settings

```text
GitHub Repo → Settings → Secrets and variables → Actions
```

### Paso 2: Añadir Secretos

```text
Click "New repository secret"
Name: AZURE_CLIENT_ID
Value: <paste value>
Click "Add secret"
```

Repetir para cada secreto.

### Paso 3: Verificar

```yaml
# En workflow:
${{ secrets.AZURE_CLIENT_ID }}  # Debe estar disponible
```

## Service Principal Setup

### Crear Service Principal

```bash
# Crear aplicación
az ad app create --display-name "GitHub-OIDC-DXC-PoC-Nirvana"

# Obtener App ID
APP_ID=$(az ad app list --display-name "GitHub-OIDC-DXC-PoC-Nirvana" --query "[0].appId" -o tsv)

# Crear Service Principal
az ad sp create --id $APP_ID
```

### Configurar Federated Credentials

```bash
# Configurar OIDC para master branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-oidc-master",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:AlbertoLacambra/DXC_PoC_Nirvana:ref:refs/heads/master",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### Asignar Roles

```bash
# Get Service Principal Object ID
SP_ID=$(az ad sp list --display-name "GitHub-OIDC-DXC-PoC-Nirvana" --query "[0].id" -o tsv)

# Assign Contributor role to subscription
az role assignment create \
  --assignee $SP_ID \
  --role Contributor \
  --scope /subscriptions/<SUBSCRIPTION_ID>
```

## Verificación

### Test OIDC Authentication

```yaml
# .github/workflows/test-auth.yml
name: Test Azure Authentication
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Test Access
        run: az account show
```

### Test Teams Webhook

```bash
curl -H "Content-Type: application/json" \
  -d '{"text":"Test notification"}' \
  $TEAMS_WEBHOOK_URL
```

## Troubleshooting

### Error: "AADSTS700016: Application not found"

**Causa**: App ID incorrecto o aplicación eliminada

**Solución**: Verificar que la aplicación existe

```bash
az ad app show --id $APP_ID
```

### Error: "Failed to get federated token"

**Causa**: Configuración OIDC incorrecta

**Solución**: Verificar federated credentials

```bash
az ad app federated-credential list --id $APP_ID
```

## Referencias

- [Azure OIDC Documentation](https://docs.microsoft.com/azure/developer/github/connect-from-azure)
- [Teams Webhook Guide](https://docs.microsoft.com/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
- [Workflows](../cicd/workflows.md)
