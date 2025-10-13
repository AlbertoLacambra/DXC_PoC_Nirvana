# Azure Container Registry Module
# Shared container registry for Hub & Spoke architecture

resource "azurerm_resource_group" "acr" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "random_string" "acr_suffix" {
  length  = 6
  special = false
  upper   = false
  numeric = true
}

resource "azurerm_container_registry" "this" {
  name                = "${var.acr_name_prefix}${random_string.acr_suffix.result}"
  resource_group_name = azurerm_resource_group.acr.name
  location            = azurerm_resource_group.acr.location
  sku                 = var.sku
  admin_enabled       = var.admin_enabled

  # Public network access (disable for production if using Private Link)
  public_network_access_enabled = var.public_network_access_enabled

  # Network rule set
  dynamic "network_rule_set" {
    for_each = var.network_rule_set_enabled ? [1] : []
    content {
      default_action = var.network_rule_default_action

      dynamic "ip_rule" {
        for_each = var.allowed_ip_ranges
        content {
          action   = "Allow"
          ip_range = ip_rule.value
        }
      }

      dynamic "virtual_network" {
        for_each = var.allowed_subnet_ids
        content {
          action    = "Allow"
          subnet_id = virtual_network.value
        }
      }
    }
  }

  # Retention policy for untagged manifests
  dynamic "retention_policy" {
    for_each = var.retention_policy_enabled ? [1] : []
    content {
      days    = var.retention_policy_days
      enabled = true
    }
  }

  # Geo-replication (for HA scenarios)
  dynamic "georeplications" {
    for_each = var.georeplications
    content {
      location                = georeplications.value.location
      zone_redundancy_enabled = georeplications.value.zone_redundancy_enabled
      tags                    = var.tags
    }
  }

  tags = var.tags
}

# Role assignment for AKS clusters (if AKS principal IDs provided)
resource "azurerm_role_assignment" "acr_pull" {
  for_each = toset(var.aks_principal_ids)

  scope                = azurerm_container_registry.this.id
  role_definition_name = "AcrPull"
  principal_id         = each.value
}

# Diagnostic settings to Log Analytics
resource "azurerm_monitor_diagnostic_setting" "acr" {
  count = var.log_analytics_workspace_id != null ? 1 : 0

  name                       = "acr-diagnostics"
  target_resource_id         = azurerm_container_registry.this.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "ContainerRegistryRepositoryEvents"
  }

  enabled_log {
    category = "ContainerRegistryLoginEvents"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
