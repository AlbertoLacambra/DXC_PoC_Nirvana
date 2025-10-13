# Root Terragrunt Configuration
# DXC PoC Nirvana - Cloud Control Center
# Multi-subscription Hub & Spoke architecture

locals {
  # Azure regions
  primary_region = "northeurope"
  
  # Parse environment from directory path (hub, spoke-prod, spoke-dev)
  environment = basename(get_terragrunt_dir())
  
  # Map environment to container name
  # Strategy: One Storage Account, multiple containers (isolation per environment)
  container_map = {
    "hub"        = "cc-hub"
    "spoke-prod" = "cc-spoke-prod"
    "spoke-dev"  = "cc-spoke-dev"
  }
  
  # Get container name for current environment
  container_name = lookup(local.container_map, local.environment, "cc-${local.environment}")
  
  # Common tags applied to all resources
  common_tags = {
    Project     = "DXC_PoC_Nirvana"
    ManagedBy   = "Terragrunt"
    Repository  = "https://github.com/AlbertoLacambra/DXC_PoC_Nirvana"
    Owner       = "Alberto Lacambra"
    CreatedDate = "2025-10-12"
  }
}

# Remote state configuration (Azure Storage Backend)
# Strategy: Reuse existing Storage Account with multiple containers
# Storage Account: tfstate9a448729 (existing in terraform-state-rg)
# Containers: cc-hub, cc-spoke-prod, cc-spoke-dev (one per environment)
remote_state {
  backend = "azurerm"
  
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  
  config = {
    # Existing Storage Account (reused from previous deployments)
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate9a448729"
    
    # Container per environment (cc-hub, cc-spoke-prod, cc-spoke-dev)
    container_name = local.container_name
    
    # State file name (same across environments)
    key = "terraform.tfstate"
    
    # Authentication using Azure AD
    use_azuread_auth = true
    
    # Subscription ID where state storage exists (Hub)
    subscription_id = "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
  }
}

# Generate provider configuration for all environments
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  
  contents = <<EOF
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.47"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    virtual_machine {
      delete_os_disk_on_deletion     = true
      graceful_shutdown              = false
      skip_shutdown_and_force_delete = false
    }
  }
  
  subscription_id = var.subscription_id
  
  # Skip provider registration (assume subscriptions already configured)
  skip_provider_registration = true
}

provider "azuread" {
  tenant_id = var.tenant_id
}

provider "random" {}
EOF
}

# Generate common variables for all environments
# Note: Each environment can have additional variables in their own variables.tf
generate "common_variables" {
  path      = "common_variables.tf"
  if_exists = "overwrite"
  
  contents = <<EOF
variable "subscription_id" {
  type        = string
  description = "Azure subscription ID"
}

variable "tenant_id" {
  type        = string
  description = "Azure AD tenant ID"
  default     = "your-tenant-id-here"  # TODO: Replace with actual tenant ID
}

variable "environment" {
  type        = string
  description = "Environment name (hub, prod, dev)"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "northeurope"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
EOF
}

# Retry configuration for Azure API throttling
retryable_errors = [
  "(?s).*Error waiting for.*",
  "(?s).*timeout while waiting.*",
  "(?s).*operation timed out.*",
  "(?s).*TooManyRequests.*",
  "(?s).*Client\\.Timeout exceeded.*",
]

retry_max_attempts       = 3
retry_sleep_interval_sec = 5
