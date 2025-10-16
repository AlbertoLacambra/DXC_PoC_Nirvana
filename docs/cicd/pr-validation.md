# PR Validation

## Overview

Todos los Pull Requests pasan por 7 security gates automáticos antes de poder hacer merge.

## Security Gates

### 1. Terraform Format

**Tool**: `terraform fmt -check -recursive`

**Purpose**: Garantizar formato consistente

**Fail Criteria**: Archivos sin formato correcto

### 2. Terraform Validate

**Tool**: `terraform validate`

**Purpose**: Validar sintaxis HCL

**Fail Criteria**: Errores de sintaxis

### 3. TFSec

**Tool**: `tfsec .`

**Purpose**: Security scanning

**Fail Criteria**: Issues CRITICAL o HIGH

### 4. Checkov

**Tool**: `checkov -d .`

**Purpose**: Policy compliance

**Fail Criteria**: Policy violations

### 5. TFLint

**Tool**: `tflint`

**Purpose**: Linting avanzado

**Fail Criteria**: Errores o warnings

### 6. Terraform Plan

**Tool**: `terraform plan`

**Purpose**: Preview de cambios

**Output**: Plan en PR comment

### 7. PR Comment

**Tool**: GitHub API

**Purpose**: Publicar resultados

**Content**: Resumen de todos los gates

## Ejemplo de Output

```markdown
## 🔍 PR Validation Results

✅ **Format Check**: PASSED
✅ **Validation**: PASSED
✅ **TFSec**: 0 critical issues
✅ **Checkov**: All policies passed
✅ **TFLint**: PASSED

## 📋 Terraform Plan

7 to add, 0 to change, 0 to destroy
```

## Referencias

- [Workflows](workflows.md)
- [Security Gates](security.md)
