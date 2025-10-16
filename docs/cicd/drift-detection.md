# Drift Detection

## Overview

Workflow automático que detecta cambios manuales en la infraestructura ejecutándose diariamente a las 05:00 UTC.

## Funcionamiento

### Trigger

```yaml
on:
  schedule:
    - cron: '0 5 * * *'  # Daily at 05:00 UTC
  workflow_dispatch:      # Manual trigger
```

### Lógica

1. Terraform plan con `-detailed-exitcode`
2. Verificar exit code:
   - `0` = No drift
   - `1` = Error
   - `2` = Drift detected
3. Notificar Teams si drift

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | No changes | ✅ OK |
| 1 | Error | 🔴 Alert |
| 2 | Drift detected | ⚠️ Notify |

## Teams Notification

```json
{
  "title": "⚠️ Drift Detected",
  "text": "Manual changes detected in infrastructure",
  "facts": [
    {"name": "Resources affected", "value": "3"},
    {"name": "Last deployment", "value": "2025-01-15"}
  ]
}
```

## Resolución

### Opción 1: Import Changes

```bash
terraform import <resource> <azure-id>
terraform plan  # Verify
git commit -m "fix: Import manual changes"
```

### Opción 2: Revert Changes

```bash
terraform apply  # Restore to state
```

## Referencias

- [Workflows](workflows.md)
