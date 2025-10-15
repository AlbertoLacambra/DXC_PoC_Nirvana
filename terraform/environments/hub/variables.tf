variable "existing_resources" {
  type = object({
    resource_group_name    = string
    aks_cluster_name       = string
    vnet_name              = string
    postgresql_server_name = string
    storage_account_name   = string
    key_vault_name         = string
  })
  description = "Existing Dify resources to reference (data sources)"
}

variable "create_acr" {
  type        = bool
  description = "Create Container Registry"
  default     = true
}

variable "acr_config" {
  type = object({
    name_prefix                   = string
    sku                           = string
    admin_enabled                 = bool
    public_network_access_enabled = bool
    retention_policy_enabled      = bool
    retention_policy_days         = number
  })
  description = "ACR configuration"
}

# PoC: Monitoring variables removed - using free Container Insights only
# For production, add back: monitoring_config, action_group_config
# See: PROJECT_LOGBOOK.md - Production Recommendations

