# Hub Environment - Main Configuration
# Creates new shared services while referencing existing Dify infrastructure

# Data sources para recursos existentes de Dify
data "azurerm_resource_group" "dify" {
  name = var.existing_resources.resource_group_name
}

data "azurerm_kubernetes_cluster" "dify_aks" {
  name                = var.existing_resources.aks_cluster_name
  resource_group_name = data.azurerm_resource_group.dify.name
}

data "azurerm_virtual_network" "dify_vnet" {
  name                = var.existing_resources.vnet_name
  resource_group_name = data.azurerm_resource_group.dify.name
}

data "azurerm_postgresql_flexible_server" "dify_postgres" {
  name                = var.existing_resources.postgresql_server_name
  resource_group_name = data.azurerm_resource_group.dify.name
}

data "azurerm_storage_account" "dify_storage" {
  name                = var.existing_resources.storage_account_name
  resource_group_name = data.azurerm_resource_group.dify.name
}

data "azurerm_key_vault" "dify_kv" {
  name                = var.existing_resources.key_vault_name
  resource_group_name = data.azurerm_resource_group.dify.name
}

# Resource Group para nuevos recursos Hub
resource "azurerm_resource_group" "hub" {
  name     = "cc-hub-rg"
  location = var.location
  tags     = var.tags
}

# Container Registry (Shared)
module "acr" {
  count  = var.create_acr ? 1 : 0
  source = "./modules/container-registry"

  resource_group_name           = "cc-acr-rg"
  location                      = var.location
  acr_name_prefix               = var.acr_config.name_prefix
  sku                           = var.acr_config.sku
  admin_enabled                 = var.acr_config.admin_enabled
  public_network_access_enabled = var.acr_config.public_network_access_enabled
  retention_policy_enabled      = var.acr_config.retention_policy_enabled
  retention_policy_days         = var.acr_config.retention_policy_days

  # Grant AKS Dify pull access
  aks_principal_ids = [
    data.azurerm_kubernetes_cluster.dify_aks.kubelet_identity[0].object_id
  ]

  # Will be set after monitoring module creates Log Analytics
  log_analytics_workspace_id = var.create_monitoring ? module.monitoring[0].log_analytics_workspace_id : null

  tags = merge(var.tags, {
    Component = "container-registry"
  })
}

# Monitoring (Log Analytics + Application Insights)
module "monitoring" {
  count  = var.create_monitoring ? 1 : 0
  source = "./modules/monitoring"

  resource_group_name               = "cc-monitoring-rg"
  location                          = var.location
  log_analytics_name                = var.monitoring_config.log_analytics_name
  log_analytics_sku                 = var.monitoring_config.log_analytics_sku
  log_analytics_retention_days      = var.monitoring_config.log_analytics_retention
  app_insights_name                 = var.monitoring_config.app_insights_name
  app_insights_application_type     = var.monitoring_config.app_insights_type
  enable_container_insights         = var.monitoring_config.enable_container_insights

  # Action Group
  create_action_group     = var.create_action_group
  action_group_name       = var.action_group_config.name
  action_group_short_name = var.action_group_config.short_name
  action_group_emails     = var.action_group_config.emails
  action_group_webhooks   = var.action_group_config.webhooks

  tags = merge(var.tags, {
    Component = "monitoring"
  })
}

# Enable monitoring for existing Dify AKS
# This adds OMS agent to existing AKS without recreating it
resource "null_resource" "enable_aks_monitoring" {
  count = var.create_monitoring ? 1 : 0

  provisioner "local-exec" {
    command = <<-EOT
      az aks enable-addons \
        --resource-group ${data.azurerm_resource_group.dify.name} \
        --name ${data.azurerm_kubernetes_cluster.dify_aks.name} \
        --addons monitoring \
        --workspace-resource-id ${module.monitoring[0].log_analytics_workspace_id}
    EOT
  }

  depends_on = [module.monitoring]
}
