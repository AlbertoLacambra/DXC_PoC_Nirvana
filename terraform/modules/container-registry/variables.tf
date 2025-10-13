variable "resource_group_name" {
  type        = string
  description = "Name of the resource group for ACR"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "acr_name_prefix" {
  type        = string
  description = "Prefix for ACR name (will add random suffix)"
  default     = "ccacr"
}

variable "sku" {
  type        = string
  description = "ACR SKU (Basic, Standard, Premium)"
  default     = "Standard"
  
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.sku)
    error_message = "SKU must be Basic, Standard, or Premium."
  }
}

variable "admin_enabled" {
  type        = bool
  description = "Enable admin user (not recommended for production)"
  default     = false
}

variable "public_network_access_enabled" {
  type        = bool
  description = "Enable public network access"
  default     = true
}

variable "network_rule_set_enabled" {
  type        = bool
  description = "Enable network rule set"
  default     = false
}

variable "network_rule_default_action" {
  type        = string
  description = "Default action for network rules (Allow or Deny)"
  default     = "Allow"
}

variable "allowed_ip_ranges" {
  type        = list(string)
  description = "List of allowed IP ranges (CIDR)"
  default     = []
}

variable "allowed_subnet_ids" {
  type        = list(string)
  description = "List of allowed subnet IDs"
  default     = []
}

variable "retention_policy_enabled" {
  type        = bool
  description = "Enable retention policy for untagged manifests"
  default     = true
}

variable "retention_policy_days" {
  type        = number
  description = "Number of days to retain untagged manifests"
  default     = 7
}

variable "georeplications" {
  type = list(object({
    location                = string
    zone_redundancy_enabled = bool
  }))
  description = "List of geo-replication locations"
  default     = []
}

variable "aks_principal_ids" {
  type        = list(string)
  description = "List of AKS kubelet identity principal IDs for AcrPull role"
  default     = []
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "Log Analytics Workspace ID for diagnostics"
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to resources"
  default     = {}
}
