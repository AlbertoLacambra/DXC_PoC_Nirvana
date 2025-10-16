# 🔧 Troubleshooting - Teams Notifications

## 📋 Problema Reportado

**Síntomas**:
- ✅ Drift detection notifications funcionando (se recibe a las 05:00 UTC)
- ❌ Deployment success notifications NO aparecen
- ❌ PR approval pending notifications NO aparecen

**Canal**: DXC Cloud Mind - Nirvana (Microsoft Teams)

---

## 🔍 Diagnóstico

### 1. Verificar Webhook URL

**Paso 1**: Confirmar que el secreto está configurado

```bash
# En GitHub → Settings → Secrets and variables → Actions
# Verificar que existe: TEAMS_WEBHOOK_URL
```

**Paso 2**: Probar webhook manualmente

```bash
# Usar el script de prueba
cd scripts/
chmod +x test-teams-webhook.sh

# Opción 1: Pasar URL directamente
./test-teams-webhook.sh "https://prod-XX.westeurope.logic.azure.com/workflows/..."

# Opción 2: Usar variable de entorno
export TEAMS_WEBHOOK_URL="https://prod-XX.westeurope.logic.azure.com/workflows/..."
./test-teams-webhook.sh
```

**Resultado Esperado**: Deberías ver 3 mensajes en Teams:
1. ✅ Mensaje simple
2. ✅ Deployment success simulation
3. ⏸️ PR approval pending simulation

---

### 2. Verificar Workflow Execution

**Paso 1**: Revisar logs del último deployment

```bash
# Ir a: GitHub → Actions → 🚀 Deploy Infrastructure → [último run]
# Buscar el job: "📢 Notify Teams"
```

**Paso 2**: Verificar que el job se ejecutó

Posibles estados:
- ✅ **Success**: El mensaje se envió correctamente
- ⚠️ **Skipped**: El job no se ejecutó (verificar condiciones `if`)
- ❌ **Failed**: Error al enviar mensaje (verificar logs)

**Paso 3**: Revisar logs del step "📱 Send Teams Notification"

Buscar en logs:
```
curl -X POST \
  -H 'Content-Type: application/json' \
  ...
```

Verificar HTTP response code:
- `200 OK`: Mensaje enviado exitosamente
- `400 Bad Request`: Formato del JSON incorrecto
- `404 Not Found`: Webhook URL incorrecta
- `500 Internal Server Error`: Error en Power Automate

---

### 3. Verificar Condiciones del Job

**Workflow**: `deploy.yml`

```yaml
notify-teams:
  needs: [deploy-hub, update-docs]
  if: always()
```

**Problema Potencial**: El job `update-docs` puede estar fallando

**Solución**: Revisar logs de `update-docs` job

Si `update-docs` falla, considerar:
- Deshabilitar terraform-docs temporalmente
- Cambiar condición a: `if: needs.deploy-hub.result == 'success'`

---

### 4. Verificar Formato de Adaptive Card

**Problema**: El formato de Adaptive Card puede estar incorrecto

**Validación**: Usar el [Adaptive Cards Designer](https://adaptivecards.io/designer/)

**Payload Actual** (desde `deploy.yml`):

```json
{
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.4",
      "body": [
        {
          "type": "TextBlock",
          "text": "✅ Deployment Exitoso - Hub",
          "weight": "Bolder",
          "size": "Large",
          "color": "Good"
        },
        ...
      ],
      "actions": [...]
    }
  }]
}
```

**Verificar**:
- ✅ `version: "1.4"` es soportado por Teams
- ✅ Estructura de `body` es válida
- ✅ Colores válidos: `Good`, `Attention`, `Accent`

---

### 5. Verificar Power Automate Flow

**Paso 1**: Ir a Power Automate → My flows

**Paso 2**: Buscar el flow asociado al webhook

**Paso 3**: Verificar configuración:
- ✅ Flow está **activado** (Turned On)
- ✅ Trigger es "When a HTTP request is received"
- ✅ Acción es "Post message in a chat or channel"
- ✅ Canal de Teams configurado: "DXC Cloud Mind - Nirvana"

**Paso 4**: Revisar "Run History"
- Si no hay runs recientes → Webhook NO está recibiendo requests
- Si hay runs pero fallan → Revisar error message

---

### 6. Verificar Permisos del Webhook

**Problema Potencial**: El webhook puede no tener permisos para publicar en el canal

**Solución**:
1. En Teams → Canal "DXC Cloud Mind - Nirvana"
2. Verificar que el conector está instalado
3. Re-crear webhook si es necesario

---

## 🔧 Soluciones Propuestas

### Solución 1: Re-crear Webhook

**Pasos**:
1. Teams → Canal "DXC Cloud Mind - Nirvana" → ⋯ → Connectors
2. Buscar "Incoming Webhook"
3. Configurar nuevo webhook:
   - Nombre: "DXC Cloud Mind Deployments"
   - Upload imagen (opcional)
   - Create
4. Copiar nueva URL del webhook
5. Actualizar secreto en GitHub:
   ```
   GitHub → Settings → Secrets → TEAMS_WEBHOOK_URL → Update
   ```

### Solución 2: Simplificar Condiciones del Job

**Archivo**: `.github/workflows/deploy.yml`

**Cambio**:
```yaml
# Antes
notify-teams:
  needs: [deploy-hub, update-docs]
  if: always()

# Después
notify-teams:
  needs: [deploy-hub]
  if: always()
```

**Razón**: Eliminar dependencia de `update-docs` que puede estar fallando

### Solución 3: Agregar Debug Logging

**Archivo**: `.github/workflows/deploy.yml`

**Agregar step antes de Send Teams Notification**:

```yaml
- name: 🐛 Debug Webhook
  run: |
    echo "WEBHOOK_URL length: ${#TEAMS_WEBHOOK_URL}"
    echo "WEBHOOK_URL prefix: ${TEAMS_WEBHOOK_URL:0:50}..."
    echo "Deploy Status: ${{ needs.deploy-hub.result }}"
    echo "Docs Status: ${{ needs.update-docs.result }}"
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

### Solución 4: Usar GitHub Action en lugar de curl

**Alternativa**: Usar action `toko-bifrost/ms-teams-deploy-card@master`

```yaml
- name: 📱 Send Teams Notification
  uses: toko-bifrost/ms-teams-deploy-card@master
  if: always()
  with:
    github-token: ${{ github.token }}
    webhook-uri: ${{ secrets.TEAMS_WEBHOOK_URL }}
    card-layout-start: complete
    environment: Hub
```

---

## ✅ Checklist de Validación

### Pre-requisitos
- [ ] Webhook URL configurado en GitHub Secrets
- [ ] Webhook funciona con script de prueba
- [ ] Power Automate flow está activado
- [ ] Canal de Teams accesible

### Workflow Configuration
- [ ] Job `notify-teams` tiene `if: always()`
- [ ] Dependencies correctas (`needs:`)
- [ ] Secreto `TEAMS_WEBHOOK_URL` referenciado correctamente
- [ ] Formato de Adaptive Card válido

### Testing
- [ ] Script manual `test-teams-webhook.sh` funciona
- [ ] Deployment genera logs en "📢 Notify Teams" job
- [ ] HTTP response code es 200 OK
- [ ] Mensaje aparece en Teams

---

## 📊 Logs de Ejemplo

### ✅ Success (Expected)

```
📱 Send Teams Notification
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"attachments":[...]}' \
  "https://prod-XX.westeurope.logic.azure.com/workflows/..."
  
HTTP/1.1 200 OK
```

### ❌ Failure Examples

**404 Not Found**:
```
HTTP/1.1 404 Not Found
{"error": "Workflow not found"}
```
→ **Solución**: Verificar URL del webhook

**400 Bad Request**:
```
HTTP/1.1 400 Bad Request
{"error": "Invalid JSON"}
```
→ **Solución**: Validar formato de Adaptive Card

**500 Internal Server Error**:
```
HTTP/1.1 500 Internal Server Error
```
→ **Solución**: Verificar Power Automate flow configuration

---

## 🔗 Enlaces Útiles

- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Adaptive Cards Schema](http://adaptivecards.io/schemas/adaptive-card.json)
- [Power Automate](https://make.powerautomate.com/)
- [GitHub Actions Logs](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/actions)

---

## 📝 Notas

**Última Actualización**: Enero 2025

**Problemas Conocidos**:
- Drift detection notifications funcionando correctamente ✅
- Deployment notifications: Investigación en progreso ⏳
- PR approval notifications: Investigación en progreso ⏳

**Próximos Pasos**:
1. Ejecutar `test-teams-webhook.sh` para validar webhook
2. Revisar logs del último deployment exitoso
3. Verificar Power Automate flow run history
4. Aplicar soluciones propuestas según diagnóstico
