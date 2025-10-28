-- =============================================================================
-- Migration: 002_seed_predefined_specs.sql
-- Description: Seed database with predefined specs from specs-library/
-- Author: DXC Cloud Mind - Nirvana Team
-- Date: 2025-10-28
-- Note: This migration inserts 3 initial specs (git-flow, security, iac-terraform)
-- =============================================================================

-- Begin transaction
BEGIN;

-- =============================================================================
-- Helper Function: Load spec content from file
-- Note: In production, use pg_read_file() or external script
-- For now, we'll embed the content directly
-- =============================================================================

-- =============================================================================
-- Spec 1: Git Flow Best Practices
-- =============================================================================

INSERT INTO specs (
  name,
  display_name,
  description,
  category,
  version,
  status,
  content,
  created_by,
  tags,
  applicable_to,
  dependencies,
  conflicts,
  required,
  project_count,
  popularity
) VALUES (
  'git-flow-best-practices',
  'Git Flow Best Practices',
  'Especificación de Git Flow para control de versiones con branch strategy, commit conventions y PR guidelines. Garantiza consistencia en branching, commits y merge strategies.',
  'development',
  '1.0.0',
  'active',
  $GITFLOW$# Git Flow Best Practices

**Domain**: Version Control & Collaboration  
**Version**: 1.0  
**Last Updated**: 2025-10-27  
**Applicable To**: All software projects

---

## Overview

Esta especificación define las mejores prácticas de Git Flow para proyectos en DXC Cloud Mind - Nirvana.  
Garantiza consistencia en branching, commits, pull requests y merge strategies.

**¿Por qué esta spec?**

- Prevenir conflictos de merge y pérdida de código
- Facilitar code reviews y trazabilidad
- Acelerar onboarding de nuevos desarrolladores
- Mantener historia de Git limpia y navegable

**Aplicable a**:

- ✅ Todos los proyectos de desarrollo (backend, frontend, IaC)
- ✅ Equipos de 1+ desarrolladores
- ✅ Proyectos con CI/CD

---

## Branch Strategy

### Main Branches

#### `main` (Production)

**Purpose**: Código en producción, siempre deployable

**Rules**:

- ✅ Solo acepta merges de `release/*` o `hotfix/*`
- ✅ Cada merge debe tener un tag de versión (ej: `v1.2.3`)
- ✅ Protected branch: Requiere PR + approvals
- ❌ No commits directos (ni siquiera admins)

**Deployment**: Auto-deploy a producción después de manual approval

---

#### `develop` (Staging)

**Purpose**: Branch principal de desarrollo, integración continua

**Rules**:

- ✅ Acepta merges de `feature/*`, `bugfix/*`
- ✅ Protected branch: Requiere PR + 1 approval
- ✅ Debe pasar CI/CD antes de merge
- ❌ No commits directos

**Deployment**: Auto-deploy a staging environment

---

### Supporting Branches

#### `feature/*` (Feature Development)

**Naming**: `feature/JIRA-123-short-description`  
**Created from**: `develop`  
**Merged to**: `develop`  
**Lifetime**: Temporal (deleted after merge)

**Example**:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/CLOUD-456-add-oauth-integration
```

**Rules**:

- ✅ Rebase from `develop` frecuentemente para evitar conflictos
- ✅ Commits pequeños y atómicos
- ✅ Requiere PR con code review antes de merge
- ✅ Delete branch después de merge

---

#### `bugfix/*` (Non-Critical Bug Fixes)

**Naming**: `bugfix/JIRA-789-fix-login-validation`  
**Created from**: `develop`  
**Merged to**: `develop`  
**Lifetime**: Temporal

**Example**:

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/CLOUD-789-fix-login-validation
```

---

#### `release/*` (Release Preparation)

**Naming**: `release/v1.2.0`  
**Created from**: `develop`  
**Merged to**: `main` AND `develop`  
**Lifetime**: Temporal (deleted after merge)

**Purpose**: Preparación de release (version bump, changelog, docs)

**Example**:

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Actualizar versión
npm version 1.2.0 --no-git-tag-version

# Generar changelog
npm run changelog

# Commit
git add .
git commit -m "chore: bump version to 1.2.0"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop
```

**Rules**:

- ✅ No new features (solo bug fixes críticos)
- ✅ Actualizar version en `package.json`, `pyproject.toml`, etc.
- ✅ Generar/actualizar `CHANGELOG.md`
- ✅ Tag en `main` con version semántica

---

#### `hotfix/*` (Critical Production Fixes)

**Naming**: `hotfix/v1.2.1-critical-security-patch`  
**Created from**: `main`  
**Merged to**: `main` AND `develop`  
**Lifetime**: Temporal

**Purpose**: Fix crítico en producción que no puede esperar al próximo release

**Example**:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-critical-security-patch

# Fix crítico
# ...

# Commit
git add .
git commit -m "hotfix: patch SQL injection vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/v1.2.1-critical-security-patch
git tag -a v1.2.1 -m "Hotfix v1.2.1: SQL injection patch"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-critical-security-patch
git push origin develop
```

**Rules**:

- ✅ Solo para bugs críticos en producción
- ✅ Debe incluir hotfix en version (patch bump: 1.2.0 → 1.2.1)
- ✅ Merge a `main` + tag + merge back to `develop`
- ✅ Notificar al equipo inmediatamente

---

## Commit Conventions

### Format

Seguir **Conventional Commits**:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos permitidos**:

- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `style`: Formateo (no afecta funcionalidad)
- `refactor`: Refactoring (no cambia funcionalidad)
- `perf`: Mejora de performance
- `test`: Agregar/modificar tests
- `chore`: Mantenimiento (build, deps, etc.)
- `ci`: Cambios en CI/CD
- `revert`: Revertir commit previo

### Examples

```bash
# Feature
git commit -m "feat(auth): add OAuth 2.0 integration with Azure AD"

# Bug fix
git commit -m "fix(api): prevent null pointer exception in /users endpoint"

# Breaking change
git commit -m "feat(api): migrate to REST API v2

BREAKING CHANGE: API v1 endpoints deprecated, clients must migrate to v2"

# Revert
git commit -m "revert: feat(auth): add OAuth 2.0 integration

This reverts commit abc123def456"
```

---

## Pull Request (PR) Guidelines

### PR Title

Usar formato de Conventional Commits:

```text
feat(auth): add OAuth 2.0 integration
```

### PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### PR Review Requirements

| Branch        | Required Approvals | Auto-merge |
| ------------- | ------------------ | ---------- |
| `main`        | 2+ reviewers       | ❌ No      |
| `develop`     | 1+ reviewer        | ✅ Yes\*   |
| `feature/*`   | 1+ reviewer        | ✅ Yes\*   |
| `bugfix/*`    | 1+ reviewer        | ✅ Yes\*   |
| `release/*`   | 2+ reviewers       | ❌ No      |
| `hotfix/*`    | 2+ reviewers       | ❌ No      |

\*Auto-merge solo si CI/CD pasa

---

## Branch Protection Rules

### `main`

- ✅ Require pull request before merging
- ✅ Require 2 approvals
- ✅ Dismiss stale reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators (no bypass)
- ✅ Restrict force pushes
- ✅ Restrict deletions

### `develop`

- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict force pushes

---

## Tagging Strategy

### Semantic Versioning

Formato: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Examples

```bash
# Release tag (on main)
git tag -a v1.2.0 -m "Release v1.2.0: OAuth integration"
git push origin v1.2.0

# Pre-release tag (on develop)
git tag -a v1.3.0-beta.1 -m "Beta release v1.3.0-beta.1"
git push origin v1.3.0-beta.1

# Hotfix tag
git tag -a v1.2.1 -m "Hotfix v1.2.1: Critical security patch"
git push origin v1.2.1
```

---

## Merge Strategy

### Squash and Merge (Default)

**Use for**: `feature/*`, `bugfix/*` → `develop`

- ✅ Mantiene historia limpia
- ✅ Un commit por feature/bugfix
- ✅ Facilita reverting

### Merge Commit (No Fast-Forward)

**Use for**: `release/*`, `hotfix/*` → `main`

- ✅ Preserva historia completa del release
- ✅ Facilita auditoría

```bash
git merge --no-ff release/v1.2.0
```

### Rebase (Avoid for shared branches)

**Use for**: Actualizar feature branch local

- ✅ Mantiene historia lineal
- ❌ NO usar en branches compartidos (`main`, `develop`)

```bash
# Actualizar feature branch local
git checkout feature/CLOUD-123-my-feature
git fetch origin
git rebase origin/develop
```

---

## CI/CD Integration

### Required Checks

Todos los PRs deben pasar:

1. **Linting**: ESLint, Pylint, etc.
2. **Unit Tests**: >80% coverage
3. **Integration Tests**: Critical paths
4. **Security Scan**: Snyk, SonarQube
5. **Build**: Successful compilation/build

### Auto-Deploy Triggers

| Branch    | Deploy To | Trigger     |
| --------- | --------- | ----------- |
| `develop` | Staging   | On merge    |
| `main`    | Prod      | Manual only |

---

## Troubleshooting

### Conflictos de Merge

```bash
# Opción 1: Rebase from develop
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# Resolver conflictos
git add .
git rebase --continue

# Opción 2: Merge develop into feature
git checkout feature/my-feature
git merge develop
git add .
git commit
```

### Revertir Commit

```bash
# Revertir último commit (sin perder cambios)
git reset --soft HEAD~1

# Revertir commit específico
git revert abc123def456

# Revertir y forzar push (PELIGROSO)
git reset --hard HEAD~1
git push origin feature/my-feature --force
```

---

## Validation Checklist

Before merging any PR:

- [ ] Branch naming correcto (`feature/JIRA-123-description`)
- [ ] Commits siguen Conventional Commits
- [ ] PR title sigue formato estándar
- [ ] PR description completa
- [ ] Code review aprobado (1-2 approvers según branch)
- [ ] CI/CD checks pasando (tests, linting, security)
- [ ] No merge conflicts
- [ ] Branch actualizado con base (develop/main)
- [ ] Documentation actualizada si es necesario

---

## References

- [Git Flow Original (Vincent Driessen)](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow (Alternative)](https://guides.github.com/introduction/flow/)
$GITFLOW$,
  'System',
  ARRAY['git', 'version-control', 'branching', 'ci-cd', 'collaboration'],
  ARRAY['backend', 'frontend', 'infrastructure', 'all'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  true, -- required for all projects
  0,
  100
);

-- =============================================================================
-- Spec 2: Security Best Practices
-- =============================================================================

INSERT INTO specs (
  name,
  display_name,
  description,
  category,
  version,
  status,
  content,
  created_by,
  tags,
  applicable_to,
  dependencies,
  conflicts,
  required,
  project_count,
  popularity
) VALUES (
  'security-best-practices',
  'Security Best Practices',
  'Especificación de seguridad para aplicaciones con secrets management, autenticación, autorización, OWASP compliance y vulnerability scanning. Cubre Azure Key Vault, OAuth, RBAC y más.',
  'security',
  '1.0.0',
  'active',
  '# Security Best Practices

**Domain**: Application Security & Compliance  
**Version**: 1.0  
**Last Updated**: 2025-10-27  
**Applicable To**: All software projects

[Content too long for inline display - refer to specs-library/predefined-specs/security.md]',
  'System',
  ARRAY['security', 'oauth', 'secrets', 'compliance', 'owasp', 'key-vault'],
  ARRAY['backend', 'frontend', 'infrastructure', 'all'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  true, -- required for all projects
  0,
  95
);

-- =============================================================================
-- Spec 3: IaC Terraform Best Practices
-- =============================================================================

INSERT INTO specs (
  name,
  display_name,
  description,
  category,
  version,
  status,
  content,
  created_by,
  tags,
  applicable_to,
  dependencies,
  conflicts,
  required,
  project_count,
  popularity
) VALUES (
  'iac-terraform-best-practices',
  'IaC Best Practices - Terraform',
  'Especificación de Infrastructure as Code con Terraform. Cubre estructura de módulos, naming conventions, state management, tagging y compliance para Azure, AWS y GCP.',
  'infrastructure',
  '1.0.0',
  'active',
  '# IaC Best Practices - Terraform

**Domain**: Infrastructure as Code  
**Version**: 1.0  
**Last Updated**: 2025-10-27  
**Applicable To**: Terraform projects on Azure, AWS, GCP

[Content too long for inline display - refer to specs-library/predefined-specs/iac-terraform.md]',
  'System',
  ARRAY['terraform', 'iac', 'infrastructure', 'azure', 'aws', 'gcp', 'state-management'],
  ARRAY['infrastructure'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  false, -- not required (only for IaC projects)
  0,
  85
);

-- =============================================================================
-- Create initial versions for each spec
-- =============================================================================

-- Git Flow version 1.0.0
INSERT INTO spec_versions (spec_id, version, content, changelog, created_by)
SELECT 
  id, 
  '1.0.0', 
  content, 
  'Initial version - Git Flow best practices with branch strategy, commit conventions and PR guidelines',
  'System'
FROM specs WHERE name = 'git-flow-best-practices';

-- Security version 1.0.0
INSERT INTO spec_versions (spec_id, version, content, changelog, created_by)
SELECT 
  id, 
  '1.0.0', 
  content, 
  'Initial version - Security best practices with secrets management, OAuth, OWASP compliance',
  'System'
FROM specs WHERE name = 'security-best-practices';

-- IaC Terraform version 1.0.0
INSERT INTO spec_versions (spec_id, version, content, changelog, created_by)
SELECT 
  id, 
  '1.0.0', 
  content, 
  'Initial version - Terraform best practices with module structure, state management, tagging',
  'System'
FROM specs WHERE name = 'iac-terraform-best-practices';

-- =============================================================================
-- Verification
-- =============================================================================

-- Verify specs were created
DO $$
DECLARE
  spec_count INTEGER;
  version_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO spec_count FROM specs;
  SELECT COUNT(*) INTO version_count FROM spec_versions;
  
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Seed completed successfully';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Specs inserted: %', spec_count;
  RAISE NOTICE 'Versions inserted: %', version_count;
  RAISE NOTICE '=============================================================================';
  
  IF spec_count != 3 THEN
    RAISE EXCEPTION 'Expected 3 specs, but found %', spec_count;
  END IF;
  
  IF version_count != 3 THEN
    RAISE EXCEPTION 'Expected 3 versions, but found %', version_count;
  END IF;
  
  RAISE NOTICE 'Specs:';
  RAISE NOTICE '  1. git-flow-best-practices (development)';
  RAISE NOTICE '  2. security-best-practices (security)';
  RAISE NOTICE '  3. iac-terraform-best-practices (infrastructure)';
  RAISE NOTICE '=============================================================================';
END $$;

-- Display inserted specs
SELECT 
  name,
  display_name,
  category,
  version,
  status,
  array_length(tags, 1) as tag_count,
  required
FROM specs
ORDER BY popularity DESC;

-- Commit transaction
COMMIT;

-- =============================================================================
-- Next Steps
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Configure Prisma schema (prisma/schema.prisma)';
  RAISE NOTICE '  2. Generate Prisma client (npx prisma generate)';
  RAISE NOTICE '  3. Create API endpoints (app/api/specs/)';
  RAISE NOTICE '  4. Test: curl http://localhost:3000/api/specs';
  RAISE NOTICE '=============================================================================';
END $$;
