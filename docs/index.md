# 🚀 Bienvenido a DXC Cloud Mind - Nirvana PoC# 📚 Documentación - DXC Cloud Mind Nirvana# 🚀 Bienvenido a DXC Cloud Mind - Nirvana PoC



!!! success "Estado del Proyecto"

    **Phase**: Infrastructure Deployed + Chatbot Integrated ✅  

    **Última Actualización**: Octubre 2025  **Índice principal de documentación del proyecto**!!! success "Estado del Proyecto"

    **Recursos Desplegados**: 7  

    **Workflows Operacionales**: 5      **Phase**: Infrastructure Deployed ✅  

    **Chatbot**: Nirvana Tech Support Assistant 🤖

---    **Última Actualización**: Enero 2025  

## 🎯 Visión

    **Recursos Desplegados**: 7  

Transform cloud operations through **AI-driven automation**, proactive governance, and cost optimization. This PoC implements a **Cloud Mind Control Center** that enables:

## 🚀 Inicio Rápido    **Workflows Operacionales**: 5

<div class="grid cards" markdown>



-   :material-eye-check:{ .lg .middle } **Visibilidad Total**

**Para comenzar a usar el proyecto rápidamente**:## 🎯 Visión

    ---



    Real-time monitoring de operaciones, incidentes y alertas con dashboards unificados

- [**QUICK_START.md**](../QUICK_START.md) - Guía de inicio rápido (5-10 minutos)Transform cloud operations through **AI-driven automation**, proactive governance, and cost optimization. This PoC implements a **Cloud Mind Control Center** that enables:

-   :material-lightning-bolt:{ .lg .middle } **Velocidad de Acción**

- [**README.md**](../README.md) - Documentación principal del proyecto

    ---

<div class="grid cards" markdown>

    Planes de acción generados por IA con comparación histórica y automated remediation

---

-   :material-brain:{ .lg .middle } **Proactividad**

-   :material-eye-check:{ .lg .middle } **Visibilidad Total**

    ---

## 🤖 Chatbot / AI

    Insights continuos que previenen incidentes recurrentes antes de que ocurran

    ---

-   :material-shield-check:{ .lg .middle } **Cero Riesgo**

**Todo sobre la integración del chatbot Nirvana Tech Support Assistant**:

    ---

    Real-time monitoring de operaciones, incidentes y alertas con dashboards unificados

    Enfoque en zero operational risk con automated compliance y security scanning

- [**CHATBOT_INTEGRATION.md**](../CHATBOT_INTEGRATION.md) - Guía completa del chatbot integrado

-   :material-robot:{ .lg .middle } **Hiper-automatización**

  - Arquitectura del chatbot-   :material-lightning-bolt:{ .lg .middle } **Velocidad de Acción**

    ---

  - Configuración de Dify

    Ciclo de vida completo de soluciones Cloud con GitOps y CI/CD

  - Troubleshooting    ---

-   :material-cash:{ .lg .middle } **Optimización de Costes**

  - Personalización

    ---

    Planes de acción generados por IA con comparación histórica y automated remediation

    ~€250/mes ahorrados con Single-AKS strategy y FinOps automation

---

</div>

-   :material-brain:{ .lg .middle } **Proactividad**

---

## 🏗️ Arquitectura e Infraestructura

## 🤖 Chatbot Integrado - NUEVO

    ---

!!! tip "Nirvana Tech Support Assistant"

    Hemos integrado un chatbot inteligente powered by **gpt-4o-mini** (Azure OpenAI) en la aplicación Control Center UI.**Diseño del sistema y decisiones arquitectónicas**:



**Características**:    Insights continuos que previenen incidentes recurrentes antes de que ocurran



- ✅ **Botón flotante verde** disponible en todas las páginas### Infraestructura como Código (Terraform)

- ✅ **Powered by Dify AI Platform** con Azure OpenAI gpt-4o-mini

- ✅ **Interfaz personalizada** con React components-   :material-shield-check:{ .lg .middle } **Cero Riesgo**

- ✅ **Dos modos**: Iframe embebido o nueva ventana

- ✅ **Sin autenticación** requerida (WebApp público)- [**terraform/README.md**](../terraform/README.md) - Documentación de Terraform



**Documentación completa**:  - Módulos reutilizables    ---



- 📖 [Guía de Integración del Chatbot](guides/chatbot-integration.md)  - Configuración de entornos

- 🚀 [Quick Start App + Chatbot](guides/quick-start-app.md)

  - Backend de estado    Enfoque en zero operational risk con automated compliance y security scanning

**Arquitectura**:

```  - Comandos útiles

Next.js App (localhost:3000)

    ↓-   :material-robot:{ .lg .middle } **Hiper-automatización**

DifyChatButton Component (Custom React)

    ↓### Arquitectura del Sistema

Iframe → http://10.0.2.91/chatbot/7C9Ppi4gev9j1h7p

    ↓    ---

Dify Platform → Azure OpenAI (gpt-4o-mini)

```- [**architecture/ARCHITECTURE_V2.md**](./architecture/ARCHITECTURE_V2.md) - Arquitectura completa v2.0



---- [**architecture/**](./architecture/) - Diagramas y diseños arquitectónicos    Ciclo de vida completo de soluciones Cloud con GitOps y CI/CD



## 🏗️ Arquitectura Actual



### Single-AKS Shared Services----   :material-cash:{ .lg .middle } **Optimización de Costes**



```mermaid

graph TB

    subgraph Azure["AZURE SUBSCRIPTION: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"]## 🔐 Seguridad y Configuración    ---

        subgraph ACR["Resource Group: cloudmind-acr-rg (NEW)"]

            ACR_RESOURCE["Azure Container Registry"]

            ROLES["Role Assignments"]

        end**Configuración de secretos, autenticación y permisos**:    ~€250/mes ahorrados con Single-AKS strategy y FinOps automation

        

        subgraph DIFY["Resource Group: dify-rg (Existing)"]

            subgraph AKS["AKS Cluster: dify-aks"]

                NS_DIFY["Namespace<br/>dify<br/>(Existing)"]- [**SECRETS_SETUP.md**](../SECRETS_SETUP.md) - Configuración de Service Principal y secretos</div>

                NS_CLOUD["Namespace<br/>cloudmind<br/>(NEW)"]

            end  - OIDC authentication

        end

          - GitHub Actions secrets---

        ACR_RESOURCE -->|AcrPull| AKS

          - Azure permissions

        subgraph HUB["Resource Group: cloudmind-hub-rg (NEW)"]

            SERVICES["Shared Services<br/>• PostgreSQL Flexible Server<br/>• Storage Account<br/>• Key Vault<br/>• Virtual Network"]## 🏗️ Arquitectura Actual

        end

    end- [**CHECKLIST_SECRETOS.md**](../CHECKLIST_SECRETOS.md) - Checklist de configuración de secretos

```

### Single-AKS Shared Services

**Single-AKS Strategy**

---

Leveraging existing Dify AKS cluster with namespace isolation:

```mermaid

- **Dify namespace**: Existing workloads (data source, read-only)

- **CloudMind namespace**: New PoC workloads (Terraform-managed)## 🔄 CI/CD y GitHub Actionsgraph TB

- **Ahorro**: ~€250/mes vs multi-AKS approach

    subgraph Azure["AZURE SUBSCRIPTION: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"]

---

**Workflows automáticos de despliegue y validación**:        subgraph DifyRG["Resource Group: dify-rg (Existing)"]

## 📊 Métricas del Proyecto

            AKS[AKS Cluster: dify-aks]

| Métrica | Valor | Estado |

|---------|-------|--------|- [**cicd/**](./cicd/) - Documentación de pipelines CI/CD            subgraph Namespaces["Namespaces"]

| Recursos Desplegados | 7 | ✅ |

| Workflows CI/CD | 5 | ✅ |  - Workflow de deploy                NS1[dify<br/>Existing]

| Security Gates | 6 | ✅ |

| Coste Mensual Incremental | ~€5/mes | ✅ |  - Validación de PRs                NS2[cloudmind<br/>NEW]

| Ahorro vs Multi-AKS | ~€250/mes | ✅ |

| Time-to-Deploy | ~10 min | ✅ |  - Drift detection            end

| **Chatbot Integrado** | **gpt-4o-mini** | **✅** |

| **Control Center UI** | **Next.js 14** | **✅** |            AKS --> Namespaces



---### GitHub Pages            



## 🚀 Quick Start            PostgreSQL[PostgreSQL Flexible Server]



### 1. Clonar Repositorio- [**GITHUB_PAGES_SETUP.md**](../GITHUB_PAGES_SETUP.md) - Configuración de GitHub Pages            Storage[Storage Account]



```bash            KeyVault[Key Vault]

git clone https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana.git

cd DXC_PoC_Nirvana---            VNet[Virtual Network]

```

        end

### 2. Opción A: Infraestructura (Terraform)

## 💰 Costes y FinOps        

Ver [Guía de Quick Start Infraestructura](guides/quick-start.md)

        subgraph HubRG["Resource Group: cloudmind-hub-rg (NEW)"]

### 2. Opción B: Aplicación + Chatbot (Next.js)

**Análisis de costes y optimización financiera**:            Hub[Shared Services]

Ver [Guía de Quick Start App + Chatbot](guides/quick-start-app.md)

        end

```bash

cd apps/control-center-ui- [**costs/**](./costs/) - Documentación de costes        

npm install

npm run dev- [**terraform/COST_ANALYSIS.md**](../terraform/COST_ANALYSIS.md) - Análisis de costes de infraestructura        subgraph ACRRG["Resource Group: cloudmind-acr-rg (NEW)"]

# Abre http://localhost:3000

# Busca el botón verde 💬 en la esquina inferior derecha            ACR[Azure Container Registry]

```

---            RoleAssign[Role Assignments]

### 3. Configurar Credenciales (Para despliegues)

        end

Ver [Guía de Configuración de Secretos](guides/secrets-setup.md)

## 📖 Guías y Tutoriales    end

---

    

## 🎯 Use Cases (Roadmap)

**Guías paso a paso para tareas específicas**:    ACR -.AcrPull.-> AKS

### Phase 1: Foundation ✅

    

- [x] Infrastructure as Code (Terraform)

- [x] CI/CD Pipelines (GitHub Actions)- [**guides/**](./guides/) - Guías técnicas    style NS2 fill:#90EE90

- [x] Security & Compliance Gates

- [x] Cost Optimization (Single-AKS)  - [**secrets-setup.md**](./guides/secrets-setup.md) - Setup de secretos detallado    style ACR fill:#90EE90



### Phase 2: Control Center UI + Chatbot ✅    style HubRG fill:#90EE90



- [x] **Next.js Control Center UI**---    style ACRRG fill:#90EE90

- [x] **Dify Chatbot Integration (gpt-4o-mini)**

- [x] **Custom React Component (DifyChatButton)**```

- [x] **WebApp Approach (iframe embedding)**

- [ ] FastAPI API Gateway## 🎯 Casos de Uso

- [ ] Dify RAG integration (advanced)

- [ ] Conversational Q&A bot (advanced features)!!! tip "Single-AKS Strategy"



### Phase 3: IaC Automation 🤖**Implementaciones específicas y casos de uso**:    Leveraging existing Dify AKS cluster with namespace isolation:



- [ ] Drift detection pipeline    

- [ ] AI risk analysis (Dify workflows)

- [ ] Infrastructure state dashboard- [**use-cases/**](./use-cases/) - Casos de uso del proyecto    - **Dify namespace**: Existing workloads (data source, read-only)

- [ ] Auto-remediation workflows

  - Documentation System    - **CloudMind namespace**: New PoC workloads (Terraform-managed)

### Phase 4: FinOps Optimization 💰

  - IaC Automation    - **Ahorro**: ~€250/mes vs multi-AKS approach

- [ ] Azure Cost Management API integration

- [ ] Underutilization detection  - FinOps Optimization

- [ ] Automated PR generation (optimizations)

- [ ] Predictive cost dashboards  - Engineering Homologation---



---



## 🔗 Enlaces Rápidos---## 📊 Métricas del Proyecto



<div class="grid cards" markdown>



-   :fontawesome-brands-github:{ .lg .middle } **GitHub Repository**## 📊 Estado del Proyecto| Métrica | Valor | Estado |



    ---|---------|-------|--------|



    [Ver código fuente](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana)**Seguimiento del progreso y planificación**:| **Recursos Desplegados** | 7 | ✅ |



-   :material-microsoft-azure:{ .lg .middle } **Azure Portal**| **Workflows CI/CD** | 5 | ✅ |



    ---- [**status.md**](./status.md) - Estado actual del proyecto| **Security Gates** | 6 | ✅ |



    [Ver recursos](https://portal.azure.com/#@93f33571-550f-43cf-b09f-cd331338d086/resource/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7)- [**PRODUCT_VISION.md**](./PRODUCT_VISION.md) - Visión del producto| **Coste Mensual Incremental** | ~€5/mes | ✅ |



-   :material-github-actions:{ .lg .middle } **GitHub Actions**- [**IMPLEMENTATION_PLAN.md**](./IMPLEMENTATION_PLAN.md) - Plan de implementación| **Ahorro vs Multi-AKS** | ~€250/mes | ✅ |



    ---- [**OPTIMIZATION_PROPOSAL.md**](./OPTIMIZATION_PROPOSAL.md) - Propuestas de optimización| **Time-to-Deploy** | ~10 min | ✅ |



    [Ver workflows](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/actions)



-   :material-book-open-page-variant:{ .lg .middle } **Documentación**------



    ---



    [Explorar guías](guides/quick-start-app/)## 💼 Business Plan## 🚀 Quick Start



-   :material-robot:{ .lg .middle } **Chatbot Integration**



    ---**Casos de negocio y ROI**:### 1. Clonar Repositorio



    [Ver guía completa](guides/chatbot-integration/)



-   :material-rocket-launch:{ .lg .middle } **Quick Start**- [**business-plan.md**](./business-plan.md) - Plan de negocio```bash



    ---- [**BUSINESS_PLAN.md**](../BUSINESS_PLAN.md) - Business case y ROIgit clone https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana.git



    [Empezar en 5 minutos](guides/quick-start-app/)cd DXC_PoC_Nirvana



</div>---```



---



## 📞 Soporte## 🛠️ Runbooks y Operaciones### 2. Configurar Credenciales



**CloudOps Team**: Alberto Lacambra  

**GitHub Issues**: [Reportar aquí](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/issues)

**Procedimientos operacionales y troubleshooting**:Ver [Guía de Configuración de Secretos](guides/secrets-setup.md)

!!! quote "Misión"

    Transformar CloudOps mediante IA, automatización end-to-end y gobernanza proactiva, depreciando ClickOps y modernizando operaciones legacy.


- [**runbooks/**](./runbooks/) - Procedimientos de operación### 3. Desplegar Infraestructura

  - Mantenimiento de servicios

  - Recovery procedures```bash

  - Incident response# Opción 1: GitHub Actions (Recomendado)

# Ir a Actions → "🚀 Deploy Infrastructure" → Run workflow

---

# Opción 2: Local (Testing)

## 📝 Referencia Técnicacd terraform/environments/hub

terraform init

**Documentación de referencia y APIs**:terraform plan

terraform apply

- [**reference/**](./reference/) - Documentación de referencia```

  - APIs

  - Configuraciones---

  - Especificaciones técnicas

## 🎯 Use Cases (Roadmap)

---

### Phase 1: Foundation ✅

## 📌 Recursos Adicionales

- [x] Infrastructure as Code (Terraform)

### Notificaciones de Teams- [x] CI/CD Pipelines (GitHub Actions)

- [x] Security & Compliance Gates

- [**TEAMS_WEBHOOK_INSTRUCTIONS.md**](../TEAMS_WEBHOOK_INSTRUCTIONS.md) - Configuración de webhooks- [x] Cost Optimization (Single-AKS)

- [**TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md**](../TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md) - Solución de problemas

### Phase 2: Documentation System 📝

### Otros Recursos

- [ ] Next.js Control Center UI with MDX

- [**features/**](./features/) - Documentación de características del sistema- [ ] FastAPI API Gateway

- [ ] Dify RAG integration

---- [ ] Conversational Q&A bot



## 🗂️ Estructura de Documentación### Phase 3: IaC Automation 🤖



```- [ ] Drift detection pipeline

DXC_PoC_Nirvana/- [ ] AI risk analysis (Dify workflows)

├── README.md                           # 📖 Documentación principal- [ ] Infrastructure state dashboard

├── QUICK_START.md                      # 🚀 Inicio rápido- [ ] Auto-remediation workflows

├── CHATBOT_INTEGRATION.md              # 🤖 Guía del chatbot

│### Phase 4: FinOps Optimization 💰

├── docs/                               # 📚 Documentación estructurada

│   ├── index.md                        # Este archivo- [ ] Azure Cost Management API integration

│   ├── architecture/                   # 🏗️ Arquitectura del sistema- [ ] Underutilization detection

│   ├── cicd/                           # 🔄 CI/CD workflows- [ ] Automated PR generation (optimizations)

│   ├── costs/                          # 💰 Análisis de costes- [ ] Predictive cost dashboards

│   ├── guides/                         # 📖 Guías técnicas

│   ├── use-cases/                      # 🎯 Casos de uso---

│   ├── runbooks/                       # 🛠️ Procedimientos operacionales

│   ├── reference/                      # 📝 Documentación de referencia## 🔗 Enlaces Rápidos

│   └── features/                       # ✨ Características del sistema

│<div class="grid cards" markdown>

├── terraform/

│   └── README.md                       # 🌍 Documentación de Terraform-   :material-github:{ .lg .middle } **GitHub Repository**

│

├── SECRETS_SETUP.md                    # 🔐 Setup de secretos    ---

├── CHECKLIST_SECRETOS.md               # ✅ Checklist de secretos

├── GITHUB_PAGES_SETUP.md               # 📄 Setup de GitHub Pages    [Ver código fuente](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana){ .md-button .md-button--primary }

├── TEAMS_WEBHOOK_INSTRUCTIONS.md       # 📢 Webhooks de Teams

└── BUSINESS_PLAN.md                    # 💼 Business case-   :material-microsoft-azure:{ .lg .middle } **Azure Portal**

```

    ---

---

    [Ver recursos](https://portal.azure.com/#@93f33571-550f-43cf-b09f-cd331338d086/resource/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7){ .md-button }

## 🔍 Búsqueda Rápida

-   :octicons-workflow-24:{ .lg .middle } **GitHub Actions**

### Por Tarea

    ---

| Quiero... | Ver documento |

|-----------|---------------|    [Ver workflows](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/actions){ .md-button }

| Empezar rápidamente | [`QUICK_START.md`](../QUICK_START.md) |

| Entender el chatbot | [`CHATBOT_INTEGRATION.md`](../CHATBOT_INTEGRATION.md) |-   :material-file-document-outline:{ .lg .middle } **Documentación**

| Desplegar infraestructura | [`terraform/README.md`](../terraform/README.md) |

| Configurar secretos | [`SECRETS_SETUP.md`](../SECRETS_SETUP.md) |    ---

| Ver la arquitectura | [`architecture/ARCHITECTURE_V2.md`](./architecture/ARCHITECTURE_V2.md) |

| Configurar CI/CD | [`cicd/`](./cicd/) |    [Explorar guías](guides/quick-start.md){ .md-button }

| Analizar costes | [`costs/`](./costs/) |

</div>

### Por Rol

---

#### Desarrollador Frontend

- [`QUICK_START.md`](../QUICK_START.md)## 📞 Soporte

- [`CHATBOT_INTEGRATION.md`](../CHATBOT_INTEGRATION.md)

- [`guides/`](./guides/)**CloudOps Team**: Alberto Lacambra  

**GitHub Issues**: [Reportar aquí](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/issues)

#### DevOps / SRE

- [`terraform/README.md`](../terraform/README.md)---

- [`SECRETS_SETUP.md`](../SECRETS_SETUP.md)

- [`cicd/`](./cicd/)!!! quote "Misión"

- [`runbooks/`](./runbooks/)    Transformar CloudOps mediante IA, automatización end-to-end y gobernanza proactiva, depreciando ClickOps y modernizando operaciones legacy.


#### Arquitecto
- [`architecture/ARCHITECTURE_V2.md`](./architecture/ARCHITECTURE_V2.md)
- [`PRODUCT_VISION.md`](./PRODUCT_VISION.md)
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

#### Product Owner / Manager
- [`BUSINESS_PLAN.md`](../BUSINESS_PLAN.md)
- [`PRODUCT_VISION.md`](./PRODUCT_VISION.md)
- [`status.md`](./status.md)
- [`costs/`](./costs/)

---

## 🆘 Soporte y Contribución

### Problemas Comunes

1. **Problemas con el chatbot**: Ver [`CHATBOT_INTEGRATION.md - Troubleshooting`](../CHATBOT_INTEGRATION.md#-troubleshooting)
2. **Errores de Terraform**: Ver [`terraform/README.md`](../terraform/README.md)
3. **Problemas de CI/CD**: Ver [`cicd/`](./cicd/)
4. **Notificaciones de Teams**: Ver [`TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md`](../TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md)

### Contacto

- **Equipo**: DXC Cloud Mind Team
- **Proyecto**: Nirvana PoC
- **Repositorio**: [DXC_PoC_Nirvana](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana)

---

**Última actualización**: 25 de Octubre 2025  
**Mantenido por**: DXC Cloud Mind Team
