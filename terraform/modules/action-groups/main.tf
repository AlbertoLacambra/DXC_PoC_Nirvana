# ========================================
# Action Groups Module
# ========================================
# Crea Azure Monitor Action Groups para alertas de infraestructura
# Integra con Microsoft Teams mediante Power Automate y notificaciones por email
#
# Coste: $0/mes (Action Groups básico es gratuito)
# ========================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

# ========================================
# Action Group Principal - Infraestructura
# ========================================

resource "azurerm_monitor_action_group" "infrastructure" {
  count = var.create_infrastructure_action_group ? 1 : 0

  name                = var.infrastructure_action_group_name
  resource_group_name = var.resource_group_name
  short_name          = var.infrastructure_short_name

  enabled = true

  # Webhook a Microsoft Teams (Power Automate)
  # IMPORTANTE: El webhook debe enviar Adaptive Cards en formato JSON
  # Ver TEAMS_INTEGRATION.md para configuración completa
  dynamic "webhook_receiver" {
    for_each = var.teams_webhook_url != null ? [1] : []
    content {
      name                    = "teams-infrastructure"
      service_uri             = var.teams_webhook_url
      use_common_alert_schema = true
    }
  }

  # Notificaciones por Email
  dynamic "email_receiver" {
    for_each = var.email_receivers
    content {
      name                    = email_receiver.value.name
      email_address           = email_receiver.value.email
      use_common_alert_schema = true
    }
  }

  # Notificaciones por SMS (opcional)
  dynamic "sms_receiver" {
    for_each = var.sms_receivers
    content {
      name         = sms_receiver.value.name
      country_code = sms_receiver.value.country_code
      phone_number = sms_receiver.value.phone_number
    }
  }

  tags = merge(
    var.tags,
    {
      Module      = "action-groups"
      Type        = "infrastructure"
      AlertTarget = "Teams + Email"
    }
  )
}

# ========================================
# Action Group Secundario - Pipelines
# ========================================

resource "azurerm_monitor_action_group" "pipelines" {
  count = var.create_pipelines_action_group ? 1 : 0

  name                = var.pipelines_action_group_name
  resource_group_name = var.resource_group_name
  short_name          = var.pipelines_short_name

  enabled = true

  # Webhook a Microsoft Teams
  dynamic "webhook_receiver" {
    for_each = var.teams_webhook_url != null ? [1] : []
    content {
      name                    = "teams-pipelines"
      service_uri             = var.teams_webhook_url
      use_common_alert_schema = true
    }
  }

  # Notificaciones por Email
  dynamic "email_receiver" {
    for_each = var.email_receivers
    content {
      name                    = email_receiver.value.name
      email_address           = email_receiver.value.email
      use_common_alert_schema = true
    }
  }

  tags = merge(
    var.tags,
    {
      Module      = "action-groups"
      Type        = "pipelines"
      AlertTarget = "Teams + Email"
    }
  )
}

# ========================================
# Action Group Terciario - Costes
# ========================================

resource "azurerm_monitor_action_group" "costs" {
  count = var.create_costs_action_group ? 1 : 0

  name                = var.costs_action_group_name
  resource_group_name = var.resource_group_name
  short_name          = var.costs_short_name

  enabled = true

  # Webhook a Microsoft Teams
  dynamic "webhook_receiver" {
    for_each = var.teams_webhook_url != null ? [1] : []
    content {
      name                    = "teams-costs"
      service_uri             = var.teams_webhook_url
      use_common_alert_schema = true
    }
  }

  # Notificaciones por Email (sólo a responsables financieros)
  dynamic "email_receiver" {
    for_each = var.cost_email_receivers
    content {
      name                    = email_receiver.value.name
      email_address           = email_receiver.value.email
      use_common_alert_schema = true
    }
  }

  tags = merge(
    var.tags,
    {
      Module      = "action-groups"
      Type        = "costs"
      AlertTarget = "Teams + Email (Finance)"
    }
  )
}
