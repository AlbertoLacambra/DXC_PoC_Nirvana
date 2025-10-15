# Variables for AKS Namespaces Module

variable "create_dify_namespace" {
  type        = bool
  description = "Create namespace for Dify AI Platform"
  default     = true
}

variable "create_cloudmind_namespace" {
  type        = bool
  description = "Create namespace for Cloud Mind workloads"
  default     = true
}

variable "dify_namespace_name" {
  type        = string
  description = "Name for Dify namespace"
  default     = "dify"
}

variable "cloudmind_namespace_name" {
  type        = string
  description = "Name for Cloud Mind namespace"
  default     = "cloudmind"
}

variable "common_labels" {
  type        = map(string)
  description = "Common labels to apply to all namespaces"
  default     = {}
}

variable "enable_resource_quotas" {
  type        = bool
  description = "Enable resource quotas for namespaces (recommended for PoC)"
  default     = true
}

variable "enable_network_policies" {
  type        = bool
  description = "Enable network policies for namespace isolation"
  default     = false  # Disabled by default for PoC simplicity
}

# Dify Namespace Resource Quotas
variable "dify_quota_cpu" {
  type        = string
  description = "CPU request quota for Dify namespace"
  default     = "4"  # 4 vCPUs
}

variable "dify_quota_memory" {
  type        = string
  description = "Memory request quota for Dify namespace"
  default     = "8Gi"
}

variable "dify_quota_cpu_limit" {
  type        = string
  description = "CPU limit quota for Dify namespace"
  default     = "8"  # 8 vCPUs max
}

variable "dify_quota_memory_limit" {
  type        = string
  description = "Memory limit quota for Dify namespace"
  default     = "16Gi"
}

variable "dify_quota_pods" {
  type        = string
  description = "Maximum number of pods in Dify namespace"
  default     = "50"
}

# Cloud Mind Namespace Resource Quotas
variable "cloudmind_quota_cpu" {
  type        = string
  description = "CPU request quota for Cloud Mind namespace"
  default     = "2"  # 2 vCPUs
}

variable "cloudmind_quota_memory" {
  type        = string
  description = "Memory request quota for Cloud Mind namespace"
  default     = "4Gi"
}

variable "cloudmind_quota_cpu_limit" {
  type        = string
  description = "CPU limit quota for Cloud Mind namespace"
  default     = "4"  # 4 vCPUs max
}

variable "cloudmind_quota_memory_limit" {
  type        = string
  description = "Memory limit quota for Cloud Mind namespace"
  default     = "8Gi"
}

variable "cloudmind_quota_pods" {
  type        = string
  description = "Maximum number of pods in Cloud Mind namespace"
  default     = "30"
}
