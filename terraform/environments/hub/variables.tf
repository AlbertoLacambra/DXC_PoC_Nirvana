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

variable "create_monitoring" {
  type        = bool
  description = "Create monitoring resources"
  default     = true
}

variable "monitoring_config" {
  type = object({
    log_analytics_name        = string
    log_analytics_sku         = string
    log_analytics_retention   = number
    app_insights_name         = string
    app_insights_type         = string
    enable_container_insights = bool
  })
  description = "Monitoring configuration"
}

variable "create_action_group" {
  type        = bool
  description = "Create action group for alerts"
  default     = false
}

variable "action_group_config" {
  type = object({
    name       = string
    short_name = string
    emails     = map(string)
    webhooks   = map(string)
  })
  description = "Action group configuration"
  default = {
    name       = "cc-alerts"
    short_name = "cc-alerts"
    emails     = {}
    webhooks   = {}
  }
}
