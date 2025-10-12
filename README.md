# DXC PoC Nirvana - Cloud Control Center

> **AI-driven CloudOps platform with Hub & Spoke architecture across Azure subscriptions**

## 🎯 Vision

Construir un **Cloud Control Center** que transforme las operaciones en la nube mediante inteligencia artificial, automatización end-to-end y gobernanza proactiva. Este proyecto implementa una plataforma unificada que permite:

- **Visibilidad total** en tiempo real (minutos/segundos) de operaciones, incidentes y alarmas
- **Velocidad de acción** mediante planes generados por IA con comparación histórica
- **Proactividad** a través de insights continuos que previenen incidentes recurrentes
- **Resiliencia** con enfoque en cero riesgo operacional (runtime + operations)
- **Hiper-automatización** del ciclo de vida completo de soluciones Cloud
- **Gobernanza** automatizada con cumplimiento de normativas Wiki/código
- **Eficiencia de costes** mediante automatización de iniciativas FinOps
- **Unificación CloudOps** que depreca ClickOps y moderniza operaciones legacy

## 🏗️ Arquitectura

### Hub & Spoke Multi-Subscription

```
┌─────────────────────────────────────────────────────────────┐
│  HUB (Subscription: 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7)   │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐    │
│  │   Dify    │  │PostgreSQL│  │  Redis  │  │   VPN    │    │
│  │ (Existing)│  │  Shared  │  │ Shared  │  │ Gateway  │    │
│  └───────────┘  └──────────┘  └─────────┘  └──────────┘    │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐    │
│  │    ACR    │  │Log Analytics│ │App Insights│ │Monitoring│ │
│  │  Shared   │  │   Shared  │  │  Shared │  │  Stack   │    │
│  └───────────┘  └──────────┘  └─────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                                   │
           ├───────────────────────────────────┤
           │                                   │
┌──────────▼────────────┐         ┌───────────▼──────────────┐
│  SPOKE-PROD           │         │  SPOKE-DEV               │
│  (Sub: 353a6255)      │         │  (Sub: 0987a8ce)         │
│  ┌─────────────────┐  │         │  ┌────────────────────┐  │
│  │  Control Center │  │         │  │  Dev/Test Envs     │  │
│  │  UI (Next.js)   │  │         │  │  AI Experiments    │  │
│  └─────────────────┘  │         │  └────────────────────┘  │
│  ┌─────────────────┐  │         │  ┌────────────────────┐  │
│  │  API Gateway    │  │         │  │  FinOps Sandboxes  │  │
│  │  (FastAPI)      │  │         │  │  Cost-optimized    │  │
│  └─────────────────┘  │         │  └────────────────────┘  │
└───────────────────────┘         └──────────────────────────┘
```

### Componentes Clave

- **Dify**: Orquestador de IA existente (`http://10.0.2.62/`) - workflows, RAG, agentes
- **Next.js**: UI del Control Center con MDX para documentación embebida
- **FastAPI**: API Gateway que integra Dify, Azure APIs, y lógica de negocio
- **Terraform**: IaC principal para despliegue multi-subscripción
- **Pulumi**: Escenarios complejos y programáticos
- **Grafana/Prometheus**: Observabilidad unificada
- **Azure Monitor**: Telemetría centralizada en Hub

## 🚀 Use Cases Iniciales

### 1. Sistema de Documentación
- **MDX como fuente de verdad** con Git como repositorio central
- **RAG con Dify** para Q&A bot conversacional sobre documentación
- **Renderizado Next.js** con búsqueda, versiones y contribuciones

### 2. Automatización IaC Deploy
- **Detección de drift** en Terraform con comparación estado vs realidad
- **Análisis de riesgo** mediante Dify antes de ejecutar cambios
- **Auto-remediación** de configuraciones desviadas

### 3. FinOps Automation
- **Detección de infrautilización** con Azure Cost Management API
- **Generación automática de PRs** con recomendaciones de optimización
- **Dashboards predictivos** de costes con tendencias y alertas

### 4. Homologación Engineering
- **Revisión de código AI-driven** para cumplimiento de estándares
- **Testing automatizado** de nuevos componentes
- **Validación de compliance** contra normativas internas

## 📁 Estructura del Proyecto

```
DXC_PoC_Nirvana/
├── docs/
│   ├── architecture/       # Diseños Hub & Spoke, ADRs, diagramas
│   ├── use-cases/          # Especificaciones detalladas de casos de uso
│   └── runbooks/           # Procedimientos operacionales
├── terraform/
│   ├── hub/                # Recursos compartidos (extiende Dify existente)
│   ├── spoke-prod/         # Control Center producción (sub 353a6255)
│   └── spoke-dev/          # Entornos dev/test (sub 0987a8ce)
├── apps/
│   ├── control-center-ui/  # Next.js 14+ con App Router y MDX
│   ├── api-gateway/        # FastAPI backend
│   ├── dify-integrations/  # Conectores a Dify API
│   └── agents/             # Agentes especializados (FinOps, IaC, etc.)
├── kubernetes/
│   ├── control-center/     # Deployments UI y API
│   └── monitoring/         # Grafana, Prometheus, dashboards
├── scripts/
│   ├── setup/              # Scripts de inicialización
│   ├── finops/             # Automatización de análisis de costes
│   └── governance/         # Comprobación de compliance
└── .github/workflows/      # CI/CD pipelines
```

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 14+, React Server Components, TailwindCSS, MDX |
| **Backend** | Python FastAPI, async/await, type hints |
| **AI/LLM** | Dify (orchestrator), Azure OpenAI, RAG pipelines |
| **IaC** | Terragrunt + Terraform (multi-subscription orchestration) |
| **CI/CD** | GitHub Actions (self-hosted runners en Hub) |
| **Observability** | Grafana, Prometheus, Azure Monitor, Application Insights |
| **Database** | PostgreSQL Flexible Server (Hub shared) |
| **Cache** | Redis (Hub shared) |
| **Container Registry** | Azure Container Registry (Hub shared) |
| **Networking** | OpenVPN (Hub), VNet Peering, NSGs |
| **Secrets** | Azure Key Vault (Hub + spoke-specific) |

## 📋 Roadmap de Implementación

### Phase 0: Setup (Actual)
- [x] Crear estructura de repositorio
- [x] Documentar arquitectura Hub & Spoke
- [ ] Inicializar Terraform para Hub (recursos complementarios)
- [ ] Configurar GitHub Actions workflows básicos
- [ ] Crear repositorio privado en GitHub

### Phase 1: Foundation & Documentation System
- [ ] Next.js Control Center UI con MDX
- [ ] FastAPI API Gateway con integración Dify
- [ ] Knowledge Base en Dify con documentación inicial
- [ ] Bot conversacional RAG para Q&A
- [ ] Despliegue en Spoke-Prod

### Phase 2: IaC Automation
- [ ] Pipeline de detección de drift Terraform
- [ ] Workflow Dify para análisis de riesgo
- [ ] Dashboard de estado de infraestructura
- [ ] Auto-remediación de configuraciones

### Phase 3: FinOps Optimization
- [ ] Integración Azure Cost Management API
- [ ] Agente Dify para análisis de underutilization
- [ ] Generación automática de PRs con optimizaciones
- [ ] Dashboards predictivos de costes

### Phase 4: Engineering Homologation
- [ ] AI code review integration
- [ ] Automated testing workflows
- [ ] Compliance validation engine
- [ ] Lifecycle automation end-to-end

## 🔐 Seguridad

- **VPN centralizada**: Acceso a todos los recursos a través de OpenVPN en Hub
- **Segmentación de red**: Hub & Spoke con NSGs restrictivos
- **Secrets management**: Azure Key Vault con Managed Identities
- **RBAC**: Roles mínimos privilegiados por subscripción
- **Audit logs**: Centralizados en Log Analytics Workspace (Hub)

## 💰 Optimización de Costes

- **Recursos compartidos**: PostgreSQL, Redis, ACR, Monitoring en Hub
- **VPN única**: Gateway centralizado vs per-subscription (~60% ahorro)
- **Auto-shutdown**: Políticas en Spoke-Dev para entornos no productivos
- **Right-sizing**: FinOps automation identifica y ajusta recursos sobredimensionados
- **Reserved instances**: Análisis de patrones para reservas estratégicas

## 📊 Capacidades del Cloud Control Center

| Capacidad | Descripción | Prioridad |
|-----------|-------------|-----------|
| **Visibilidad** | Dashboards en tiempo real (minutos/segundos) | P0 |
| **Velocidad de acción** | Planes AI con comparación histórica | P0 |
| **Proactividad** | Insights continuos, prevención de incidentes | P1 |
| **Resiliencia** | Zero operational risk focus | P0 |
| **Hiper-automatización** | E2E lifecycle automation | P1 |
| **Gobernanza** | Compliance automatizado | P1 |
| **Eficiencia de costes** | FinOps automation | P0 |
| **Unificación CloudOps** | Deprecate ClickOps, version control | P2 |

## 🤝 Contribución

Este proyecto sigue metodología **trunk-based development**:
- Feature branches de corta duración
- PRs revisados por pares
- CI checks obligatorios (tests, linting, security scans)
- Deployment automático tras merge a `main`

## 📞 Soporte

- **Arquitectura**: docs/architecture/
- **Runbooks**: docs/runbooks/
- **Issues**: GitHub Issues para bugs y feature requests
- **Discussions**: GitHub Discussions para preguntas y propuestas

## 🔗 Enlaces

- **Dify existente**: `http://10.0.2.62/` (VPN requerida)
- **VPN Gateway**: `52.178.149.106`
- **GitHub**: [DXC_PoC_Nirvana](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana) (privado)
- **Azure Portal**: [Hub Subscription](https://portal.azure.com/#@/resource/subscriptions/739aaf91-5cb2-45a6-ab4f-abf883e9d3f7/overview)

---

**Status**: 🚧 En construcción activa - Phase 0 (Setup)  
**Última actualización**: 12 Octubre 2025  
**Maintainer**: Alberto Lacambra (@AlbertoLacambra)
