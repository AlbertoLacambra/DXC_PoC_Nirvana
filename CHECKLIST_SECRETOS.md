# ✅ CHECKLIST: Configurar GitHub Secrets

## ⚠️ IMPORTANTE
Los workflows NO funcionarán hasta que configures estos 3 secretos en GitHub.

---

## 🔗 PASO 1: Abrir Configuración de Secretos

1. Abre esta URL en tu navegador:
   ```
   https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/settings/secrets/actions
   ```

2. Deberías ver la página "Actions secrets and variables"

---

## 🔐 PASO 2: Crear Secreto AZURE_CLIENT_ID

1. Click en botón verde **"New repository secret"**
2. En el campo **Name**, escribe exactamente:
   ```
   AZURE_CLIENT_ID
   ```
3. En el campo **Secret**, copia y pega:
   ```
   f704d3ce-5d4e-4af6-bf59-bdad32729407
   ```
4. Click en **"Add secret"**
5. ✅ Marca aquí cuando esté completo: [ ]

---

## 🔐 PASO 3: Crear Secreto AZURE_TENANT_ID

1. Click en botón verde **"New repository secret"**
2. En el campo **Name**, escribe exactamente:
   ```
   AZURE_TENANT_ID
   ```
3. En el campo **Secret**, copia y pega:
   ```
   93f33571-550f-43cf-b09f-cd331338d086
   ```
4. Click en **"Add secret"**
5. ✅ Marca aquí cuando esté completo: [ ]

---

## 🔐 PASO 4: Crear Secreto TEAMS_WEBHOOK_URL

1. Click en botón verde **"New repository secret"**
2. En el campo **Name**, escribe exactamente:
   ```
   TEAMS_WEBHOOK_URL
   ```
3. En el campo **Secret**, copia y pega (TODO EN UNA LÍNEA):
   ```
   https://default93f33571550f43cfb09fcd331338d0.86.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9b7a4c5dbf90431ea477182e484a0f4a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GkOprQp1DDP8Ag4zubsAGovbg6AIqUKLauRQZnIB8vo
   ```
4. Click en **"Add secret"**
5. ✅ Marca aquí cuando esté completo: [ ]

---

## ✅ PASO 5: Verificar Secretos Configurados

Después de crear los 3 secretos, deberías ver en la página:

- ✅ AZURE_CLIENT_ID (Updated X seconds/minutes ago)
- ✅ AZURE_TENANT_ID (Updated X seconds/minutes ago)
- ✅ TEAMS_WEBHOOK_URL (Updated X seconds/minutes ago)

**NOTA:** GitHub no te mostrará los valores, solo los nombres. Esto es normal por seguridad.

✅ Marca aquí cuando veas los 3 secretos listados: [ ]

---

## 🧪 PASO 6: Probar el Sistema

### Opción A: Ejecutar Workflow Manualmente (RECOMENDADO)

1. Abre esta URL:
   ```
   https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/actions/workflows/deploy.yml
   ```

2. Click en el botón **"Run workflow"** (arriba a la derecha)

3. Selecciona:
   - **Branch:** master
   - **Environment:** hub

4. Click en **"Run workflow"** (botón verde)

5. Espera 2-3 minutos y verifica:
   - ✅ El workflow se ejecuta sin errores
   - ✅ Recibes una notificación en Microsoft Teams
   - ✅ El estado del workflow es verde (success)

✅ Marca aquí cuando el workflow funcione: [ ]

---

### Opción B: Crear Pull Request de Prueba

Si prefieres probar con un PR:

```bash
# 1. Crear rama de prueba
git checkout -b test-workflows

# 2. Hacer un cambio menor
echo "# Test Workflows" >> terraform/environments/hub/README.md

# 3. Commit y push
git add terraform/environments/hub/README.md
git commit -m "test: Verificar workflows actualizados"
git push -u origin test-workflows

# 4. Crear PR en GitHub
# Ve a: https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/pulls
# Click en "New Pull Request"
# Selecciona: base: master ← compare: test-workflows
```

Verifica que:
- ✅ El workflow terraform-pr.yml se ejecute automáticamente
- ✅ Aparezcan los resultados en el PR (formato, validación, plan)
- ✅ No haya errores de autenticación
- ✅ No haya errores de "duplicate provider" o "duplicate variable"

✅ Marca aquí cuando el PR funcione: [ ]

---

## 🆘 Si Algo Falla

### Error: "Login failed"
**Causa:** Los secretos no están configurados correctamente
**Solución:** Verifica que copiaste los valores EXACTAMENTE como se muestran arriba

### Error: "Backend initialization failed"
**Causa:** El Storage Account no existe o no tienes permisos
**Solución:** Ejecuta este comando para verificar:
```bash
az storage account show --name tfstate9a448729 --resource-group rg-terraform-state
```

### Error: "Module not found"
**Causa:** Los módulos de Terraform no están en las rutas correctas
**Solución:** Verifica que exista el directorio `terraform/modules/` con los módulos

### No recibo notificaciones en Teams
**Causa:** El webhook de Teams puede estar mal configurado
**Solución:** Verifica que el secreto TEAMS_WEBHOOK_URL esté configurado correctamente

---

## 📋 RESUMEN FINAL

Cuando TODOS los checkboxes estén marcados ✅:

- [ ] AZURE_CLIENT_ID creado
- [ ] AZURE_TENANT_ID creado
- [ ] TEAMS_WEBHOOK_URL creado
- [ ] Los 3 secretos visibles en GitHub
- [ ] Workflow ejecutado manualmente con éxito
- [ ] Notificación recibida en Teams (opcional pero recomendado)

**¡Felicidades!** 🎉 Tu pipeline de CI/CD está completamente funcional.

---

## 📚 Documentación Adicional

- `MIGRATION_COMPLETE.md` - Resumen completo de la migración
- `SECRETS_SETUP.md` - Guía completa de configuración del Service Principal
- `scripts/setup-azure-sp.sh` - Script para crear Service Principal

---

**Última actualización:** 2025
**Estado:** ✅ Migración completada - Pendiente configuración de secretos
