# GitHub Actions Reference

## Workflows Disponibles

### deploy.yml

**Trigger**: Manual (workflow_dispatch)

**Purpose**: Production deployment con aprobación manual

**Jobs**:

1. `deploy`: Terraform apply con manual gate

**Usage**:

```yaml
GitHub UI → Actions → deploy.yml → Run workflow
```

### pr-validation.yml

**Trigger**: Pull request a master

**Purpose**: 7 security gates validation

**Jobs**:

1. `validate`: Run all security checks
2. `comment`: Post results to PR

### drift-detection.yml

**Trigger**: Cron (daily 05:00 UTC) + manual

**Purpose**: Detectar cambios manuales

**Jobs**:

1. `detect`: Terraform plan con exit code check

### gh-pages.yml

**Trigger**: Push to master (paths: docs/*, mkdocs.yml)

**Purpose**: Deploy documentation

**Jobs**:

1. `deploy`: Build and deploy MkDocs site

## Reusable Actions

### azure/login@v1

**Purpose**: Azure authentication via OIDC

**Usage**:

```yaml
- uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### hashicorp/setup-terraform@v2

**Purpose**: Install Terraform CLI

**Usage**:

```yaml
- uses: hashicorp/setup-terraform@v2
  with:
    terraform_version: 1.5.5
```

### actions/setup-python@v5

**Purpose**: Install Python

**Usage**:

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
```

## Custom Scripts

### Teams Notification

**Location**: `.github/scripts/notify-teams.sh`

**Purpose**: Send Adaptive Card to Teams

**Usage**:

```bash
./notify-teams.sh "success" "Deployment completed"
```

## Environment Variables

### Required

| Variable | Description | Source |
|----------|-------------|--------|
| `AZURE_CLIENT_ID` | OIDC App ID | Secret |
| `AZURE_TENANT_ID` | Tenant ID | Secret |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | Secret |
| `TEAMS_WEBHOOK_URL` | Webhook URL | Secret |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `TF_VERSION` | Terraform version | 1.5.5 |
| `WORKING_DIR` | Working directory | terraform/environments/hub |

## Referencias

- [Workflows Documentation](../cicd/workflows.md)
- [Repository](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana)
