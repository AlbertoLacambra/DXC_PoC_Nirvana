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
  # Container Registry
  create_acr = true
  acr_config = {
    name_prefix                   = "ccacr"
    sku                           = "Standard"
    admin_enabled                 = false
    public_network_access_enabled = true
    retention_policy_enabled      = false  # Only available with Premium SKU
    retention_policy_days         = 7      # Ignored when retention_policy_enabled=false
  }
  
  # Monitoring
  create_monitoring = true
  monitoring_config = {
    log_analytics_name        = "cc-logs-workspace"
    log_analytics_sku         = "PerGB2018"
    log_analytics_retention   = 30
    app_insights_name         = "cc-app-insights"
    app_insights_type         = "web"
    enable_container_insights = true
  }
  
  # Action Group para alertas
  create_action_group = true
  action_group_config = {
    name       = "cc-alerts"
    short_name = "cc-alerts"
    emails = {
      admin = "alberto.lacambra@dxc.com"
    }
    webhooks = {
      # slack = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    }
  }
  
  # Tags específicos Hub
  tags = {
    Environment = "hub"
    CostCenter  = "shared-services"
    Criticality = "high"
    Backup      = "daily"
  }
}

# Terraform source para Hub
# Note: environments/hub contains a symlink to ../../modules
# This allows Terragrunt to copy both the environment code and modules
terraform {
  source = "${get_parent_terragrunt_dir()}/environments/hub"
}
