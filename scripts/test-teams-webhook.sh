#!/bin/bash

# Script para probar el webhook de Teams manualmente
# Uso: ./test-teams-webhook.sh <WEBHOOK_URL>

WEBHOOK_URL="${1:-$TEAMS_WEBHOOK_URL}"

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Error: Se requiere la URL del webhook"
  echo "Uso: $0 <WEBHOOK_URL>"
  echo "  o: export TEAMS_WEBHOOK_URL='...' && $0"
  exit 1
fi

echo "📱 Enviando mensaje de prueba a Teams..."
echo "🔗 Webhook: ${WEBHOOK_URL:0:50}..."

# Test 1: Mensaje simple
echo ""
echo "📤 Test 1: Mensaje Simple"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "attachments": [{
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "✅ TEST - Webhook Funcionando",
            "weight": "Bolder",
            "size": "Large",
            "color": "Good"
          },
          {
            "type": "TextBlock",
            "text": "Este es un mensaje de prueba del webhook de DXC Cloud Mind",
            "wrap": true
          }
        ]
      }
    }]
  }' \
  "$WEBHOOK_URL")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Test 1 exitoso (HTTP $HTTP_CODE)"
else
  echo "❌ Test 1 fallido (HTTP $HTTP_CODE)"
  echo "Respuesta: $BODY"
fi

# Test 2: Mensaje completo como en deployment
echo ""
echo "📤 Test 2: Simulación Deployment Success"
sleep 2

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "attachments": [{
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "✅ Deployment Exitoso - Hub (TEST)",
            "weight": "Bolder",
            "size": "Large",
            "color": "Good"
          },
          {
            "type": "TextBlock",
            "text": "Deployment de infraestructura completado",
            "wrap": true
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "🎯 Entorno:",
                "value": "Hub"
              },
              {
                "title": "👤 Actor:",
                "value": "test-user"
              },
              {
                "title": "🌿 Branch:",
                "value": "master"
              },
              {
                "title": "📊 Estado Deploy:",
                "value": "success"
              },
              {
                "title": "⏱️ Timestamp:",
                "value": "'"$(date -u +"%Y-%m-%d %H:%M:%S UTC")"'"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "Ver Documentación",
            "url": "https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana"
          }
        ]
      }
    }]
  }' \
  "$WEBHOOK_URL")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Test 2 exitoso (HTTP $HTTP_CODE)"
else
  echo "❌ Test 2 fallido (HTTP $HTTP_CODE)"
  echo "Respuesta: $BODY"
fi

# Test 3: Simulación PR Approval Pending
echo ""
echo "📤 Test 3: Simulación PR Approval Pending"
sleep 2

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "attachments": [{
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "⏸️ Aprobación Pendiente - Pull Request (TEST)",
            "weight": "Bolder",
            "size": "Large",
            "color": "Accent"
          },
          {
            "type": "TextBlock",
            "text": "Se requiere revisión y aprobación para el siguiente PR",
            "wrap": true
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "📝 PR:",
                "value": "#123"
              },
              {
                "title": "👤 Autor:",
                "value": "test-user"
              },
              {
                "title": "✅ Checks Pasados:",
                "value": "6/6"
              },
              {
                "title": "⏱️ Timestamp:",
                "value": "'"$(date -u +"%Y-%m-%d %H:%M:%S UTC")"'"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "Revisar PR",
            "url": "https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/pulls"
          }
        ]
      }
    }]
  }' \
  "$WEBHOOK_URL")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Test 3 exitoso (HTTP $HTTP_CODE)"
else
  echo "❌ Test 3 fallido (HTTP $HTTP_CODE)"
  echo "Respuesta: $BODY"
fi

echo ""
echo "=========================================="
echo "📊 Resumen de Tests:"
echo "=========================================="
echo "Revisa el canal de Teams 'DXC Cloud Mind - Nirvana'"
echo "Deberías ver 3 mensajes de prueba:"
echo "  1. ✅ Mensaje simple"
echo "  2. ✅ Simulación deployment success"
echo "  3. ⏸️ Simulación PR approval pending"
echo ""
echo "Si NO aparecen los mensajes, verifica:"
echo "  • URL del webhook es correcta"
echo "  • Permisos del webhook en Power Automate"
echo "  • Canal de Teams configurado correctamente"
