# 🚀 Quick Start Guide - DXC Cloud Mind Nirvana

**Tiempo estimado**: 5-10 minutos  
**Última actualización**: 25 de Octubre 2025

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** >= 18.0.0 ([descargar](https://nodejs.org/))
- ✅ **npm** >= 9.0.0 (viene con Node.js)
- ✅ **Git** ([descargar](https://git-scm.com/))
- ✅ **Visual Studio Code** (opcional pero recomendado)

**Verificar instalaciones**:
```bash
node --version  # Debe ser >= 18.0.0
npm --version   # Debe ser >= 9.0.0
git --version   # Cualquier versión reciente
```

---

## 🎯 Inicio Rápido (3 pasos)

### 1. Clonar el Repositorio

```bash
# HTTPS
git clone https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana.git

# SSH (si tienes configurada tu clave SSH)
git clone git@github.com:DXC-Technology-Spain/DXC_PoC_Nirvana.git

cd DXC_PoC_Nirvana
```

### 2. Instalar Dependencias

```bash
cd apps/control-center-ui
npm install
```

⏱️ **Tiempo**: ~2-3 minutos (dependiendo de tu conexión)

### 3. Iniciar la Aplicación

```bash
npm run dev
```

✅ **Listo!** Abre tu navegador en: **http://localhost:3000**

---

## 🤖 Chatbot Integrado

El chatbot **Nirvana Tech Support Assistant** está integrado y listo para usar.

### Cómo usarlo

1. **Busca el botón verde** 💬 en la esquina inferior derecha
2. **Haz clic** para abrir el chat
3. **Escribe tu pregunta** y presiona Enter
4. **Recibe respuestas** del modelo gpt-4o-mini

### Características

- ✅ Disponible en **todas las páginas**
- ✅ Dos modos: Iframe embebido o nueva ventana
- ✅ Powered by Azure OpenAI (gpt-4o-mini)
- ✅ Conectado a Dify AI Platform

📖 **Documentación completa**: [`CHATBOT_INTEGRATION.md`](./CHATBOT_INTEGRATION.md)

---

## 🏗️ Estructura del Proyecto

```
DXC_PoC_Nirvana/
├── apps/
│   └── control-center-ui/       # ← Aplicación Next.js (aquí estás)
│       ├── app/
│       │   ├── components/
│       │   │   └── DifyChatButton.tsx  # Componente del chatbot
│       │   ├── layout.tsx              # Layout global
│       │   └── page.tsx                # Homepage
│       ├── .env.local                  # Variables de entorno
│       └── package.json
│
├── terraform/                   # Infraestructura como código
├── kubernetes/                  # Manifiestos de Kubernetes
├── docs/                        # Documentación adicional
└── CHATBOT_INTEGRATION.md       # Guía del chatbot
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

El archivo `.env.local` ya está configurado con los valores correctos:

```bash
# Dify ChatBot Configuration
NEXT_PUBLIC_DIFY_URL=http://10.0.2.91
NEXT_PUBLIC_DIFY_APP_CODE=7C9Ppi4gev9j1h7p
```

**No es necesario modificar nada** para el desarrollo local.

### Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint

# Format code
npm run format
```

### Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Next.js Dev** | 3000 | http://localhost:3000 |
| **Next.js Prod** | 3000 | http://localhost:3000 |
| **Dify Platform** | 10.0.2.91 | http://10.0.2.91 |

---

## 🧪 Verificar la Instalación

### Checklist

- [ ] `npm install` completado sin errores
- [ ] `npm run dev` ejecutándose correctamente
- [ ] Navegador abierto en http://localhost:3000
- [ ] Página de inicio visible con logo DXC
- [ ] Botón flotante verde 💬 visible en esquina inferior derecha
- [ ] Clic en botón abre el chatbot
- [ ] Chatbot responde a mensajes

---

## 🆘 Problemas Comunes

### Error: "Port 3000 already in use"

**Solución 1**: Matar el proceso que usa el puerto 3000
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Solución 2**: Usar otro puerto
```bash
PORT=3001 npm run dev
```

### Error: "Cannot find module"

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### El chatbot no aparece

1. **Hard refresh** del navegador: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
2. Verificar que `.env.local` existe y tiene las variables correctas
3. Reiniciar el servidor Next.js

### El chat no responde

1. Verificar que Dify está accesible: Abrir http://10.0.2.91 en el navegador
2. Si Dify no es accesible, verificar conexión VPN/red interna
3. Consultar [`CHATBOT_INTEGRATION.md`](./CHATBOT_INTEGRATION.md) sección Troubleshooting

---

## 📖 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [`CHATBOT_INTEGRATION.md`](./CHATBOT_INTEGRATION.md) | Guía completa del chatbot integrado |
| [`README.md`](./README.md) | Documentación principal del proyecto |
| [`terraform/README.md`](./terraform/README.md) | Infraestructura como código |
| [`SECRETS_SETUP.md`](./SECRETS_SETUP.md) | Configuración de secretos para CI/CD |

---

## 🎓 Próximos Pasos

1. **Explorar la aplicación**: Navega por las diferentes secciones
2. **Probar el chatbot**: Haz preguntas al asistente Nirvana
3. **Revisar el código**: Explora `app/components/DifyChatButton.tsx`
4. **Personalizar**: Cambia colores, posición, o estilos del chatbot
5. **Contribuir**: Lee [`CONTRIBUTING.md`](./CONTRIBUTING.md) (si existe)

---

## 💡 Tips para Desarrolladores

### Hot Reload

Next.js recarga automáticamente cuando guardas cambios en archivos `.tsx`, `.ts`, `.css`.

**Excepciones**:
- `.env.local`: Requiere reiniciar el servidor
- `next.config.js`: Requiere reiniciar el servidor

### TypeScript

El proyecto usa TypeScript estricto. Si ves errores de tipos:

```bash
# Verificar errores de TypeScript
npx tsc --noEmit
```

### Tailwind CSS

El proyecto usa Tailwind CSS para estilos. Clases útiles:

```tsx
className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg hover:shadow-xl transition-all"
```

### VS Code Extensions Recomendadas

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

---

## 🤝 Contacto y Soporte

- **Equipo**: DXC Cloud Mind Team
- **Proyecto**: Nirvana PoC
- **Repositorio**: [DXC_PoC_Nirvana](https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana)

---

**¡Disfruta desarrollando con DXC Cloud Mind Nirvana!** 🚀
