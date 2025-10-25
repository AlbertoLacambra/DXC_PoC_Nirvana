# 🤖 Integración del Chatbot Dify - Nirvana Tech Support Assistant

**Fecha de Última Actualización**: 25 de Octubre 2025  
**Estado**: ✅ **FUNCIONANDO CORRECTAMENTE**  
**Versión**: 1.0 (WebApp Approach)

---

## 📋 Resumen Ejecutivo

Se ha integrado exitosamente el chatbot **Nirvana Tech Support Assistant** en la aplicación React (Next.js) DXC Cloud Mind - Nirvana. El chatbot está disponible como un **botón flotante verde** en la esquina inferior derecha de todas las páginas.

### Solución Implementada

**Custom React Component + Dify WebApp**
- ✅ Componente React personalizado (`DifyChatButton.tsx`)
- ✅ Iframe embebido apuntando al WebApp público de Dify
- ✅ Sin necesidad de autenticación (WebApp habilitado)
- ✅ Diseño responsive y personalizable

**¿Por qué esta solución?**
- El widget oficial `embed.min.js` de Dify presentaba problemas de autenticación (401/400 errors)
- La solución con iframe es más estable, simple y no requiere tokens de API
- Mayor control sobre UX y personalización del botón flotante

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (localhost:3000)                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Layout.tsx (Global)                                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  DifyChatButton Component                       │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  Floating Button (visible)                │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Iframe (when opened)               │  │  │  │  │
│  │  │  │  │  src: http://10.0.2.91/chatbot/     │  │  │  │  │
│  │  │  │  │       7C9Ppi4gev9j1h7p               │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│  Dify Platform (10.0.2.91)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  WebApp Endpoint                                      │  │
│  │  /chatbot/7C9Ppi4gev9j1h7p                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Chat Interface (Public Access)                 │  │  │
│  │  │  • No authentication required                   │  │  │
│  │  │  • enable_site = true                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Dify API / Agent                                     │  │
│  │  • App ID: 3b4e8375-30db-4351-afca-78b3e98ca0d3      │  │
│  │  • Model: gpt-4o-mini (Azure OpenAI)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuración Implementada

### 1. Variables de Entorno (`.env.local`)

**Ubicación**: `apps/control-center-ui/.env.local`

```bash
# Dify ChatBot Configuration (Nirvana Tech Support Assistant)
# LoadBalancer interno de Dify
NEXT_PUBLIC_DIFY_URL=http://10.0.2.91
# App CODE del WebApp (no confundir con app_id)
NEXT_PUBLIC_DIFY_APP_CODE=7C9Ppi4gev9j1h7p
```

**Notas importantes**:
- ✅ Variables con prefijo `NEXT_PUBLIC_*` (disponibles en cliente)
- ✅ `DIFY_APP_CODE` es el código del WebApp (≠ app_id)
- ✅ URL interna del LoadBalancer de Dify

### 2. Componente React (`DifyChatButton.tsx`)

**Ubicación**: `apps/control-center-ui/app/components/DifyChatButton.tsx`

```tsx
'use client';

import { useState } from 'react';

export default function DifyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  const DIFY_URL = process.env.NEXT_PUBLIC_DIFY_URL || 'http://10.0.2.91';
  const DIFY_APP_CODE = process.env.NEXT_PUBLIC_DIFY_APP_CODE || '7C9Ppi4gev9j1h7p';
  const chatbotUrl = `${DIFY_URL}/chatbot/${DIFY_APP_CODE}`;

  const handleOpenChat = () => {
    window.open(chatbotUrl, 'dify-chat', 'width=400,height=600,resizable=yes');
  };

  const handleToggleIframe = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleToggleIframe}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all z-50 flex items-center justify-center hover:scale-110"
        aria-label="Abrir chatbot"
      >
        💬
      </button>

      {/* Iframe del chatbot (cuando está abierto) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-green-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-semibold">Nirvana Assistant</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleOpenChat}
                className="hover:bg-white/20 p-2 rounded transition-all"
                title="Abrir en nueva ventana"
              >
                ↗️
              </button>
              <button
                onClick={handleToggleIframe}
                className="hover:bg-white/20 p-2 rounded transition-all"
                title="Cerrar"
              >
                ✖️
              </button>
            </div>
          </div>
          
          {/* Iframe content */}
          <iframe
            src={chatbotUrl}
            className="flex-1 w-full border-0"
            title="Dify Chatbot"
            allow="microphone"
          />
        </div>
      )}
    </>
  );
}
```

**Características**:
- ✅ Botón flotante con emoji 💬
- ✅ Gradient verde corporativo (green-500 → emerald-600)
- ✅ Dos modos: Iframe embebido o nueva ventana
- ✅ Header personalizado con nombre "Nirvana Assistant"
- ✅ Botones de cerrar y expandir
- ✅ Responsive y animaciones suaves

### 3. Layout Global (`layout.tsx`)

**Ubicación**: `apps/control-center-ui/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
import DifyChatButton from "./components/DifyChatButton";

export const metadata: Metadata = {
  title: "DXC Cloud Mind - Nirvana",
  description: "AI-driven CloudOps Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <DifyChatButton />
      </body>
    </html>
  );
}
```

**Resultado**: El botón flotante aparece en **todas las páginas** de la aplicación.

### 4. Homepage Informativa (`page.tsx`)

Se añadió una tarjeta informativa en la homepage:

```tsx
<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
  <div className="flex items-start gap-4">
    <div className="text-4xl">💬</div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Chatbot Integrado - Nirvana Tech Support Assistant
      </h3>
      <p className="text-gray-700 mb-3">
        El chatbot flotante está disponible en <strong>todas las páginas</strong> usando el widget embebido de Dify. 
        Busca el botón verde en la esquina inferior derecha 🤖
      </p>
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-300 text-green-700 rounded-lg font-semibold">
        ✅ Widget Activo
      </div>
    </div>
  </div>
</div>
```

---

## 🚀 Cómo Usar el Chatbot

### Para Desarrolladores

#### 1. Iniciar el Servidor de Desarrollo

```bash
cd apps/control-center-ui
npm run dev
```

El servidor iniciará en: **http://localhost:3000**

#### 2. Verificar Variables de Entorno

Asegúrate de que `.env.local` contiene:

```bash
NEXT_PUBLIC_DIFY_URL=http://10.0.2.91
NEXT_PUBLIC_DIFY_APP_CODE=7C9Ppi4gev9j1h7p
```

#### 3. Hard Refresh en el Navegador

Si acabas de actualizar variables de entorno:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Para Usuarios Finales

1. **Acceder a la aplicación**: `http://localhost:3000`
2. **Buscar el botón verde** en la esquina inferior derecha 💬
3. **Hacer clic** para abrir el chat
4. **Escribir tu pregunta** y presionar Enter
5. **Recibir respuesta** del modelo gpt-4o-mini

#### Funciones del Chatbot

- **Cerrar chat**: Botón ✖️ en el header
- **Abrir en nueva ventana**: Botón ↗️ en el header (útil para pantallas pequeñas)
- **Reabrir**: Clic nuevamente en el botón flotante verde

---

## 📊 Configuración de Dify

### Información del Chatbot

| Parámetro | Valor |
|-----------|-------|
| **Nombre** | Nirvana Tech Support Assistant |
| **App ID** | `3b4e8375-30db-4351-afca-78b3e98ca0d3` |
| **WebApp Code** | `7C9Ppi4gev9j1h7p` ⚠️ |
| **Tenant ID** | `7803de48-c995-4776-af73-de10d5e98147` |
| **Tipo** | Chat |
| **Modelo** | gpt-4o-mini |
| **Provider** | Azure OpenAI |
| **WebApp Habilitado** | ✅ Sí (`enable_site = true`) |

⚠️ **Importante**: El **WebApp Code** (`7C9Ppi4gev9j1h7p`) es diferente al **App ID** y se almacena en la tabla `sites` de la base de datos.

### URLs Relevantes

| Tipo | URL |
|------|-----|
| **Dify UI** | `http://10.0.2.91` |
| **WebApp Público** | `http://10.0.2.91/chatbot/7C9Ppi4gev9j1h7p` |
| **Dify API** | `http://10.0.2.91/v1` |

### Infraestructura Dify

| Componente | Valor |
|------------|-------|
| **Versión Dify** | 1.9.2 |
| **Helm Chart** | BorisPolonsky/dify-helm v0.31.0 |
| **Cluster AKS** | `dify-aks` |
| **Namespace** | `dify` |
| **LoadBalancer** | `10.0.2.91` (Azure Internal) |
| **PostgreSQL** | `dify-postgres-9107e36a.postgres.database.azure.com` |
| **Base de Datos** | `dify` |

---

## 🔍 Troubleshooting

### Problema 1: El botón flotante no aparece

**Síntomas**: No se ve el botón verde en la esquina inferior derecha.

**Solución**:
1. Verificar que `DifyChatButton.tsx` existe en `apps/control-center-ui/app/components/`
2. Verificar que `layout.tsx` importa y renderiza `<DifyChatButton />`
3. Hard refresh del navegador (`Ctrl + Shift + R`)
4. Revisar consola del navegador para errores de React

### Problema 2: El iframe no carga el chatbot

**Síntomas**: El iframe está en blanco o muestra error 404.

**Solución**:
1. Verificar que `.env.local` tiene las variables correctas:
   ```bash
   NEXT_PUBLIC_DIFY_URL=http://10.0.2.91
   NEXT_PUBLIC_DIFY_APP_CODE=7C9Ppi4gev9j1h7p
   ```
2. **Reiniciar el servidor Next.js** (las variables de entorno solo se cargan al inicio)
3. Verificar acceso directo a: `http://10.0.2.91/chatbot/7C9Ppi4gev9j1h7p`

### Problema 3: Error "App with code ... not found"

**Síntomas**: El WebApp muestra error de aplicación no encontrada.

**Causa**: El WebApp está deshabilitado en la base de datos.

**Solución**:
```bash
# Conectar a PostgreSQL y habilitar WebApp
kubectl run psql-enable-site --rm -i --restart=Never --image=postgres:15 -n dify \
  --env="PGPASSWORD=:hAqXVV>wqjB*:)SJhPZD25n" -- \
  psql -h dify-postgres-9107e36a.postgres.database.azure.com -p 5432 -U difyadmin -d dify \
  -c "UPDATE apps SET enable_site = true WHERE id = '3b4e8375-30db-4351-afca-78b3e98ca0d3';"
```

### Problema 4: El chat no responde

**Síntomas**: El chat se abre pero no responde a mensajes.

**Solución**:
1. Verificar que Dify API está funcionando:
   ```bash
   curl http://10.0.2.91/health
   ```
2. Verificar logs de Dify:
   ```bash
   kubectl logs -n dify -l app.kubernetes.io/component=api --tail=50
   ```
3. Verificar configuración de Azure OpenAI en Dify UI

### Problema 5: CORS errors en la consola

**Síntomas**: Errores de CORS al cargar el iframe.

**Causa**: Dify no está configurado para permitir embeddings.

**Solución**: Verificar que Dify permite iframe embeddings (configuración por defecto en Dify 1.9.2).

---

## 🎨 Personalización

### Cambiar Colores del Botón

Editar `DifyChatButton.tsx`:

```tsx
// Cambiar de verde a azul
className="... from-blue-500 to-blue-600 ..."
```

### Cambiar Posición del Botón

```tsx
// De esquina inferior derecha a inferior izquierda
className="fixed bottom-6 left-6 ..."
```

### Cambiar Tamaño del Iframe

```tsx
// Iframe más grande
className="... w-[500px] h-[700px] ..."
```

### Cambiar Emoji del Botón

```tsx
// Usar un robot en vez de burbuja
<button>
  🤖
</button>
```

### Personalizar Header del Chat

```tsx
<div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
  <span>Tu Nombre Personalizado</span>
</div>
```

---

## 📝 Notas Técnicas

### ¿Por qué no usamos embed.min.js oficial?

**Intentamos primero** la integración con el widget oficial de Dify:

```tsx
<Script src="http://10.0.2.91/embed.min.js" />
```

**Problemas encontrados**:
- ❌ Error 401: Autenticación fallida incluso con token correcto
- ❌ Error 400: Endpoint `/api/login/status` no existe o requiere autenticación diferente
- ❌ Complejidad innecesaria para nuestro caso de uso

**Solución final (iframe)**:
- ✅ Más simple y estable
- ✅ No requiere autenticación (WebApp público)
- ✅ Mayor control sobre UX
- ✅ Compatible con Next.js Server Components

### Diferencia entre App ID y WebApp Code

```
App ID (UUID):           3b4e8375-30db-4351-afca-78b3e98ca0d3
WebApp Code (alfanum):   7C9Ppi4gev9j1h7p
```

- **App ID**: Identificador interno de Dify (tabla `apps`)
- **WebApp Code**: Código público para acceder al WebApp (tabla `sites`)
- **URL WebApp**: `/chatbot/{WebApp Code}` ≠ `/chatbot/{App ID}`

Para obtener el WebApp Code desde la base de datos:

```sql
SELECT code FROM sites WHERE app_id = '3b4e8375-30db-4351-afca-78b3e98ca0d3';
```

Resultado: `7C9Ppi4gev9j1h7p`

---

## ✅ Checklist de Verificación

### Desarrollo

- [x] Archivo `DifyChatButton.tsx` existe en `apps/control-center-ui/app/components/`
- [x] `layout.tsx` importa y renderiza `<DifyChatButton />`
- [x] `.env.local` contiene `NEXT_PUBLIC_DIFY_URL` y `NEXT_PUBLIC_DIFY_APP_CODE`
- [x] Servidor Next.js corriendo en puerto 3000
- [x] Hard refresh realizado después de cambios

### Funcionalidad

- [x] Botón flotante verde visible en esquina inferior derecha
- [x] Clic en botón abre iframe con chat
- [x] Iframe carga la interfaz de Dify correctamente
- [x] Se puede escribir y enviar mensajes
- [x] El chatbot responde con mensajes del modelo gpt-4o-mini
- [x] Botón de cerrar (✖️) funciona
- [x] Botón de nueva ventana (↗️) funciona

### Producción

- [ ] Variables de entorno configuradas en entorno de producción
- [ ] WebApp habilitado en Dify (`enable_site = true`)
- [ ] LoadBalancer accesible desde la red de producción
- [ ] HTTPS configurado (si aplica)
- [ ] Pruebas de carga realizadas

---

## 📚 Referencias

- [Documentación de Dify](https://docs.dify.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Reference](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar la sección [Troubleshooting](#-troubleshooting)
2. Consultar logs de Dify: `kubectl logs -n dify -l app.kubernetes.io/component=api`
3. Verificar estado de pods: `kubectl get pods -n dify`
4. Revisar PostgreSQL: Conectar y verificar tablas `apps` y `sites`

---

**Última verificación**: 25 de Octubre 2025 ✅  
**Autor**: DXC Cloud Mind Team  
**Versión del documento**: 1.0
