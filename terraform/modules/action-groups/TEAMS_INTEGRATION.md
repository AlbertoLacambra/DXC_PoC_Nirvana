# 📱 Integración de Alertas con Microsoft Teams

## 🎯 Objetivo

Configurar alertas de Azure Monitor para Microsoft Teams usando Power Automate.

---

## ✅ Requisitos Previos

- Microsoft Teams: Acceso a un equipo y canal
- Permisos: Propietario del equipo o permisos de gestión
- Power Automate: Licencia incluida en Microsoft 365

---

## 🔧 Configuración de Power Automate

### Paso 1: Crear el Flujo desde Teams

1. En Teams → Canal → **⋯** → **Flujos de trabajo**
2. Busca: **"Publicar en un canal cuando se recibe una solicitud de webhook"**
3. Clic en **Agregar flujo de trabajo**
4. Nombre: `Alertas DXC Cloud Mind`
5. Selecciona el canal
6. **¡IMPORTANTE!** Copia la URL del webhook

### Paso 2: Configurar el Flujo

El flujo debe tener 2 acciones:

1. **Disparador HTTP**:
   - When a HTTP request is received
   - Schema: Aceptar attachments array

2. **Publicar en Teams**:
   - Post adaptive card in a channel
   - Team: Tu equipo
   - Channel: Tu canal  
   - Message: `@{triggerBody()?['attachments'][0]['content']}`

### Paso 3: URL del Webhook

Formato esperado:
```
https://default[ID].environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/[WORKFLOW_ID]/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=[SIGNATURE]
```

---

## ✅ Validación del Webhook

### Prueba desde WSL/Linux

```bash
WEBHOOK_URL="TU_URL_AQUI"

curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.4",
          "body": [
            {
              "type": "TextBlock",
              "text": "🎉 Webhook Configurado",
              "weight": "Bolder",
              "size": "Large",
              "color": "Good"
            }
          ]
        }
      }
    ]
  }' \
  "$WEBHOOK_URL"
```

**Respuesta Esperada**: HTTP 202 Accepted + Mensaje en Teams ✅

---

## 🎨 Formato de Mensajes (Adaptive Cards)

### Estructura Básica

```json
{
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "Título del mensaje",
            "weight": "Bolder",
            "size": "Large"
          }
        ]
      }
    }
  ]
}
```

### Colores Disponibles

- **Good** (Verde): Éxito, operaciones correctas
- **Warning** (Amarillo): Advertencias, drift detectado
- **Attention** (Rojo): Errores críticos, fallos
- **Accent** (Azul): Información general

---

## 🔗 Integración con Terraform

### Guardar Webhook en Key Vault

```bash
az keyvault secret set \
  --vault-name dify-private-kv-9107e36a \
  --name teams-webhook-url \
  --value "https://default[ID].environment.api.powerplatform.com..."
```

### Configurar en terragrunt.hcl

```hcl
inputs = {
  teams_webhook_url = "TEAMS_WEBHOOK_URL_AQUI"
  
  email_receivers = [
    {
      name  = "admin-alberto"
      email = "alberto.lacambra@dxc.com"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### No recibo mensajes en Teams

1. Verifica que el flujo esté **Activado** (On)
2. Comprueba que tiene la acción "Publicar tarjeta adaptable"
3. Revisa el historial en [Power Automate](https://make.powerautomate.com)

### Error "attachments is of type Null"

Asegúrate de enviar el formato correcto:

```json
{
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": { /* contenido */ }
    }
  ]
}
```

---

## 📚 Referencias

- [Adaptive Cards](https://adaptivecards.io/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Power Automate Docs](https://learn.microsoft.com/es-es/power-automate/)

---

## 📝 Historial de Configuración

### 2025-10-15 - Configuración Inicial

- Webhook URL: Configurado en Power Automate ✅
- Formato: Adaptive Cards v1.4
- Validación: HTTP 202 - Funcional ✅
- Canal Teams: Configurado
- Coste: $0/mes

---

**Última actualización**: 15 de Octubre, 2025  
**Mantenido por**: DXC Cloud Mind Team
