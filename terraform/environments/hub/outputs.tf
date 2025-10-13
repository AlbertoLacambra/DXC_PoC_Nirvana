# Hub Outputs - Para usar en Spokes via Terragrunt dependencies

# Existing Dify Resources
output "dify_resource_group_name" {
  value       = data.azurerm_resource_group.dify.name
  description = "Dify resource group name"
}

output "dify_vnet_id" {
  value       = data.azurerm_virtual_network.dify_vnet.id
  description = "Dify VNet ID"
}

output "dify_vnet_name" {
  value       = data.azurerm_virtual_network.dify_vnet.name
  description = "Dify VNet name"
}

output "dify_aks_id" {
  value       = data.azurerm_kubernetes_cluster.dify_aks.id
  description = "Dify AKS cluster ID"
}

output "dify_aks_name" {
  value       = data.azurerm_kubernetes_cluster.dify_aks.name
  description = "Dify AKS cluster name"
}

output "dify_postgresql_fqdn" {
  value       = data.azurerm_postgresql_flexible_server.dify_postgres.fqdn
  description = "Dify PostgreSQL FQDN"
}

output "dify_postgresql_id" {
  value       = data.azurerm_postgresql_flexible_server.dify_postgres.id
  description = "Dify PostgreSQL ID"
}

output "dify_storage_account_name" {
  value       = data.azurerm_storage_account.dify_storage.name
  description = "Dify Storage Account name"
}

output "dify_storage_account_id" {
  value       = data.azurerm_storage_account.dify_storage.id
  description = "Dify Storage Account ID"
}

output "dify_key_vault_id" {
  value       = data.azurerm_key_vault.dify_kv.id
  description = "Dify Key Vault ID"
}

output "dify_key_vault_uri" {
  value       = data.azurerm_key_vault.dify_kv.vault_uri
  description = "Dify Key Vault URI"
}

# New Hub Resources
output "hub_resource_group_name" {
  value       = azurerm_resource_group.hub.name
  description = "Hub resource group name"
}

output "acr_id" {
  value       = var.create_acr ? module.acr[0].id : null
  description = "ACR ID"
}

output "acr_name" {
  value       = var.create_acr ? module.acr[0].name : null
  description = "ACR name"
}

output "acr_login_server" {
  value       = var.create_acr ? module.acr[0].login_server : null
  description = "ACR login server"
}

output "log_analytics_workspace_id" {
  value       = var.create_monitoring ? module.monitoring[0].log_analytics_workspace_id : null
  description = "Log Analytics Workspace ID"
}

output "log_analytics_workspace_name" {
  value       = var.create_monitoring ? module.monitoring[0].log_analytics_workspace_name : null
  description = "Log Analytics Workspace name"
}

output "application_insights_id" {
  value       = var.create_monitoring ? module.monitoring[0].application_insights_id : null
  description = "Application Insights ID"
}

output "application_insights_instrumentation_key" {
  value       = var.create_monitoring ? module.monitoring[0].application_insights_instrumentation_key : null
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "application_insights_connection_string" {
  value       = var.create_monitoring ? module.monitoring[0].application_insights_connection_string : null
  description = "Application Insights connection string"
  sensitive   = true
}

output "action_group_id" {
  value       = var.create_monitoring ? module.monitoring[0].action_group_id : null
  description = "Action Group ID"
}
