# 📋 Cómo Crear el Project Board Manualmente en GitHub

## ⚠️ Por Qué No Se Creó Automáticamente

GitHub Projects ha migrado de **Projects V1** (clásico) a **Projects V2** (beta), que usa GraphQL API y requiere permisos especiales:
- `project` scope
- `read:project` scope

El GITHUB_TOKEN actual no tiene estos permisos, por lo que el project board debe crearse manualmente.

---

## ✅ Pasos para Crear el Project Board

### Opción 1: Desde el Repositorio (Recomendada)

1. **Ve a tu repositorio**:
   ```
   https://github.com/AlbertoLacambra/ecommerce-smart-checkout
   ```

2. **Click en la pestaña "Projects"** (junto a Issues, Pull requests, etc.)

3. **Click en "Link a project"**

4. **Click en "New project"**

5. **Selecciona el template "Board"**:
   - Board (Kanban style) ← **Recomendado**
   - Table (Spreadsheet style)
   - Roadmap (Timeline view)

6. **Configura el proyecto**:
   - **Name**: `E-Commerce Smart Checkout`
   - Click **"Create project"**

7. **Personaliza las columnas** (el template Board ya trae: Todo, In Progress, Done):
   
   Para que coincida con nuestra estructura Agile:
   - Renombra "Todo" → **"Backlog"**
   - Agrega columna: **"Sprint Ready"** (entre Backlog e In Progress)
   - Agrega columna: **"Review"** (entre In Progress y Done)
   - Agrega columna: **"Testing"** (entre Review y Done)
   - Resultado final: **Backlog → Sprint Ready → In Progress → Review → Testing → Done**

8. **Vincula los issues**:
   - En cada columna, click en **"+"**
   - Selecciona **"Add items from repository"**
   - Busca y selecciona los issues por tipo:
     - **Backlog**: Todos los issues inicialmente
     - **Sprint Ready**: P0 issues que están listos para arrancar
   - También puedes arrastrar y soltar entre columnas

---

### Opción 2: Desde Tu Perfil (Projects Globales)

1. **Ve a tus Projects**:
   ```
   https://github.com/AlbertoLacambra?tab=projects
   ```

2. **Click "New project"** (botón verde)

3. **Selecciona template "Board"**

4. **Dale un nombre**: `E-Commerce Smart Checkout`

5. **Una vez creado, vincula el repositorio**:
   - Click en **"⋯"** (tres puntos) → **"Settings"**
   - En la sección **"Linked repositories"**
   - Click **"Link a repository"**
   - Busca y selecciona `AlbertoLacambra/ecommerce-smart-checkout`

6. **Agrega los issues**:
   - Vuelve a la vista Board
   - Click **"+"** en cualquier columna
   - **"Add items from repository"**
   - Selecciona el repo y filtra/agrega los issues

---

## 🎯 Estructura de Columnas Recomendada

```
┌──────────┬─────────────┬─────────────┬──────────┬──────────┬──────┐
│ Backlog  │ Sprint Ready│ In Progress │  Review  │ Testing  │ Done │
├──────────┼─────────────┼─────────────┼──────────┼──────────┼──────┤
│ Todos los│ Issues P0/P1│ Trabajando  │ Code     │ QA/E2E   │ ✅   │
│ issues   │ priorizados │ activamente │ Review   │ Testing  │      │
│ nuevos   │ para sprint │             │          │          │      │
└──────────┴─────────────┴─────────────┴──────────┴──────────┴──────┘
```

### Descripción de Columnas

| Columna | Descripción | Issues Típicos |
|---------|-------------|----------------|
| **Backlog** | Issues sin priorizar o para sprints futuros | Todos inicialmente, P2, P3 |
| **Sprint Ready** | Issues listos para trabajar en el sprint actual | P0, P1 con acceptance criteria |
| **In Progress** | Trabajo activo en desarrollo | Issues asignados y en progreso |
| **Review** | Code review y validación de pares | PRs abiertas, esperando review |
| **Testing** | QA, testing E2E, validación | Issues en testing, pre-release |
| **Done** | Completado y deployado | Issues cerrados ✅ |

---

## 🏷️ Organización por Labels

Una vez creado el project, puedes filtrar y agrupar por labels:

### Filtrar por Tipo de Issue

En la vista Board, usa los filtros:
- `label:epic` - Ver solo Epics
- `label:feature` - Ver solo Features
- `label:story` - Ver solo Stories
- `label:P0` - Ver solo prioridad crítica

### Agrupar Issues

Click en **"View"** → **"Group by"**:
- **Labels**: Agrupa por epic/feature/story
- **Assignees**: Agrupa por persona
- **Milestone**: Agrupa por sprint/milestone
- **Priority**: Custom field (puedes crear uno)

---

## 📊 Vistas Personalizadas

Crea múltiples vistas para diferentes perspectivas:

### Vista 1: Por Prioridad
```
Filters: No filter
Group by: Labels (P0, P1, P2, P3)
Sort by: Priority
```

### Vista 2: Por Epic
```
Filters: label:epic OR label:feature OR label:story
Group by: Parent (Epic)
Sort by: Hierarchy
```

### Vista 3: Sprint Actual
```
Filters: label:P0 OR label:P1
Group by: Status
Sort by: Priority
```

---

## 🔗 Vincular Issues a Columnas Específicas

### Opción A: Arrastrar y Soltar
1. Ve a la vista Board
2. Arrastra los issues entre columnas
3. GitHub actualiza automáticamente el estado

### Opción B: Agregar Individualmente
1. Click **"+"** en la columna deseada
2. Busca por número: `#1`, `#2`, etc.
3. Selecciona y agrega

### Opción C: Bulk Add (Masivo)
1. Click **"+"** en Backlog
2. **"Add items from repository"**
3. Selecciona `ecommerce-smart-checkout`
4. Usa filtros: `is:issue is:open`
5. Selecciona todos (Ctrl+A o Cmd+A)
6. Click **"Add selected items"**

---

## 🎨 Personalización Avanzada

### 1. Agregar Custom Fields

En **Settings** del project:
- **Priority**: Single select (P0, P1, P2, P3)
- **Estimate**: Number (story points)
- **Sprint**: Text (Sprint 1, Sprint 2, etc.)
- **Component**: Single select (Frontend, Backend, API, etc.)

### 2. Automatizaciones

GitHub Projects V2 soporta workflows automáticos:

**Settings → Workflows**:
- ✅ **Auto-add new issues**: Issues nuevos → Backlog
- ✅ **Auto-close items**: Done → Close issue
- ✅ **Auto-move on PR**: PR merged → Done

### 3. Vistas Roadmap

Crea una vista tipo **Roadmap**:
- Click **"+"** junto a las vistas
- Selecciona **"New view"** → **"Roadmap"**
- Configura fechas usando custom fields
- Visualiza timeline de Epics/Features

---

## 📱 Acceso Rápido

### URL Directa al Proyecto
Una vez creado, la URL será algo como:
```
https://github.com/users/AlbertoLacambra/projects/[NUMBER]
```

Guarda este link para acceso rápido.

### Pin en Repositorio
En el repositorio:
- **Settings → General**
- Sección **"Features"**
- Activa **"Projects"**
- El project aparecerá en la pestaña Projects del repo

---

## ✅ Verificación

Después de crear el project board, verifica que:

- [ ] Project creado con nombre `E-Commerce Smart Checkout`
- [ ] 6 columnas: Backlog, Sprint Ready, In Progress, Review, Testing, Done
- [ ] Todos los ~15 issues agregados al project
- [ ] Issues distribuidos en columnas (todos en Backlog inicialmente es OK)
- [ ] Project vinculado al repositorio `ecommerce-smart-checkout`
- [ ] Vistas configuradas (opcional pero recomendado)
- [ ] Automatizaciones activadas (opcional)

---

## 🐛 Troubleshooting

### No veo la pestaña "Projects" en el repo
**Solución**: 
```bash
gh repo edit AlbertoLacambra/ecommerce-smart-checkout --enable-projects
```

### No puedo crear projects
**Solución**: Verifica que tienes permisos en el repositorio (admin o write access)

### Los issues no aparecen en el project
**Solución**: 
1. Verifica que el repo está vinculado
2. Usa "Add items from repository" en vez de buscar manualmente
3. Asegúrate de filtrar por el repo correcto

---

## 🚀 Próximos Pasos

Una vez creado el project board:

1. **Prioriza los issues**: Mueve P0/P1 a "Sprint Ready"
2. **Planifica Sprint 1**: Selecciona ~21 puntos de stories
3. **Asigna trabajo**: Asigna issues a team members
4. **Empieza desarrollo**: Mueve issues a "In Progress"
5. **Track progreso**: Usa el board diariamente en standups

---

## 📚 Referencias

- [GitHub Projects V2 Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Quickstart for Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects)
- [Best Practices for Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)

---

¡Listo! En menos de 5 minutos tendrás tu project board funcionando. 🎉
