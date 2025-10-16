# 📚 Activar GitHub Pages

## ✅ Archivos Creados

Se han creado los siguientes archivos para GitHub Pages:

```
DXC_PoC_Nirvana/
├── mkdocs.yml                          # Configuración MkDocs
├── docs/
│   ├── index.md                        # Homepage
│   ├── status.md                       # Estado del proyecto
│   └── guides/
│       └── quick-start.md              # Guía de inicio
└── .github/workflows/
    └── gh-pages.yml                    # Workflow de deployment
```

---

## 🚀 Pasos para Activar GitHub Pages

### 1. Configurar en GitHub

1. **Ir a Settings**:
   ```
   https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/settings/pages
   ```

2. **Configurar Source**:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`

3. **Save**

### 2. Ejecutar el Workflow

**Opción A - Automático** (Recomendado):
```bash
# Commit y push de los cambios
git add .
git commit -m "docs: Add GitHub Pages with MkDocs"
git push origin master

# El workflow se ejecutará automáticamente
```

**Opción B - Manual**:
```bash
# Ir a GitHub Actions
# → 📚 Deploy GitHub Pages
# → Run workflow
```

### 3. Verificar Deployment

1. **Check workflow status**:
   ```
   https://github.com/DXC-Technology-Spain/DXC_PoC_Nirvana/actions
   ```

2. **Access GitHub Pages** (después de ~2-3 minutos):
   ```
   https://dxc-technology-spain.github.io/DXC_PoC_Nirvana/
   ```

---

## 🎨 Personalización

### Cambiar Tema

Editar `mkdocs.yml`:

```yaml
theme:
  palette:
    # Cambiar colores
    primary: indigo    # blue, red, green, etc.
    accent: blue       # amber, teal, pink, etc.
```

### Agregar Páginas

1. Crear archivo en `docs/`:
   ```bash
   # Ejemplo: docs/architecture/overview.md
   mkdir -p docs/architecture
   nano docs/architecture/overview.md
   ```

2. Agregar a `mkdocs.yml`:
   ```yaml
   nav:
     - Arquitectura:
       - Visión General: architecture/overview.md
   ```

### Cambiar Logo

1. Agregar imagen en `docs/img/logo.png`
2. Editar `mkdocs.yml`:
   ```yaml
   theme:
     logo: img/logo.png
   ```

---

## 📦 Instalar MkDocs Localmente (Opcional)

Para previsualizar cambios antes de push:

```bash
# Instalar dependencias
pip install mkdocs-material
pip install mkdocs-minify-plugin
pip install mkdocs-git-revision-date-localized-plugin

# Servir localmente
mkdocs serve

# Abrir navegador
open http://127.0.0.1:8000
```

---

## 🔧 Troubleshooting

### Problema 1: GitHub Pages No Aparece

**Síntoma**: Error 404 después de deployment

**Solución**:
1. Verificar que existe branch `gh-pages`
2. Settings → Pages → Source debe ser `gh-pages` branch
3. Esperar 2-3 minutos para propagación

### Problema 2: Workflow Falla

**Error**: `ModuleNotFoundError: No module named 'material'`

**Solución**:
El workflow ya incluye instalación de dependencias. Si falla:

1. Check workflow logs
2. Verificar syntax de `mkdocs.yml`
3. Test local: `mkdocs build --strict`

### Problema 3: Estilos No Se Aplican

**Síntoma**: Página aparece sin estilos

**Solución**:
1. Verify `site_url` en `mkdocs.yml`
2. Clear browser cache
3. Usar navegador privado/incognito

---

## 📝 Contenido Pendiente

Las siguientes páginas están definidas en `mkdocs.yml` pero aún no creadas:

```
docs/
├── business-plan.md                    # TODO
├── architecture/
│   ├── overview.md                     # TODO
│   ├── single-aks.md                   # TODO
│   ├── deployed-resources.md           # TODO
│   └── adr.md                          # TODO
├── cicd/
│   ├── workflows.md                    # TODO
│   ├── deployment.md                   # TODO
│   ├── pr-validation.md                # TODO
│   ├── drift-detection.md              # TODO
│   └── security.md                     # TODO
├── guides/
│   ├── secrets-setup.md                # TODO
│   ├── migration.md                    # TODO
│   └── teams-troubleshooting.md        # TODO
├── costs/
│   ├── analysis.md                     # TODO
│   ├── optimization.md                 # TODO
│   └── roi.md                          # TODO
└── reference/
    ├── terraform-modules.md            # TODO
    ├── github-actions.md               # TODO
    └── links.md                        # TODO
```

Puedes crearlas progresivamente basándote en los documentos existentes:

- `BUSINESS_PLAN.md` → `docs/business-plan.md`
- `MIGRATION_COMPLETE.md` → `docs/guides/migration.md`
- `TEAMS_NOTIFICATIONS_TROUBLESHOOTING.md` → `docs/guides/teams-troubleshooting.md`
- etc.

---

## ✅ Checklist de Activación

- [ ] Commit cambios a master
- [ ] Verificar workflow execution
- [ ] Configurar GitHub Pages settings
- [ ] Esperar 2-3 minutos
- [ ] Acceder a URL: `https://dxc-technology-spain.github.io/DXC_PoC_Nirvana/`
- [ ] Verificar navegación funciona
- [ ] Verificar tema se aplica correctamente
- [ ] Compartir URL con equipo

---

## 🔗 Referencias

- **MkDocs**: https://www.mkdocs.org/
- **Material for MkDocs**: https://squidfunk.github.io/mkdocs-material/
- **GitHub Pages**: https://docs.github.com/en/pages

---

!!! success "GitHub Pages Configurado"
    Una vez activado, el sitio se actualizará automáticamente con cada push a `master` que modifique archivos en `docs/` o `mkdocs.yml`.
