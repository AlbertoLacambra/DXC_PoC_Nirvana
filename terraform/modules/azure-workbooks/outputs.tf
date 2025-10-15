# Outputs for Azure Workbooks Module

output "resource_group_name" {
  description = "Name of the resource group containing workbooks"
  value       = azurerm_resource_group.workbooks.name
}

output "drift_workbook_id" {
  description = "ID of the drift detection workbook"
  value       = var.create_drift_workbook ? azurerm_application_insights_workbook.drift_detection[0].id : null
}

output "pipeline_workbook_id" {
  description = "ID of the pipeline status workbook"
  value       = var.create_pipeline_workbook ? azurerm_application_insights_workbook.pipeline_status[0].id : null
}

output "aks_workbook_id" {
  description = "ID of the AKS resources workbook"
  value       = var.create_aks_workbook ? azurerm_application_insights_workbook.aks_resources[0].id : null
}

output "cost_workbook_id" {
  description = "ID of the cost tracking workbook"
  value       = var.create_cost_workbook ? azurerm_application_insights_workbook.cost_tracking[0].id : null
}

output "workbook_urls" {
  description = "URLs to access the workbooks in Azure Portal"
  value = {
    drift_detection = var.create_drift_workbook ? "https://portal.azure.com/#@/resource${azurerm_application_insights_workbook.drift_detection[0].id}" : null
    pipeline_status = var.create_pipeline_workbook ? "https://portal.azure.com/#@/resource${azurerm_application_insights_workbook.pipeline_status[0].id}" : null
    aks_resources   = var.create_aks_workbook ? "https://portal.azure.com/#@/resource${azurerm_application_insights_workbook.aks_resources[0].id}" : null
    cost_tracking   = var.create_cost_workbook ? "https://portal.azure.com/#@/resource${azurerm_application_insights_workbook.cost_tracking[0].id}" : null
  }
}
