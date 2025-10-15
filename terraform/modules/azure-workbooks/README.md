# Azure Workbooks Module - FREE Monitoring

## Description

This Terraform module creates Azure Workbooks for infrastructure monitoring at **zero additional cost**. Workbooks are free and leverage existing Log Analytics data from Container Insights.

## PoC Optimization

- **Cost**: $0/month (Workbooks are free)
- **Data Source**: Existing `dify-private-logs` Log Analytics Workspace
- **Container Insights**: Already enabled and free tier
- **No ingestion costs**: Uses existing AKS monitoring data

## Workbooks Created

### 1. Drift Detection Workbook
Tracks infrastructure changes and drift from Terraform state.

**Queries**:
- Recent infrastructure changes (resource deployments)
- Manual changes detected outside Terraform
- Drift detection workflow results

**Updated by**: GitHub Actions drift-detection workflow (daily)

### 2. Pipeline Status Workbook
Monitors GitHub Actions CI/CD pipelines.

**Shows**:
- PR validation workflow status
- Deployment workflow status  
- Drift detection workflow status
- terraform-docs update workflow status

**Integration**: Custom events sent from GitHub Actions

### 3. AKS Resources Workbook
Visualizes AKS resource usage by namespace.

**Metrics** (from free Container Insights):
- Pod count by namespace (`dify`, `cloudmind`)
- CPU usage by namespace
- Memory usage by namespace
- Node health and capacity

### 4. Cost Tracking Workbook
Tracks Azure spending for the PoC.

**Shows**:
- Resources by resource group
- Daily/monthly cost trends
- Budget compliance ($130/month target)

**Data Source**: Azure Cost Management API (free)

## Usage

```hcl
module "workbooks" {
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/azure-workbooks?ref=master"

  resource_group_name        = "cloudmind-monitoring-rg"
  location                   = "northeurope"
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.existing.id
  
  create_drift_workbook    = true
  create_pipeline_workbook = true
  create_aks_workbook      = true
  create_cost_workbook     = true
  
  tags = {
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
| azurerm | ~> 3.80 |

## Providers

| Name | Version |
|------|---------|
| azurerm | ~> 3.80 |

## Resources

| Name | Type |
|------|------|
| azurerm_resource_group.workbooks | resource |
| azurerm_application_insights_workbook.drift_detection | resource |
| azurerm_application_insights_workbook.pipeline_status | resource |
| azurerm_application_insights_workbook.aks_resources | resource |
| azurerm_application_insights_workbook.cost_tracking | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| resource_group_name | Name of the resource group for workbooks | `string` | `"cloudmind-monitoring-rg"` | no |
| location | Azure region for resources | `string` | `"northeurope"` | no |
| tags | Tags to apply to all resources | `map(string)` | `{}` | no |
| create_drift_workbook | Create workbook for infrastructure drift detection | `bool` | `true` | no |
| create_pipeline_workbook | Create workbook for GitHub Actions pipeline status | `bool` | `true` | no |
| create_aks_workbook | Create workbook for AKS resource usage | `bool` | `true` | no |
| create_cost_workbook | Create workbook for cost tracking | `bool` | `true` | no |
| log_analytics_workspace_id | ID of the Log Analytics Workspace | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| resource_group_name | Name of the resource group containing workbooks |
| drift_workbook_id | ID of the drift detection workbook |
| pipeline_workbook_id | ID of the pipeline status workbook |
| aks_workbook_id | ID of the AKS resources workbook |
| cost_workbook_id | ID of the cost tracking workbook |
| workbook_urls | URLs to access the workbooks in Azure Portal |

## Accessing Workbooks

After deployment, access workbooks via:

1. **Azure Portal**: Navigate to Resource Group → Workbooks
2. **Direct URL**: Use `workbook_urls` output
3. **Azure Mobile App**: Search for "DXC Cloud Mind" workbooks

## Integration with GitHub Actions

Workbooks can be updated programmatically from GitHub Actions:

```yaml
- name: Send drift status to Azure
  run: |
    az monitor app-insights events post \
      --app ${{ secrets.APP_INSIGHTS_ID }} \
      --type customEvent \
      --name "Drift.Detection" \
      --properties '{"status":"${{ steps.drift.outputs.status }}","resources":"${{ steps.drift.outputs.count }}"}'
```

## Cost Impact

**PoC**: $0/month  
**Production**: $0/month  

Workbooks are completely free. Only pay for:
- Log Analytics data ingestion (covered by free 5GB/month)
- Container Insights (free tier sufficient for PoC)

## Production Recommendations

For production deployments, consider:

1. **Alerts**: Add Azure Monitor alert rules (small cost)
2. **Retention**: Increase Log Analytics retention beyond 31 days
3. **Advanced Queries**: Add more detailed KQL queries
4. **Dashboards**: Pin workbook charts to Azure Dashboard
5. **Power BI**: Export data to Power BI for executive reporting

## License

MIT
