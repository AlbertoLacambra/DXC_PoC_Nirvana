# Cloud Control Center UI

Interfaz web unificada para la plataforma Cloud Control Center impulsada por IA.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14.2.0 con App Router
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand + React Query
- **API Client**: Axios
- **Iconos**: Lucide React
- **Deployment**: Kubernetes (AKS)

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Acceso a Dify (http://10.0.2.62/apps via VPN)
- API Key de una app de Dify

## 🛠️ Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edita con tus valores:

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
DIFY_API_KEY=app-xxx  # Tu API key desde Dify
NEXT_PUBLIC_DIFY_API_URL=http://dify-api.dify.svc.cluster.local:5001
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🐳 Build Docker

```bash
# Build imagen
docker build -t control-center-ui:latest .

# Run container
docker run -p 3000:3000 \
  -e DIFY_API_KEY=your-key \
  -e NEXT_PUBLIC_DIFY_API_URL=http://dify-api.dify.svc.cluster.local:5001 \
  control-center-ui:latest
```

## ☸️ Despliegue en Kubernetes

### 1. Actualizar el Secret con tu API Key

Edita `kubernetes/deployment.yaml` y reemplaza `YOUR_DIFY_API_KEY_HERE` con tu API key real de Dify.

### 2. Build y push a ACR

```bash
# Login a ACR
az acr login --name dxccloudmindx0sa6l

# Build y push
docker build -t dxccloudmindx0sa6l.azurecr.io/control-center-ui:latest .
docker push dxccloudmindx0sa6l.azurecr.io/control-center-ui:latest
```

### 3. Desplegar en AKS

```bash
# Get credentials
az aks get-credentials --resource-group dify-rg --name dify-aks

# Deploy
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml

# Verificar
kubectl get pods -n cloudmind
kubectl get svc -n cloudmind
kubectl get ingress -n cloudmind
```

### 4. Acceso

La aplicación estará disponible en:
- **Interno**: http://control-center-ui.cloudmind.svc.cluster.local
- **Ingress**: http://cloudcontrol.internal.dxc.com (via VPN)

## 📁 Estructura del Proyecto

```
apps/control-center-ui/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Dashboard home
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat widget (próximamente)
│   ├── dashboard/        # Dashboard cards (próximamente)
│   └── layout/           # Navigation, Header (próximamente)
├── lib/                   # Utilidades
│   ├── dify-client.ts    # Cliente API de Dify
│   └── utils.ts          # Helpers
├── kubernetes/            # Manifiestos K8s
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── Dockerfile
└── package.json
```

## 🔑 Obtener API Key de Dify

1. Accede a Dify UI: http://10.0.2.62/apps (via VPN OPNSense)
2. Crea una nueva app o abre una existente
3. Ve a "API Access" en el menú
4. Copia el "API Key"
5. Úsala en tu `.env.local` o en el Secret de Kubernetes

## 🎯 Próximas Fases

### Fase 1 (Semanas 1-4): UI Foundation ✅
- [x] Setup NextJS + TypeScript + Tailwind
- [x] Cliente Dify implementado
- [x] Dockerfile y K8s manifests
- [x] GitHub Actions workflow
- [ ] Componentes UI básicos (dashboard, chat)
- [ ] Despliegue inicial en AKS

### Fase 2 (Semanas 5-7): Knowledge Portal
- [ ] Página de búsqueda de conocimiento
- [ ] Integración con Dify RAG
- [ ] Upload de documentación a Dify

### Fase 3 (Semanas 8-12): Code Generation
- [ ] Vibe Coding interface
- [ ] Generación de proyectos
- [ ] Preview y download de código

## 🐛 Troubleshooting

### Error: Cannot connect to Dify API

Si estás ejecutando localmente fuera del cluster, cambia la URL a la externa:

```env
NEXT_PUBLIC_DIFY_API_URL=http://10.0.2.62
```

### Pod en estado CrashLoopBackOff

Verifica que:
1. El Secret `dify-api-key` existe y tiene la key correcta
2. La imagen está correctamente pushed a ACR
3. AKS tiene permisos para pull desde ACR

```bash
kubectl logs -n cloudmind -l app=control-center-ui
kubectl describe pod -n cloudmind -l app=control-center-ui
```

## 📊 Costos Estimados

- **Compute (2 pods)**: ~€15/mes
- **Storage**: ~€5/mes
- **Network**: ~€5/mes
- **Total Fase 1**: ~€25/mes

## 📝 Licencia

Uso interno DXC - Confidencial
