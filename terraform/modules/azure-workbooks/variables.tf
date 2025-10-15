# Variables for Azure Workbooks Module

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group for workbooks"
  default     = "cloudmind-monitoring-rg"
}

variable "location" {
  type        = string
  description = "Azure region for resources"
  default     = "northeurope"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}

variable "create_drift_workbook" {
  type        = bool
  description = "Create workbook for infrastructure drift detection"
  default     = true
}

variable "create_pipeline_workbook" {
  type        = bool
  description = "Create workbook for GitHub Actions pipeline status"
  default     = true
}

variable "create_aks_workbook" {
  type        = bool
  description = "Create workbook for AKS resource usage"
  default     = true
}

variable "create_cost_workbook" {
  type        = bool
  description = "Create workbook for cost tracking"
  default     = true
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "ID of the Log Analytics Workspace (uses existing dify-private-logs)"
}
