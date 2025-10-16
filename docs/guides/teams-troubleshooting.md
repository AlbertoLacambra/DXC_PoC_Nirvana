# Troubleshooting Teams Notifications

## Problemas Comunes

### 1. No Llegan Notificaciones

#### Verificar Webhook URL

```bash
# Test básico
curl -H "Content-Type: application/json" \
  -d '{"text":"Test"}' \
  $TEAMS_WEBHOOK_URL

# Respuesta esperada: "1"
```

#### Verificar Secret en GitHub

```yaml
# GitHub Repo → Settings → Secrets → Actions
# Verificar que TEAMS_WEBHOOK_URL existe
```

#### Verificar Workflow Configuration

```yaml
- name: Notify Teams
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
  run: |
    # Verificar que la variable está disponible
    echo "URL length: ${#TEAMS_WEBHOOK_URL}"
```

### 2. Notificaciones Incompletas

#### Verificar Formato Adaptive Card

```json
{
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "type": "AdaptiveCard",
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.4",
      "body": [...]
    }
  }]
}
```

#### Test con Script

```bash
# Ejecutar test script
export TEAMS_WEBHOOK_URL="<your-webhook-url>"
./scripts/test-teams-webhook.sh
```

### 3. Error 400 Bad Request

**Causa**: JSON malformado

**Solución**: Validar JSON

```bash
# Validar JSON antes de enviar
echo $JSON | jq .
```

### 4. Error 403 Forbidden

**Causa**: Webhook URL expirado o eliminado

**Solución**: Regenerar webhook en Teams

1. Teams → Canal → ⋯ → Connectors
2. Incoming Webhook → Configure
3. Regenerar URL

## Diagnóstico

### Script de Diagnóstico

```bash
#!/bin/bash
# diagnose-teams.sh

echo "1. Testing webhook URL..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}' \
  $TEAMS_WEBHOOK_URL)

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Webhook is accessible"
else
  echo "❌ Webhook returned: $RESPONSE"
fi

echo "2. Testing from workflow..."
gh workflow run deploy.yml
```

### Logs de GitHub Actions

```bash
# Ver logs del último run
gh run list --workflow=deploy.yml --limit 1
gh run view <run-id> --log
```

## Referencias

- [Test Script](../../scripts/test-teams-webhook.sh)
- [Workflows](../cicd/workflows.md)
- [Secrets Setup](secrets-setup.md)
