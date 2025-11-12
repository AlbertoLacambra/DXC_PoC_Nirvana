# 🤖 Azure SRE Agent Integration Project - Especificación Completa

## 📋 **Resumen Ejecutivo**

Proyecto para implementar una infraestructura cloud completa en Azure con aplicación dummy (estilo Mindfulness), totalmente automatizada con Terraform, CI/CD con GitHub Actions, y monitorizada/gestionada por el Azure SRE Agent con capacidades de respuesta autónoma a incidentes incluyendo notificaciones telefónicas on-call.

**Budget**: 120€ máximo mensual  
**Subscription**: `353a6255-27a8-4733-adf0-1c531ba9f4e9`  
**Repository**: GitHub - AlbertoLacambra  
**Control Center**: http://localhost:3000/projects/new

---

## 🎯 **Objetivos del Proyecto**

1. ✅ Infraestructura Azure automatizada con Terraform (IaC)
2. ✅ Aplicación web dummy con database y storage
3. ✅ CI/CD completo con GitHub Actions
4. ✅ Azure SRE Agent configurado y operativo
5. ✅ Alerting con llamadas telefónicas (on-call simulation)
6. ✅ Monitorización completa con Azure Monitor
7. ✅ RCA automático y mitigación de incidentes
8. ✅ Integración con PagerDuty (o simulación)

---

## 🏗️ **Arquitectura de la Solución**

### **1. Stack Tecnológico**

#### **Infraestructura (Azure)**
- **App Service**: Web App Linux (Node.js/Python) - SKU B1 (Basic)
- **Azure Database for PostgreSQL**: Flexible Server - B1ms (Burstable)
- **Azure Storage**: Standard LRS (Blob Storage)
- **Azure Monitor**: Application Insights + Log Analytics Workspace
- **Azure Key Vault**: Secretos y configuración sensible
- **Azure Virtual Network**: Subnet privada para database
- **Azure SRE Agent**: Gestión autónoma de incidentes

#### **Aplicación Dummy - "Mindful Moments"**
- **Frontend**: React + TypeScript (Next.js)
- **Backend**: Node.js/Express o Python/FastAPI
- **Features**:
  - CRUD de "momentos mindfulness" (texto + imagen)
  - Almacenamiento en PostgreSQL
  - Imágenes en Blob Storage
  - Health checks endpoint
  - Métricas expuestas para monitoring
  - Endpoints para simular errores (testing SRE Agent)

#### **DevOps & Automation**
- **IaC**: Terraform v1.7+ con módulos reutilizables
- **CI/CD**: GitHub Actions workflows
- **State Management**: Azure Storage Account (Terraform Remote State)
- **Secrets**: GitHub Secrets + Azure Key Vault
- **Monitoring**: Azure Monitor + Application Insights
- **Alerting**: Azure Monitor Alerts → PagerDuty → Phone call simulation

---

### **2. Estimación de Costes (Budget-Aware)**

| Recurso | SKU | Coste Mensual Aprox. |
|---------|-----|---------------------|
| App Service | B1 (Linux) | ~13€ |
| PostgreSQL Flexible | B1ms (1 vCore, 2GB RAM) | ~20€ |
| Storage Account | Standard LRS | ~2€ |
| Azure Monitor | Log Analytics (5GB free/month) | ~5€ |
| Key Vault | Standard | ~1€ |
| Virtual Network | Standard | ~0€ (incluido) |
| Azure SRE Agent | Pay-per-use (AAUs) | ~10-15€ |
| Application Insights | 5GB free | ~5€ |
| **TOTAL ESTIMADO** | | **~56-61€/mes** |

**Margen de seguridad**: 120€ - 61€ = **59€ restantes** ✅

**Optimizaciones aplicadas**:
- B1 tier en vez de P1V2 (ahorro ~80€)
- Burstable tier para PostgreSQL (ahorro ~60€)
- Auto-scaling deshabilitado inicialmente
- Retention de logs reducido a 30 días

---

## 📐 **Diseño de Infraestructura (Terraform)**

### **Estructura de Proyecto**

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars (gitignored)
│   │   └── backend.tf
│   └── prod/ (opcional, para futuro)
├── modules/
│   ├── networking/
│   │   ├── main.tf (VNet, Subnets, NSG)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── app-service/
│   │   ├── main.tf (App Service Plan + Web App)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf (PostgreSQL Flexible Server)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/
│   │   ├── main.tf (Storage Account + Containers)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── monitoring/
│   │   ├── main.tf (Log Analytics, App Insights, Alerts)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── key-vault/
│   │   ├── main.tf (Key Vault + Secrets)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── sre-agent/
│       ├── main.tf (SRE Agent configuration)
│       ├── variables.tf
│       └── outputs.tf
├── scripts/
│   ├── setup-backend.sh (crear storage para tfstate)
│   └── init-env.sh (inicializar environment)
└── README.md
```

### **Recursos de Terraform**

#### **1. Networking Module**
```hcl
# Virtual Network con subnets privadas
resource "azurerm_virtual_network" "main" {
  name                = "vnet-mindful-moments-${var.environment}"
  address_space       = ["10.0.0.0/16"]
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  address_prefixes     = ["10.0.1.0/24"]
  virtual_network_name = azurerm_virtual_network.main.name
  resource_group_name  = azurerm_resource_group.main.name
  
  delegation {
    name = "app-service-delegation"
    service_delegation {
      name = "Microsoft.Web/serverFarms"
    }
  }
}

resource "azurerm_subnet" "database" {
  name                 = "snet-database"
  address_prefixes     = ["10.0.2.0/24"]
  virtual_network_name = azurerm_virtual_network.main.name
  resource_group_name  = azurerm_resource_group.main.name
  
  delegation {
    name = "postgresql-delegation"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
    }
  }
}

# Network Security Group para database
resource "azurerm_network_security_group" "database" {
  name                = "nsg-database-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "AllowAppServicePostgreSQL"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = "10.0.1.0/24"
    destination_address_prefix = "*"
  }
}
```

#### **2. App Service Module**
```hcl
# App Service Plan - B1 tier (budget-friendly)
resource "azurerm_service_plan" "main" {
  name                = "asp-mindful-moments-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"  # 1 core, 1.75GB RAM
}

# Linux Web App
resource "azurerm_linux_web_app" "main" {
  name                = "app-mindful-moments-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on        = true
    
    application_stack {
      node_version = "20-lts"  # o python_version = "3.11"
    }

    health_check_path = "/health"
    
    # Configuración para VNet integration
    vnet_route_all_enabled = true
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "20-lts"
    "DATABASE_HOST"                = var.database_host
    "DATABASE_NAME"                = var.database_name
    "DATABASE_USER"                = "@Microsoft.KeyVault(SecretUri=${var.db_user_secret_uri})"
    "DATABASE_PASSWORD"            = "@Microsoft.KeyVault(SecretUri=${var.db_password_secret_uri})"
    "STORAGE_CONNECTION_STRING"    = "@Microsoft.KeyVault(SecretUri=${var.storage_secret_uri})"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.appinsights_connection_string
  }

  identity {
    type = "SystemAssigned"
  }

  logs {
    application_logs {
      file_system_level = "Information"
    }
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }
}

# VNet Integration
resource "azurerm_app_service_virtual_network_swift_connection" "main" {
  app_service_id = azurerm_linux_web_app.main.id
  subnet_id      = var.app_subnet_id
}
```

#### **3. Database Module**
```hcl
# PostgreSQL Flexible Server - Burstable tier
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-mindful-moments-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  administrator_login    = "psqladmin"
  administrator_password = var.admin_password  # From Key Vault
  
  sku_name   = "B_Standard_B1ms"  # 1 vCore, 2GB RAM - BUDGET FRIENDLY
  storage_mb = 32768  # 32GB

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false  # Cost optimization
  
  delegated_subnet_id = var.database_subnet_id
  private_dns_zone_id = azurerm_private_dns_zone.postgresql.id

  lifecycle {
    ignore_changes = [
      administrator_password,
    ]
  }
}

# Private DNS Zone para PostgreSQL
resource "azurerm_private_dns_zone" "postgresql" {
  name                = "privatelink.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgresql" {
  name                  = "pdnsz-link-postgresql"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.postgresql.name
  virtual_network_id    = var.vnet_id
}

# Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "mindfulmoments"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
```

#### **4. Storage Module**
```hcl
# Storage Account para imágenes
resource "azurerm_storage_account" "main" {
  name                     = "stmindful${var.environment}${random_string.suffix.result}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"  # Locally redundant - cost optimization
  
  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 7
    }
  }

  network_rules {
    default_action             = "Deny"
    ip_rules                   = []
    virtual_network_subnet_ids = [var.app_subnet_id]
    bypass                     = ["AzureServices"]
  }
}

# Container para imágenes de usuarios
resource "azurerm_storage_container" "images" {
  name                  = "mindful-images"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Managed Identity access
resource "azurerm_role_assignment" "storage_blob_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = var.app_managed_identity_principal_id
}
```

#### **5. Monitoring Module**
```hcl
# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-mindful-moments-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 30  # Cost optimization
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "appi-mindful-moments-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  
  daily_data_cap_in_gb = 5  # Free tier limit
}

# Alert - High Response Time
resource "azurerm_monitor_metric_alert" "high_response_time" {
  name                = "alert-high-response-time"
  resource_group_name = var.resource_group_name
  scopes              = [var.app_service_id]
  description         = "Alert when response time exceeds threshold"
  severity            = 2
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 5  # 5 seconds
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_team.id
  }
}

# Alert - HTTP 5xx Errors
resource "azurerm_monitor_metric_alert" "http_5xx" {
  name                = "alert-http-5xx-errors"
  resource_group_name = var.resource_group_name
  scopes              = [var.app_service_id]
  description         = "Alert on HTTP 500 errors"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 10
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_team.id
  }
}

# Alert - Database Connection Failures
resource "azurerm_monitor_metric_alert" "db_connection_fail" {
  name                = "alert-db-connection-failures"
  resource_group_name = var.resource_group_name
  scopes              = [var.database_id]
  description         = "Alert on database connection failures"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "connections_failed"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_team.id
  }
}

# Action Group - Integración con PagerDuty y Azure SRE Agent
resource "azurerm_monitor_action_group" "sre_team" {
  name                = "ag-sre-team-${var.environment}"
  resource_group_name = var.resource_group_name
  short_name          = "SRETeam"

  # Email notification
  email_receiver {
    name          = "SRE Team Email"
    email_address = var.sre_team_email
  }

  # Webhook para Azure SRE Agent
  webhook_receiver {
    name        = "Azure SRE Agent"
    service_uri = var.sre_agent_webhook_uri
  }

  # Azure Function para Phone Call (simulación)
  azure_function_receiver {
    name                     = "OnCall Phone Alert"
    function_app_resource_id = var.phone_alert_function_id
    function_name            = "SendPhoneAlert"
    http_trigger_url         = var.phone_alert_function_url
  }
}
```

#### **6. Key Vault Module**
```hcl
# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "kv-mindful-${var.environment}-${random_string.suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  purge_protection_enabled   = false  # Dev environment
  soft_delete_retention_days = 7

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    ip_rules       = []
    virtual_network_subnet_ids = [var.app_subnet_id]
  }
}

# Access Policy para App Service Managed Identity
resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = var.app_managed_identity_principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Secrets
resource "azurerm_key_vault_secret" "db_password" {
  name         = "database-password"
  value        = random_password.db_password.result
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "db_user" {
  name         = "database-user"
  value        = "psqladmin"
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "storage_connection" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id
}
```

---

## 🔧 **Azure SRE Agent - Configuración**

### **Capacidades a Habilitar**

#### **1. Application Resource Mapping**
- Mapeo automático de App Service + Database + Storage
- Visualización de dependencias entre recursos
- Detección de configuraciones subóptimas

#### **2. Query & Diagnostics**
- Consultas sobre configuración de recursos
- Análisis de métricas de performance
- Revisión de logs en tiempo real
- Queries con lenguaje natural

#### **3. Root Cause Analysis (RCA)**
- Análisis automático de logs ante alertas
- Correlación de eventos entre recursos
- Identificación de patrones históricos
- Generación de reportes de incidentes

#### **4. Incident Mitigation (con aprobación)**
- Restart de App Service ante alta latencia
- Scale up temporal ante carga alta
- Limpieza de conexiones idle en database
- Rollback de deployment reciente

#### **5. Autonomous Incident Handling**
- Resolución automática de incidentes conocidos
- Ejecución de runbooks predefinidos
- Auto-healing de recursos

### **Configuración del SRE Agent**

```yaml
# Azure SRE Agent Configuration
agent_name: "mindful-moments-sre-agent"
subscription_id: "353a6255-27a8-4733-adf0-1c531ba9f4e9"
resource_group: "rg-mindful-moments-dev"

# Monitored Resources
resources:
  - type: "Microsoft.Web/sites"
    name: "app-mindful-moments-dev"
    monitoring_enabled: true
    auto_healing: true
    
  - type: "Microsoft.DBforPostgreSQL/flexibleServers"
    name: "psql-mindful-moments-dev"
    monitoring_enabled: true
    auto_healing: true
    
  - type: "Microsoft.Storage/storageAccounts"
    name: "stmindfuldev*"
    monitoring_enabled: true

# Runbooks (respuesta automática)
runbooks:
  - name: "Restart App Service on High Response Time"
    trigger:
      alert: "alert-high-response-time"
      condition: "ResponseTime > 5s for 5 minutes"
    actions:
      - type: "restart"
        resource: "app-mindful-moments-dev"
        approval_required: false  # Auto-restart
        
  - name: "Scale Up on High CPU"
    trigger:
      alert: "alert-high-cpu"
      condition: "CPU > 80% for 10 minutes"
    actions:
      - type: "scale"
        resource: "app-mindful-moments-dev"
        target_sku: "B2"
        approval_required: true  # Requiere aprobación (coste)
        
  - name: "Clear Database Connections"
    trigger:
      alert: "alert-db-connection-fail"
      condition: "Connection failures > 5 in 5 minutes"
    actions:
      - type: "execute_query"
        resource: "psql-mindful-moments-dev"
        query: "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '1 hour';"
        approval_required: true

# Integrations
integrations:
  azure_monitor:
    enabled: true
    workspace_id: "${log_analytics_workspace_id}"
    
  github:
    enabled: true
    repository: "AlbertoLacambra/mindful-moments-infrastructure"
    create_issues: true
    create_pull_requests: true  # Auto-fix con GitHub Copilot
    
  pagerduty:
    enabled: true
    integration_key: "${pagerduty_integration_key}"
    service_id: "${pagerduty_service_id}"

# Permissions (RBAC)
permissions:
  read_access:
    - "Monitoring Reader"
    - "Log Analytics Reader"
  write_access:
    - "Contributor"  # Limitado a RG específico
  approval_roles:
    - "Owner"
```

---

## 📞 **Sistema de Alerting con Llamadas Telefónicas**

### **Arquitectura de Notificación**

```
Azure Monitor Alert
    ↓
Action Group
    ↓
Azure Function (HTTP Trigger)
    ↓
Twilio API / Azure Communication Services
    ↓
☎️ Llamada Telefónica a On-Call Engineer
```

### **Implementación con Azure Function**

```typescript
// Azure Function: SendPhoneAlert
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import twilio from "twilio";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("Phone alert triggered");

  const alertData = req.body;
  
  // Parse alert data
  const {
    alertName,
    severity,
    resourceName,
    description,
    firedDateTime
  } = alertData.data.essentials;

  // Twilio configuration
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.ONCALL_PHONE_NUMBER;

  const client = twilio(accountSid, authToken);

  // Generate TwiML for voice message
  const twiml = `
    <Response>
      <Say voice="alice">
        Alert triggered in Azure. 
        Alert name: ${alertName}.
        Severity: ${severity}.
        Resource: ${resourceName}.
        Description: ${description}.
        Please check the Azure SRE Agent dashboard for details.
      </Say>
      <Say>Press 1 to acknowledge the alert.</Say>
      <Gather numDigits="1" action="${process.env.ACKNOWLEDGE_WEBHOOK_URL}">
        <Say>Waiting for input...</Say>
      </Gather>
    </Response>
  `;

  try {
    const call = await client.calls.create({
      twiml,
      to: toNumber,
      from: fromNumber,
    });

    context.log(`Call initiated: ${call.sid}`);
    
    // Log to Application Insights
    context.log.metric("PhoneAlertSent", 1, {
      alertName,
      severity,
      callSid: call.sid
    });

    context.res = {
      status: 200,
      body: { success: true, callSid: call.sid }
    };
  } catch (error) {
    context.log.error("Failed to send phone alert", error);
    context.res = {
      status: 500,
      body: { success: false, error: error.message }
    };
  }
};

export default httpTrigger;
```

### **Alternativa: Azure Communication Services**

```typescript
// Usando Azure Communication Services (sin Twilio)
import { CallAutomationClient } from "@azure/communication-call-automation";

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
const client = new CallAutomationClient(connectionString);

const call = await client.createCall({
  targetParticipant: { phoneNumber: toNumber },
  sourceCallerId: { phoneNumber: fromNumber },
  callbackUrl: process.env.CALLBACK_URL,
});

// Play audio message
await client.playAudio(call.callConnectionId, {
  audioFileUri: `https://yourstorage.blob.core.windows.net/alerts/${alertName}.mp3`
});
```

### **Configuración en Terraform**

```hcl
# Azure Function App para Phone Alerts
resource "azurerm_linux_function_app" "phone_alerts" {
  name                       = "func-phone-alerts-${var.environment}"
  resource_group_name        = var.resource_group_name
  location                   = var.location
  service_plan_id            = azurerm_service_plan.functions.id
  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  site_config {
    application_stack {
      node_version = "20"
    }
  }

  app_settings = {
    "TWILIO_ACCOUNT_SID"      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.twilio_sid.id})"
    "TWILIO_AUTH_TOKEN"       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.twilio_token.id})"
    "TWILIO_PHONE_NUMBER"     = var.twilio_phone_number
    "ONCALL_PHONE_NUMBER"     = var.oncall_phone_number
    "ACKNOWLEDGE_WEBHOOK_URL" = "https://func-phone-alerts-${var.environment}.azurewebsites.net/api/acknowledge"
  }
}

# Service Plan para Functions (Consumption)
resource "azurerm_service_plan" "functions" {
  name                = "asp-functions-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "Y1"  # Consumption plan - PAY PER EXECUTION
}
```

---

## 🚀 **CI/CD con GitHub Actions**

### **Workflows Principales**

#### **1. Terraform Deploy Workflow**

```yaml
# .github/workflows/terraform-deploy.yml
name: 🏗️ Terraform Infrastructure Deploy

on:
  push:
    branches: [main]
    paths:
      - 'terraform/**'
  pull_request:
    branches: [main]
    paths:
      - 'terraform/**'
  workflow_dispatch:

permissions:
  id-token: write  # OIDC token for Azure
  contents: read

env:
  ARM_SUBSCRIPTION_ID: "353a6255-27a8-4733-adf0-1c531ba9f4e9"
  ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
  TF_VERSION: "1.7.0"
  WORKING_DIR: "./terraform/environments/dev"

jobs:
  terraform-plan:
    name: 📋 Terraform Plan
    runs-on: ubuntu-latest
    environment: development
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        
      - name: 🔐 Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          
      - name: 🛠️ Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
          
      - name: 🔧 Terraform Init
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform init
        
      - name: 🎨 Terraform Format Check
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform fmt -check -recursive
        
      - name: ✅ Terraform Validate
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform validate
        
      - name: 🔍 Terraform Plan
        working-directory: ${{ env.WORKING_DIR }}
        run: |
          terraform plan \
            -var-file="terraform.tfvars" \
            -out=tfplan \
            -no-color
            
      - name: 📤 Upload Plan Artifact
        uses: actions/upload-artifact@v4
        with:
          name: tfplan
          path: ${{ env.WORKING_DIR }}/tfplan
          retention-days: 5

  terraform-apply:
    name: 🚀 Terraform Apply
    runs-on: ubuntu-latest
    needs: terraform-plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: 
      name: production
      url: https://app-mindful-moments-dev.azurewebsites.net
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        
      - name: 🔐 Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          
      - name: 🛠️ Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
          
      - name: 📥 Download Plan Artifact
        uses: actions/download-artifact@v4
        with:
          name: tfplan
          path: ${{ env.WORKING_DIR }}
          
      - name: 🔧 Terraform Init
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform init
        
      - name: ✅ Terraform Apply
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform apply -auto-approve tfplan
        
      - name: 📊 Output Infrastructure Info
        working-directory: ${{ env.WORKING_DIR }}
        run: terraform output -json > infrastructure-output.json
        
      - name: 📤 Upload Infrastructure Output
        uses: actions/upload-artifact@v4
        with:
          name: infrastructure-output
          path: ${{ env.WORKING_DIR }}/infrastructure-output.json

  security-scan:
    name: 🔒 Security Scan (tfsec)
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        
      - name: 🔍 Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.3
        with:
          working_directory: terraform
          soft_fail: false
          
      - name: 📊 Upload tfsec results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: tfsec.sarif
```

#### **2. Application Deploy Workflow**

```yaml
# .github/workflows/app-deploy.yml
name: 🚀 Deploy Mindful Moments App

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  NODE_VERSION: '20'
  APP_NAME: 'app-mindful-moments-dev'

jobs:
  build:
    name: 🏗️ Build Application
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
        
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: 📦 Install dependencies
        run: npm ci
        
      - name: 🧪 Run tests
        run: npm test
        
      - name: 📊 Generate coverage report
        run: npm run test:coverage
        
      - name: 🏗️ Build application
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: 📤 Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-build
          path: |
            dist/
            package.json
            package-lock.json
          retention-days: 5

  deploy:
    name: 🚀 Deploy to Azure
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: production
      url: https://app-mindful-moments-dev.azurewebsites.net
    
    steps:
      - name: 📥 Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: app-build
          
      - name: 🔐 Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          
      - name: 🚀 Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.APP_NAME }}
          package: .
          
      - name: 🔍 Run smoke tests
        run: |
          curl -f https://${{ env.APP_NAME }}.azurewebsites.net/health || exit 1
          
      - name: 📊 Trigger Application Insights annotation
        run: |
          az monitor app-insights component show \
            --app appi-mindful-moments-dev \
            --resource-group rg-mindful-moments-dev

  notify-sre-agent:
    name: 📢 Notify Azure SRE Agent
    runs-on: ubuntu-latest
    needs: deploy
    if: success()
    
    steps:
      - name: 📤 Send deployment event
        run: |
          curl -X POST "${{ secrets.SRE_AGENT_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "event": "deployment",
              "app": "${{ env.APP_NAME }}",
              "version": "${{ github.sha }}",
              "status": "success",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }'
```

---

## 📱 **Aplicación Dummy: "Mindful Moments"**

### **Especificación de la Aplicación**

#### **Features**
1. **CRUD de Momentos Mindfulness**
   - Crear momento (texto + imagen opcional)
   - Listar momentos propios
   - Editar momento
   - Eliminar momento

2. **Almacenamiento**
   - Textos → PostgreSQL
   - Imágenes → Azure Blob Storage

3. **Health & Monitoring**
   - `/health` - Health check endpoint
   - `/metrics` - Prometheus-style metrics
   - `/api/simulate-error` - Endpoint para testing SRE Agent

#### **Stack Técnico**

**Opción 1: Node.js + Express + React**
```
Backend: Express.js + TypeScript
Frontend: React + TypeScript + Vite
Database: PostgreSQL (pg library)
Storage: @azure/storage-blob
Monitoring: @azure/monitor-opentelemetry
```

**Opción 2: Python + FastAPI + React**
```
Backend: FastAPI + Python 3.11
Frontend: React + TypeScript + Vite
Database: asyncpg / SQLAlchemy
Storage: azure-storage-blob
Monitoring: opencensus-ext-azure
```

#### **Estructura de Proyecto**

```
mindful-moments/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── moments.ts
│   │   │   ├── health.ts
│   │   │   └── metrics.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   └── schema.sql
│   │   ├── storage/
│   │   │   └── blob-client.ts
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   └── telemetry.ts
│   │   └── app.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/
│       ├── terraform-deploy.yml
│       ├── app-deploy.yml
│       └── security-scan.yml
├── terraform/
│   ├── (estructura ya definida)
├── docs/
│   └── API.md
└── README.md
```

#### **Database Schema**

```sql
-- PostgreSQL Schema
CREATE TABLE mindful_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false
);

CREATE INDEX idx_user_id ON mindful_moments(user_id);
CREATE INDEX idx_created_at ON mindful_moments(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mindful_moments_updated_at
    BEFORE UPDATE ON mindful_moments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### **API Endpoints**

```typescript
// Health & Monitoring
GET  /health              → Health check (200 OK)
GET  /metrics             → Prometheus metrics
GET  /api/simulate-error  → Simulate error for testing SRE Agent

// Moments CRUD
GET    /api/moments              → List all moments (paginated)
POST   /api/moments              → Create new moment
GET    /api/moments/:id          → Get moment by ID
PUT    /api/moments/:id          → Update moment
DELETE /api/moments/:id          → Delete moment
POST   /api/moments/:id/image   → Upload image for moment
```

---

## 🎯 **Plan de Implementación por Fases**

### **FASE 1: Setup Inicial (Semana 1)**

#### **Día 1-2: Configuración de Azure & GitHub**
- [ ] Crear Resource Group en Azure (Portal)
- [ ] Configurar Azure Storage Account para Terraform State
- [ ] Crear Service Principal para GitHub Actions (OIDC)
- [ ] Configurar GitHub Secrets
- [ ] Crear repositorio GitHub "mindful-moments-infrastructure"
- [ ] Crear repositorio GitHub "mindful-moments-app"

#### **Día 3-4: Terraform Base Infrastructure**
- [ ] Crear estructura de proyecto Terraform
- [ ] Implementar módulo de networking (VNet, Subnets, NSG)
- [ ] Implementar módulo de Key Vault
- [ ] Implementar módulo de monitoring (Log Analytics, App Insights)
- [ ] Validar con `terraform plan`

#### **Día 5-7: Deploy Infrastructure**
- [ ] Implementar módulo de App Service
- [ ] Implementar módulo de PostgreSQL
- [ ] Implementar módulo de Storage Account
- [ ] Ejecutar `terraform apply`
- [ ] Verificar recursos en Azure Portal

### **FASE 2: Aplicación Dummy (Semana 2)**

#### **Día 1-3: Backend Development**
- [ ] Setup proyecto Express.js / FastAPI
- [ ] Implementar conexión a PostgreSQL
- [ ] Implementar CRUD de moments
- [ ] Implementar integración con Blob Storage
- [ ] Implementar health check endpoint
- [ ] Agregar Application Insights SDK
- [ ] Tests unitarios

#### **Día 4-5: Frontend Development**
- [ ] Setup proyecto React + Vite
- [ ] Crear componentes (MomentCard, MomentForm, MomentList)
- [ ] Integrar con API backend
- [ ] Implementar upload de imágenes
- [ ] UI/UX básica con Tailwind

#### **Día 6-7: CI/CD Pipelines**
- [ ] Crear workflow GitHub Actions para backend
- [ ] Crear workflow GitHub Actions para frontend
- [ ] Configurar Azure Web App deployment
- [ ] Smoke tests post-deployment
- [ ] Deploy primera versión a Azure

### **FASE 3: Monitoring & Alerting (Semana 3)**

#### **Día 1-2: Azure Monitor Setup**
- [ ] Configurar Application Insights en app
- [ ] Crear custom metrics
- [ ] Configurar distributed tracing
- [ ] Configurar log queries en Log Analytics

#### **Día 3-4: Alert Rules**
- [ ] Crear alert: High Response Time
- [ ] Crear alert: HTTP 5xx Errors
- [ ] Crear alert: Database Connection Failures
- [ ] Crear alert: High Memory Usage
- [ ] Configurar Action Groups

#### **Día 5-7: Phone Alert System**
- [ ] Crear Azure Function para phone alerts
- [ ] Configurar Twilio account (trial gratuita)
- [ ] Implementar TwiML para voice messages
- [ ] Integrar con Action Groups
- [ ] Testing end-to-end de alerting

### **FASE 4: Azure SRE Agent (Semana 4)**

#### **Día 1-2: SRE Agent Setup**
- [ ] Crear SRE Agent en Azure Portal
- [ ] Configurar permisos RBAC
- [ ] Mapear recursos (App Service, Database, Storage)
- [ ] Configurar integración con Azure Monitor

#### **Día 3-4: Runbooks & Auto-Remediation**
- [ ] Crear runbook: Auto-restart App Service
- [ ] Crear runbook: Clear database connections
- [ ] Crear runbook: Scale up on high CPU
- [ ] Configurar approval workflows

#### **Día 5-6: Integration Testing**
- [ ] Simular incidente: High response time
- [ ] Verificar SRE Agent RCA
- [ ] Verificar phone alert triggered
- [ ] Verificar auto-remediation
- [ ] Ajustar thresholds

#### **Día 7: GitHub Integration**
- [ ] Configurar SRE Agent → GitHub integration
- [ ] Probar creación automática de issues
- [ ] Probar creación de PRs con fixes
- [ ] Integrar con GitHub Copilot coding agent (opcional)

### **FASE 5: Documentación & Handoff (Semana 5)**

#### **Día 1-3: Documentación Técnica**
- [ ] README completo con arquitectura
- [ ] Guía de deployment
- [ ] Runbook de operaciones
- [ ] Troubleshooting guide
- [ ] Cost optimization tips

#### **Día 4-5: Demos & Training**
- [ ] Demo: Flujo completo de creación de proyecto
- [ ] Demo: Simulación de incidente y respuesta SRE Agent
- [ ] Demo: Phone alert system
- [ ] Demo: RCA y auto-remediation

#### **Día 6-7: Optimización Final**
- [ ] Cost review (ajustar SKUs si necesario)
- [ ] Performance tuning
- [ ] Security hardening
- [ ] Backup & disaster recovery plan

---

## 📝 **Inputs para `/projects/new`**

### **Campos del Formulario**

```yaml
Project Name: "Mindful Moments - Azure SRE Demo"

Description: |
  Full-stack application with Azure infrastructure automated by Terraform,
  CI/CD with GitHub Actions, and monitored by Azure SRE Agent with 
  autonomous incident response including phone call alerts.

Repository Owner: "AlbertoLacambra"

Repository Name: "mindful-moments-infrastructure"

Timeline: "5 weeks"

Constraints: |
  - Budget: Maximum 120€/month
  - Use Azure subscription: 353a6255-27a8-4733-adf0-1c531ba9f4e9
  - Must use B1 tier for App Service (cost optimization)
  - Must use Burstable B1ms for PostgreSQL
  - Follow Terraform best practices from /agent-hub/instructions
  - Follow GitHub Actions best practices from /agent-hub/instructions

Must-Have Requirements:
  - "Terraform infrastructure modules (networking, app-service, database, storage, monitoring, key-vault)"
  - "Azure App Service B1 Linux with Node.js 20"
  - "PostgreSQL Flexible Server B1ms with private networking"
  - "Azure Storage Account with blob containers"
  - "Application Insights + Log Analytics Workspace"
  - "Azure Key Vault for secrets management"
  - "GitHub Actions CI/CD workflows (terraform-deploy, app-deploy)"
  - "Azure SRE Agent configuration with runbooks"
  - "Azure Monitor alerts (response time, HTTP errors, database failures)"
  - "Phone alert system with Azure Functions + Twilio"
  - "React frontend with TypeScript"
  - "Express.js backend with PostgreSQL integration"
  - "Health check and metrics endpoints"
  - "Unit tests and integration tests"

Nice-to-Have Requirements:
  - "PagerDuty integration for incident management"
  - "GitHub Copilot coding agent integration"
  - "Automated backup and restore procedures"
  - "Blue-green deployment strategy"
  - "Performance testing with k6"
  - "Chaos engineering experiments (Azure Chaos Studio)"
  - "Cost anomaly detection"
  - "Multi-region deployment (future)"
```

### **Archivos Spec Generados Automáticamente**

El sistema generará automáticamente:

1. **Epics**:
   - Epic 1: Azure Infrastructure Setup with Terraform
   - Epic 2: Mindful Moments Application Development
   - Epic 3: CI/CD Pipeline Implementation
   - Epic 4: Monitoring & Alerting System
   - Epic 5: Azure SRE Agent Configuration
   - Epic 6: Phone Alert System
   - Epic 7: Documentation & Handoff

2. **Features por Epic**:
   - Epic 1 → Features: Networking, App Service Module, Database Module, Storage Module, etc.
   - Epic 2 → Features: Backend API, Frontend UI, Database Schema, etc.
   - Epic 3 → Features: Terraform Workflow, App Deploy Workflow, Security Scan, etc.
   - etc.

3. **Stories por Feature**: Desglose detallado implementable

4. **GitHub Issues + Project Board**: Creado automáticamente con dependencias

5. **PROJECT_INSTRUCTIONS.md**: Guía completa con sprints, story points, priorities

---

## 💰 **Cost Monitoring & Optimization**

### **Azure Cost Management Setup**

```hcl
# Budget Alert
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-mindful-moments"
  resource_group_id = azurerm_resource_group.main.id

  amount     = 120
  time_grain = "Monthly"

  time_period {
    start_date = "2025-01-01T00:00:00Z"
  }

  notification {
    enabled   = true
    threshold = 80.0
    operator  = "GreaterThan"

    contact_emails = [
      var.admin_email
    ]
  }

  notification {
    enabled   = true
    threshold = 100.0
    operator  = "GreaterThan"

    contact_emails = [
      var.admin_email
    ]
  }
}
```

### **Cost Optimization Strategies**

1. **Auto-shutdown**: Configurar App Service para apagar fuera de horario laboral
2. **Reserved Instances**: No aplicable para B1 (ya es el tier más barato)
3. **Database Scaling**: Auto-pause PostgreSQL durante inactividad
4. **Storage Lifecycle**: Mover imágenes antiguas a Cool tier automáticamente
5. **Monitoring**: Reducir retention de logs a 30 días

---

## 🔒 **Security Checklist**

- [ ] Secrets en Key Vault (nunca en código)
- [ ] HTTPS obligatorio para App Service
- [ ] Database en subnet privada (no acceso público)
- [ ] Storage Account con firewall habilitado
- [ ] Managed Identity para App Service (no connection strings)
- [ ] Network Security Groups configurados
- [ ] RBAC con least privilege
- [ ] Terraform state encriptado en blob
- [ ] GitHub Secrets para CI/CD
- [ ] Security scanning con tfsec en pipeline
- [ ] Dependabot habilitado para vulnerabilities
- [ ] OWASP top 10 compliance

---

## 📊 **Success Criteria**

### **Infraestructura**
✅ Todos los recursos desplegados correctamente vía Terraform  
✅ Costes por debajo de 65€/mes  
✅ Sin errores en `terraform plan` o `terraform validate`  
✅ Secrets gestionados en Key Vault  
✅ Networking privado para database

### **Aplicación**
✅ App desplegada en Azure App Service  
✅ CRUD funcionando correctamente  
✅ Imágenes almacenadas en Blob Storage  
✅ Health check retorna 200 OK  
✅ Logs visibles en Application Insights

### **CI/CD**
✅ GitHub Actions workflows ejecutándose sin errores  
✅ Deployment automático en push a main  
✅ Tests unitarios passing (100% coverage no requerido)  
✅ Security scan passing

### **Monitoring & SRE Agent**
✅ Métricas visibles en Azure Monitor  
✅ Alertas configuradas y funcionales  
✅ SRE Agent conectado a recursos  
✅ Runbook ejecutado exitosamente en test  
✅ Phone alert recibida en simulación

### **Documentation**
✅ README completo con setup instructions  
✅ Arquitectura documentada con diagramas  
✅ Runbook de operaciones disponible  
✅ Cost optimization guide

---

## 🚀 **Próximos Pasos (Post-MVP)**

1. **Multi-Region Deployment**: Replicar en West Europe para HA
2. **Chaos Engineering**: Azure Chaos Studio experiments
3. **Advanced Observability**: Distributed tracing, SLO monitoring
4. **Auto-Scaling**: Configurar scaling rules basadas en CPU/Memory
5. **Blue-Green Deployment**: Zero-downtime deployments
6. **Performance Testing**: k6 load tests en pipeline
7. **Advanced SRE**: Self-healing más sofisticado
8. **AI-Powered Insights**: Anomaly detection con ML

---

## 📚 **Referencias**

- [Azure SRE Agent Docs](https://aka.ms/sreagent/docs)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Azure Monitor Best Practices](https://learn.microsoft.com/azure/azure-monitor/best-practices)
- [Twilio Voice API](https://www.twilio.com/docs/voice)

---

**Documento creado**: 11 de Noviembre 2025  
**Versión**: 1.0  
**Autor**: DXC Cloud nIrvanA - AI Agent Hub
