# 🔐 Configuración de Secretos de GitHub

Esta guía te ayudará a configurar los secretos necesarios para que los workflows de GitHub Actions puedan autenticarse con Azure.

## 📋 Requisitos Previos

- Acceso de administrador a Azure (Subscription: `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7`)
- Acceso de administrador al repositorio de GitHub
- Azure CLI instalado y autenticado

## 🔑 Paso 1: Crear Service Principal en Azure

Un Service Principal es una identidad que permite a GitHub Actions autenticarse con Azure de forma segura.

### Opción A: Usando Azure Portal

1. **Ir a Azure Active Directory** (Entra ID)
   - Portal: https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview

2. **Crear App Registration**
   - Navega a: `Azure Active Directory` → `App registrations` → `New registration`
   - Nombre: `github-actions-dxc-nirvana`
   - Supported account types: `Accounts in this organizational directory only`
   - Click `Register`

3. **Anotar Client ID y Tenant ID**
   - En la página de Overview del App Registration, copia:
     - **Application (client) ID** → Este es tu `AZURE_CLIENT_ID`
     - **Directory (tenant) ID** → Este es tu `AZURE_TENANT_ID`

4. **Crear Client Secret**
   - Ve a: `Certificates & secrets` → `Client secrets` → `New client secret`
   - Description: `GitHub Actions Secret`
   - Expires: `24 months` (o el máximo permitido)
   - Click `Add`
   - **⚠️ IMPORTANTE:** Copia el **Value** inmediatamente (solo se muestra una vez)
     - Este es tu `AZURE_CLIENT_SECRET` (opcional, solo si usas autenticación con secret)

5. **Asignar Permisos (Role Assignment)**
   - Ve a: `Subscriptions` → Selecciona `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7`
   - Click `Access control (IAM)` → `Add` → `Add role assignment`
   - Role: `Contributor`
   - Members: Busca `github-actions-dxc-nirvana` (el App Registration que creaste)
   - Click `Review + assign`

### Opción B: Usando Azure CLI (Más Rápido)

```bash
# 1. Login en Azure
az login

# 2. Configurar la suscripción correcta
az account set --subscription "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"

# 3. Crear Service Principal con permisos de Contributor
az ad sp create-for-rbac \
  --name "github-actions-dxc-nirvana" \
  --role "Contributor" \
  --scopes "/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7" \
  --sdk-auth

# 4. La salida será algo como:
# {
#   "clientId": "12345678-1234-1234-1234-123456789012",         ← AZURE_CLIENT_ID
#   "clientSecret": "tu-secret-aqui",                          ← AZURE_CLIENT_SECRET (opcional)
#   "subscriptionId": "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7",  ← Ya lo tienes
#   "tenantId": "87654321-4321-4321-4321-210987654321",        ← AZURE_TENANT_ID
#   ...
# }
```

**⚠️ IMPORTANTE:** Guarda esta salida en un lugar seguro (como 1Password, Azure Key Vault, etc.)

## 🔐 Paso 2: Configurar Federated Credentials (Recomendado - Más Seguro)

En lugar de usar un client secret, Azure permite autenticación sin secretos usando OpenID Connect (OIDC). **Esta es la opción más segura y recomendada.**

### En Azure Portal:

1. Ve al App Registration que creaste: `github-actions-dxc-nirvana`
2. Navega a: `Certificates & secrets` → `Federated credentials` → `Add credential`
3. Configura así:
   - **Federated credential scenario:** GitHub Actions deploying Azure resources
   - **Organization:** `AlbertoLacambra`
   - **Repository:** `DXC_PoC_Nirvana`
   - **Entity type:** `Branch`
   - **GitHub branch name:** `master`
   - **Name:** `github-actions-master-branch`
   - Click `Add`

4. **Agregar otra credencial para Pull Requests** (para el workflow de PR Validation):
   - Click `Add credential` nuevamente
   - **Entity type:** `Pull request`
   - **Name:** `github-actions-pull-requests`
   - Click `Add`

### Ventajas de Federated Credentials:
- ✅ No hay secretos que expiren
- ✅ No hay secretos que puedan filtrarse
- ✅ Rotación automática de tokens
- ✅ Más seguro que client secrets

**Con esta opción, NO necesitas `AZURE_CLIENT_SECRET`**

## 📝 Paso 3: Configurar Secretos en GitHub

### 3.1. Ir a la Configuración de Secretos

1. Ve a tu repositorio: https://github.com/AlbertoLacambra/DXC_PoC_Nirvana
2. Click en `Settings` (⚙️)
3. En el menú lateral: `Secrets and variables` → `Actions`
4. Click en `New repository secret`

### 3.2. Agregar los Secretos

Crea estos **3 secretos** (uno por uno):

#### Secret 1: AZURE_CLIENT_ID
- **Name:** `AZURE_CLIENT_ID`
- **Value:** El Application (client) ID que copiaste antes
- Click `Add secret`

#### Secret 2: AZURE_TENANT_ID
- **Name:** `AZURE_TENANT_ID`
- **Value:** El Directory (tenant) ID que copiaste antes
- Click `Add secret`

#### Secret 3: TEAMS_WEBHOOK_URL
- **Name:** `TEAMS_WEBHOOK_URL`
- **Value:** 
```
https://default93f33571550f43cfb09fcd331338d0.86.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9b7a4c5dbf90431ea477182e484a0f4a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GkOprQp1DDP8Ag4zubsAGovbg6AIqUKLauRQZnIB8vo
```
- Click `Add secret`

### 3.3. Verificar Secretos Creados

Deberías ver estos 3 secretos en la lista:
- ✅ `AZURE_CLIENT_ID`
- ✅ `AZURE_TENANT_ID`
- ✅ `TEAMS_WEBHOOK_URL`

## 🧪 Paso 4: Probar la Configuración

### Opción 1: Ejecutar Workflow Manualmente

1. Ve a: `Actions` → `Deploy Infrastructure` (deploy.yml)
2. Click en `Run workflow`
3. Selecciona:
   - **Branch:** `master`
   - **Environment:** `hub`
   - **Auto-approve:** `false` (para probar la aprobación manual)
4. Click `Run workflow`

El workflow debería:
- ✅ Autenticarse correctamente con Azure
- ✅ Ejecutar `terraform plan`
- ✅ Crear un Issue pidiendo aprobación manual
- ✅ Enviar notificación a Teams

### Opción 2: Crear un Pull Request de Prueba

1. Crea una rama nueva:
```bash
git checkout -b test/workflows-validation
```

2. Haz un cambio pequeño (por ejemplo, en README.md)

3. Push y crea un Pull Request:
```bash
git push -u origin test/workflows-validation
```

4. En GitHub, crea el Pull Request

El workflow `PR Validation` debería ejecutarse automáticamente.

## 🔍 Verificar Autenticación

Para verificar que el Service Principal tiene los permisos correctos:

```bash
# Login con el Service Principal
az login --service-principal \
  -u <AZURE_CLIENT_ID> \
  -p <AZURE_CLIENT_SECRET o usar --federated-token> \
  --tenant <AZURE_TENANT_ID>

# Verificar acceso a la suscripción
az account show

# Verificar permisos
az role assignment list --assignee <AZURE_CLIENT_ID>
```

## 📚 Recursos Adicionales

- [Azure Login Action Documentation](https://github.com/Azure/login)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Service Principal Best Practices](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal)
- [OpenID Connect with Azure](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)

## ⚠️ Seguridad

- ✅ **NUNCA** commities secretos en el código
- ✅ Usa Federated Credentials en lugar de Client Secrets cuando sea posible
- ✅ Aplica el principio de mínimo privilegio (usa roles específicos, no Owner)
- ✅ Rota los secretos regularmente (cada 90 días)
- ✅ Audita el uso de Service Principals periódicamente

## 🆘 Troubleshooting

### Error: "Login failed with Error: Using auth-type: SERVICE_PRINCIPAL"

**Causa:** Los secretos `AZURE_CLIENT_ID` o `AZURE_TENANT_ID` no están configurados.

**Solución:** Verifica que los secretos estén creados correctamente en GitHub Settings → Secrets.

### Error: "Authorization failed for user"

**Causa:** El Service Principal no tiene permisos de Contributor en la suscripción.

**Solución:** Asigna el rol Contributor:
```bash
az role assignment create \
  --assignee <AZURE_CLIENT_ID> \
  --role "Contributor" \
  --scope "/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
```

### Error: "Audience validation failed"

**Causa:** Federated Credentials no están configuradas correctamente.

**Solución:** Verifica que:
- El repositorio sea `AlbertoLacambra/DXC_PoC_Nirvana`
- La rama sea `master` (o la que estés usando)
- El Entity type sea correcto (Branch o Pull request)

---

**Última actualización:** 2025-10-15  
**Autor:** GitHub Copilot  
**Versión:** 1.0
