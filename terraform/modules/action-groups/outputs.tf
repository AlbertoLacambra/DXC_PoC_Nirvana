# ========================================
# Outputs - Action Groups Module
# ========================================

# ========================================
# Action Group: Infrastructure
# ========================================

output "infrastructure_action_group_id" {
  description = "ID del Action Group de infraestructura"
  value       = var.create_infrastructure_action_group ? azurerm_monitor_action_group.infrastructure[0].id : null
}

output "infrastructure_action_group_name" {
  description = "Nombre del Action Group de infraestructura"
  value       = var.create_infrastructure_action_group ? azurerm_monitor_action_group.infrastructure[0].name : null
}

# ========================================
# Action Group: Pipelines
# ========================================

output "pipelines_action_group_id" {
  description = "ID del Action Group de pipelines"
  value       = var.create_pipelines_action_group ? azurerm_monitor_action_group.pipelines[0].id : null
}

output "pipelines_action_group_name" {
  description = "Nombre del Action Group de pipelines"
  value       = var.create_pipelines_action_group ? azurerm_monitor_action_group.pipelines[0].name : null
}

# ========================================
# Action Group: Costs
# ========================================

output "costs_action_group_id" {
  description = "ID del Action Group de costes"
  value       = var.create_costs_action_group ? azurerm_monitor_action_group.costs[0].id : null
}

output "costs_action_group_name" {
  description = "Nombre del Action Group de costes"
  value       = var.create_costs_action_group ? azurerm_monitor_action_group.costs[0].name : null
}

# ========================================
# Summary Output
# ========================================

output "action_groups_summary" {
  description = "Resumen de todos los Action Groups creados"
  value = {
    infrastructure = var.create_infrastructure_action_group ? {
      id         = azurerm_monitor_action_group.infrastructure[0].id
      name       = azurerm_monitor_action_group.infrastructure[0].name
      short_name = azurerm_monitor_action_group.infrastructure[0].short_name
      enabled    = azurerm_monitor_action_group.infrastructure[0].enabled
    } : null

    pipelines = var.create_pipelines_action_group ? {
      id         = azurerm_monitor_action_group.pipelines[0].id
      name       = azurerm_monitor_action_group.pipelines[0].name
      short_name = azurerm_monitor_action_group.pipelines[0].short_name
      enabled    = azurerm_monitor_action_group.pipelines[0].enabled
    } : null

    costs = var.create_costs_action_group ? {
      id         = azurerm_monitor_action_group.costs[0].id
      name       = azurerm_monitor_action_group.costs[0].name
      short_name = azurerm_monitor_action_group.costs[0].short_name
      enabled    = azurerm_monitor_action_group.costs[0].enabled
    } : null

    teams_webhook_configured = var.teams_webhook_url != null
    total_email_receivers    = length(var.email_receivers)
    total_sms_receivers      = length(var.sms_receivers)
  }
}
