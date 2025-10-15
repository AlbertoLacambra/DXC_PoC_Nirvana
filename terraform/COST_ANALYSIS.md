# Análisis de Costes - Cloud Control Center PoC

**Fecha**: 13 de Octubre, 2025  
**Presupuesto disponible**: $130 USD/mes por suscripción  
**Suscripciones**: 3 (Hub, Spoke-Prod, Spoke-Dev)

---

## 📊 RESUMEN EJECUTIVO

### ⚠️ **ALERTA DE PRESUPUESTO**
**El diseño actual EXCEDE significativamente el presupuesto disponible.**

- **Presupuesto total**: $390/mes (3 suscripciones × $130)
- **Coste estimado actual**: ~$550-750/mes
- **Exceso**: $160-360/mes (41-92% sobre presupuesto)

### 🎯 **RECOMENDACIÓN**
Para una **PoC**, se recomienda **consolidar en una sola suscripción** y **reutilizar infraestructura existente**.

---

## 💰 DESGLOSE DE COSTES ACTUALES

### **HUB - Suscripción 739aaf91** (Infraestructura Dify Existente + Nuevos Recursos)

#### Recursos Existentes (Dify):
| Recurso | SKU/Tamaño | Coste Mensual Estimado |
|---------|-----------|------------------------|
| **AKS dify-aks** | 2× Standard_B2ms (System pool) | **~$60** |
| **PostgreSQL Flexible** | Standard_B1ms, 32GB storage | **~$15** |
| **Storage Account** | Standard LRS | **~$2** |
| **Key Vault** | Standard | **~$0.50** (transacciones incluidas) |
| **Log Analytics** | PerGB2018, ~5GB/mes estimado | **~$12** |
| **Application Insights** | Uso básico | **~$3** |
| **VM OPNsense** | Standard_B1ms | **~$8** |
| **Public IP** | Static | **~$3** |
| **VNet + NSG + Route Tables** | Recursos gratuitos | **$0** |
| **Private DNS Zone** | 1 zona | **~$0.50** |
| **Data Transfer** | Egress estimado | **~$5** |
| **SUBTOTAL Dify Existente** | | **~$109/mes** ✅ |

#### Recursos Planificados (Cloud Control Center):
| Recurso | SKU/Tamaño | Coste Mensual Estimado |
|---------|-----------|------------------------|
| **ACR (Container Registry)** | Standard | **~$5** |
| **Log Analytics NUEVO** | PerGB2018, 30 días retención | **~$15-25** (duplicado innecesario) |
| **Application Insights NUEVO** | Uso básico | **~$3-5** (duplicado innecesario) |
| **Action Group** | Email notifications | **$0** (gratuito) |
| **Storage Account tfstate** | Standard LRS | **~$0.05** (ya existe) |
| **SUBTOTAL Nuevos Recursos** | | **~$23-30/mes** |

**TOTAL HUB: ~$132-139/mes** ⚠️ (Supera presupuesto en $2-9)

---

### **SPOKE-PROD - Suscripción 353a6255** (Recursos Planificados)

| Recurso | SKU/Tamaño | Coste Mensual Estimado |
|---------|-----------|------------------------|
| **AKS Cluster NUEVO** | 2× Standard_D4s_v3 (8 vCPU, 16GB) | **~$280** ⚠️⚠️⚠️ |
| **VNet + Subnets** | Gratis | **$0** |
| **VNet Peering** | Hub ↔ Spoke-Prod | **~$10** |
| **Data Transfer** | Ingress/Egress | **~$10** |

**TOTAL SPOKE-PROD: ~$300/mes** ⚠️⚠️⚠️ (231% sobre presupuesto)

---

### **SPOKE-DEV - Suscripción 0987a8ce** (Recursos Planificados)

| Recurso | SKU/Tamaño | Coste Mensual Estimado |
|---------|-----------|------------------------|
| **AKS Cluster NUEVO** | 1-2× Standard_B2s (2 vCPU, 4GB) | **~$60-120** |
| **VNet + Subnets** | Gratis | **$0** |
| **VNet Peering** | Hub ↔ Spoke-Dev | **~$10** |
| **Data Transfer** | Ingress/Egress | **~$5** |

**TOTAL SPOKE-DEV: ~$75-135/mes** ⚠️ (Hasta 4% sobre presupuesto)

---

## 📈 COMPARATIVA: DISEÑO ACTUAL vs PRESUPUESTO

```
┌─────────────────────────────────────────────────────────┐
│ SUSCRIPCIÓN  │ PRESUPUESTO │ COSTE ACTUAL │ DIFERENCIA │
├─────────────────────────────────────────────────────────┤
│ Hub          │   $130      │   $132-139   │   +$2-9    │
│ Spoke-Prod   │   $130      │   ~$300      │   +$170    │
│ Spoke-Dev    │   $130      │   ~$75-135   │  -$55/+$5  │
├─────────────────────────────────────────────────────────┤
│ TOTAL        │   $390      │  $507-574    │  +$117-184 │
└─────────────────────────────────────────────────────────┘
```

**⚠️ El coste supera el presupuesto en un 30-47%**

---

## 🎯 RECOMENDACIONES PARA POC (Reducción de Costes)

### **OPCIÓN 1: Consolidación Total - UNA SUSCRIPCIÓN** ✅ **RECOMENDADA**

**Cambios propuestos:**
1. ✅ **Eliminar suscripciones Spoke-Prod y Spoke-Dev** → Todo en Hub
2. ✅ **Reutilizar AKS existente (dify-aks)** → Usar **Namespaces** en lugar de clusters separados
3. ✅ **Eliminar Log Analytics duplicado** → Usar `dify-private-logs` existente
4. ✅ **Eliminar Application Insights duplicado** → Usar `dify-private-insights` existente
5. ✅ **Mantener solo ACR** → $5/mes para imágenes compartidas
6. ✅ **Reducir retención de logs** → De 30 a 7 días
7. ✅ **Deshabilitar backups automáticos** → Solo snapshots manuales

**Arquitectura simplificada:**
```
┌─────────────────────────────────────────────────────────┐
│              HUB (Suscripción única)                    │
├─────────────────────────────────────────────────────────┤
│  • AKS dify-aks (existente) - 2× B2ms                  │
│    ├─ Namespace: dify (existente)                      │
│    ├─ Namespace: cc-prod (nuevo)                       │
│    └─ Namespace: cc-dev (nuevo)                        │
│                                                         │
│  • ACR ccacr-xxx (nuevo) - Standard                    │
│  • PostgreSQL (existente)                               │
│  • Log Analytics (existente) - Reutilizado             │
│  • Storage Account tfstate (existente)                  │
│  • VNet dify-private-vnet (existente)                  │
└─────────────────────────────────────────────────────────┘
```

**Coste estimado OPCIÓN 1:**
| Categoría | Coste Mensual |
|-----------|--------------|
| Dify existente (sin cambios) | $109 |
| ACR nuevo | $5 |
| **TOTAL** | **~$114/mes** ✅ |

**✅ Ahorro: $276-460/mes (48-67% reducción)**  
**✅ Dentro de presupuesto: $130/mes** ✅

---

### **OPCIÓN 2: Hub + 1 Spoke (Solo Producción)**

**Si realmente necesitas separación de suscripciones:**

**Hub (Suscripción 1):**
- Recursos Dify existentes: $109/mes
- ACR nuevo: $5/mes
- **Total Hub: $114/mes** ✅

**Spoke-Prod (Suscripción 2):**
- **Cambiar AKS a tamaño económico**: 1× Standard_B2ms (en lugar de 2× D4s_v3)
- **Usar auto-scaling**: Min 1, Max 2 nodos
- **Deshabilitar monitoring avanzado**: Usar logs básicos
- VNet Peering: $10/mes
- **Total Spoke-Prod: ~$40/mes** ✅

**TOTAL OPCIÓN 2: ~$154/mes (2 suscripciones)**  
**✅ Dentro de presupuesto combinado: $260/mes** ✅

---

### **OPCIÓN 3: Arquitectura Serverless (Alternativa radical)**

**Si los workloads no requieren orquestación completa:**

Reemplazar AKS por:
- **Azure Container Instances** (ACI): ~$25-50/mes
- **Azure Container Apps**: ~$30-60/mes
- **Azure Functions + Docker**: ~$10-30/mes

**Coste estimado: $90-130/mes (todo incluido)** ✅

---

## 🔧 CAMBIOS ESPECÍFICOS RECOMENDADOS

### **Cambios Inmediatos (Sin impacto funcional):**

1. **Eliminar Log Analytics duplicado** en Hub:
   ```hcl
   create_monitoring = false  # Usar dify-private-logs existente
   ```
   **Ahorro: $18-28/mes**

2. **Referenciar Log Analytics existente** en ACR:
   ```hcl
   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.dify_logs.id
   ```

3. **Reducir retención ACR** (ya configurado):
   ```hcl
   retention_policy_enabled = false  # Solo con Premium SKU
   ```

4. **Deshabilitar geo-replication** (no configurado, bien):
   ```hcl
   geo_replications = []  # Ya está así
   ```

### **Cambios Arquitectónicos (Requieren rediseño):**

5. **Usar Namespaces en lugar de Clusters separados**:
   ```bash
   kubectl create namespace cc-prod
   kubectl create namespace cc-dev
   kubectl create namespace cc-staging
   ```
   **Ahorro: $340-400/mes** (eliminar 2 AKS clusters)

6. **RBAC por Namespace**:
   ```bash
   # Producción: Solo admins
   kubectl create rolebinding cc-prod-admin --clusterrole=admin --user=alberto.lacambra@dxc.com -n cc-prod
   
   # Dev: Developers + admins
   kubectl create rolebinding cc-dev-admin --clusterrole=admin --group=developers -n cc-dev
   ```

7. **Network Policies por Namespace**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: deny-from-other-namespaces
     namespace: cc-prod
   spec:
     podSelector: {}
     policyTypes:
     - Ingress
     ingress:
     - from:
       - podSelector: {}  # Solo pods del mismo namespace
   ```

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### **FASE 0: Decisión Arquitectónica** (Ahora)
- [ ] **DECISIÓN**: ¿Opción 1 (1 suscripción), Opción 2 (2 suscripciones), u Opción 3 (Serverless)?
- [ ] Aprobar cambios de arquitectura
- [ ] Actualizar diseño en documentación

### **FASE 1: Limpieza Inmediata** (Si Opción 1)
- [ ] Modificar `terraform/hub/terragrunt.hcl`:
  ```hcl
  create_monitoring = false
  create_action_group = false
  ```
- [ ] Agregar data source para Log Analytics existente
- [ ] Referenciar workspace existente en módulo ACR

### **FASE 2: Implementación PoC Simplificada**
- [ ] Deploy solo ACR en Hub
- [ ] Crear namespaces en AKS existente:
  - `cc-prod`
  - `cc-dev`
  - `cc-staging` (opcional)
- [ ] Configurar RBAC por namespace
- [ ] Configurar Network Policies
- [ ] Probar deploy de aplicaciones en cada namespace

### **FASE 3: Validación**
- [ ] Verificar aislamiento entre namespaces
- [ ] Verificar acceso a ACR desde todos los namespaces
- [ ] Verificar logs en Log Analytics existente
- [ ] **Verificar coste real en Azure Cost Management**

---

## 💡 BENEFICIOS DE OPCIÓN 1 (RECOMENDADA)

### **Ventajas:**
✅ **Coste**: $114/mes vs $507/mes (77% ahorro)  
✅ **Simplicidad**: 1 suscripción, 1 AKS, 1 cluster  
✅ **Rápido**: Reutiliza infraestructura existente  
✅ **Apropiado para PoC**: Demuestra conceptos sin sobre-ingeniería  
✅ **Fácil limpieza**: Solo eliminar namespaces al terminar PoC  
✅ **Namespaces = Aislamiento**: Suficiente para PoC (no producción real)

### **Desventajas:**
⚠️ **No demuestra Hub & Spoke real**: Arquitectura simplificada  
⚠️ **Aislamiento débil**: Namespaces vs clusters separados  
⚠️ **No escalable a producción**: Requiere migración posterior  

### **Para Producción Real (Post-PoC):**
- Migrar a arquitectura Hub & Spoke completa
- 3 suscripciones con presupuesto adecuado (~$500-800/mes)
- AKS dedicados por ambiente
- Monitoring completo con alertas
- Backups automatizados
- Geo-redundancia

---

## 📊 COMPARATIVA FINAL

```
┌────────────────────────────────────────────────────────────────┐
│ Criterio          │ Diseño Actual │ Opción 1  │ Opción 2      │
├────────────────────────────────────────────────────────────────┤
│ Coste mensual     │  $507-574     │  $114 ✅  │  $154         │
│ Suscripciones     │      3        │    1 ✅   │    2          │
│ AKS clusters      │      3        │    1 ✅   │    2          │
│ Complejidad       │    Alta       │  Baja ✅  │  Media        │
│ Tiempo deploy     │   2-3 días    │  1 día ✅ │  1-2 días     │
│ Apropiado PoC     │     No ❌     │   Sí ✅   │  Sí ✅        │
│ Dentro presupuesto│     No ❌     │   Sí ✅   │  Sí ✅        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎓 CONCLUSIÓN

**Para una PoC con presupuesto de $130/mes por suscripción:**

1. ✅ **OPCIÓN 1 (Recomendada)**: Consolidar en Hub, usar namespaces
   - **Coste**: $114/mes
   - **Tiempo**: 1 día
   - **Riesgo**: Bajo

2. ⚠️ **OPCIÓN 2 (Alternativa)**: Hub + Spoke-Prod económico
   - **Coste**: $154/mes
   - **Tiempo**: 1-2 días
   - **Riesgo**: Medio

3. ❌ **Diseño Actual**: NO viable con presupuesto actual
   - **Coste**: $507-574/mes
   - **Requiere**: Aumentar presupuesto a $170/mes por suscripción

**Próximos pasos:**
1. Decidir qué opción implementar
2. Actualizar código Terraform según la opción elegida
3. Proceder con deployment

---

**Nota**: Todos los costes son estimaciones basadas en precios de Azure North Europe a Octubre 2025. Los costes reales pueden variar según uso, data transfer, y promociones aplicables.
