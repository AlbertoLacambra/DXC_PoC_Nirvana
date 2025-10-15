# Outputs for AKS Namespaces Module

output "dify_namespace_name" {
  description = "Name of the Dify namespace"
  value       = var.create_dify_namespace ? kubernetes_namespace.dify[0].metadata[0].name : null
}

output "cloudmind_namespace_name" {
  description = "Name of the Cloud Mind namespace"
  value       = var.create_cloudmind_namespace ? kubernetes_namespace.cloudmind[0].metadata[0].name : null
}

output "dify_namespace_labels" {
  description = "Labels applied to Dify namespace"
  value       = var.create_dify_namespace ? kubernetes_namespace.dify[0].metadata[0].labels : null
}

output "cloudmind_namespace_labels" {
  description = "Labels applied to Cloud Mind namespace"
  value       = var.create_cloudmind_namespace ? kubernetes_namespace.cloudmind[0].metadata[0].labels : null
}

output "resource_quotas_enabled" {
  description = "Whether resource quotas are enabled"
  value       = var.enable_resource_quotas
}

output "network_policies_enabled" {
  description = "Whether network policies are enabled"
  value       = var.enable_network_policies
}
