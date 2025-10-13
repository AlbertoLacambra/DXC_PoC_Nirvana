variable "resource_group_name" {
  type        = string
  description = "Name of the resource group for monitoring resources"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "log_analytics_name" {
  type        = string
  description = "Name of the Log Analytics Workspace"
}

variable "log_analytics_sku" {
  type        = string
  description = "SKU for Log Analytics Workspace"
  default     = "PerGB2018"
  
  validation {
    condition     = contains(["Free", "PerNode", "Premium", "Standard", "Standalone", "Unlimited", "CapacityReservation", "PerGB2018"], var.log_analytics_sku)
    error_message = "SKU must be a valid Log Analytics SKU."
  }
}

variable "log_analytics_retention_days" {
  type        = number
  description = "Retention period in days for Log Analytics"
  default     = 30
  
  validation {
    condition     = var.log_analytics_retention_days >= 30 && var.log_analytics_retention_days <= 730
    error_message = "Retention must be between 30 and 730 days."
  }
}

variable "log_analytics_daily_quota_gb" {
  type        = number
  description = "Daily ingestion quota in GB (-1 for unlimited)"
  default     = -1
}

variable "app_insights_name" {
  type        = string
  description = "Name of Application Insights"
}

variable "app_insights_application_type" {
  type        = string
  description = "Application type for Application Insights"
  default     = "web"
  
  validation {
    condition     = contains(["web", "other", "java", "MobileCenter", "Node.JS", "ios", "phone"], var.app_insights_application_type)
    error_message = "Application type must be valid."
  }
}

variable "app_insights_retention_days" {
  type        = number
  description = "Retention period in days for Application Insights"
  default     = 90
  
  validation {
    condition     = contains([30, 60, 90, 120, 180, 270, 365, 550, 730], var.app_insights_retention_days)
    error_message = "Retention must be 30, 60, 90, 120, 180, 270, 365, 550, or 730 days."
  }
}

variable "app_insights_sampling_percentage" {
  type        = number
  description = "Sampling percentage for Application Insights"
  default     = 100
  
  validation {
    condition     = var.app_insights_sampling_percentage >= 0 && var.app_insights_sampling_percentage <= 100
    error_message = "Sampling percentage must be between 0 and 100."
  }
}

variable "enable_container_insights" {
  type        = bool
  description = "Enable Container Insights solution"
  default     = true
}

variable "enable_security_insights" {
  type        = bool
  description = "Enable Security Insights solution"
  default     = false
}

variable "enable_updates" {
  type        = bool
  description = "Enable Updates solution"
  default     = false
}

variable "create_action_group" {
  type        = bool
  description = "Create an action group for alerts"
  default     = false
}

variable "action_group_name" {
  type        = string
  description = "Name of the action group"
  default     = "cc-alerts"
}

variable "action_group_short_name" {
  type        = string
  description = "Short name for action group (max 12 chars)"
  default     = "cc-alerts"
  
  validation {
    condition     = length(var.action_group_short_name) <= 12
    error_message = "Short name must be 12 characters or less."
  }
}

variable "action_group_emails" {
  type        = map(string)
  description = "Map of email receivers (name => email)"
  default     = {}
}

variable "action_group_webhooks" {
  type        = map(string)
  description = "Map of webhook receivers (name => URI)"
  default     = {}
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to resources"
  default     = {}
}
