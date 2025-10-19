# 🎉 Cloud Control Center UI - Setup Completado

## ✅ Estado del Proyecto

El proyecto NextJS ha sido inicializado exitosamente con toda la estructura base.

### Archivos Creados

```
apps/control-center-ui/
├── 📄 Configuration Files
│   ├── package.json              ✅ NextJS 14.2.0 + TypeScript
│   ├── tsconfig.json             ✅ TypeScript config
│   ├── next.config.mjs           ✅ NextJS config con standalone mode
│   ├── tailwind.config.ts        ✅ Tailwind + shadcn/ui setup
│   ├── postcss.config.mjs        ✅ PostCSS config
│   ├── .eslintrc.json            ✅ ESLint config
│   ├── .gitignore                ✅ Git ignore rules
│   └── .env.example              ✅ Environment variables template
│
├── 📁 app/ (Next.js App Router)
│   ├── layout.tsx                ✅ Root layout con Inter font
│   ├── page.tsx                  ✅ Dashboard home con 3 módulos
│   └── globals.css               ✅ Tailwind + custom CSS variables
│
├── 📁 lib/
│   ├── dify-client.ts            ✅ Cliente completo para Dify API
│   │   - sendMessage()          → Chat con Dify
│   │   - queryKnowledge()       → RAG queries
│   │   - getConversations()     → Historial
│   │   - getConversationMessages() → Mensajes
│   └── utils.ts                  ✅ Utility functions (cn helper)
│
├── 📁 kubernetes/
│   ├── deployment.yaml           ✅ 2 replicas, health checks, secrets
│   ├── service.yaml              ✅ ClusterIP service
│   └── ingress.yaml              ✅ Nginx ingress config
│
├── 🐳 Dockerfile                 ✅ Multi-stage build optimizado
├── 📖 README.md                  ✅ Documentación completa
└── 📦 node_modules/              ✅ 392 packages instalados
```

## 📦 Dependencias Instaladas

### Core
- `next@14.2.0` - Framework
- `react@18.3.1` - UI library
- `typescript@5.5.4` - Type safety
- `tailwindcss@3.4.4` - Utility-first CSS

### State & Data Fetching
- `zustand` - State management (simple & powerful)
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client

### UI & Styling
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Class name utilities
- `tailwindcss-animate` - Animation utilities

## 🚀 Próximos Pasos

### 1. Configurar Variables de Entorno

```bash
# Crear archivo .env.local
cp .env.example .env.local

# Editar con tu API key de Dify
nano .env.local
```

Contenido de `.env.local`:
```env
DIFY_API_KEY=app-xxxxxxxxxx  # Obtener desde Dify UI
NEXT_PUBLIC_DIFY_API_URL=http://dify-api.dify.svc.cluster.local:5001
```

### 2. Ejecutar en Desarrollo

```bash
cd apps/control-center-ui
npm run dev
```

Abre: http://localhost:3000

### 3. Build y Deploy a AKS

#### A. Build Docker Image

```bash
# Login a ACR
az acr login --name dxccloudmindx0sa6l

# Build y push
docker build -t dxccloudmindx0sa6l.azurecr.io/control-center-ui:latest .
docker push dxccloudmindx0sa6l.azurecr.io/control-center-ui:latest
```

#### B. Actualizar Secret con API Key

Edita `kubernetes/deployment.yaml` línea 36:
```yaml
stringData:
  api-key: "app-xxxxxxxxxx"  # Tu API key real de Dify
```

#### C. Deploy a Kubernetes

```bash
# Get AKS credentials
az aks get-credentials --resource-group dify-rg --name dify-aks

# Deploy
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml

# Verificar
kubectl get pods -n cloudmind
kubectl logs -n cloudmind -l app=control-center-ui
```

### 4. Acceder a la Aplicación

- **Local**: http://localhost:3000
- **Ingress**: http://cloudcontrol.internal.dxc.com (via VPN OPNSense)

## 🔑 Obtener API Key de Dify

1. Accede a: http://10.0.2.62/apps (via VPN)
2. Crea una nueva app de tipo "Chat" o abre una existente
3. Ve a **API Access** en el menú lateral
4. Copia el **API Key** (formato: `app-xxxxxxxxxx`)
5. Úsala en `.env.local` o en el Secret de K8s

## 📋 Checklist Fase 1 - Semana 1

- [x] ✅ Proyecto NextJS inicializado
- [x] ✅ Dependencias instaladas (392 packages)
- [x] ✅ Cliente Dify implementado (`lib/dify-client.ts`)
- [x] ✅ Layout y página principal creados
- [x] ✅ Dockerfile multi-stage optimizado
- [x] ✅ Kubernetes manifests (deployment, service, ingress)
- [x] ✅ GitHub Actions workflow configurado
- [x] ✅ Documentación completa (README.md)

### Próximas Tareas (Días 2-5)

- [ ] 🔜 Crear componentes UI con shadcn/ui
  - [ ] Button, Card, Input, Textarea
  - [ ] Dialog, Dropdown Menu, Tabs
- [ ] 🔜 Implementar ChatWidget component
  - [ ] MessageList con scroll
  - [ ] MessageInput con textarea autosize
  - [ ] Integración con Dify API
- [ ] 🔜 Implementar Dashboard
  - [ ] StatsCard component (métricas)
  - [ ] ActivityFeed component
  - [ ] Quick actions buttons
- [ ] 🔜 Crear Navigation component
  - [ ] Sidebar con links a módulos
  - [ ] User menu
  - [ ] Theme toggle (dark mode)

## 📊 Costos Estimados

| Recurso | Cantidad | Costo Mensual |
|---------|----------|---------------|
| Pods (256Mi RAM, 100m CPU) | 2 | ~€15 |
| Storage (logs, cache) | 10GB | ~€2 |
| Network (ingress) | - | ~€8 |
| **Total** | | **~€25/mes** |

✅ **Dentro del presupuesto**: $130/mes disponibles, solo usaremos ~$27/mes

## 🎯 Siguientes Fases

### Fase 2 (Semanas 5-7): Knowledge Portal - €50/mes adicional
- Página de búsqueda de documentación
- Integración con Dify RAG
- Upload automático de docs desde GitHub
- Filtros por categoría, tags, fechas

### Fase 3 (Semanas 8-12): Code Generation - €175/mes adicional
- Interface de Vibe Coding
- Generación de proyectos desde prompts
- Preview de código generado
- Download de proyectos completos
- Templates library

## 🐛 Troubleshooting

### Build Error: Module not found

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Docker Build Fails

```bash
# Verificar que estás en el directorio correcto
cd apps/control-center-ui
docker build -t test .
```

### Pods en CrashLoopBackOff

```bash
# Ver logs
kubectl logs -n cloudmind -l app=control-center-ui

# Verificar secret
kubectl get secret dify-api-key -n cloudmind -o yaml

# Verificar que ACR está accesible
kubectl get pods -n kube-system | grep acr
```

## 📚 Recursos

- **Dify Docs**: https://docs.dify.ai/
- **NextJS Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Estado**: ✅ LISTO PARA DESARROLLO

**Próximo comando**: `npm run dev` para empezar a desarrollar

**Contacto**: Alberto Lacambra (alacambra@dxc.com)
