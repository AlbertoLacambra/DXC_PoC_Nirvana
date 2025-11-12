# Azure SRE Agent Deployment Guide

## Overview

Este proyecto integra **Azure SRE Agent** - el agente oficial de Microsoft con IA para análisis de causas raíz (RCA) automático y respuesta a incidentes.

**Azure SRE Agent NO es código custom** - es un producto Preview de Microsoft que usa IA para:
- Diagnosticar y resolver problemas de producción
- Reducir Mean Time To Resolution (MTTR)
- Proporcionar RCA explicable correlacionando métricas, logs, traces y deployments
- Orquestar workflows de incidentes con aprobación humana o ejecución autónoma

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure SRE Agent (IA)                     │
│  - Natural Language Chat Interface                           │
│  - Root Cause Analysis con ML                                │
│  - Anomaly Detection                                         │
│  - Autonomous Remediation (con aprobación)                   │
└──────────────┬──────────────────────────────────────────────┘
               │
    ┌──────────┴───────────┬─────────────────┬────────────────┐
    │                      │                 │                │
    ▼                      ▼                 ▼                ▼
┌─────────┐      ┌──────────────┐   ┌────────────┐  ┌────────────┐
│ Azure   │      │ Application  │   │ PagerDuty  │  │   GitHub   │
│ Monitor │      │   Insights   │   │ ServiceNow │  │ Azure DevOps│
│ Alerts  │      │              │   │            │  │            │
└─────────┘      └──────────────┘   └────────────┘  └────────────┘
     │                   │
     │                   │
     ▼                   ▼
┌──────────────────────────────┐
│  Mindful Moments App         │
│  - App Service               │
│  - PostgreSQL                │
│  - /health endpoint          │
│  - /api/simulate/error       │
└──────────────────────────────┘
```

## Características del Azure SRE Agent

### 1. **Accelerated Root-Cause Analysis**
- Analiza metrics, logs, traces y recent deployments
- Correlación automática de eventos
- Si está conectado a source code repo, puede identificar diffs en RCA reports

### 2. **Automated Incident Response**
- Se conecta a Azure Monitor alerts automáticamente
- También soporta PagerDuty y ServiceNow
- Proporciona análisis inicial automático con IA

### 3. **Intelligent Infrastructure Insights**
- Detecta anomalías y patrones
- Revisa múltiples data sources en tiempo real
- Gestiona recursos across multiple subscriptions

### 4. **Automated Mitigation**
- Ejecuta tareas autónomas **CON TU APROBACIÓN**
- Detección proactiva de issues comunes
- Incrementa uptime con remediation automática

### 5. **Natural Language Insights**
- Chat interface en lenguaje natural
- Ejemplos:
  - "What changed in production in last 24 hours?"
  - "Why is my app slow?"
  - "What alerts are active now?"

### 6. **Dev Work Item Creation**
- Integración con GitHub/Azure DevOps
- Crea issues/work items automáticamente
- Incluye repro steps, logs, suspects

## Prerequisites

### 1. Azure Subscription Requirements
- Azure account con active subscription
- User account con `Microsoft.Authorization/roleAssignments/write` permissions:
  - **Role Based Access Control Administrator** o
  - **User Access Administrator**

### 2. Register Required Namespace
```bash
az provider register --namespace "Microsoft.App"
```

### 3. Firewall Settings
Añadir `*.azuresre.ai` al allowlist en firewall settings.

### 4. Regional Availability
Durante el Preview, Azure SRE Agent solo está disponible en:
- **East US 2** ✅ RECOMENDADO
- **Sweden Central**
- **Australia East**

**Importante**: El agente puede monitorizar recursos en **cualquier región de Azure**, solo el agente mismo debe estar en estas regiones.

## Deployment Steps

### Paso 1: Crear Azure SRE Agent via Portal

1. Abrir [Azure SRE Agent Portal](https://aka.ms/sreagent/portal)

2. Click **Create**

3. En **Project details**:
   - **Subscription**: Seleccionar tu subscription
   - **Resource group**: `rg-sre-agent` (crear nuevo, separado de la app)

4. En **Agent details**:
   - **Agent name**: `sre-agent-mindful-moments`
   - **Region**: **East US 2**

5. Click **Choose resource groups**

6. Seleccionar el checkbox de:
   - ✅ `rg-mindful-moments-dev` (nuestro resource group de la app)

7. Click **Save** → **Create**

El proceso de deployment creará automáticamente:
- Azure Application Insights (para el agente)
- Log Analytics workspace (para el agente)
- Managed Identity (para acceso a recursos)

### Paso 2: Configurar Incident Management

#### Opción A: Azure Monitor (Default - Ya configurado)
El agente se conecta automáticamente a Azure Monitor alerts existentes:
- HTTP 5xx errors alert
- Response time alert
- Availability alert
- Health check failures

#### Opción B: PagerDuty Integration (Opcional)
1. En el Azure SRE Agent resource → **Incident management** tab
2. Select **Incident platform** dropdown → **PagerDuty**
3. Enter PagerDuty API key
4. Click **Save**

#### Opción C: ServiceNow Integration (Opcional)
Similar a PagerDuty, disponible en el mismo dropdown.

### Paso 3: Configurar Source Code Integration (Opcional)

Para RCA reports mejorados con código:

1. En Azure SRE Agent resource → **Settings** tab
2. Select **Source code repository**
3. Opciones:
   - **GitHub**: Conectar repo `AlbertoLacambra/DXC_PoC_Nirvana`
   - **Azure DevOps**: Conectar project

Beneficios:
- RCA reports incluyen code diffs
- Pinpoint exact commits que causaron issues
- Auto-create GitHub issues con repro steps

### Paso 4: Configurar Custom Instructions (Opcional)

Puedes personalizar el comportamiento del agente:

1. En Azure SRE Agent → **Settings** → **Instructions**
2. Agregar custom runbooks/procedures:
   ```
   When HTTP 5xx errors exceed 10 in 5 minutes:
   1. Check App Service logs for exceptions
   2. Verify PostgreSQL connection pool
   3. If database connection issues, suggest restart
   4. Create GitHub issue with full diagnostic
   ```

## Using Azure SRE Agent

### Chat Interface

1. En Azure Portal → Search "Azure SRE Agent"
2. Select tu agente: `sre-agent-mindful-moments`
3. Chat window se abre

#### Comandos útiles:

**Health & Status**:
```
What's the CPU and memory utilization of my app?
Which resources are unhealthy?
Show me current active alerts
```

**Diagnostics**:
```
Why is app-mindful-moments-dev slow?
Investigate recent errors in my App Service
What changed in my web app last 24 hours?
```

**Metrics & Visualization**:
```
Show me a visualization of 2xx requests vs HTTP errors
Get me the response time of app-mindful-moments-dev
Compare today's traffic with last week
```

**Incident Response**:
```
What's the root cause of the current 5xx errors?
Recommend mitigation for high memory usage
Create a GitHub issue for this incident
```

### Autonomous Actions (Require Approval)

Cuando el agente sugiere acciones:
1. Review la propuesta en el chat
2. El agente explica qué hará y por qué
3. **Aprobar o rechazar** la acción
4. Si apruebas, el agente ejecuta automáticamente
5. Recibes confirmación y logs de la ejecución

## Testing Azure SRE Agent

### Test 1: Simular Error y RCA

```bash
# Generar errores 500
for i in {1..10}; do
  curl https://app-mindful-moments-dev.azurewebsites.net/api/simulate/error
  sleep 2
done
```

**Resultado esperado**:
1. Azure Monitor alert se dispara (HTTP 5xx > 5 en 5 min)
2. Azure SRE Agent recibe el alert automáticamente
3. Pregunta al agente: "What's happening with my app?"
4. El agente responde con:
   - RCA explicable (correlating logs, metrics, traces)
   - Possible root causes
   - Suggested mitigation steps
   - Option to auto-remediate

### Test 2: Slow Response Analysis

```bash
curl "https://app-mindful-moments-dev.azurewebsites.net/api/simulate/slow?delay=6000"
```

**Pregunta al agente**:
```
Why is my app responding slowly?
```

**El agente analizará**:
- Response time metrics
- CPU/Memory usage patterns
- Database query performance
- Recent deployments
- Network latency

### Test 3: Health Check Failure

```bash
# Stop app temporalmente
az webapp stop --name app-mindful-moments-dev --resource-group rg-mindful-moments-dev
```

**Pregunta inmediatamente**:
```
What's the status of my resources?
```

**El agente detectará**:
- Health check failures
- Availability drop
- Proporcionará timeline del incidente

```bash
# Restart app
az webapp start --name app-mindful-moments-dev --resource-group rg-mindful-moments-dev
```

### Test 4: Daily Health Summary

El agente envía summaries diarios automáticamente. Ejemplo de preguntas:
```
Give me yesterday's health summary
What were the top issues last week?
Show me CPU spike patterns from last month
```

## Pricing (Preview)

**Azure Agent Units (AAU)** - Pay-as-you-go

Componentes:
1. **Fixed always-on flow**: Monitorización continua
2. **Usage-based active flow**: Cuando IA analiza activamente

**Estimate para Mindful Moments**:
- Always-on monitoring: ~€5-10/mes
- Active incidents (assuming 10/mes): ~€3-5/mes
- **Total estimado**: €8-15/mes

*Nota: Pricing en preview puede cambiar en GA*

## Monitoring the SRE Agent

### View Agent Activity
1. Azure Portal → Azure SRE Agent → `sre-agent-mindful-moments`
2. **Overview** tab muestra:
   - Recent chat conversations
   - Incidents handled
   - Actions taken (with approvals)
   - Resource health summary

### View Logs
```bash
# Agent's own Application Insights
az monitor app-insights component show \
  --app <agent-app-insights-name> \
  --resource-group rg-sre-agent \
  --query instrumentationKey
```

## Integrations Summary

| Service | Purpose | Status |
|---------|---------|--------|
| **Azure Monitor** | Alert ingestion | ✅ Auto-configured |
| **Application Insights** | Metrics, traces, logs | ✅ Configured |
| **PagerDuty** | External incident mgmt | ⚙️ Optional |
| **ServiceNow** | Enterprise ITSM | ⚙️ Optional |
| **GitHub** | Work items, code RCA | ⚙️ Optional |
| **Azure DevOps** | Work items, pipelines | ⚙️ Optional |

## Comparison: Custom vs Official

| Feature | Custom Logic Apps/Runbooks | Azure SRE Agent (IA) |
|---------|---------------------------|----------------------|
| Root Cause Analysis | ❌ No | ✅ IA-powered |
| Learning from history | ❌ No | ✅ ML models |
| Natural language | ❌ No | ✅ Yes |
| Code-aware RCA | ❌ No | ✅ GitHub integration |
| Maintenance | 🔧 Manual | ✅ Microsoft-managed |
| Cost | ~€5/mes | ~€10-15/mes |
| Complexity | 🔴 High | 🟢 Low |

## Troubleshooting

### Agent not seeing my resources
```bash
# Verificar permisos del managed identity
az role assignment list --assignee <agent-managed-identity-principal-id>
```

El agente debe tener **Reader** permission en `rg-mindful-moments-dev`.

### Chat not responding
1. Check firewall permite `*.azuresre.ai`
2. Verify agent está en región correcta (East US 2)
3. Check Azure service health status

### Incident not auto-detected
1. Verify Azure Monitor alerts están firing correctamente
2. Check agent está conectado en Incident management tab
3. Review agent logs en Application Insights

## Next Steps

1. ✅ **Deploy Azure SRE Agent** siguiendo pasos arriba
2. 🔗 **Connect GitHub repo** para code-aware RCA
3. 📊 **Configure custom dashboards** en Azure Monitor
4. 🤖 **Create custom instructions** para automated workflows
5. 📱 **Setup PagerDuty** para escalations (opcional)
6. 📞 **Add Twilio** para phone notifications (via custom Logic App complementario)

## References

- [Azure SRE Agent Official Page](https://azure.microsoft.com/en-us/products/sre-agent)
- [Azure SRE Agent Documentation](https://learn.microsoft.com/en-us/azure/sre-agent/)
- [Create and Use Agent Guide](https://learn.microsoft.com/en-us/azure/sre-agent/usage)
- [Troubleshoot Azure App Service](https://learn.microsoft.com/en-us/azure/sre-agent/troubleshoot-azure-app-service)
- [Azure SRE Agent Billing](https://learn.microsoft.com/en-us/azure/sre-agent/billing)
- [Preview Terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)

## Important Notes

⚠️ **Preview Status**: Azure SRE Agent está en Preview. Features pueden cambiar.

🔒 **Approvals Required**: Por defecto, el agente requiere aprobación humana para acciones. Esto se puede configurar por action type.

🌍 **Regional Limitation**: Durante preview, solo East US 2, Sweden Central, Australia East. El agente puede gestionar recursos en cualquier región.

🇬🇧 **English Only**: El chat interface solo soporta inglés durante preview.

📅 **Billing Start**: Preview billing comenzó September 1, 2025.
