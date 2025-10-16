# Provider Configuration
# Azure Provider with required features

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.47"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    virtual_machine {
      delete_os_disk_on_deletion     = true
      graceful_shutdown              = false
      skip_shutdown_and_force_delete = false
    }
  }
  
  subscription_id = "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
}

provider "azuread" {
  tenant_id = "93f33571-550f-43cf-b09f-cd331338d086"
}

# Kubernetes Provider - connects to existing Dify AKS cluster
provider "kubernetes" {
  host                   = data.azurerm_kubernetes_cluster.dify_aks.kube_config.0.host
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.dify_aks.kube_config.0.client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.dify_aks.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.dify_aks.kube_config.0.cluster_ca_certificate)
}
