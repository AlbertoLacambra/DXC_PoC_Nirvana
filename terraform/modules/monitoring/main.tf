# Azure Monitoring Module
# Log Analytics Workspace + Application Insights for centralized monitoring

resource "azurerm_resource_group" "monitoring" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "this" {
  name                = var.log_analytics_name
  location            = azurerm_resource_group.monitoring.location
  resource_group_name = azurerm_resource_group.monitoring.name
  sku                 = var.log_analytics_sku
  retention_in_days   = var.log_analytics_retention_days

  # Daily quota (optional, for cost control)
  daily_quota_gb = var.log_analytics_daily_quota_gb

  tags = var.tags
}

# Application Insights
resource "azurerm_application_insights" "this" {
  name                = var.app_insights_name
  location            = azurerm_resource_group.monitoring.location
  resource_group_name = azurerm_resource_group.monitoring.name
  workspace_id        = azurerm_log_analytics_workspace.this.id
  application_type    = var.app_insights_application_type

  # Retention
  retention_in_days = var.app_insights_retention_days

  # Sampling percentage (for high-volume scenarios)
  sampling_percentage = var.app_insights_sampling_percentage

  tags = var.tags
}

# Log Analytics Solutions (optional)
resource "azurerm_log_analytics_solution" "container_insights" {
  count = var.enable_container_insights ? 1 : 0

  solution_name         = "ContainerInsights"
  location              = azurerm_resource_group.monitoring.location
  resource_group_name   = azurerm_resource_group.monitoring.name
  workspace_resource_id = azurerm_log_analytics_workspace.this.id
  workspace_name        = azurerm_log_analytics_workspace.this.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }

  tags = var.tags
}

resource "azurerm_log_analytics_solution" "security_insights" {
  count = var.enable_security_insights ? 1 : 0

  solution_name         = "Security"
  location              = azurerm_resource_group.monitoring.location
  resource_group_name   = azurerm_resource_group.monitoring.name
  workspace_resource_id = azurerm_log_analytics_workspace.this.id
  workspace_name        = azurerm_log_analytics_workspace.this.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/Security"
  }

  tags = var.tags
}

resource "azurerm_log_analytics_solution" "updates" {
  count = var.enable_updates ? 1 : 0

  solution_name         = "Updates"
  location              = azurerm_resource_group.monitoring.location
  resource_group_name   = azurerm_resource_group.monitoring.name
  workspace_resource_id = azurerm_log_analytics_workspace.this.id
  workspace_name        = azurerm_log_analytics_workspace.this.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/Updates"
  }

  tags = var.tags
}

# Action Group for alerts (optional)
resource "azurerm_monitor_action_group" "this" {
  count = var.create_action_group ? 1 : 0

  name                = var.action_group_name
  resource_group_name = azurerm_resource_group.monitoring.name
  short_name          = var.action_group_short_name

  dynamic "email_receiver" {
    for_each = var.action_group_emails
    content {
      name                    = "email-${email_receiver.key}"
      email_address           = email_receiver.value
      use_common_alert_schema = true
    }
  }

  dynamic "webhook_receiver" {
    for_each = var.action_group_webhooks
    content {
      name                    = "webhook-${webhook_receiver.key}"
      service_uri             = webhook_receiver.value
      use_common_alert_schema = true
    }
  }

  tags = var.tags
}
