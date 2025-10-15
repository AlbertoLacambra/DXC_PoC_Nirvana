# Backend Configuration
# Azure Storage Account backend for Terraform state

terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate9a448729"
    container_name       = "cc-hub"
    key                  = "terraform.tfstate"
    use_azuread_auth     = true
    subscription_id      = "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
  }
}
