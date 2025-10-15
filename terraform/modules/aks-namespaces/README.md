# AKS Namespaces Module

## Description

This Terraform module configures Kubernetes namespaces in an existing AKS cluster for workload isolation in the DXC Cloud Mind PoC project.

## PoC Optimization

- **Zero Additional Cost**: Uses existing AKS cluster
- **Resource Quotas**: Prevents resource exhaustion
- **Namespace Isolation**: Separates Dify platform from use case workloads
- **Optional Network Policies**: Can be enabled for production

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AKS Cluster (Existing)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │  dify namespace  │         │  cloudmind namespace    │  │
│  ├──────────────────┤         ├─────────────────────────┤  │
│  │ Dify AI Platform │         │ Use Cases & Workloads   │  │
│  │                  │         │                         │  │
│  │ Resource Quota:  │         │ Resource Quota:         │  │
│  │ - CPU: 4-8 cores │         │ - CPU: 2-4 cores        │  │
│  │ - RAM: 8-16 GB   │         │ - RAM: 4-8 GB           │  │
│  │ - Pods: 50       │         │ - Pods: 30              │  │
│  └──────────────────┘         └─────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Usage

```hcl
module "aks_namespaces" {
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/aks-namespaces?ref=master"

  create_dify_namespace      = true
  create_cloudmind_namespace = true
  
  enable_resource_quotas   = true
  enable_network_policies  = false  # PoC: disabled for simplicity
  
  common_labels = {
    project     = "DXC-Cloud-Mind"
    environment = "poc"
    managed-by  = "terraform"
  }
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.5 |
| kubernetes | ~> 2.23 |

## Providers

| Name | Version |
|------|---------|
| kubernetes | ~> 2.23 |

## Resources

| Name | Type |
|------|------|
| kubernetes_namespace.dify | resource |
| kubernetes_namespace.cloudmind | resource |
| kubernetes_resource_quota.dify | resource |
| kubernetes_resource_quota.cloudmind | resource |
| kubernetes_network_policy.dify_default_deny | resource |
| kubernetes_network_policy.cloudmind_default_deny | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| create_dify_namespace | Create namespace for Dify AI Platform | `bool` | `true` | no |
| create_cloudmind_namespace | Create namespace for Cloud Mind workloads | `bool` | `true` | no |
| dify_namespace_name | Name for Dify namespace | `string` | `"dify"` | no |
| cloudmind_namespace_name | Name for Cloud Mind namespace | `string` | `"cloudmind"` | no |
| enable_resource_quotas | Enable resource quotas for namespaces | `bool` | `true` | no |
| enable_network_policies | Enable network policies for isolation | `bool` | `false` | no |
| common_labels | Common labels to apply to all namespaces | `map(string)` | `{}` | no |
| dify_quota_cpu | CPU request quota for Dify namespace | `string` | `"4"` | no |
| dify_quota_memory | Memory request quota for Dify namespace | `string` | `"8Gi"` | no |
| dify_quota_cpu_limit | CPU limit quota for Dify namespace | `string` | `"8"` | no |
| dify_quota_memory_limit | Memory limit quota for Dify namespace | `string` | `"16Gi"` | no |
| dify_quota_pods | Maximum number of pods in Dify namespace | `string` | `"50"` | no |
| cloudmind_quota_cpu | CPU request quota for Cloud Mind namespace | `string` | `"2"` | no |
| cloudmind_quota_memory | Memory request quota for Cloud Mind namespace | `string` | `"4Gi"` | no |
| cloudmind_quota_cpu_limit | CPU limit quota for Cloud Mind namespace | `string` | `"4"` | no |
| cloudmind_quota_memory_limit | Memory limit quota for Cloud Mind namespace | `string` | `"8Gi"` | no |
| cloudmind_quota_pods | Maximum number of pods in Cloud Mind namespace | `string` | `"30"` | no |

## Outputs

| Name | Description |
|------|-------------|
| dify_namespace_name | Name of the Dify namespace |
| cloudmind_namespace_name | Name of the Cloud Mind namespace |
| dify_namespace_labels | Labels applied to Dify namespace |
| cloudmind_namespace_labels | Labels applied to Cloud Mind namespace |
| resource_quotas_enabled | Whether resource quotas are enabled |
| network_policies_enabled | Whether network policies are enabled |

## Production Recommendations

For production deployments, consider enabling:

1. **Network Policies**: Restrict inter-namespace communication
2. **Pod Security Policies**: Enforce security standards
3. **Resource Limits**: Per-pod limits in addition to namespace quotas
4. **Monitoring**: Enable Container Insights and configure alerts
5. **RBAC**: Implement role-based access control per namespace

## Cost Impact

**PoC**: $0/month (uses existing AKS)  
**Production**: $0/month (namespace configuration has no cost)

## License

MIT
