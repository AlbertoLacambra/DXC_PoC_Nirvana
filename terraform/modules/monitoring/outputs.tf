output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.this.id
  description = "Log Analytics Workspace ID"
}

output "log_analytics_workspace_name" {
  value       = azurerm_log_analytics_workspace.this.name
  description = "Log Analytics Workspace name"
}

output "log_analytics_workspace_key" {
  value       = azurerm_log_analytics_workspace.this.primary_shared_key
  description = "Log Analytics Workspace primary key"
  sensitive   = true
}

output "log_analytics_workspace_workspace_id" {
  value       = azurerm_log_analytics_workspace.this.workspace_id
  description = "Log Analytics Workspace ID (GUID)"
}

output "application_insights_id" {
  value       = azurerm_application_insights.this.id
  description = "Application Insights ID"
}

output "application_insights_name" {
  value       = azurerm_application_insights.this.name
  description = "Application Insights name"
}

output "application_insights_instrumentation_key" {
  value       = azurerm_application_insights.this.instrumentation_key
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "application_insights_connection_string" {
  value       = azurerm_application_insights.this.connection_string
  description = "Application Insights connection string"
  sensitive   = true
}

output "application_insights_app_id" {
  value       = azurerm_application_insights.this.app_id
  description = "Application Insights App ID"
}

output "resource_group_name" {
  value       = azurerm_resource_group.monitoring.name
  description = "Resource group name"
}

output "action_group_id" {
  value       = var.create_action_group ? azurerm_monitor_action_group.this[0].id : null
  description = "Action Group ID (if created)"
}
