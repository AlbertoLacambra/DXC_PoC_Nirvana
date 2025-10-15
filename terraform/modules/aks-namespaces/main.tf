# AKS Namespaces Module
# Configures namespaces in existing AKS cluster for workload isolation
# PoC Optimized: Uses existing AKS, no additional costs

terraform {
  required_version = ">= 1.5"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

# Namespace for Dify AI Platform
resource "kubernetes_namespace" "dify" {
  count = var.create_dify_namespace ? 1 : 0

  metadata {
    name = var.dify_namespace_name

    labels = merge(
      var.common_labels,
      {
        "component" = "ai-platform"
        "tier"      = "core"
        "managed-by" = "terraform"
      }
    )

    annotations = {
      "description" = "Namespace for Dify AI Platform"
    }
  }
}

# Namespace for Cloud Mind workloads (use cases, bots, agents)
resource "kubernetes_namespace" "cloudmind" {
  count = var.create_cloudmind_namespace ? 1 : 0

  metadata {
    name = var.cloudmind_namespace_name

    labels = merge(
      var.common_labels,
      {
        "component" = "use-cases"
        "tier"      = "workloads"
        "managed-by" = "terraform"
      }
    )

    annotations = {
      "description" = "Namespace for Cloud Mind use cases and applications"
    }
  }
}

# Resource Quota for Dify namespace (to prevent resource exhaustion)
resource "kubernetes_resource_quota" "dify" {
  count = var.create_dify_namespace && var.enable_resource_quotas ? 1 : 0

  metadata {
    name      = "dify-quota"
    namespace = kubernetes_namespace.dify[0].metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = var.dify_quota_cpu
      "requests.memory" = var.dify_quota_memory
      "limits.cpu"      = var.dify_quota_cpu_limit
      "limits.memory"   = var.dify_quota_memory_limit
      "pods"            = var.dify_quota_pods
    }
  }
}

# Resource Quota for Cloud Mind namespace
resource "kubernetes_resource_quota" "cloudmind" {
  count = var.create_cloudmind_namespace && var.enable_resource_quotas ? 1 : 0

  metadata {
    name      = "cloudmind-quota"
    namespace = kubernetes_namespace.cloudmind[0].metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = var.cloudmind_quota_cpu
      "requests.memory" = var.cloudmind_quota_memory
      "limits.cpu"      = var.cloudmind_quota_cpu_limit
      "limits.memory"   = var.cloudmind_quota_memory_limit
      "pods"            = var.cloudmind_quota_pods
    }
  }
}

# Network Policy for Dify namespace (optional, for security)
resource "kubernetes_network_policy" "dify_default_deny" {
  count = var.create_dify_namespace && var.enable_network_policies ? 1 : 0

  metadata {
    name      = "default-deny-all"
    namespace = kubernetes_namespace.dify[0].metadata[0].name
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]
  }
}

# Network Policy for Cloud Mind namespace
resource "kubernetes_network_policy" "cloudmind_default_deny" {
  count = var.create_cloudmind_namespace && var.enable_network_policies ? 1 : 0

  metadata {
    name      = "default-deny-all"
    namespace = kubernetes_namespace.cloudmind[0].metadata[0].name
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]
  }
}
