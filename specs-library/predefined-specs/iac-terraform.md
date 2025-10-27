# IaC Best Practices - Terraform

**Domain**: Infrastructure as Code  
**Version**: 1.0  
**Last Updated**: 2025-10-27  
**Applicable To**: Terraform projects on Azure, AWS, GCP

---

## Overview

Esta especificación define las mejores prácticas de Infrastructure as Code (IaC) con Terraform para proyectos en DXC Cloud Mind - Nirvana.  
Cubre estructura de módulos, naming conventions, state management, tagging y compliance.

**¿Por qué esta spec?**

- Prevenir drift de infraestructura y configuración manual
- Facilitar disaster recovery y replicación de entornos
- Mantener infraestructura versionada y auditable
- Garantizar consistency entre dev/staging/prod

**Aplicable a**:

- ✅ Todos los proyectos de infraestructura (Azure, AWS, GCP)
- ✅ Despliegues multi-environment (dev, staging, prod)
- ✅ Equipos que gestionan recursos cloud

---

## 1. Project Structure

### Standard Directory Layout

```text
terraform-project/
├── modules/                    # Reusable modules
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── storage/
│   └── monitoring/
│
├── environments/               # Environment-specific configs
│   ├── dev/
│   │   ├── main.tf            # Calls modules
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars   # Environment-specific values
│   │   └── backend.tf         # Remote state config
│   ├── staging/
│   └── prod/
│
├── global/                     # Global resources (DNS, IAM)
│   ├── main.tf
│   └── terraform.tfvars
│
├── tests/                      # Terratest or similar
│   └── terratest/
│
├── .gitignore
├── .terraform-version          # tfenv version
└── README.md
```

### File Organization

#### `main.tf` - Resource Definitions

```hcl
# main.tf
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

# Resources
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}
```

#### `variables.tf` - Input Variables

```hcl
# variables.tf
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}
```

#### `outputs.tf` - Output Values

```hcl
# outputs.tf
output "resource_group_id" {
  description = "Resource group ID"
  value       = azurerm_resource_group.main.id
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.main.name
}
```

#### `terraform.tfvars` - Environment Values

```hcl
# environments/prod/terraform.tfvars
environment         = "prod"
location            = "East US"
resource_group_name = "nirvana-prod-rg"
```

**⚠️ Important**: Add `*.tfvars` to `.gitignore` if contains secrets, or use `*.auto.tfvars` for committed values

---

## 2. Naming Conventions

### Resource Naming Pattern

```text
<project>-<environment>-<resource_type>-<description>
```

**Examples**:

```hcl
# ✅ CORRECTO
resource "azurerm_virtual_network" "main" {
  name                = "nirvana-prod-vnet-main"
  resource_group_name = "nirvana-prod-rg"
  location            = "East US"
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "nirvana-prod-aks-cluster"
  location            = "East US"
  resource_group_name = "nirvana-prod-rg"
  dns_prefix          = "nirvana-prod-aks"
  # ...
}

resource "azurerm_storage_account" "logs" {
  name                     = "nirvanaprodlogssa"  # No dashes (storage limitation)
  resource_group_name      = "nirvana-prod-rg"
  location                 = "East US"
  account_tier             = "Standard"
  account_replication_type = "GRS"
}

# ❌ INCORRECTO (no pattern, unclear)
resource "azurerm_virtual_network" "vnet" {
  name = "my-vnet"  # No project, no environment
}
```

### Variable Naming

**Use `snake_case`**:

```hcl
# ✅ CORRECTO
variable "resource_group_name" { }
variable "virtual_network_address_space" { }
variable "enable_monitoring" { }

# ❌ INCORRECTO
variable "resourceGroupName" { }  # camelCase
variable "VnetAddressSpace" { }   # PascalCase
```

### Module Naming

**Use descriptive names**:

```text
modules/
├── networking/           ✅ Clear purpose
├── aks-cluster/          ✅ Specific resource
├── monitoring-stack/     ✅ Grouped functionality
└── app-service/          ✅ Service-focused

❌ modules/infra/         Too vague
❌ modules/resources/     Too generic
```

---

## 3. State Management

### Remote State (Mandatory)

**Never use local state for team projects**:

```hcl
# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "nirvana-tfstate-rg"
    storage_account_name = "nirvanatfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
    use_azuread_auth     = true
  }
}
```

**Alternative: AWS S3**

```hcl
terraform {
  backend "s3" {
    bucket         = "nirvana-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "nirvana-tfstate-lock"
  }
}
```

### State Locking

**Azure**: Automatic with Azure Storage Account  
**AWS**: Use DynamoDB table for locking

**Test locking**:

```bash
# Terminal 1
terraform plan  # Acquires lock

# Terminal 2 (simultaneous)
terraform plan  # Should wait or fail with lock error
```

### State Encryption

**Mandatory**: Enable encryption at rest

```bash
# Azure Storage Account
az storage account update \
  --name nirvanatfstate \
  --resource-group nirvana-tfstate-rg \
  --encryption-services blob
```

### `.gitignore` (Critical)

```gitignore
# .gitignore
# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl
crash.log
override.tf
override.tf.json

# Environment variables
*.tfvars  # If contains secrets
.env

# Local files
.DS_Store
```

---

## 4. Modules Best Practices

### Creating Reusable Modules

#### Module Structure

```text
modules/networking/
├── main.tf          # Resources
├── variables.tf     # Inputs
├── outputs.tf       # Outputs
├── README.md        # Documentation
└── examples/        # Usage examples
    └── basic/
        ├── main.tf
        └── terraform.tfvars
```

#### Example Module: Networking

```hcl
# modules/networking/main.tf
resource "azurerm_virtual_network" "main" {
  name                = var.vnet_name
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = var.address_space
  tags                = var.tags
}

resource "azurerm_subnet" "subnets" {
  for_each = var.subnets
  
  name                 = each.key
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [each.value.address_prefix]
}
```

```hcl
# modules/networking/variables.tf
variable "vnet_name" {
  description = "Virtual network name"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "address_space" {
  description = "Address space for VNet"
  type        = list(string)
}

variable "subnets" {
  description = "Map of subnets to create"
  type = map(object({
    address_prefix = string
  }))
  default = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
```

```hcl
# modules/networking/outputs.tf
output "vnet_id" {
  description = "Virtual network ID"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Virtual network name"
  value       = azurerm_virtual_network.main.name
}

output "subnet_ids" {
  description = "Map of subnet IDs"
  value       = { for k, v in azurerm_subnet.subnets : k => v.id }
}
```

#### Using the Module

```hcl
# environments/prod/main.tf
module "networking" {
  source = "../../modules/networking"
  
  vnet_name           = "nirvana-prod-vnet-main"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  address_space       = ["10.0.0.0/16"]
  
  subnets = {
    "frontend" = {
      address_prefix = "10.0.1.0/24"
    }
    "backend" = {
      address_prefix = "10.0.2.0/24"
    }
    "database" = {
      address_prefix = "10.0.3.0/24"
    }
  }
  
  tags = local.common_tags
}
```

### Module Versioning

**Use Git tags for module versions**:

```hcl
# Reference specific version
module "networking" {
  source = "git::https://github.com/dxc/terraform-modules.git//networking?ref=v1.2.0"
  # ...
}

# Or Terraform Registry
module "networking" {
  source  = "dxc/networking/azurerm"
  version = "~> 1.2"
  # ...
}
```

---

## 5. Tagging Strategy

### Mandatory Tags

**All resources MUST have**:

```hcl
locals {
  common_tags = {
    Environment = var.environment        # dev | staging | prod
    Project     = "DXC-Nirvana"
    ManagedBy   = "Terraform"
    CostCenter  = "CloudOps"
    Owner       = "team@dxc.com"
    CreatedDate = formatdate("YYYY-MM-DD", timestamp())
  }
}

resource "azurerm_resource_group" "main" {
  name     = "nirvana-prod-rg"
  location = "East US"
  tags     = local.common_tags
}
```

### Optional Tags

```hcl
locals {
  optional_tags = {
    Application   = "Control Center"
    BusinessUnit  = "Digital Transformation"
    Compliance    = "SOC2, GDPR"
    DataClass     = "Confidential"
    Backup        = "Daily"
    MonitoringLevel = "Critical"
  }
  
  all_tags = merge(local.common_tags, local.optional_tags)
}
```

### Enforcing Tags with Policy

**Azure Policy Example**:

```hcl
resource "azurerm_policy_definition" "require_tags" {
  name         = "require-tags-policy"
  policy_type  = "Custom"
  mode         = "All"
  display_name = "Require mandatory tags"

  policy_rule = jsonencode({
    if = {
      allOf = [
        {
          field  = "type"
          equals = "Microsoft.Resources/subscriptions/resourceGroups"
        },
        {
          anyOf = [
            {
              field  = "tags['Environment']"
              exists = false
            },
            {
              field  = "tags['Project']"
              exists = false
            }
          ]
        }
      ]
    }
    then = {
      effect = "deny"
    }
  })
}
```

---

## 6. Security Best Practices

### Secrets Management

**NEVER hardcode secrets**:

```hcl
# ❌ INCORRECTO
resource "azurerm_sql_server" "main" {
  administrator_login          = "adminuser"
  administrator_login_password = "P@ssw0rd123!"  # NEVER DO THIS!
}

# ✅ CORRECTO: Use Azure Key Vault
data "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  key_vault_id = data.azurerm_key_vault.main.id
}

resource "azurerm_sql_server" "main" {
  administrator_login          = "adminuser"
  administrator_login_password = data.azurerm_key_vault_secret.sql_admin_password.value
}
```

**Or use environment variables**:

```hcl
variable "sql_admin_password" {
  description = "SQL admin password"
  type        = string
  sensitive   = true
}

resource "azurerm_sql_server" "main" {
  administrator_login          = "adminuser"
  administrator_login_password = var.sql_admin_password
}
```

```bash
# Set via environment variable
export TF_VAR_sql_admin_password="P@ssw0rd123!"
terraform apply
```

### Sensitive Outputs

**Mark sensitive outputs**:

```hcl
output "database_connection_string" {
  description = "Database connection string"
  value       = azurerm_sql_server.main.fully_qualified_domain_name
  sensitive   = true  # Won't display in terraform output
}
```

### Network Security

**Enable private endpoints**:

```hcl
resource "azurerm_storage_account" "main" {
  name                     = "nirvanaprodsa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  # Security settings
  public_network_access_enabled   = false  # Disable public access
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"
  
  network_rules {
    default_action = "Deny"
    ip_rules       = []
    virtual_network_subnet_ids = [
      azurerm_subnet.backend.id
    ]
  }
}
```

---

## 7. Code Quality

### Formatting

**Always run `terraform fmt`**:

```bash
# Format all files
terraform fmt -recursive

# Check if files are formatted
terraform fmt -check -recursive
```

**Add to pre-commit**:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.83.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_docs
```

### Validation

**Validate configuration**:

```bash
terraform init
terraform validate
```

### Linting

**Use `tflint`**:

```bash
# Install
brew install tflint

# Run
tflint --init
tflint
```

**`.tflint.hcl` config**:

```hcl
plugin "azurerm" {
  enabled = true
  version = "0.25.0"
  source  = "github.com/terraform-linters/tflint-ruleset-azurerm"
}

rule "terraform_naming_convention" {
  enabled = true
}

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_deprecated_syntax" {
  enabled = true
}
```

---

## 8. Drift Detection

### Automated Drift Detection

**Run `terraform plan` daily in CI/CD**:

```yaml
# .github/workflows/drift-detection.yml
name: Drift Detection

on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM

jobs:
  detect-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Init
        run: terraform init
        working-directory: environments/prod
      
      - name: Terraform Plan
        run: terraform plan -detailed-exitcode
        working-directory: environments/prod
        continue-on-error: true
        id: plan
      
      - name: Notify if drift detected
        if: steps.plan.outcome == 'failure'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Infrastructure Drift Detected',
              body: 'Drift detected in production environment. Run `terraform plan` to see changes.'
            })
```

### Drift Reconciliation

**Process**:

1. **Detect**: Daily `terraform plan` in CI/CD
2. **Alert**: Create issue/ticket when drift detected
3. **Investigate**: Determine if drift is justified (emergency change) or accidental
4. **Document**: If justified, update Terraform to match reality
5. **Remediate**: If accidental, apply Terraform to restore state
6. **Deadline**: Reconcile drift within **48 hours**

---

## 9. Testing

### Terratest

**Structure**:

```text
tests/
└── terratest/
    ├── go.mod
    ├── go.sum
    └── networking_test.go
```

**Example Test**:

```go
// tests/terratest/networking_test.go
package test

import (
  "testing"
  "github.com/gruntwork-io/terratest/modules/terraform"
  "github.com/stretchr/testify/assert"
)

func TestNetworkingModule(t *testing.T) {
  t.Parallel()

  terraformOptions := &terraform.Options{
    TerraformDir: "../../modules/networking",
    Vars: map[string]interface{}{
      "vnet_name":           "test-vnet",
      "resource_group_name": "test-rg",
      "location":            "East US",
      "address_space":       []string{"10.0.0.0/16"},
    },
  }

  defer terraform.Destroy(t, terraformOptions)
  
  terraform.InitAndApply(t, terraformOptions)
  
  vnetID := terraform.Output(t, terraformOptions, "vnet_id")
  assert.NotEmpty(t, vnetID)
}
```

**Run tests**:

```bash
cd tests/terratest
go mod init terratest
go mod tidy
go test -v -timeout 30m
```

### Pre-deployment Validation

```bash
# 1. Format check
terraform fmt -check -recursive

# 2. Validate
terraform validate

# 3. Plan
terraform plan -out=tfplan

# 4. Show plan (human-readable)
terraform show tfplan

# 5. Apply (after approval)
terraform apply tfplan
```

---

## 10. CI/CD Pipeline

### Pipeline Stages

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
      - 'environments/**'
      - 'modules/**'
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    env:
      ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
      ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
      ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.7
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive
      
      - name: Terraform Init
        run: terraform init
        working-directory: environments/prod
      
      - name: Terraform Validate
        run: terraform validate
        working-directory: environments/prod
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
        working-directory: environments/prod
      
      - name: Upload Plan
        uses: actions/upload-artifact@v3
        with:
          name: tfplan
          path: environments/prod/tfplan
      
      # Only apply on push to main (after approval)
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
        working-directory: environments/prod
```

### Deployment Approval

**GitHub Environments**:

```yaml
jobs:
  terraform-apply:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Terraform Apply
        run: terraform apply -auto-approve
```

---

## 11. Cost Management

### Budget Alerts

```hcl
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "nirvana-prod-budget"
  resource_group_id = azurerm_resource_group.main.id

  amount     = 5000
  time_grain = "Monthly"

  time_period {
    start_date = "2025-01-01T00:00:00Z"
  }

  notification {
    enabled   = true
    threshold = 50
    operator  = "GreaterThan"

    contact_emails = [
      "team@dxc.com",
    ]
  }

  notification {
    enabled   = true
    threshold = 90
    operator  = "GreaterThan"

    contact_emails = [
      "team@dxc.com",
      "finance@dxc.com",
    ]
  }
}
```

### Cost Estimation

**Use Infracost**:

```yaml
# .github/workflows/infracost.yml
- name: Setup Infracost
  uses: infracost/actions/setup@v2
  with:
    api-key: ${{ secrets.INFRACOST_API_KEY }}

- name: Run Infracost
  run: |
    infracost breakdown \
      --path=environments/prod \
      --format=json \
      --out-file=infracost.json

- name: Post PR Comment
  uses: infracost/actions/comment@v1
  with:
    path: infracost.json
```

**Result**: PR comments with cost impact

```text
💰 Cost estimate: +$450/month
+ azurerm_kubernetes_cluster.main: +$350/month
+ azurerm_postgresql_server.main: +$100/month
```

---

## 12. Documentation

### README.md Template

```markdown
# Terraform Infrastructure - [Project]

## Overview

Brief description of infrastructure managed by this Terraform project.

## Architecture

[Diagram or description]

## Prerequisites

- Terraform >= 1.5.0
- Azure CLI >= 2.50.0
- Access to Azure subscription

## Usage

### Initialize

```bash
cd environments/prod
terraform init
```

### Plan

```bash
terraform plan -out=tfplan
```

### Apply

```bash
terraform apply tfplan
```

## Modules

- `networking`: VNet, subnets, NSGs
- `compute`: AKS cluster, VMs
- `storage`: Storage accounts, databases

## Environments

- **dev**: Development environment
- **staging**: Pre-production
- **prod**: Production

## State Management

State is stored in Azure Storage Account:

- Resource Group: `nirvana-tfstate-rg`
- Storage Account: `nirvanatfstate`
- Container: `tfstate`

## Tags

All resources are tagged with:

- Environment
- Project
- ManagedBy
- CostCenter
- Owner

## Contributing

1. Create feature branch
2. Make changes
3. Run `terraform fmt`
4. Create PR
5. After approval, merge to main

## Troubleshooting

### Error: State lock

Wait for concurrent operation to complete or:

```bash
terraform force-unlock <LOCK_ID>
```
```

### Module README

```markdown
# Networking Module

Creates Azure Virtual Network with subnets.

## Usage

```hcl
module "networking" {
  source = "../../modules/networking"
  
  vnet_name           = "my-vnet"
  resource_group_name = "my-rg"
  location            = "East US"
  address_space       = ["10.0.0.0/16"]
  
  subnets = {
    "frontend" = { address_prefix = "10.0.1.0/24" }
  }
  
  tags = { Environment = "prod" }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| vnet_name | Virtual network name | string | - | yes |
| address_space | Address space | list(string) | - | yes |

## Outputs

| Name | Description |
|------|-------------|
| vnet_id | Virtual network ID |
| subnet_ids | Map of subnet IDs |
```

---

## 13. Compliance Checklist

### Pre-Merge Checklist

- [ ] **Formatting**: `terraform fmt` applied
- [ ] **Validation**: `terraform validate` passes
- [ ] **Linting**: `tflint` passes
- [ ] **Naming**: Resources follow naming convention
- [ ] **Tagging**: All resources have mandatory tags
- [ ] **Secrets**: No hardcoded secrets
- [ ] **State**: Remote state configured
- [ ] **Modules**: Reusable logic extracted to modules
- [ ] **Documentation**: README.md updated

### Pre-Deploy Checklist (Production)

- [ ] **Plan Review**: `terraform plan` reviewed by team
- [ ] **Cost Impact**: Cost estimated with Infracost
- [ ] **Backup**: State backup exists
- [ ] **Rollback Plan**: Documented and tested
- [ ] **Approval**: Tech Lead + DevOps approval
- [ ] **Monitoring**: Alerts configured for new resources
- [ ] **Testing**: Terratest passed (if applicable)

---

## 14. Success Criteria

### Adoption Metrics

- [ ] **100%** of infrastructure managed by Terraform (no manual changes)
- [ ] **Zero** drift incidents per month
- [ ] **100%** of resources have mandatory tags
- [ ] **<5%** failed Terraform applies
- [ ] **<24h** drift reconciliation time

### Code Quality

- [ ] **100%** of PRs pass `terraform fmt -check`
- [ ] **100%** of PRs pass `terraform validate`
- [ ] **>90%** of modules have tests
- [ ] **100%** of modules have README.md

---

## References

- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Azure Terraform Examples](https://github.com/hashicorp/terraform-provider-azurerm/tree/main/examples)
- [Terratest Documentation](https://terratest.gruntwork.io/)
- [Infracost](https://www.infracost.io/)
- [tflint](https://github.com/terraform-linters/tflint)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial specification |
