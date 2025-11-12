# ADR-012: Azure Infrastructure Regional Migration - West Europe to North Europe

**Status**: Accepted  
**Date**: 2025-11-12  
**Author**: Alberto Lacambra  
**Tags**: `infrastructure`, `azure`, `terraform`, `postgresql`, `regional-restrictions`, `cost-optimization`

---

## Context

Durante el despliegue inicial de la infraestructura de Azure para el proyecto Mindful Moments (PoC de Azure SRE Agent), encontramos restricciones de suscripción que impedían el aprovisionamiento de PostgreSQL Flexible Server en la región West Europe.

### Problema Encontrado

Al intentar desplegar PostgreSQL Flexible Server con SKU `B_Standard_B1ms` en **westeurope**, Azure bloqueó la creación con el siguiente error:

```
Error Code: LocationIsOfferRestricted
Message: Subscriptions are restricted from provisioning in location 'westeurope'
Activity ID: d653e193-e683-48cd-9901-a38053c5a77e
Suggestion: Try again in a different location or request quota increase
```

### Contexto Técnico

- **Subscription ID**: `353a6255-27a8-4733-adf0-1c531ba9f4e9`
- **Recursos afectados**: PostgreSQL Flexible Server, Key Vault (dependiente)
- **Estado del deployment**: 18 de 25 recursos desplegados (72% completado)
- **SKU requerido**: B_Standard_B1ms (tier más económico para dev/test)
- **Configuración**: Private connectivity via delegated subnet, public access disabled

### Opciones Evaluadas

1. **Solicitar aumento de cuota para westeurope**
   - Tiempo estimado: 24-48 horas
   - Sin garantía de aprobación
   - Bloquea el proyecto

2. **Cambiar a un SKU superior (GP_Standard_D2s_v3)**
   - Impacto en costos: +20€/mes → 76€/mes total
   - Fuera del espíritu de optimización de costos
   - No justificado para un entorno dev

3. **Migrar toda la infraestructura a North Europe** ✅ **SELECCIONADA**
   - Sin restricciones para B-tier PostgreSQL
   - Mantiene costos optimizados (~42€/mes)
   - Consolida recursos en una sola región
   - Reduce latencia inter-servicios
   - Elimina costos de transferencia entre regiones

---

## Decision

**Migrar toda la infraestructura de West Europe a North Europe** para consolidar recursos en una región sin restricciones y optimizar costos operacionales.

### Estrategia de Migración

1. **Actualizar configuración de Terraform**
   ```hcl
   # terraform/environments/dev/terraform.tfvars
   location = "northeurope"  # Cambio de westeurope
   ```

2. **Destroy completo de infraestructura parcial**
   - Ejecutar `terraform destroy -auto-approve`
   - Esperar propagación de Azure (2 minutos)

3. **Recreación limpia en North Europe**
   - Terraform plan generando 25 recursos
   - Apply con todos los recursos en northeurope

4. **Import de recursos huérfanos**
   - VNet, NSG, Storage Account ya existentes importados al state
   - Evitar duplicación de recursos

### Resultado del Deployment

**Status**: ✅ **SUCCESS** - 25/25 recursos desplegados

```
Apply complete! Resources: 15 added, 0 changed, 0 destroyed.

Outputs:
app_service_principal_id = "18c3e8a4-c7cc-45ca-9ba4-1d6e59fb3ca1"
app_service_url = "https://app-mindful-moments-dev.azurewebsites.net"
key_vault_uri = "https://kv-mindfuld97avm.vault.azure.net/"
postgres_server_fqdn = "psql-mindful-moments-dev.postgres.database.azure.com"
resource_group_name = "rg-mindful-moments-dev"
storage_account_name = "stmindfuld97avm"
```

---

## Consequences

### Positive

✅ **PostgreSQL B-tier disponible** - Sin restricciones en northeurope  
✅ **Consolidación regional** - Todos los recursos en una sola región  
✅ **Optimización de costos** - ~42€/mes vs presupuesto de 120€/mes  
✅ **Menor latencia** - Comunicación intra-región más rápida  
✅ **Sin costos de egress** - No hay transferencia de datos entre regiones  
✅ **Gestión simplificada** - Un solo datacenter para troubleshooting  
✅ **DR más limpio** - Replicación geográfica controlada si es necesaria  

### Negative

⚠️ **Downtime durante migración** - ~5 minutos (aceptable para dev)  
⚠️ **IP addresses cambiadas** - Requiere actualización de configuraciones  
⚠️ **Managed Identity renovada** - Nuevo principal_id para App Service  

### Neutral

ℹ️ **No cambios en arquitectura** - Misma topología de red  
ℹ️ **No cambios en costos** - Precio similar entre regiones  
ℹ️ **Compatibilidad con prod** - Modelo replicable para otros entornos  

---

## Compliance and Risk

### Security Considerations

- ✅ Secrets migrados correctamente a Key Vault en northeurope
- ✅ Private DNS Zone actualizada para nueva VNet
- ✅ NSG rules consistentes con configuración original
- ✅ Public network access deshabilitado en PostgreSQL

### Data Residency

- **Anterior**: West Europe (Países Bajos)
- **Actual**: North Europe (Irlanda)
- **Compliance**: Ambas regiones cumplen GDPR y regulaciones EU
- **Impacto**: No hay cambios en requisitos de residencia de datos

### Disaster Recovery

- **Objetivo**: RPO 24h, RTO 4h para entorno dev
- **Backup PostgreSQL**: Retención 7 días, sin geo-redundancia
- **Backup Storage**: LRS (Locally Redundant Storage)
- **Próximos pasos**: Implementar geo-replication para producción

---

## Implementation Details

### Terraform State Management

- **Backend**: Azure Storage (westeurope - no migrado, estado centralizado)
- **State file**: `dev.tfstate` en blob container `tfstate`
- **Versionado**: Blob versioning habilitado
- **Recursos rastreados**: 25 recursos post-migración

### Resource Naming

Todos los recursos mantienen el mismo nombre con sufijo aleatorio `d97avm`:

```
rg-mindful-moments-dev
vnet-mindful-moments-dev
psql-mindful-moments-dev
app-mindful-moments-dev
stmindfuld97avm
kv-mindfuld97avm
```

### Network Configuration

```
VNet: 10.0.0.0/16 (northeurope)
├── app-subnet: 10.0.1.0/24
│   └── Delegated to: Microsoft.Web/serverFarms
└── database-subnet: 10.0.2.0/24
    └── Delegated to: Microsoft.DBforPostgreSQL/flexibleServers
```

### Cost Breakdown (North Europe)

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service Plan | B1 Linux | ~13€ |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~20€ |
| Storage Account | Standard LRS | ~2€ |
| Log Analytics | 30-day retention | ~3€ |
| Key Vault | Standard tier | ~1€ |
| Application Insights | Node.JS | ~2€ |
| Networking | VNet + NSG | ~1€ |
| **TOTAL** | | **~42€/mes** |

---

## Lessons Learned

### Azure Subscription Quotas

1. **Verificar disponibilidad regional ANTES del diseño** - Usar `az postgres flexible-server list-skus --location <region>`
2. **B-tier tiene más restricciones** - Considerar GP-tier para flexibilidad
3. **Las restricciones son por suscripción** - Puede variar entre subscriptions
4. **LocationIsOfferRestricted ≠ Capacity** - Es un límite de quota, no falta de capacidad

### Terraform Best Practices

1. **Evitar cambios de región con replace** - Azure provider tiene problemas de timing
2. **Destroy + Apply limpio > Replace** - Más confiable para cambios regionales
3. **Import orphaned resources** - Terraform state puede desincronizarse
4. **Wait time después de destroy** - Azure propagation requiere ~2 minutos

### Infraestructura Multi-Región

1. **Default a single region para dev/test** - Simplifica gestión
2. **Planear multi-región desde diseño** - Para producción
3. **Documentar decisiones regionales** - Crítico para compliance

---

## Related Decisions

- **ADR-001**: Terraform como IaC estándar (decisión previa)
- **ADR-002**: Azure como cloud provider principal (decisión previa)
- **Próximo ADR**: CI/CD Pipeline con GitHub Actions para deployment

---

## References

- [Azure PostgreSQL Flexible Server Regions](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview#azure-regions)
- [Azure Subscription Limits and Quotas](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits)
- [Terraform AzureRM Provider - Regional Migration](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-11-12 | Alberto Lacambra | Initial creation - Regional migration decision |
| 2025-11-12 | Alberto Lacambra | Deployment completed - Added final costs and outputs |
