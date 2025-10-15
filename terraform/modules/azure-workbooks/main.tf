# Azure Workbooks Module - FREE Monitoring for PoC
# Creates custom workbooks for infrastructure monitoring at zero cost

terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

# Resource Group for Workbooks
resource "azurerm_resource_group" "workbooks" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# Workbook 1: Infrastructure Drift Detection
resource "azurerm_application_insights_workbook" "drift_detection" {
  count = var.create_drift_workbook ? 1 : 0

  name                = "drift-detection-workbook"
  resource_group_name = azurerm_resource_group.workbooks.name
  location            = azurerm_resource_group.workbooks.location
  display_name        = "DXC Cloud Mind - Drift Detection"
  
  data_json = jsonencode({
    version = "Notebook/1.0"
    items = [
      {
        type = 1
        content = {
          json = "## Infrastructure Drift Detection\n\nThis workbook shows the drift status of Terraform-managed infrastructure.\n\n**Status**: Updated by GitHub Actions drift-detection workflow (daily)."
        }
      },
      {
        type = 3
        content = {
          version = "KqlItem/1.0"
          query = "AzureActivity\n| where OperationNameValue contains 'MICROSOFT.RESOURCES/DEPLOYMENTS/WRITE'\n| where ActivityStatusValue == 'Success'\n| summarize Count=count() by bin(TimeGenerated, 1h), Caller\n| render timechart"
          size = 0
          title = "Recent Infrastructure Changes"
          queryType = 0
          resourceType = "microsoft.operationalinsights/workspaces"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    component = "monitoring"
    workbook  = "drift-detection"
  })
}

# Workbook 2: GitHub Actions Pipeline Status
resource "azurerm_application_insights_workbook" "pipeline_status" {
  count = var.create_pipeline_workbook ? 1 : 0

  name                = "pipeline-status-workbook"
  resource_group_name = azurerm_resource_group.workbooks.name
  location            = azurerm_resource_group.workbooks.location
  display_name        = "DXC Cloud Mind - Pipeline Status"
  
  data_json = jsonencode({
    version = "Notebook/1.0"
    items = [
      {
        type = 1
        content = {
          json = "## GitHub Actions Pipeline Status\n\nThis workbook displays the status of CI/CD pipelines.\n\n**Workflows**:\n- PR Validation (terraform fmt, validate, plan, cost estimate)\n- Deployment (terraform apply with approvals)\n- Drift Detection (daily checks)\n- Documentation (terraform-docs auto-update)"
        }
      },
      {
        type = 9
        content = {
          version = "KqlParameterItem/1.0"
          parameters = [
            {
              id = "workflow-filter"
              version = "KqlParameterItem/1.0"
              name = "WorkflowName"
              type = 2
              isRequired = false
              query = "customEvents\n| where name == 'GitHub.Workflow'\n| distinct tostring(customDimensions.workflow_name)\n| order by customDimensions_workflow_name asc"
              value = "All"
            }
          ]
        }
      }
    ]
  })

  tags = merge(var.tags, {
    component = "monitoring"
    workbook  = "pipeline-status"
  })
}

# Workbook 3: AKS Resource Usage (leverages free Container Insights)
resource "azurerm_application_insights_workbook" "aks_resources" {
  count = var.create_aks_workbook ? 1 : 0

  name                = "aks-resources-workbook"
  resource_group_name = azurerm_resource_group.workbooks.name
  location            = azurerm_resource_group.workbooks.location
  display_name        = "DXC Cloud Mind - AKS Resources"
  
  data_json = jsonencode({
    version = "Notebook/1.0"
    items = [
      {
        type = 1
        content = {
          json = "## AKS Resource Usage by Namespace\n\nThis workbook shows resource consumption in the shared AKS cluster.\n\n**Namespaces**:\n- `dify`: Dify AI Platform\n- `cloudmind`: Use Cases and Workloads"
        }
      },
      {
        type = 3
        content = {
          version = "KqlItem/1.0"
          query = "KubePodInventory\n| where TimeGenerated > ago(1h)\n| summarize PodCount=dcount(PodUid) by Namespace\n| order by PodCount desc"
          size = 0
          title = "Pods by Namespace"
          queryType = 0
          resourceType = "microsoft.operationalinsights/workspaces"
        }
      },
      {
        type = 3
        content = {
          version = "KqlItem/1.0"
          query = "Perf\n| where ObjectName == 'K8SContainer'\n| where CounterName == 'cpuUsageNanoCores'\n| summarize AvgCPU=avg(CounterValue) by Namespace=tostring(split(InstanceName, '/')[0])\n| order by AvgCPU desc"
          size = 0
          title = "CPU Usage by Namespace"
          queryType = 0
          resourceType = "microsoft.operationalinsights/workspaces"
        }
      },
      {
        type = 3
        content = {
          version = "KqlItem/1.0"
          query = "Perf\n| where ObjectName == 'K8SContainer'\n| where CounterName == 'memoryRssBytes'\n| summarize AvgMemory=avg(CounterValue)/1024/1024/1024 by Namespace=tostring(split(InstanceName, '/')[0])\n| order by AvgMemory desc"
          size = 0
          title = "Memory Usage by Namespace (GB)"
          queryType = 0
          resourceType = "microsoft.operationalinsights/workspaces"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    component = "monitoring"
    workbook  = "aks-resources"
  })
}

# Workbook 4: Cost Tracking (leverages Azure Cost Management - free)
resource "azurerm_application_insights_workbook" "cost_tracking" {
  count = var.create_cost_workbook ? 1 : 0

  name                = "cost-tracking-workbook"
  resource_group_name = azurerm_resource_group.workbooks.name
  location            = azurerm_resource_group.workbooks.location
  display_name        = "DXC Cloud Mind - Cost Tracking"
  
  data_json = jsonencode({
    version = "Notebook/1.0"
    items = [
      {
        type = 1
        content = {
          json = "## Cost Tracking\n\nThis workbook tracks Azure costs for the DXC Cloud Mind PoC.\n\n**Budget**: $130/month per subscription\n**Resources**:\n- AKS Cluster (existing)\n- Container Registry (Basic SKU)\n- Storage Account (state files)\n- Key Vault (secrets)"
        }
      },
      {
        type = 3
        content = {
          version = "KqlItem/1.0"
          query = "AzureActivity\n| where ResourceProvider == 'Microsoft.Resources'\n| summarize ResourceCount=dcount(ResourceId) by ResourceGroup\n| order by ResourceCount desc"
          size = 0
          title = "Resources by Resource Group"
          queryType = 0
          resourceType = "microsoft.operationalinsights/workspaces"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    component = "monitoring"
    workbook  = "cost-tracking"
  })
}
