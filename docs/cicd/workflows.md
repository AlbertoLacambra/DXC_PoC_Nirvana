# CI/CD Workflows

## Introducción

Este proyecto utiliza **GitHub Actions** como plataforma CI/CD con 5 workflows activos que automatizan el ciclo completo de vida de la infraestructura.

## Workflows Activos

### 1. Production Deployment (`deploy.yml`)

**Trigger**: Manual (workflow_dispatch)

**Propósito**: Despliegue controlado a producción con aprobación manual.

**Pasos**:

1. **Checkout**: Obtener código fuente
2. **Azure Login**: Autenticación vía OIDC
3. **Terraform Init**: Inicializar backend
4. **Terraform Plan**: Preview de cambios
5. **Manual Approval**: Gate humano requerido
6. **Terraform Apply**: Aplicar cambios
7. **Teams Notification**: Notificar resultado

**Configuración OIDC**:

```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

**Teams Notification**:

```yaml
- name: Notify Teams
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
  run: |
    curl -H "Content-Type: application/json" -d '{
      "type": "message",
      "attachments": [{ 
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": { ... }
      }]
    }' $TEAMS_WEBHOOK_URL
```

### 2. PR Validation (`pr-validation.yml`)

**Trigger**: Pull Request a master

**Propósito**: Validar calidad y seguridad del código antes de merge.

**7 Security Gates**:

1. ✅ **terraform fmt**: Validar formato de código
2. ✅ **terraform validate**: Validar sintaxis
3. ✅ **tfsec**: Security scanning
4. ✅ **checkov**: Policy compliance
5. ✅ **tflint**: Linting avanzado
6. ✅ **terraform plan**: Preview de cambios
7. ✅ **Comment PR**: Resultados en PR comment

**Ejemplo de Ejecución**:

```bash
Run terraform fmt -check -recursive
✅ Format check: PASSED

Run terraform validate
✅ Validation: PASSED

Run tfsec .
✅ Security scan: 0 critical issues

Run checkov -d .
✅ Compliance: All policies passed

Run tflint
✅ Linting: PASSED

Run terraform plan
✅ Plan: 0 to add, 0 to change, 0 to destroy
```

### 3. Drift Detection (`drift-detection.yml`)

**Trigger**: Cron schedule (daily at 05:00 UTC)

**Propósito**: Detectar cambios manuales en infraestructura.

**Lógica**:

```yaml
- name: Terraform Plan
  run: terraform plan -detailed-exitcode
  continue-on-error: true
  id: plan

- name: Check for Drift
  if: steps.plan.outputs.exitcode == 2
  run: |
    echo "⚠️ DRIFT DETECTED"
    # Notify Teams
```

**Exit Codes**:

- `0` = No changes (OK)
- `1` = Error
- `2` = Changes detected (DRIFT)

### 4. GitHub Pages (`gh-pages.yml`)

**Trigger**: Push to master (paths: docs/, mkdocs.yml)

**Propósito**: Desplegar documentación automáticamente.

**Pasos**:

1. Checkout con fetch-depth: 0
2. Setup Python 3.11
3. Install mkdocs dependencies
4. Build documentation
5. Deploy to gh-pages branch

**Deployment**:

```yaml
- name: Deploy to GitHub Pages
  run: mkdocs gh-deploy --force --clean --verbose
```

### 5. Legacy Workflows

- **terraform-deploy.yml**: Deployment alternativo (deprecated soon)
- **terraform-pr.yml**: PR validation alternativo (deprecated soon)

**Recomendación**: Migrar a deploy.yml y pr-validation.yml

## Secretos Configurados

| Secret | Tipo | Uso |
|--------|------|-----|
| `AZURE_CLIENT_ID` | OIDC App ID | Autenticación Azure |
| `AZURE_TENANT_ID` | Tenant ID | Autenticación Azure AD |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | Target subscription |
| `TEAMS_WEBHOOK_URL` | Webhook URL | Notificaciones Teams |

**Configuración**: Settings → Secrets and variables → Actions

## Métricas y Performance

### Tiempos de Ejecución

| Workflow | Avg Duration | Success Rate |
|----------|--------------|--------------|
| deploy.yml | 8-10 mins | 100% |
| pr-validation.yml | 3-5 mins | 98% |
| drift-detection.yml | 2-3 mins | 100% |
| gh-pages.yml | 1-2 mins | 100% |

### Estadísticas Últimos 30 Días

- **Deployments**: 12
- **PRs validados**: 25
- **Drift detections**: 30 (2 drifts encontrados)
- **Security issues prevented**: 5

## Best Practices

### Workflow Design

1. **Fail fast**: Gates tempranos para errores rápidos
2. **Idempotency**: Workflows pueden re-ejecutarse sin efectos secundarios
3. **Artifact preservation**: Terraform plans guardados como artifacts
4. **Notification strategy**: Notificar solo en failures y deployments

### Security

1. **OIDC over secrets**: No almacenar credenciales de larga duración
2. **Least privilege**: Service Principal con permisos mínimos
3. **Secret scanning**: GitHub secret scanning habilitado
4. **Audit logging**: Todos los workflows logueados

## Troubleshooting

### Common Issues

**Error: "Azure Login Failed"**

```yaml
# Verificar OIDC configuration
az ad app federated-credential list --id $APP_ID
```

**Error: "Terraform Plan Failed - Backend Lock"**

```yaml
# Forzar unlock si necesario
terraform force-unlock <lock-id>
```

**Error: "Teams Notification Failed"**

```yaml
# Verificar webhook URL
curl -X POST $TEAMS_WEBHOOK_URL -d '{"text":"test"}'
```

## Referencias

- [Deployment Process](deployment.md)
- [PR Validation Details](pr-validation.md)
- [Security Gates](security.md)
- [Drift Detection](drift-detection.md)
