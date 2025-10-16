# Terraform Modules

## Módulos Disponibles

### 1. container-registry

**Path**: `terraform/modules/container-registry`

**Purpose**: Azure Container Registry con role assignments

**Inputs**:

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `location` | string | Azure region | Required |
| `resource_group_name` | string | RG name | Required |
| `aks_kubelet_identity_object_id` | string | AKS identity for AcrPull | Required |
| `enable_diagnostic_setting` | bool | Enable diagnostics | false |
| `log_analytics_workspace_id` | string | Workspace ID | null |
| `tags` | map(string) | Resource tags | {} |

**Outputs**:

| Output | Description |
|--------|-------------|
| `acr_id` | ACR resource ID |
| `acr_login_server` | ACR login server URL |
| `acr_name` | ACR name |

**Usage**:

```hcl
module "acr" {
  source = "../../modules/container-registry"
  
  location            = "westeurope"
  resource_group_name = azurerm_resource_group.acr.name
  aks_kubelet_identity_object_id = data.azurerm_kubernetes_cluster.dify.kubelet_identity[0].object_id
  
  tags = {
    Environment = "Production"
    Project     = "CloudMind"
  }
}
```

### 2. aks-namespaces

**Path**: `terraform/modules/aks-namespaces`

**Purpose**: Kubernetes namespace con resource quotas

**Inputs**:

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `namespace_name` | string | K8s namespace name | Required |
| `cpu_requests` | string | CPU requests quota | "4" |
| `memory_requests` | string | Memory requests quota | "8Gi" |
| `cpu_limits` | string | CPU limits quota | "6" |
| `memory_limits` | string | Memory limits quota | "12Gi" |
| `pods` | string | Max pods | "30" |

**Outputs**:

| Output | Description |
|--------|-------------|
| `namespace_name` | Created namespace name |
| `resource_quota_name` | Created quota name |

**Usage**:

```hcl
module "cloudmind_namespace" {
  source = "../../modules/aks-namespaces"
  
  namespace_name    = "cloudmind"
  cpu_requests      = "4"
  memory_requests   = "8Gi"
  cpu_limits        = "6"
  memory_limits     = "12Gi"
  pods              = "30"
}
```

## Module Development Guidelines

### Structure

```text
module-name/
├── main.tf           # Resources
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── versions.tf       # Provider versions
└── README.md         # Documentation
```

### Best Practices

1. **Versioning**: Use semantic versioning
2. **Documentation**: Auto-generate with terraform-docs
3. **Testing**: Test modules before use
4. **Variables**: Use sensible defaults
5. **Outputs**: Expose useful values

### Example Module

```hcl
# variables.tf
variable "name" {
  description = "Resource name"
  type        = string
}

# main.tf
resource "azurerm_resource_group" "this" {
  name     = var.name
  location = "westeurope"
}

# outputs.tf
output "id" {
  description = "Resource group ID"
  value       = azurerm_resource_group.this.id
}
```

## Referencias

- [Container Registry Source](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/tree/master/terraform/modules/container-registry)
- [AKS Namespaces Source](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/tree/master/terraform/modules/aks-namespaces)
