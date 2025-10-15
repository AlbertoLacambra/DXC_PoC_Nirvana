# Action Groups Module

Módulo Terraform para gestionar Azure Monitor Action Groups con integración a Microsoft Teams.

## 📋 Descripción

Este módulo crea y configura Action Groups de Azure Monitor para enviar alertas de infraestructura a:

- **Microsoft Teams**: Mediante Power Automate con Adaptive Cards
- **Email**: Notificaciones por correo electrónico  
- **SMS**: Notificaciones por SMS (opcional, tiene coste)

### Tipos de Action Groups

1. **Infrastructure**: Alertas de cambios en infraestructura (drift detection)
2. **Pipelines**: Alertas de CI/CD (fallos de deployment)
3. **Costs**: Alertas de costes (presupuesto superado)

## 💰 Coste

**$0/mes** - Azure Monitor Action Groups es gratuito en el tier básico.

> ⚠️ **NOTA**: Los SMS tienen coste adicional (~$0.015 por SMS).

## 🚀 Uso

```hcl
module "action_groups" {
  source = "git::https://github.com/AlbertoLacambra/DXC_PoC_Nirvana.git//terraform/modules/action-groups?ref=master"

  resource_group_name = "cloudmind-monitoring-rg"
  teams_webhook_url   = var.teams_webhook_url
  
  email_receivers = [
    {
      name  = "admin-alberto"
      email = "alberto.lacambra@dxc.com"
    }
  ]
  
  tags = var.tags
}
```

## 📥 Inputs

| Variable | Tipo | Descripción | Default | Requerido |
|----------|------|-------------|---------|-----------|
| `resource_group_name` | `string` | Nombre del Resource Group | - | ✅ |
| `teams_webhook_url` | `string` | URL del webhook de Power Automate | `null` | ❌ |
| `email_receivers` | `list(object)` | Lista de receptores de email | `[]` | ❌ |
| `create_infrastructure_action_group` | `bool` | Crear AG de infraestructura | `true` | ❌ |
| `create_pipelines_action_group` | `bool` | Crear AG de pipelines | `true` | ❌ |
| `create_costs_action_group` | `bool` | Crear AG de costes | `true` | ❌ |

## 📤 Outputs

| Output | Descripción |
|--------|-------------|
| `infrastructure_action_group_id` | ID del Action Group de infraestructura |
| `pipelines_action_group_id` | ID del Action Group de pipelines |
| `costs_action_group_id` | ID del Action Group de costes |
| `action_groups_summary` | Resumen completo de todos los Action Groups |

## 🔧 Configuración de Teams

Ver **[TEAMS_INTEGRATION.md](./TEAMS_INTEGRATION.md)** para la guía completa de configuración del webhook de Microsoft Teams con Power Automate.

### Resumen rápido

1. Crear flujo en Power Automate
2. Copiar URL del webhook
3. Validar con curl
4. Configurar en Terraform

## 📚 Referencias

- [Azure Monitor Action Groups](https://learn.microsoft.com/es-es/azure/azure-monitor/alerts/action-groups)
- [Adaptive Cards](https://adaptivecards.io/)
- [Power Automate](https://learn.microsoft.com/es-es/power-automate/)

---

**Última actualización**: 15 de Octubre, 2025  
**Versión**: 1.0.0  
**Mantenido por**: DXC Cloud Mind Team
