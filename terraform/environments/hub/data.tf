# Data Sources - Existing Resources
# These must be loaded before providers that depend on them

# Existing Dify infrastructure
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

# Reference existing dify namespace - not managed by Terraform
# This namespace already exists in the AKS cluster
data "kubernetes_namespace" "dify_existing" {
  metadata {
    name = "dify"
  }
}
