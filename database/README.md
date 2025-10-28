# 📊 Database Setup - DXC Cloud Mind Nirvana

Este directorio contiene migrations y seeds para el **Spec Library Manager**.

---

## 📁 Estructura

```
database/
├── migrations/
│   └── 001_create_specs_tables.sql    # Crea tablas specs, spec_versions, spec_usage
├── seeds/
│   └── 002_seed_predefined_specs.sql  # Inserta 3 specs iniciales
├── setup-database.sh                   # Script automatizado (Unix/WSL)
└── README.md                           # Este archivo
```

---

## 🚀 Quick Start (Opción 1: Script Automatizado)

### Prerequisitos

- PostgreSQL corriendo en AKS o localmente
- `psql` instalado
- DATABASE_URL configurada en `apps/control-center-ui/.env.local`

### Pasos

```bash
# 1. Asegurarte que PostgreSQL es accesible
# Si está en AKS, hacer port-forward:
kubectl port-forward svc/postgres-service -n nirvana 5432:5432

# 2. Configurar DATABASE_URL
cd apps/control-center-ui
cat > .env.local <<EOF
DATABASE_URL="postgresql://username:password@localhost:5432/nirvana"
EOF

# 3. Ejecutar script de setup
cd ../..
chmod +x database/setup-database.sh
./database/setup-database.sh
```

**Output esperado:**

```
==============================================================================
DXC Cloud Mind - Nirvana - Database Setup
==============================================================================

📊 Database: nirvana
🖥️  Host: localhost:5432

🔌 Step 1: Testing database connection...
✅ Connection successful

📋 Step 2: Running migration 001_create_specs_tables.sql...
✅ Migration 001 completed

🌱 Step 3: Seeding database with predefined specs...
✅ Seed 002 completed

🔍 Step 4: Verifying data...
  📦 Specs created: 3
  📌 Versions created: 3
✅ Data verification passed

⚙️  Step 5: Generating Prisma client...
✅ Prisma client generated

🔬 Step 6: Introspecting database...
✅ Database introspection completed

==============================================================================
✅ Database setup completed successfully!
==============================================================================

📊 Database Summary:
  • Tables created: specs, spec_versions, spec_usage
  • Specs inserted: 3 (git-flow, security, iac-terraform)
  • Prisma client generated: ✅

🚀 Next Steps:
  1. Test API: curl http://localhost:3000/api/specs
  2. Create API endpoints in apps/control-center-ui/app/api/specs/
  3. Create UI components in apps/control-center-ui/components/specs/
```

---

## 🔧 Manual Setup (Opción 2: Paso a Paso)

Si prefieres ejecutar manualmente cada paso:

### 1. Conectar a PostgreSQL

```bash
# Port forward desde AKS (si aplica)
kubectl port-forward svc/postgres-service -n nirvana 5432:5432

# Obtener credenciales
kubectl get secret postgres-secret -n nirvana -o jsonpath='{.data.username}' | base64 -d
kubectl get secret postgres-secret -n nirvana -o jsonpath='{.data.password}' | base64 -d
```

### 2. Configurar .env.local

```bash
cd apps/control-center-ui

cat > .env.local <<EOF
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/nirvana"
EOF
```

### 3. Ejecutar Migration 001

```bash
cd ../..

psql "postgresql://USERNAME:PASSWORD@localhost:5432/nirvana" \
  -f database/migrations/001_create_specs_tables.sql
```

**Output esperado:**

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
...
NOTICE:  =============================================================================
NOTICE:  Migration 001_create_specs_tables.sql completed successfully
NOTICE:  =============================================================================
```

### 4. Ejecutar Seed 002

```bash
psql "postgresql://USERNAME:PASSWORD@localhost:5432/nirvana" \
  -f database/seeds/002_seed_predefined_specs.sql
```

**Output esperado:**

```
INSERT 0 1
INSERT 0 1
INSERT 0 1
...
NOTICE:  =============================================================================
NOTICE:  Seed completed successfully
NOTICE:  =============================================================================
NOTICE:  Specs inserted: 3
NOTICE:  Versions inserted: 3
```

### 5. Instalar Prisma y generar client

```bash
cd apps/control-center-ui

# Instalar dependencias
npm install @prisma/client
npm install -D prisma

# Generar Prisma client
npx prisma generate
```

### 6. Verificar datos

```bash
psql "postgresql://USERNAME:PASSWORD@localhost:5432/nirvana" -c "
SELECT 
  name,
  display_name,
  category,
  version,
  status,
  array_length(tags, 1) as tag_count
FROM specs
ORDER BY popularity DESC;
"
```

**Output esperado:**

```
             name              |         display_name          |   category    | version | status | tag_count
-------------------------------+-------------------------------+---------------+---------+--------+-----------
 git-flow-best-practices       | Git Flow Best Practices       | development   | 1.0.0   | active |         5
 security-best-practices       | Security Best Practices       | security      | 1.0.0   | active |         6
 iac-terraform-best-practices  | IaC Best Practices - Terraform| infrastructure| 1.0.0   | active |         7
(3 rows)
```

---

## 📊 Database Schema

### Tabla: `specs`

| Column         | Type         | Description                              |
| -------------- | ------------ | ---------------------------------------- |
| id             | UUID         | Primary key                              |
| name           | VARCHAR(100) | Unique identifier (kebab-case)           |
| display_name   | VARCHAR(200) | Human-readable name                      |
| description    | TEXT         | Brief description                        |
| category       | VARCHAR(50)  | Category (development, security, etc.)   |
| version        | VARCHAR(20)  | Semantic version (1.0.0)                 |
| status         | VARCHAR(20)  | Status (draft, active, deprecated, etc.) |
| content        | TEXT         | Full markdown content                    |
| created_at     | TIMESTAMP    | Creation timestamp                       |
| updated_at     | TIMESTAMP    | Last update timestamp                    |
| created_by     | VARCHAR(100) | Creator user                             |
| tags           | TEXT[]       | Tags array                               |
| applicable_to  | TEXT[]       | Applicable project types                 |
| dependencies   | TEXT[]       | Dependencies (other spec names)          |
| conflicts      | TEXT[]       | Conflicts (incompatible specs)           |
| required       | BOOLEAN      | Is spec required?                        |
| min_version    | VARCHAR(20)  | Minimum version                          |
| max_version    | VARCHAR(20)  | Maximum version                          |
| project_count  | INTEGER      | Number of projects using this spec       |
| last_used      | TIMESTAMP    | Last usage timestamp                     |
| popularity     | INTEGER      | Popularity score                         |

**Indexes:**

- `idx_specs_category` - Category index
- `idx_specs_status` - Status index
- `idx_specs_tags` - GIN index for tags array
- `idx_specs_name` - Name index
- `idx_specs_popularity` - Popularity DESC index
- `idx_specs_search` - Full-text search GIN index

### Tabla: `spec_versions`

| Column     | Type         | Description             |
| ---------- | ------------ | ----------------------- |
| id         | UUID         | Primary key             |
| spec_id    | UUID         | Foreign key to specs.id |
| version    | VARCHAR(20)  | Semantic version        |
| content    | TEXT         | Version content         |
| changelog  | TEXT         | Changelog description   |
| created_at | TIMESTAMP    | Creation timestamp      |
| created_by | VARCHAR(100) | Creator user            |

**Constraints:**

- `UNIQUE(spec_id, version)` - One version per spec

### Tabla: `spec_usage`

| Column       | Type         | Description             |
| ------------ | ------------ | ----------------------- |
| id           | UUID         | Primary key             |
| spec_id      | UUID         | Foreign key to specs.id |
| project_id   | UUID         | Project UUID            |
| project_name | VARCHAR(200) | Project name            |
| applied_at   | TIMESTAMP    | Application timestamp   |
| spec_version | VARCHAR(20)  | Spec version used       |

**Constraints:**

- `UNIQUE(spec_id, project_id)` - One usage record per project

---

## 🧪 Testing

### Test Connection

```bash
psql "$DATABASE_URL" -c "SELECT 1"
```

### Test Tables

```bash
psql "$DATABASE_URL" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('specs', 'spec_versions', 'spec_usage')
ORDER BY table_name;
"
```

### Test Specs Count

```bash
psql "$DATABASE_URL" -c "
SELECT 
  (SELECT COUNT(*) FROM specs) as specs_count,
  (SELECT COUNT(*) FROM spec_versions) as versions_count,
  (SELECT COUNT(*) FROM spec_usage) as usage_count;
"
```

### Test Full-Text Search

```bash
psql "$DATABASE_URL" -c "
SELECT name, display_name 
FROM specs 
WHERE to_tsvector('english', display_name || ' ' || description || ' ' || content)
      @@ plainto_tsquery('english', 'oauth authentication');
"
```

---

## 🔄 Rollback

Si necesitas revertir las migrations:

```bash
# Drop todas las tablas
psql "$DATABASE_URL" -c "
DROP TABLE IF EXISTS spec_usage CASCADE;
DROP TABLE IF EXISTS spec_versions CASCADE;
DROP TABLE IF EXISTS specs CASCADE;
"

# Recrear desde cero
./database/setup-database.sh
```

---

## 📝 Adding New Migrations

### Convención de nombres

```
<number>_<description>.sql

Ejemplos:
  003_add_spec_author_field.sql
  004_add_spec_analytics_table.sql
```

### Template

```sql
-- =============================================================================
-- Migration: 003_add_spec_author_field.sql
-- Description: Add author field to specs table
-- Author: Tu Nombre
-- Date: 2025-10-XX
-- =============================================================================

BEGIN;

-- Add column
ALTER TABLE specs ADD COLUMN author VARCHAR(200);

-- Create index
CREATE INDEX idx_specs_author ON specs(author);

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully';
END $$;

COMMIT;
```

---

## 🐛 Troubleshooting

### Error: "connection refused"

**Causa**: PostgreSQL no está corriendo o port-forward no está activo.

**Solución**:

```bash
# Verificar PostgreSQL en AKS
kubectl get pods -n nirvana | grep postgres

# Verificar port-forward
ps aux | grep "kubectl port-forward"

# Iniciar port-forward si no está activo
kubectl port-forward svc/postgres-service -n nirvana 5432:5432
```

### Error: "relation 'specs' already exists"

**Causa**: Las tablas ya existen de una ejecución previa.

**Solución**: Ejecutar rollback y recrear:

```bash
psql "$DATABASE_URL" -c "
DROP TABLE IF EXISTS spec_usage CASCADE;
DROP TABLE IF EXISTS spec_versions CASCADE;
DROP TABLE IF EXISTS specs CASCADE;
"

./database/setup-database.sh
```

### Error: "Prisma client generation failed"

**Causa**: Prisma no puede conectar a la DB o schema.prisma está mal configurado.

**Solución**:

```bash
# Verificar DATABASE_URL
cat apps/control-center-ui/.env.local

# Test connection
psql "$DATABASE_URL" -c "SELECT 1"

# Regenerar client
cd apps/control-center-ui
npx prisma generate --force
```

---

## 🚀 Next Steps

Después de setup exitoso:

1. ✅ **Create API endpoints**
   - Ir a: `apps/control-center-ui/app/api/specs/`
   - Crear: `route.ts` (GET /api/specs, POST /api/specs)

2. ✅ **Test API**
   ```bash
   curl http://localhost:3000/api/specs
   ```

3. ✅ **Create UI components**
   - Ir a: `apps/control-center-ui/components/specs/`
   - Crear: SpecCard.tsx, SpecGrid.tsx, etc.

4. ✅ **Create Spec Browser page**
   - Ir a: `apps/control-center-ui/app/specs/browse/`
   - Crear: page.tsx

Consulta: `docs/features/spec-driven-development/PHASE_2_IMPLEMENTATION.md` para detalles.

---

## 📚 References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Semantic Versioning](https://semver.org/)
