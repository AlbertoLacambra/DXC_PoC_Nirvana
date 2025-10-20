# 🎯 Configuración de Dashboards - Datos Reales

## ✅ Estado Actual

Los Dashboards ya están completamente integrados con APIs reales. Solo falta configurar las credenciales para que funcionen con tus datos.

### Módulos Implementados

1. **🔄 Pipeline Status** - Monitoreo de GitHub Actions
2. **⚡ Infrastructure DRIFT** - Detección de cambios en Terraform

---

## 📋 Configuración Requerida

### 1️⃣ GitHub Personal Access Token (para Pipeline Status)

#### Crear el Token

1. Ve a GitHub: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configura el token:
   - **Note**: `DXC Cloud Mind - Pipeline Monitoring`
   - **Expiration**: 90 days (o lo que prefieras)
   - **Scopes**: Marca estas opciones:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `read:org` (Read org and team membership, read org projects)
4. Click en **"Generate token"**
5. **⚠️ COPIA EL TOKEN AHORA** (solo se muestra una vez)

#### Configurar el Token

Abre el archivo `.env.local` y pega tu token:

```env
# GitHub (para Pipelines Dashboard)
GITHUB_TOKEN=ghp_TU_TOKEN_AQUI_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=AlbertoLacambra
GITHUB_REPO=DXC_PoC_Nirvana
```

---

### 2️⃣ Terraform (para DRIFT Dashboard)

#### Opción A: Terraform Local (Recomendado para desarrollo)

Verifica que la ruta a tu directorio de Terraform sea correcta:

```env
# Terraform (para DRIFT Dashboard)
TERRAFORM_PATH=C:\PROYECTS\DXC_PoC_Nirvana\terraform
```

**Requisitos:**
- Terraform CLI instalado: `terraform --version`
- Credenciales de Azure configuradas: `az account show`
- Estado de Terraform inicializado: `terraform init` en el directorio

**Verificar configuración:**
```bash
cd C:\PROYECTS\DXC_PoC_Nirvana\terraform
terraform init
terraform plan -detailed-exitcode
```

Si el comando anterior funciona, ¡ya está listo! 🎉

#### Opción B: Terraform Cloud (Alternativa)

Si usas Terraform Cloud en lugar de local:

1. Ve a: https://app.terraform.io/app/settings/tokens
2. Crea un token: **"Create an API token"**
3. Configura en `.env.local`:

```env
# Terraform Cloud (alternativa a local)
TERRAFORM_CLOUD_TOKEN=tu-token-de-terraform-cloud
TERRAFORM_ORGANIZATION=tu-organizacion
TERRAFORM_WORKSPACE=tu-workspace
```

**Nota:** Si usas Terraform Cloud, comenta la línea `TERRAFORM_PATH`.

---

## 🚀 Probar la Integración

### 1. Reiniciar el servidor de desarrollo

```bash
cd C:\PROYECTS\DXC_PoC_Nirvana\apps\control-center-ui
npm run dev
```

### 2. Probar las APIs directamente

**Pipeline Status API:**
```bash
# En tu navegador o con curl:
http://localhost:3000/api/pipelines
```

Deberías ver algo como:
```json
{
  "success": true,
  "stats": {
    "totalPipelines": 15,
    "running": 2,
    "succeeded": 10,
    "failed": 2,
    "cancelled": 1
  },
  "recentRuns": [
    {
      "id": 12345,
      "name": "CI/CD Pipeline",
      "status": "succeeded",
      "branch": "master",
      "commit": "2070b52",
      "startedAt": "2025-01-28T14:30:00Z",
      "duration": "5m 30s",
      "triggeredBy": "Alberto Lacambra",
      "url": "https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/actions/runs/12345"
    }
  ],
  "lastUpdate": "2025-01-28T15:00:00Z"
}
```

**DRIFT Detection API:**
```bash
http://localhost:3000/api/drift
```

Deberías ver algo como:
```json
{
  "success": true,
  "hasChanges": false,
  "stats": {
    "totalResources": 25,
    "inSync": 25,
    "drifted": 0,
    "toAdd": 0,
    "toChange": 0,
    "toDestroy": 0
  },
  "driftedResources": [],
  "lastCheck": "2025-01-28T15:00:00Z"
}
```

### 3. Ver los Dashboards

1. Ve a: http://localhost:3000
2. Click en **"📊 Dashboards"**
3. Verás los dashboards funcionando con datos reales

**Características:**
- ✅ **Auto-refresh**: Pipeline Status se actualiza cada 30 segundos
- ✅ **Refresh manual**: Botones 🔄 para actualizar manualmente
- ✅ **Loading states**: Spinners mientras carga
- ✅ **Error handling**: Mensajes claros si algo falla
- ✅ **Empty states**: Avisos si no hay datos

---

## 🔧 Troubleshooting

### ❌ Error: "GitHub token not configured"

**Problema:** No has configurado el `GITHUB_TOKEN` en `.env.local`

**Solución:**
1. Crea el token siguiendo los pasos del punto 1️⃣
2. Pégalo en `.env.local`
3. Reinicia el servidor: `npm run dev`

### ❌ Error: "Terraform not found"

**Problema:** Terraform CLI no está instalado o no está en el PATH

**Solución:**
```bash
# Verificar instalación
terraform --version

# Si no está instalado, descarga desde:
# https://www.terraform.io/downloads

# Windows (con chocolatey):
choco install terraform

# O descarga el binario y añádelo al PATH
```

### ❌ Error: "Azure credentials not configured"

**Problema:** Terraform necesita credenciales de Azure

**Solución:**
```bash
# Login en Azure CLI
az login

# Verificar la suscripción activa
az account show

# Si necesitas cambiar de suscripción:
az account set --subscription "NOMBRE_O_ID"
```

### ❌ Error: "No workflow runs found"

**Problema:** El repositorio no tiene ninguna ejecución de GitHub Actions

**Solución:**
- Es normal si acabas de crear el repo
- Ejecuta una workflow manualmente o haz un push para trigger la CI/CD
- El dashboard mostrará el mensaje: "No hay ejecuciones recientes"

### ❌ El servidor no carga las variables de entorno

**Problema:** Cambios en `.env.local` no se reflejan

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Reinicia: `npm run dev`
3. Las variables `.env.local` solo se cargan al iniciar

---

## 📊 Próximos Pasos

Una vez que los Dashboards funcionen con datos reales:

### Fase 1: Testing ✅
- [x] Configurar GitHub token
- [x] Configurar Terraform
- [x] Probar APIs individualmente
- [x] Verificar Dashboards en UI

### Fase 2: Chat Dify (Siguiente)
- [ ] Crear app en Dify (tipo Chatbot)
- [ ] Configurar modelo (gpt-4o-mini)
- [ ] Copiar API key a `.env.local`
- [ ] Probar en `/test-chat`
- [ ] Integrar ChatWidget flotante

### Fase 3: Componentes UI
- [ ] Instalar shadcn/ui components
- [ ] Mejorar diseño de Dashboards
- [ ] Añadir más visualizaciones (gráficos, métricas)

### Fase 4: Más Módulos
- [ ] Knowledge Portal (RAG con Dify)
- [ ] FinOps Dashboard
- [ ] Vibe Coding Interface

### Fase 5: Deployment
- [ ] Build para producción
- [ ] Deploy a AKS (namespace `cloudmind`)
- [ ] Configurar Ingress
- [ ] SSL/TLS certificates

---

## 📝 Notas Importantes

### Seguridad

⚠️ **NUNCA** commits el archivo `.env.local` a Git. Ya está en `.gitignore`.

```bash
# Verificar que .env.local está ignorado:
git status

# No debería aparecer .env.local en la lista
```

### Rendimiento

- **Pipeline Status**: Auto-refresh cada 30 segundos (configurable en línea 341 de `dashboards/page.tsx`)
- **DRIFT Detection**: Manual refresh (terraform plan puede tardar varios segundos)

### Limitaciones API GitHub

- **Rate limit**: 5,000 requests/hour con token autenticado
- **Sin token**: 60 requests/hour (por IP)
- El Dashboard consume ~1 request cada 30 segundos = ~120 requests/hora

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa los logs del servidor**: Los errores aparecen en la terminal donde ejecutas `npm run dev`
2. **Revisa la consola del navegador**: Errores de frontend aparecen en DevTools (F12)
3. **Prueba las APIs directamente**: `/api/pipelines` y `/api/drift` en el navegador
4. **Verifica las credenciales**: Token válido, Terraform instalado, Azure login activo

---

## ✅ Checklist de Configuración

Antes de probar, verifica:

- [ ] GitHub Token creado y copiado en `.env.local`
- [ ] Terraform CLI instalado (`terraform --version`)
- [ ] Azure CLI configurado (`az account show`)
- [ ] Directorio de Terraform correcto en `.env.local`
- [ ] Servidor reiniciado después de cambios en `.env.local`
- [ ] Navegador apuntando a `http://localhost:3000`

Si todos los checks están ✅, ¡los Dashboards deberían funcionar! 🎉

---

**Última actualización**: 28/01/2025  
**Commit**: 2070b52 - feat: Integrate Dashboards with real-time data sources
