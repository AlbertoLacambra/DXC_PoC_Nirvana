# 🚀 Quick Start - Spec Generator Bot

Guía rápida para desplegar el bot Spec Generator en Dify en menos de 30 minutos.

## ✅ Pre-requisitos (5 min)

### 1. Verifica que tienes:
- [ ] Acceso a Dify Platform (admin o developer)
- [ ] Azure OpenAI con deployment GPT-4o
- [ ] Knowledge Portal dataset ID
- [ ] Git Bash o WSL instalado

### 2. Obtén credenciales:

**Dify:**
```bash
# Accede a: https://your-dify-instance.com/settings/api-keys
DIFY_API_URL=https://your-dify-instance.com/api/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
```

**Azure OpenAI:**
```bash
# Desde Azure Portal → Tu recurso OpenAI → Keys and Endpoint
AZURE_OPENAI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

**Knowledge Portal:**
```bash
# Desde Dify → Datasets → Tu dataset → ID
KNOWLEDGE_PORTAL_DATASET_ID=dataset_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 🤖 Opción A: Despliegue Automatizado (15 min)

### Paso 1: Configurar entorno

```bash
cd c:/PROYECTS/DXC_PoC_Nirvana/dify-workflows/spec-generator

# Copiar plantilla de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
notepad .env
```

Contenido de `.env`:
```bash
DIFY_API_URL=https://your-dify-instance.com/api/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
KNOWLEDGE_PORTAL_DATASET_ID=dataset_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Paso 2: Desplegar bot

```bash
# Dar permisos de ejecución (WSL/Git Bash)
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

**Salida esperada:**
```
✓ Configuration valid
✓ Validation script OK
✓ Chatbot created with ID: app_xxxxxxxx
✓ System prompt configured
✓ Workflow configured (7 nodes)
✓ Validation script uploaded
✓ Variables configured
✓ Conversation opener configured
✓ Suggested questions configured
✓ Features enabled
✓ Bot responding correctly
✓ Published to production

API Endpoint: https://your-dify-instance.com/api/v1/chat-messages
```

### Paso 3: Ejecutar tests

```bash
# Dar permisos
chmod +x test-cases.sh

# Ejecutar suite de tests
./test-cases.sh
```

**Success criteria:**
- ✅ Pass Rate: ≥80%
- ✅ Quality Score: ≥80/100
- ✅ Response Time: <300s

### Paso 4: ¡Listo!

El bot está desplegado. Accede a:
- **UI:** https://your-dify-instance.com/app/[CHATBOT_ID]
- **API:** Usa el endpoint del output de deploy.sh

---

## 🖥️ Opción B: Despliegue Manual en UI (20 min)

Si prefieres no usar scripts o no tienes acceso a la API:

### Paso 1: Crear chatbot

1. Accede a Dify: https://your-dify-instance.com
2. Click "Create App" → "Chatbot"
3. Configurar:
   - Name: `Spec Generator`
   - Icon: 🤖
   - Model: Azure OpenAI GPT-4o
   - Temperature: `0.3`
   - Max Tokens: `16000`

### Paso 2: Copiar System Prompt

```bash
# Abre README.md
notepad README.md

# Copia líneas 27-523 (todo el System Prompt desde "# SYSTEM PROMPT" hasta antes de "## Knowledge Portal Integration")
```

En Dify:
1. Ir a "Settings" → "System Prompt"
2. Pegar el prompt completo
3. Guardar

### Paso 3: Crear workflow

Ver `DEPLOYMENT_MANUAL.md` para instrucciones detalladas de cada nodo.

**Resumen de nodos:**
1. **analyze_domain** (LLM): Extrae categoría, nombre, goal, users, capabilities → JSON
2. **search_knowledge** (Knowledge Retrieval): Busca en Knowledge Portal
3. **generate_spec** (LLM): Genera spec.md
4. **generate_plan** (LLM): Genera plan.md
5. **generate_tasks** (LLM): Genera tasks.md
6. **validate_output** (Code): Ejecuta validate.py
7. **format_response** (Template): Formatea respuesta final

### Paso 4: Configurar variables

Crear 4 variables:
- `feature_description` (String, required)
- `applied_specs` (Array, default: ["git-flow", "security"])
- `tech_stack_preference` (String, default: "auto")
- `priority_focus` (String, default: "P1")

### Paso 5: Publicar

1. Test en Preview con: "Sistema de autenticación OAuth2"
2. Click "Publish" → Version: `1.0.0`
3. Copiar API endpoint

---

## 🧪 Testing Rápido

### Test en UI de Dify

1. Accede al chatbot
2. Prueba con:
```
Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. 
Los usuarios deben poder hacer login con sus cuentas corporativas, gestionar 
sesiones, y tener roles (admin, user, viewer).
```

3. Verifica que genera:
   - ✅ spec.md con 4-5 user stories
   - ✅ plan.md con tech stack justificado
   - ✅ tasks.md con tareas 2-8h
   - ✅ Validation PASSED
   - ✅ Quality Score ≥80/100

### Test via API

```bash
curl -X POST "https://your-dify-instance.com/api/v1/chat-messages" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "feature_description": "Sistema de autenticación OAuth2 con Azure AD",
      "applied_specs": ["security"],
      "tech_stack_preference": "auto",
      "priority_focus": "P1"
    },
    "query": "Sistema de autenticación OAuth2",
    "response_mode": "blocking",
    "conversation_id": "",
    "user": "test-user"
  }'
```

---

## 📊 Métricas de Éxito

Monitorea estas métricas en Dify Analytics:

| Métrica | Target | Actual |
|---------|--------|--------|
| Response Time (p95) | <300s | ? |
| Validation Pass Rate | >95% | ? |
| Avg Quality Score | >80/100 | ? |
| User Satisfaction | >80% | ? |

---

## 🔄 Próximos Pasos

1. ✅ Bot desplegado
2. ⏳ Ejecutar test suite completo
3. ⏳ Integrar con Control Center (ver DEPLOYMENT_MANUAL.md Step "Integración con Control Center")
4. ⏳ Presentar a 3-5 desarrolladores
5. ⏳ Recoger feedback (target: 80%+ satisfacción)

---

## 🆘 ¿Necesitas ayuda?

### Problemas comunes

**1. Deploy.sh falla:**
```bash
# Verificar .env está configurado
cat .env | grep -v '^#'

# Verificar credenciales Azure OpenAI
curl "$AZURE_OPENAI_ENDPOINT/openai/deployments?api-version=2023-05-15" \
  -H "api-key: $AZURE_OPENAI_KEY"
```

**2. Bot no responde:**
- Revisar logs en Dify: Settings → Logs
- Verificar deployment GPT-4o está activo
- Aumentar timeout en workflow

**3. Validation siempre falla:**
- Test local: `python3 validate.py '{"spec_md": "test", "plan_md": "test", "tasks_md": "test"}'`
- Revisar validate.py está en Code Node

### Documentación completa

- **Deployment manual detallado:** `DEPLOYMENT_MANUAL.md`
- **Configuración del bot:** `README.md`
- **Workflow config:** `workflow-config.json`
- **Implementation guide:** `IMPLEMENTATION_GUIDE.md`

---

## 📝 Checklist de Despliegue

- [ ] Pre-requisitos verificados
- [ ] .env configurado con credenciales
- [ ] Bot desplegado (deploy.sh o manual)
- [ ] Test suite ejecutado (pass rate ≥80%)
- [ ] Bot accesible en Dify UI
- [ ] API endpoint funcional
- [ ] Métricas monitoreadas
- [ ] Próximos pasos planificados

**¡Todo listo!** El bot Spec Generator está desplegado y listo para generar specs automáticamente.
