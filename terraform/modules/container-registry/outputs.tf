output "id" {
  value       = azurerm_container_registry.this.id
  description = "ACR resource ID"
}

output "name" {
  value       = azurerm_container_registry.this.name
  description = "ACR name"
}

output "login_server" {
  value       = azurerm_container_registry.this.login_server
  description = "ACR login server URL"
}

output "admin_username" {
  value       = var.admin_enabled ? azurerm_container_registry.this.admin_username : null
  description = "ACR admin username (if enabled)"
  sensitive   = true
}

output "admin_password" {
  value       = var.admin_enabled ? azurerm_container_registry.this.admin_password : null
  description = "ACR admin password (if enabled)"
  sensitive   = true
}

output "resource_group_name" {
  value       = azurerm_resource_group.acr.name
  description = "Resource group name"
}
