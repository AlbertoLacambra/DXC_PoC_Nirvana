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
  name     = "cloudmind-hub-rg"
  location = var.location
  tags     = var.tags
}

# AKS Namespaces - Configure namespaces in existing AKS cluster
module "aks_namespaces" {
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/aks-namespaces?ref=master"

  create_dify_namespace      = true
  create_cloudmind_namespace = true
  
  enable_resource_quotas  = true
  enable_network_policies = false  # PoC: disabled for simplicity
  
  common_labels = merge(var.tags, {
    managed-by = "terraform"
  })
}

# Container Registry (Shared) - PoC OPTIMIZED
module "acr" {
  count  = var.create_acr ? 1 : 0
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/container-registry?ref=master"

  resource_group_name           = "cloudmind-acr-rg"
  location                      = var.location
  acr_name_prefix               = var.acr_config.name_prefix
  sku                           = var.acr_config.sku
  admin_enabled                 = var.acr_config.admin_enabled
  public_network_access_enabled = var.acr_config.public_network_access_enabled
  retention_policy_enabled      = var.acr_config.retention_policy_enabled
  retention_policy_days         = var.acr_config.retention_policy_days
  
  # Network rules (disabled for PoC)
  network_rule_set_enabled = false

  # Grant AKS Dify pull access
  aks_principal_ids = [
    data.azurerm_kubernetes_cluster.dify_aks.kubelet_identity[0].object_id
  ]

  # PoC: No Log Analytics integration (uses Container Insights instead)
  log_analytics_workspace_id = null

  tags = merge(var.tags, {
    Component = "container-registry"
  })
}


# PoC: Container Insights is already enabled on the existing AKS cluster
# No additional monitoring resources needed - leverages free tier
# For production, consider adding:
# - Log Analytics Workspace
# - Application Insights
# - Azure Monitor Workbooks
# - Alert Rules
# See: PROJECT_LOGBOOK.md - Production Recommendations

