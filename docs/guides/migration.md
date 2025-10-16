# Migración desde Terragrunt

## Overview

Guía para migración futura de Terraform standalone a Terragrunt para gestión multi-subscription.

## Por Qué Terragrunt

### Beneficios

- **DRY principle**: No repetir código backend
- **Multi-env**: Gestión simplificada de múltiples entornos
- **Dependencies**: Gestión automática de dependencias entre módulos
- **Remote state**: Configuración centralizada

### Estructura Propuesta

```text
terragrunt/
├── terragrunt.hcl              # Root configuration
├── environments/
│   ├── hub/
│   │   ├── terragrunt.hcl
│   │   ├── acr/
│   │   │   └── terragrunt.hcl
│   │   └── aks/
│   │       └── terragrunt.hcl
│   ├── spoke-prod/
│   │   └── terragrunt.hcl
│   └── spoke-dev/
│       └── terragrunt.hcl
└── modules/
    ├── container-registry/
    └── aks-namespaces/
```

## Plan de Migración

### Phase 1: Setup Terragrunt

```bash
# Install Terragrunt
brew install terragrunt  # macOS
# or
wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.50.0/terragrunt_linux_amd64
```

### Phase 2: Convert Configuration

**Root terragrunt.hcl**:

```hcl
remote_state {
  backend = "azurerm"
  config = {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate${get_env("ENV", "hub")}"
    container_name       = "tfstate"
    key                  = "${path_relative_to_include()}/terraform.tfstate"
  }
}
```

### Phase 3: Migrate Modules

**Environment terragrunt.hcl**:

```hcl
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules//container-registry"
}

inputs = {
  location = "westeurope"
  environment = "production"
}
```

### Phase 4: Test Migration

```bash
cd environments/hub/acr
terragrunt plan
terragrunt apply
```

## Estado Actual

**Prioridad**: LOW (Single environment actualmente)

**Trigger**: Cuando se añadan spoke subscriptions

## Referencias

- [Terragrunt Documentation](https://terragrunt.gruntwork.io/)
- [Architecture Overview](../architecture/overview.md)
