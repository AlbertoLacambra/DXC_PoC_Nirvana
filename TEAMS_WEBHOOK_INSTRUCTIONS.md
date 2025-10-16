# 🔑 Instrucciones para Obtener el Teams Webhook URL

## Opción 1: Desde GitHub Secrets (Si ya está configurado)

1. **Ve a GitHub Settings**:
   ```
   https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/settings/secrets/actions
   ```

2. **Busca el secreto**: `TEAMS_WEBHOOK_URL`

3. **Si existe**: Copia la URL (no podrás verla completa, pero puedes actualizarla)

---

## Opción 2: Crear Nuevo Webhook en Teams

### Paso a Paso:

1. **Abre Microsoft Teams**

2. **Ve al canal**: `DXC Cloud Mind - Nirvana`

3. **Click en los 3 puntos** (⋯) al lado del nombre del canal

4. **Selecciona**: `Connectors` o `Conectores`

5. **Busca**: `Incoming Webhook`

6. **Click**: `Configure` o `Configurar`

7. **Rellena el formulario**:
   ```
   Nombre: DXC Cloud Mind - Deployments
   Upload imagen (opcional): Logo de DXC o Azure
   ```

8. **Click**: `Create` o `Crear`

9. **Copia la URL del webhook**:
   ```
   https://prod-XX.westeurope.logic.azure.com/workflows/XXXXXXXXX/...
   ```

10. **IMPORTANTE**: Guarda esta URL (la necesitarás para GitHub Secrets)

---

## Opción 3: Desde Power Automate

Si el webhook fue creado con Power Automate:

1. **Ve a**: https://make.powerautomate.com/

2. **My flows** → Busca el flow de Teams

3. **Edit** → Copia la URL del trigger HTTP

---

## 📝 Una vez tengas la URL:

### Probar localmente:

```bash
# Exporta la variable
export TEAMS_WEBHOOK_URL="https://prod-XX.westeurope.logic.azure.com/workflows/..."

# Ejecuta el test
./scripts/test-teams-webhook.sh

# Deberías ver 3 mensajes en Teams
```

### Actualizar GitHub Secret:

1. Ve a: https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/settings/secrets/actions

2. Si existe `TEAMS_WEBHOOK_URL`:
   - Click en el secreto
   - Click `Update`
   - Pega la nueva URL
   - Click `Update secret`

3. Si NO existe:
   - Click `New repository secret`
   - Name: `TEAMS_WEBHOOK_URL`
   - Secret: `<pega-la-url-del-webhook>`
   - Click `Add secret`

---

## ✅ Verificar que funciona:

Después de ejecutar el script, deberías ver en Teams:

1. ✅ **TEST - Webhook Funcionando**
2. ✅ **Deployment Exitoso - Hub (TEST)**
3. ⏸️ **Aprobación Pendiente - Pull Request (TEST)**

Si ves los 3 mensajes: **¡El webhook funciona correctamente!** 🎉

---

## 🐛 Troubleshooting

Si no ves mensajes:

1. **Verifica la URL**: Debe empezar con `https://prod-` o `https://outlook.office.com/webhook/`

2. **Verifica permisos**: El webhook debe tener permisos para publicar en el canal

3. **Revisa el script output**: Debería mostrar `HTTP 200 OK`

4. **Consulta la guía completa**: `TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md`

---

**¿Listo para probar?**

```bash
# 1. Obtén la URL del webhook (arriba)
# 2. Exporta la variable
export TEAMS_WEBHOOK_URL="<tu-webhook-url>"

# 3. Ejecuta el test
./scripts/test-teams-webhook.sh
```
