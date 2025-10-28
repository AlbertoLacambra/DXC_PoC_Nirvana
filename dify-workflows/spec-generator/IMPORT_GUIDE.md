# 🚀 Importar Spec Generator en Dify (< 5 minutos)

Este documento te guía para importar el Spec Generator en Dify usando el archivo DSL pre-configurado.

---

## ✅ Pre-requisitos (1 min)

Antes de importar, asegúrate de tener:

1. **Acceso a Dify Platform**
   - URL de tu instancia Dify
   - Rol: Admin o App Developer

2. **Azure OpenAI configurado en Dify**
   - Provider: `langgenius/azure_openai`
   - Model deployment: `gpt-4o`
   - Si no lo tienes, ve a: Settings → Model Providers → Add Azure OpenAI

3. **Knowledge Portal Dataset (opcional pero recomendado)**
   - Dataset ID del Knowledge Portal
   - Si no lo tienes, el bot funcionará sin Knowledge Portal (pero sin contexto enriquecido)

---

## 📥 Importar DSL (3 minutos)

### Paso 1: Descargar archivo DSL

El archivo ya está listo en tu repositorio:
```
c:\PROYECTS\DXC_PoC_Nirvana\dify-workflows\spec-generator\spec-generator.yml
```

### Paso 2: Importar en Dify

1. **Acceder a Dify:**
   - Abre tu navegador
   - Ve a: `https://your-dify-instance.com`
   - Login con tus credenciales

2. **Importar App:**
   - En el dashboard principal, click en **"Import DSL"** (botón superior derecho)
   - O navega a: Studio → Apps → Import
   
3. **Subir archivo:**
   - Click en "Choose File" o arrastra el archivo
   - Selecciona: `spec-generator.yml`
   - Click en **"Import"**

4. **Esperar importación:**
   - Dify procesará el archivo (5-10 segundos)
   - Verás: "Import successful"

### Paso 3: Configurar Model Provider

1. **Verificar Azure OpenAI:**
   - En la app importada, ir a: **Orchestrate** (pestaña superior)
   - Revisar que el modelo está configurado:
     - Provider: `langgenius/azure_openai/azure_openai`
     - Model: `gpt-4o`
     - Temperature: `0.3`
     - Max Tokens: `16000`

2. **Si el modelo no está disponible:**
   - Ir a: Settings → Model Providers
   - Configurar Azure OpenAI:
     - API Key: `[tu Azure OpenAI key]`
     - API Base: `https://your-resource.openai.azure.com/`
     - API Version: `2024-02-01`
     - Deployment Name: `gpt-4o`
   - Guardar y volver a la app

### Paso 4: Configurar Knowledge Portal (Opcional)

Si tienes Knowledge Portal configurado:

1. **Ir a la app importada:**
   - Click en la app "Spec Generator"
   - Ir a: **Orchestrate**

2. **Agregar Knowledge:**
   - En la sección de contexto (lado derecho)
   - Click en **"Add Knowledge"**
   - Selecciona tu Knowledge Portal dataset
   - Configurar retrieval:
     - Retrieval Mode: `Semantic Search`
     - Top K: `5`
     - Score Threshold: `0.7`
     - Reranking: `Enabled` (si está disponible)
   - Guardar

### Paso 5: Test Rápido (1 min)

1. **Abrir Preview:**
   - Click en **"Preview"** (botón superior derecho)
   - O presiona: `Ctrl + P` / `Cmd + P`

2. **Probar con ejemplo:**
   
   **Input:**
   ```
   Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. 
   Los usuarios deben poder hacer login con sus cuentas corporativas, gestionar 
   sesiones, y tener roles (admin, user, viewer).
   ```

3. **Verificar output:**
   
   El bot debe generar:
   - ✅ **spec.md**: 4-5 user stories con Given/When/Then
   - ✅ **plan.md**: Tech stack (NextAuth.js + Azure AD B2C) con justificación
   - ✅ **tasks.md**: Tareas de 2-8h con dependencies y DoD
   - ✅ Validation report con quality score

   **Tiempo esperado:** 30-60 segundos

4. **Si funciona correctamente:**
   - ✅ El bot está listo para usar
   - Procede al Paso 6 para publicar

5. **Si hay errores:**
   - Ver sección "Troubleshooting" al final de este documento

---

## 🚀 Publicar a Producción (1 min)

### Paso 6: Publicar App

1. **Guardar cambios:**
   - Click en **"Publish"** (botón superior derecho)
   - O: Settings → Publish

2. **Configurar publicación:**
   - Version: `1.0.0`
   - Release Note: `Initial production deployment - Spec Generator bot`
   - Click en **"Publish"**

3. **Obtener API Endpoint:**
   - Después de publicar, ir a: **API Access** (pestaña superior)
   - Copiar:
     - **API Endpoint**: `https://your-dify-instance.com/v1/chat-messages`
     - **API Key**: `app-xxxxxxxxxxxxxxxxxxxxxxxx`
   - Guardar estas credenciales (las necesitarás para integrar con Control Center)

4. **Obtener Share Link (opcional):**
   - Ir a: **Publish** → Web App
   - Habilitar: `Enable Web App`
   - Copiar: Share Link (para compartir con el equipo)

---

## 📊 Verificación Post-Importación

### Checklist de Configuración

Verifica que todo esté correcto:

- [ ] **App importada**: Nombre "Spec Generator", icono 🤖
- [ ] **Model configurado**: GPT-4o, temp 0.3, max tokens 16000
- [ ] **System Prompt**: Pre-prompt completo (líneas 1-200+)
- [ ] **Opening Statement**: Mensaje de bienvenida en español
- [ ] **Suggested Questions**: 5 preguntas sugeridas
- [ ] **User Input Form**: 4 variables (feature_description, applied_specs, tech_stack_preference, priority_focus)
- [ ] **Knowledge Portal**: Dataset conectado (si aplica)
- [ ] **Annotation Reply**: Habilitado con threshold 0.8
- [ ] **Test exitoso**: Preview genera spec.md, plan.md, tasks.md

### Métricas de Calidad

Después del test, verifica:

| Métrica | Target | ¿Cumple? |
|---------|--------|----------|
| Response Time | <60s | ⬜ |
| Genera spec.md | Sí | ⬜ |
| Genera plan.md | Sí | ⬜ |
| Genera tasks.md | Sí | ⬜ |
| User Stories | 3-7 | ⬜ |
| Success Criteria | 3-10 | ⬜ |
| Quality Score | >80/100 | ⬜ |

---

## 🔗 Integración con Control Center

Una vez publicado, integra el bot con Control Center:

### Opción 1: API Integration

1. **Crear API Route:**
   - Ver: `DEPLOYMENT_MANUAL.md` → "Integración con Control Center"
   - Archivo: `apps/control-center-ui/app/api/spec-generator/route.ts`

2. **Agregar variables de entorno:**
   ```bash
   # .env.local
   DIFY_API_URL=https://your-dify-instance.com/api/v1
   DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Crear UI Component:**
   - Ver: `DEPLOYMENT_MANUAL.md` → "Paso 3: Crear UI Component"
   - Archivo: `components/SpecGeneratorForm.tsx`

### Opción 2: Embedded Widget

1. **Obtener Embed Code:**
   - En Dify, ir a: **Publish** → Web App
   - Click en **"Embed"**
   - Copiar código HTML/iframe

2. **Agregar a Control Center:**
   - Crear página: `apps/control-center-ui/app/spec-generator/page.tsx`
   - Pegar embed code
   - Publicar

---

## 🆘 Troubleshooting

### Problema 1: "Model not available"

**Síntoma:** Al importar, error "Model gpt-4o not found"

**Solución:**
1. Ir a: Settings → Model Providers
2. Verificar que Azure OpenAI está configurado
3. Crear deployment `gpt-4o` en tu recurso Azure OpenAI
4. En Dify, ir a la app → Orchestrate → Model
5. Seleccionar el modelo correcto del dropdown

### Problema 2: "Import failed - Invalid DSL"

**Síntoma:** Error al importar el archivo YAML

**Solución:**
1. Verificar que el archivo `spec-generator.yml` no está corrupto
2. Abrir con editor de texto, verificar que es YAML válido
3. Intentar importar de nuevo
4. Si persiste, crear app manualmente siguiendo `DEPLOYMENT_MANUAL.md`

### Problema 3: Bot no responde en Preview

**Síntoma:** Preview se queda cargando o timeout

**Solución:**
1. Verificar Azure OpenAI deployment está activo:
   ```bash
   curl https://your-resource.openai.azure.com/openai/deployments?api-version=2023-05-15 \
     -H "api-key: YOUR_KEY"
   ```
2. Verificar API Key es válida
3. Reducir max_tokens de 16000 a 8000 (temporalmente)
4. Re-intentar

### Problema 4: Genera specs incompletas

**Síntoma:** Output no incluye todos los archivos (spec.md, plan.md, tasks.md)

**Solución:**
1. Verificar system prompt está completo en: Orchestrate → Pre-prompt
2. Aumentar max_tokens de 16000 a 20000 (si es posible)
3. Simplificar input (menos features en una sola query)
4. Dividir en múltiples queries (primero spec.md, luego plan.md, etc.)

### Problema 5: Knowledge Portal no funciona

**Síntoma:** Bot no encuentra contexto en Knowledge Portal

**Solución:**
1. Verificar dataset ID es correcto
2. En Dify, ir a: Knowledge → Tu dataset → Verificar que tiene documentos
3. Reducir score threshold de 0.7 a 0.5
4. Aumentar top_k de 5 a 10
5. Si persiste, el bot funcionará sin Knowledge Portal (solo sin contexto enriquecido)

---

## 📝 Próximos Pasos

Ahora que el bot está importado y funcionando:

### Task 8: Probar con Casos de Uso

1. **Ejecutar test suite automatizada:**
   ```bash
   cd dify-workflows/spec-generator
   chmod +x test-cases.sh
   ./test-cases.sh
   ```

2. **Testear manualmente en Dify UI:**
   - Test 1: Sistema de autenticación OAuth2
   - Test 2: Notificaciones en tiempo real
   - Test 3: IaC para AKS cluster
   - Test 4: Dashboard de analytics
   - Test 5: API REST para especialistas

3. **Validar métricas:**
   - Pass Rate: ≥80%
   - Avg Quality Score: ≥80/100
   - Response Time: <300s (5 min)

### Task 9: Validar con Equipo

1. **Compartir con desarrolladores:**
   - Share Link: (desde Dify → Publish → Web App)
   - O integrar con Control Center

2. **Recoger feedback:**
   - Satisfaction score: 1-5
   - Pros y cons
   - Suggestions de mejora

3. **Iterar basado en feedback:**
   - Ajustar system prompt si hay confusiones
   - Mejorar validation si hay errores comunes
   - Agregar features si hay requests frecuentes

---

## 🎉 ¡Listo!

El bot Spec Generator está importado y listo para usar.

**Tiempo total:** ~5 minutos

**Lo que tienes ahora:**
- ✅ Bot funcionando en Dify
- ✅ System prompt completo (8-step workflow)
- ✅ 4 variables de conversación
- ✅ 5 preguntas sugeridas
- ✅ Knowledge Portal integrado (opcional)
- ✅ API endpoint para integraciones

**Siguiente:** Testear con casos reales y validar con el equipo.

---

**Última actualización:** 28 de octubre de 2025  
**Versión:** 1.0.0
