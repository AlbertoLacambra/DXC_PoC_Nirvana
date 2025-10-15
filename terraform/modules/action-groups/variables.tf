# ========================================
# Variables - Action Groups Module
# ========================================

# ========================================
# General Configuration
# ========================================

variable "resource_group_name" {
  description = "Nombre del Resource Group donde crear los Action Groups"
  type        = string
}

variable "tags" {
  description = "Tags a aplicar a todos los recursos"
  type        = map(string)
  default     = {}
}

# ========================================
# Teams Webhook Configuration
# ========================================

variable "teams_webhook_url" {
  description = <<-EOT
    URL del webhook de Power Automate para enviar alertas a Microsoft Teams.
    
    FORMATO ESPERADO:
    https://default[ID].environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/[WORKFLOW_ID]/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=[SIGNATURE]
    
    El webhook debe estar configurado para recibir Adaptive Cards.
    Ver TEAMS_INTEGRATION.md para instrucciones completas.
  EOT
  type        = string
  sensitive   = true
  default     = null

  validation {
    condition     = var.teams_webhook_url == null || can(regex("^https://", var.teams_webhook_url))
    error_message = "La URL del webhook debe comenzar con https://"
  }
}

# ========================================
# Action Group: Infrastructure
# ========================================

variable "create_infrastructure_action_group" {
  description = "Si se debe crear el Action Group para alertas de infraestructura"
  type        = bool
  default     = true
}

variable "infrastructure_action_group_name" {
  description = "Nombre del Action Group de infraestructura"
  type        = string
  default     = "ag-infrastructure-alerts"
}

variable "infrastructure_short_name" {
  description = "Nombre corto del Action Group de infraestructura (máx 12 caracteres)"
  type        = string
  default     = "ag-infra"

  validation {
    condition     = length(var.infrastructure_short_name) <= 12
    error_message = "El short_name debe tener máximo 12 caracteres"
  }
}

# ========================================
# Action Group: Pipelines
# ========================================

variable "create_pipelines_action_group" {
  description = "Si se debe crear el Action Group para alertas de pipelines"
  type        = bool
  default     = true
}

variable "pipelines_action_group_name" {
  description = "Nombre del Action Group de pipelines"
  type        = string
  default     = "ag-pipeline-alerts"
}

variable "pipelines_short_name" {
  description = "Nombre corto del Action Group de pipelines (máx 12 caracteres)"
  type        = string
  default     = "ag-pipeline"

  validation {
    condition     = length(var.pipelines_short_name) <= 12
    error_message = "El short_name debe tener máximo 12 caracteres"
  }
}

# ========================================
# Action Group: Costs
# ========================================

variable "create_costs_action_group" {
  description = "Si se debe crear el Action Group para alertas de costes"
  type        = bool
  default     = true
}

variable "costs_action_group_name" {
  description = "Nombre del Action Group de costes"
  type        = string
  default     = "ag-cost-alerts"
}

variable "costs_short_name" {
  description = "Nombre corto del Action Group de costes (máx 12 caracteres)"
  type        = string
  default     = "ag-costs"

  validation {
    condition     = length(var.costs_short_name) <= 12
    error_message = "El short_name debe tener máximo 12 caracteres"
  }
}

# ========================================
# Email Receivers
# ========================================

variable "email_receivers" {
  description = <<-EOT
    Lista de receptores de email para alertas generales.
    
    Ejemplo:
    [
      {
        name  = "admin-alberto"
        email = "alberto.lacambra@dxc.com"
      }
    ]
  EOT
  type = list(object({
    name  = string
    email = string
  }))
  default = []

  validation {
    condition     = alltrue([for r in var.email_receivers : can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", r.email))])
    error_message = "Todas las direcciones de email deben ser válidas"
  }
}

variable "cost_email_receivers" {
  description = <<-EOT
    Lista de receptores de email para alertas de costes (normalmente responsables financieros).
    Si no se especifica, se usará email_receivers.
  EOT
  type = list(object({
    name  = string
    email = string
  }))
  default = []

  validation {
    condition     = alltrue([for r in var.cost_email_receivers : can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", r.email))])
    error_message = "Todas las direcciones de email deben ser válidas"
  }
}

# ========================================
# SMS Receivers (Opcional)
# ========================================

variable "sms_receivers" {
  description = <<-EOT
    Lista de receptores de SMS para alertas críticas (opcional).
    
    IMPORTANTE: Los SMS tienen coste. Úsalos sólo para alertas críticas.
    
    Ejemplo:
    [
      {
        name         = "oncall-admin"
        country_code = "34"  # España
        phone_number = "600123456"
      }
    ]
  EOT
  type = list(object({
    name         = string
    country_code = string
    phone_number = string
  }))
  default = []
}
