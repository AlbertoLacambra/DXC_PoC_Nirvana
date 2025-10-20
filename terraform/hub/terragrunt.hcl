# Hub Terragrunt Configuration
# Manages shared services for Control Center
# IMPORTANT: Hub ya tiene AKS de Dify existente (dify-aks en RG dify-rg)

include "root" {
  path = find_in_parent_folders()
}

locals {
  subscription_id = "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
  environment     = "hub"
  
  # Recursos existentes de Dify
  existing_resources = {
    resource_group_name    = "dify-rg"
    aks_cluster_name       = "dify-aks"
    vnet_name              = "dify-private-vnet"
    postgresql_server_name = "dify-postgres-9107e36a"
    storage_account_name   = "difyprivatest9107e36a"
    key_vault_name         = "dify-private-kv-9107e36a"
  }
}

inputs = {
  subscription_id = local.subscription_id
  environment     = local.environment
  location        = "northeurope"
  
  # Recursos existentes (para data sources)
  existing_resources = local.existing_resources
  
  # Nuevos recursos a crear
  # Container Registry - DRIFT TEST: Changed SKU to detect configuration drift
  create_acr = true
  acr_config = {
    name_prefix                   = "dxccloudmind"
    sku                           = "Standard"  # DRIFT TEST: Changed from Basic to Standard
    admin_enabled                 = true        # DRIFT TEST: Changed from false to true
    public_network_access_enabled = true
    retention_policy_enabled      = true        # DRIFT TEST: Changed from false to true
    retention_policy_days         = 30          # DRIFT TEST: Changed from 7 to 30
  }
  
  # Monitoring - SOLO GRATUITO (Container Insights)
  # PoC: Sin Log Analytics adicional, sin App Insights, sin alertas premium
  create_monitoring = false  # Desactivado - usaremos solo Container Insights gratuito del AKS existente
  
  # AKS Configuration - Single AKS con namespaces
  aks_namespaces = {
    dify = {
      name = "dify"
      labels = {
        component = "ai-platform"
        tier      = "core"
      }
    }
    cloudmind = {
      name = "cloudmind"
      labels = {
        component = "use-cases"
        tier      = "workloads"
      }
    }
  }
  
  # Teams Webhook para alertas (GRATUITO)
  teams_webhook_url = ""  # Se configurará después de crear el webhook en Teams
  
  # Tags específicos Hub
  tags = {
    Project     = "DXC-Cloud-Mind"
    Environment = "poc-test"  # Changed from "poc" to simulate drift
    CostCenter  = "shared-services"
    ManagedBy   = "terraform"
    Repository  = "DXC_PoC_Nirvana"
    DriftTest   = "true"  # New tag to simulate drift
    LastUpdate  = "2025-10-20"  # New tag to simulate drift
  }
}

# Terraform source para Hub
# Use parent directory to include both environments/hub and modules/
# The // indicates where terraform should run from within the copied directory
terraform {
  source = "${get_parent_terragrunt_dir()}//environments/hub"
}
