# 🚀 Phase 2: Spec Library Manager - Plan de Implementación

**Fecha inicio:** 28 de octubre de 2025  
**Duración estimada:** 2-3 semanas  
**Estado:** 🟢 En progreso

---

## 🎯 Objetivo de Phase 2

Crear la **infraestructura base** del ecosistema Spec-Driven Development:
- ✅ Database con specs versionadas
- ✅ API RESTful para gestionar specs
- ✅ UI para explorar y buscar specs

---

## 🏗️ Infraestructura Existente a Reutilizar

### 1. **PostgreSQL** - Ya desplegada en AKS
- **Host:** PostgreSQL service en cluster AKS
- **Acción:** Agregar nuevas tablas para Spec Library
- **Costo:** ❌ $0 (reutilizamos DB existente)

### 2. **Nirvana UI (Next.js)** - localhost:3000
- **Stack:** Next.js 14 + React + Material UI + TypeScript
- **Acción:** Agregar nuevas páginas y componentes
- **Costo:** ❌ $0 (misma aplicación)

### 3. **Dify Platform** - 10.0.2.91
- **Bot actual:** "Spec Generator" (ya importado)
- **Acción:** Reconfigurar para Phase 3 (guardar specs en DB)
- **Costo:** ❌ $0 (mismo bot, nuevas capacidades)

### 4. **Azure OpenAI** - GPT-4o
- **Deployment:** gpt-4o (ya configurado)
- **Acción:** Reutilizar para validaciones y recomendaciones
- **Costo:** 💰 Uso normal (ya presupuestado)

---

## 📋 Tasks de Phase 2

### **Task 2.1: Database Setup** ⏱️ 2-3 horas

#### Subtasks:

1. **Conectar a PostgreSQL existente**
   ```bash
   # Obtener credenciales de PostgreSQL en AKS
   kubectl get secret postgres-secret -n nirvana -o yaml
   
   # Configurar conexión en Nirvana UI
   # .env.local:
   DATABASE_URL="postgresql://user:pass@postgres-service:5432/nirvana"
   ```

2. **Crear migrations SQL**
   - Archivo: `database/migrations/001_create_specs_tables.sql`
   - Tablas: `specs`, `spec_versions`, `spec_usage`

3. **Configurar Prisma ORM**
   - Archivo: `prisma/schema.prisma`
   - Modelos: Spec, SpecVersion, SpecUsage

4. **Seed inicial de specs**
   - Migrar specs existentes (git-flow.md, security.md, iac-terraform.md)
   - Archivo: `database/seeds/002_seed_predefined_specs.sql`

**Entregables:**
- ✅ Tablas creadas en PostgreSQL
- ✅ Prisma schema configurado
- ✅ 3 specs predefinidas en DB

---

### **Task 2.2: Spec Library Manager API** ⏱️ 5-7 horas

#### Subtasks:

1. **Setup Prisma Client**
   ```bash
   cd apps/control-center-ui  # Renombrar a nirvana-ui después
   npm install @prisma/client
   npx prisma generate
   ```

2. **Crear API endpoints básicos** (CRUD)
   - `GET /api/specs` - List all specs
   - `GET /api/specs/:id` - Get spec by ID
   - `POST /api/specs` - Create new spec
   - `PUT /api/specs/:id` - Update spec
   - `DELETE /api/specs/:id` - Delete spec

3. **Implementar search endpoint**
   - `GET /api/specs/search?q=oauth` - Semantic search con PostgreSQL full-text

4. **Implementar versioning endpoints**
   - `GET /api/specs/:id/versions` - Get all versions
   - `POST /api/specs/:id/versions` - Create new version

**Estructura de archivos:**
```
apps/control-center-ui/  # TODO: Renombrar a nirvana-ui
├── app/
│   └── api/
│       └── specs/
│           ├── route.ts              # GET /api/specs, POST
│           ├── [id]/
│           │   ├── route.ts          # GET/PUT/DELETE /api/specs/:id
│           │   └── versions/
│           │       └── route.ts      # GET/POST versions
│           └── search/
│               └── route.ts          # GET /api/specs/search
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   └── specs/
│       ├── spec.service.ts           # Business logic
│       └── spec.validator.ts         # Validation logic
└── prisma/
    └── schema.prisma                 # Prisma schema
```

**Entregables:**
- ✅ 5 endpoints funcionando (CRUD + search)
- ✅ Tests unitarios con Vitest
- ✅ Documentación API (JSDoc)

---

### **Task 2.3: Spec Browser UI** ⏱️ 8-10 horas

#### Subtasks:

1. **Crear página Spec Browser**
   - Ruta: `/specs/browse`
   - Archivo: `app/specs/browse/page.tsx`

2. **Crear componentes**
   - `SpecCard.tsx` - Card para mostrar spec
   - `SpecGrid.tsx` - Grid de specs
   - `SpecFilters.tsx` - Filtros (category, tags, status)
   - `SpecSearch.tsx` - Search bar
   - `SpecDetailModal.tsx` - Modal con detalles completos

3. **Implementar features**
   - Grid/List view toggle
   - Filtros por categoría
   - Search con debounce
   - Pagination
   - Sort (popular, recent, alphabetical)

**UI Design (Material UI):**

```tsx
// /specs/browse
<Container>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
    <Typography variant="h4">Spec Library</Typography>
    <Button variant="contained" onClick={handleGenerateNew}>
      + Generate New Spec
    </Button>
  </Box>
  
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    <SpecSearch onSearch={handleSearch} />
    <SpecFilters onFilterChange={handleFilter} />
  </Box>
  
  <SpecGrid specs={filteredSpecs} onSpecClick={handleSpecClick} />
  
  <SpecDetailModal 
    open={modalOpen} 
    spec={selectedSpec} 
    onClose={handleCloseModal}
  />
</Container>
```

**Entregables:**
- ✅ Página `/specs/browse` funcionando
- ✅ 5 componentes reutilizables
- ✅ UI responsive (mobile-friendly)

---

### **Task 2.4: Testing & Documentation** ⏱️ 3-4 horas

#### Subtasks:

1. **Tests API**
   - Unit tests con Vitest
   - Integration tests con supertest
   - Coverage >80%

2. **Tests UI**
   - Component tests con React Testing Library
   - E2E tests con Playwright (opcional)

3. **Documentación**
   - API docs con JSDoc
   - User guide para Spec Browser
   - README actualizado

**Entregables:**
- ✅ Tests pasando (>80% coverage)
- ✅ Documentación completa

---

## 📊 Schema de Base de Datos

### **Tabla: specs**

```sql
CREATE TABLE specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  
  -- Metadata
  tags TEXT[],
  applicable_to TEXT[],
  dependencies TEXT[],
  conflicts TEXT[],
  
  -- Validation
  required BOOLEAN DEFAULT false,
  min_version VARCHAR(20),
  max_version VARCHAR(20),
  
  -- Usage tracking
  project_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  popularity INTEGER DEFAULT 0,
  
  CONSTRAINT specs_category_check CHECK (category IN (
    'development', 'infrastructure', 'security', 
    'testing', 'observability', 'finops', 'compliance'
  )),
  CONSTRAINT specs_status_check CHECK (status IN (
    'draft', 'active', 'deprecated', 'archived'
  ))
);

CREATE INDEX idx_specs_category ON specs(category);
CREATE INDEX idx_specs_status ON specs(status);
CREATE INDEX idx_specs_tags ON specs USING GIN(tags);
CREATE INDEX idx_specs_name ON specs(name);
CREATE INDEX idx_specs_popularity ON specs(popularity DESC);
```

### **Tabla: spec_versions**

```sql
CREATE TABLE spec_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id UUID REFERENCES specs(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  
  UNIQUE(spec_id, version)
);

CREATE INDEX idx_spec_versions_spec_id ON spec_versions(spec_id);
CREATE INDEX idx_spec_versions_version ON spec_versions(version);
```

### **Tabla: spec_usage**

```sql
CREATE TABLE spec_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id UUID REFERENCES specs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_name VARCHAR(200),
  applied_at TIMESTAMP DEFAULT NOW(),
  spec_version VARCHAR(20),
  
  UNIQUE(spec_id, project_id)
);

CREATE INDEX idx_spec_usage_spec_id ON spec_usage(spec_id);
CREATE INDEX idx_spec_usage_project_id ON spec_usage(project_id);
```

---

## 🔧 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SpecCategory {
  development
  infrastructure
  security
  testing
  observability
  finops
  compliance
}

enum SpecStatus {
  draft
  active
  deprecated
  archived
}

model Spec {
  id          String       @id @default(uuid()) @db.Uuid
  name        String       @unique @db.VarChar(100)
  displayName String       @map("display_name") @db.VarChar(200)
  description String?      @db.Text
  category    SpecCategory
  version     String       @default("1.0.0") @db.VarChar(20)
  status      SpecStatus   @default(active)
  content     String       @db.Text
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @default(now()) @updatedAt @map("updated_at")
  createdBy   String?      @map("created_by") @db.VarChar(100)
  
  // Metadata
  tags         String[]
  applicableTo String[]     @map("applicable_to")
  dependencies String[]
  conflicts    String[]
  
  // Validation
  required   Boolean @default(false)
  minVersion String? @map("min_version") @db.VarChar(20)
  maxVersion String? @map("max_version") @db.VarChar(20)
  
  // Usage tracking
  projectCount Int       @default(0) @map("project_count")
  lastUsed     DateTime? @map("last_used")
  popularity   Int       @default(0)
  
  // Relations
  versions SpecVersion[]
  usage    SpecUsage[]
  
  @@index([category])
  @@index([status])
  @@index([name])
  @@index([popularity(sort: Desc)])
  @@map("specs")
}

model SpecVersion {
  id        String   @id @default(uuid()) @db.Uuid
  specId    String   @map("spec_id") @db.Uuid
  version   String   @db.VarChar(20)
  content   String   @db.Text
  changelog String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  createdBy String?  @map("created_by") @db.VarChar(100)
  
  spec Spec @relation(fields: [specId], references: [id], onDelete: Cascade)
  
  @@unique([specId, version])
  @@index([specId])
  @@index([version])
  @@map("spec_versions")
}

model SpecUsage {
  id          String   @id @default(uuid()) @db.Uuid
  specId      String   @map("spec_id") @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  projectName String   @map("project_name") @db.VarChar(200)
  appliedAt   DateTime @default(now()) @map("applied_at")
  specVersion String?  @map("spec_version") @db.VarChar(20)
  
  spec Spec @relation(fields: [specId], references: [id], onDelete: Cascade)
  
  @@unique([specId, projectId])
  @@index([specId])
  @@index([projectId])
  @@map("spec_usage")
}
```

---

## 📁 Estructura de Archivos Phase 2

```
DXC_PoC_Nirvana/
├── apps/
│   └── control-center-ui/  # TODO: Renombrar a nirvana-ui
│       ├── app/
│       │   ├── api/
│       │   │   └── specs/
│       │   │       ├── route.ts              # GET /api/specs, POST
│       │   │       ├── [id]/
│       │   │       │   ├── route.ts          # GET/PUT/DELETE
│       │   │       │   └── versions/
│       │   │       │       └── route.ts      # Versioning
│       │   │       └── search/
│       │   │           └── route.ts          # Search
│       │   │
│       │   └── specs/
│       │       └── browse/
│       │           └── page.tsx              # Spec Browser page
│       │
│       ├── components/
│       │   └── specs/
│       │       ├── SpecCard.tsx
│       │       ├── SpecGrid.tsx
│       │       ├── SpecFilters.tsx
│       │       ├── SpecSearch.tsx
│       │       └── SpecDetailModal.tsx
│       │
│       ├── lib/
│       │   ├── prisma.ts                     # Prisma client
│       │   └── specs/
│       │       ├── spec.service.ts
│       │       └── spec.validator.ts
│       │
│       ├── prisma/
│       │   └── schema.prisma
│       │
│       └── .env.local                        # Database URL
│
├── database/
│   ├── migrations/
│   │   └── 001_create_specs_tables.sql
│   └── seeds/
│       └── 002_seed_predefined_specs.sql
│
└── docs/features/spec-driven-development/
    ├── NIRVANA_SPEC_ECOSYSTEM_ARCHITECTURE.md
    └── PHASE_2_IMPLEMENTATION.md  # Este documento
```

---

## ✅ Checklist de Phase 2

### Database Setup
- [ ] Conectar a PostgreSQL en AKS
- [ ] Crear migration 001_create_specs_tables.sql
- [ ] Ejecutar migration en DB
- [ ] Configurar Prisma schema
- [ ] Generar Prisma client
- [ ] Crear seed script
- [ ] Ejecutar seed (3 specs iniciales)

### API Implementation
- [ ] Setup Prisma client singleton
- [ ] Implementar GET /api/specs
- [ ] Implementar POST /api/specs
- [ ] Implementar GET /api/specs/:id
- [ ] Implementar PUT /api/specs/:id
- [ ] Implementar DELETE /api/specs/:id
- [ ] Implementar GET /api/specs/search
- [ ] Implementar GET /api/specs/:id/versions
- [ ] Implementar POST /api/specs/:id/versions
- [ ] Escribir tests unitarios (>80% coverage)
- [ ] Documentar API (JSDoc)

### UI Implementation
- [ ] Crear página /specs/browse
- [ ] Crear SpecCard component
- [ ] Crear SpecGrid component
- [ ] Crear SpecFilters component
- [ ] Crear SpecSearch component
- [ ] Crear SpecDetailModal component
- [ ] Implementar grid/list view toggle
- [ ] Implementar filtros por categoría
- [ ] Implementar search con debounce
- [ ] Implementar pagination
- [ ] Implementar sort options
- [ ] Escribir component tests
- [ ] Responsive design (mobile)

### Documentation
- [ ] User guide para Spec Browser
- [ ] API documentation
- [ ] README actualizado
- [ ] Screenshots de UI

---

## 🎯 Success Criteria Phase 2

| Criterio | Target | Medición |
|----------|--------|----------|
| Specs en DB | ≥3 | git-flow, security, iac-terraform migradas |
| API endpoints | 9 | CRUD + search + versioning funcionando |
| API tests coverage | >80% | Vitest coverage report |
| UI components | 5 | SpecCard, SpecGrid, SpecFilters, SpecSearch, SpecDetailModal |
| UI responsive | ✅ | Mobile + Desktop tested |
| Page load time | <2s | /specs/browse carga en <2s |
| Search latency | <500ms | Búsqueda responde en <500ms |

---

## 🚀 Getting Started - Implementación Inmediata

### Paso 1: Conectar a PostgreSQL (15 min)

```bash
# 1. Obtener credenciales PostgreSQL del cluster
kubectl get secret postgres-secret -n nirvana -o jsonpath='{.data.username}' | base64 -d
kubectl get secret postgres-secret -n nirvana -o jsonpath='{.data.password}' | base64 -d

# 2. Port forward para acceso local (mientras desarrollamos)
kubectl port-forward svc/postgres-service -n nirvana 5432:5432

# 3. Configurar .env.local
cd apps/control-center-ui
cat > .env.local <<EOF
DATABASE_URL="postgresql://username:password@localhost:5432/nirvana"
EOF

# 4. Instalar Prisma
npm install @prisma/client
npm install -D prisma

# 5. Inicializar Prisma
npx prisma init
```

### Paso 2: Crear Migrations (20 min)

Los archivos de migration están en la sección de Schema arriba.

---

¿Quieres que proceda con **Paso 1 y 2** (Database Setup) inmediatamente?
