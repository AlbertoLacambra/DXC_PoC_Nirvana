# Security Gates

## Overview

7 security gates configurados para garantizar calidad y seguridad del código Infrastructure-as-Code.

## Gates Implementados

### 1. Format Check

**Tool**: terraform fmt

**Command**: `terraform fmt -check -recursive`

**Purpose**: Código con formato consistente

### 2. Syntax Validation

**Tool**: terraform validate

**Command**: `terraform validate`

**Purpose**: Sintaxis HCL correcta

### 3. Security Scanning

**Tool**: tfsec

**Command**: `tfsec . --minimum-severity HIGH`

**Checks**:

- Encryption at rest
- Network security
- Access controls
- Secret management

### 4. Policy Compliance

**Tool**: checkov

**Command**: `checkov -d . --framework terraform`

**Policies**:

- Resource tagging
- Naming conventions
- Cost controls
- Security baselines

### 5. Advanced Linting

**Tool**: tflint

**Command**: `tflint --recursive`

**Checks**:

- Best practices
- Provider-specific rules
- Module usage

### 6. Infrastructure Preview

**Tool**: terraform plan

**Command**: `terraform plan -out=tfplan`

**Output**: Cambios propuestos

### 7. Manual Approval

**Type**: Human gate

**Purpose**: Verificación final antes de apply

## Métricas

### Últimos 30 Días

- **Security issues prevented**: 12
- **Policy violations caught**: 8
- **PRs blocked**: 3
- **False positives**: 2

## Referencias

- [Workflows](workflows.md)
- [PR Validation](pr-validation.md)
