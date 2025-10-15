# Hub Environment - Terraform Variables
# Auto-generated from terragrunt.hcl configuration

# Existing Dify resources (data sources)
existing_resources = {
  resource_group_name    = "dify-rg"
  aks_cluster_name       = "dify-aks"
  vnet_name              = "dify-private-vnet"
  postgresql_server_name = "dify-postgres-9107e36a"
  storage_account_name   = "difyprivatest9107e36a"
  key_vault_name         = "dify-private-kv-9107e36a"
}

# Container Registry Configuration - PoC Optimized
create_acr = true
acr_config = {
  name_prefix                   = "dxccloudmind"
  sku                           = "Basic"
  admin_enabled                 = false
  public_network_access_enabled = true
  retention_policy_enabled      = false
  retention_policy_days         = 7
}

# Location
location = "northeurope"

# Environment
environment = "hub"

# Tags
tags = {
  Project     = "DXC-Cloud-Mind"
  Environment = "poc"
  CostCenter  = "shared-services"
  ManagedBy   = "terraform"
  Repository  = "DXC_PoC_Nirvana"
}
