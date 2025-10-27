# Git Flow Best Practices

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

**Purpose**: Integración continua, branch de pre-producción

**Rules**:

- ✅ Acepta merges de `feature/*` y `bugfix/*`
- ✅ Siempre debe estar en estado deployable
- ✅ Protected branch: Requiere PR + CI passing
- ❌ No commits directos

**Deployment**: Auto-deploy a staging environment

---

### Supporting Branches

#### `feature/*` (New Features)

**Naming Convention**:

```text
feature/<ISSUE-ID>-<short-description>
```

**Examples**:

```text
✅ feature/123-add-oauth-authentication
✅ feature/456-implement-notification-system
✅ feature/789-user-dashboard

❌ my-feature (no issue ID)
❌ feature-login (wrong format)
❌ add_user_auth (no prefix)
```

**Lifecycle**:

1. Branch from `develop`
2. Develop feature
3. Create PR to `develop`
4. Squash and merge after approval
5. Delete branch after merge

**Rules**:

- ✅ Debe estar asociado a un issue/user story
- ✅ Commits frecuentes (no guardar trabajo >1 día sin push)
- ✅ Rebase from `develop` regularmente (evitar drift)

---

#### `bugfix/*` (Bug Fixes in Development)

**Naming Convention**:

```text
bugfix/<ISSUE-ID>-<short-description>
```

**Examples**:

```text
✅ bugfix/234-fix-login-redirect
✅ bugfix/567-resolve-memory-leak
```

**Lifecycle**: Igual que `feature/*`, pero para correcciones

---

#### `hotfix/*` (Critical Production Fixes)

**Naming Convention**:

```text
hotfix/<ISSUE-ID>-<description>
```

**Examples**:

```text
✅ hotfix/999-critical-security-patch
✅ hotfix/888-payment-gateway-outage
```

**Lifecycle**:

1. Branch from `main` (urgente, bypass develop)
2. Fix issue
3. PR to `main` con justificación
4. Merge to `main` + tag version (ej: `v1.2.4`)
5. Cherry-pick to `develop`

**Rules**:

- ⚠️ Solo para issues críticos (P1 severity)
- ✅ Requiere justificación en PR
- ✅ Notificar al equipo inmediatamente
- ✅ Post-mortem obligatorio

---

#### `release/*` (Release Preparation)

**Naming Convention**:

```text
release/v<MAJOR>.<MINOR>.<PATCH>
```

**Examples**:

```text
✅ release/v1.2.0
✅ release/v2.0.0
```

**Lifecycle**:

1. Branch from `develop` cuando features listas
2. Solo bugfixes y polish (no nuevas features)
3. Update version numbers, changelog
4. PR to `main` cuando estable
5. Merge to `main` + tag
6. Merge back to `develop`

**Rules**:

- ✅ Feature freeze (solo bugfixes)
- ✅ QA testing completo
- ✅ Documentation updated
- ✅ Changelog generated

---

## Branch Protection Rules

### Configuration (GitHub/Azure DevOps)

#### `main` Branch

```yaml
Protection Rules:
  - Require pull request before merging: ✅
  - Require approvals: 2
  - Dismiss stale approvals when new commits pushed: ✅
  - Require review from Code Owners: ✅
  - Require status checks to pass: ✅
    - CI/CD pipeline
    - Unit tests
    - Integration tests
    - Security scan (SAST)
    - Linters
  - Require conversation resolution: ✅
  - Require signed commits: ✅ (optional but recommended)
  - Include administrators: ✅ (no bypass)
  - Restrict who can push: Tech Leads only
```

#### `develop` Branch

```yaml
Protection Rules:
  - Require pull request before merging: ✅
  - Require approvals: 1
  - Require status checks to pass: ✅
    - CI/CD pipeline
    - Unit tests
    - Linters
  - Require conversation resolution: ✅
  - Allow force pushes: ❌
```

---

## Commit Conventions

### Format: Conventional Commits

Seguimos [Conventional Commits v1.0.0](https://www.conventionalcommits.org/)

**Structure**:

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add OAuth2 login` |
| `fix` | Corrección de bug | `fix(api): handle null response` |
| `docs` | Cambios en documentación | `docs(readme): update setup instructions` |
| `style` | Formato, sin cambios de lógica | `style(header): fix indentation` |
| `refactor` | Refactorización sin cambiar funcionalidad | `refactor(user-service): extract validation logic` |
| `perf` | Mejoras de performance | `perf(db): add index on user_id` |
| `test` | Añadir o corregir tests | `test(auth): add login error cases` |
| `chore` | Mantenimiento (deps, config) | `chore(deps): update axios to v1.6.0` |
| `ci` | Cambios en CI/CD | `ci(github): add security scan step` |
| `build` | Cambios en build system | `build(webpack): optimize bundle size` |
| `revert` | Revertir commit anterior | `revert: feat(auth): add OAuth2 login` |

### Scope

**Opcional pero recomendado**. Indica área afectada:

- Componente: `auth`, `dashboard`, `api`, `database`
- Feature: `user-profile`, `notifications`, `payments`
- Layer: `frontend`, `backend`, `infra`

### Description

**Rules**:

- ✅ Imperativo, presente ("add" no "added")
- ✅ Lowercase (no capitalizar)
- ✅ No punto final
- ✅ Max 72 caracteres
- ✅ Claro y conciso

**Examples**:

```text
✅ feat(auth): add OAuth2 authentication flow
✅ fix(api): handle timeout errors gracefully
✅ docs(readme): add deployment instructions

❌ Added oauth (no type, no scope, past tense)
❌ Fix bug (vague, no details)
❌ Update code. (capitalized, has period)
```

### Body (Optional)

**When to use**:

- Explicar **por qué** (no qué, eso está en description)
- Detallar breaking changes
- Referenciar issues relacionados

**Format**:

```text
feat(auth): add OAuth2 authentication flow

Implement OAuth2 with Azure AD integration to replace
legacy session-based auth. This provides better security
and enables SSO.

- Add /auth/callback endpoint
- Store tokens in encrypted session
- Add token refresh logic

Closes #123
```

### Footer (Optional)

**Breaking Changes**:

```text
feat(api): change response format

BREAKING CHANGE: API responses now wrap data in { data, meta }
instead of returning raw data. Clients need to update.
```

**Issue References**:

```text
Closes #123
Fixes #456, #789
Related to #999
```

### Real Examples

```text
feat(dashboard): add real-time notifications widget

Implement WebSocket connection to receive notifications.
Updates notification badge count dynamically.

- Add useWebSocket hook
- Implement NotificationBadge component
- Add notification sound (optional, user setting)

Closes #345
```

```text
fix(payment): prevent duplicate charge on retry

Previously, retrying a failed payment created a new charge.
Now we use idempotency keys to prevent duplicates.

Fixes #678
```

```text
perf(db): add composite index on (user_id, created_at)

Reduces query time for user activity feed from 800ms to 45ms.

Related to #901
```

```text
chore(deps): update dependencies to latest versions

- axios: 1.5.0 → 1.6.2 (security patch)
- react: 18.2.0 → 18.3.1
- typescript: 5.2.2 → 5.3.3
```

---

## Pull Request (PR) Process

### PR Template

**File**: `.github/pull_request_template.md`

```markdown
## Description

<!-- ¿Qué cambia y por qué? -->

## Related Issue

<!-- Link al issue o user story -->
Closes #

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that breaks existing functionality)
- [ ] Documentation update

## Testing

<!-- ¿Cómo se validó este cambio? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

**Test scenarios**:
1. [Scenario 1]
2. [Scenario 2]

## Screenshots (if applicable)

**Before**:
[Screenshot]

**After**:
[Screenshot]

## Breaking Changes

<!-- ¿Este cambio rompe compatibilidad? ¿Qué necesitan actualizar los usuarios? -->

## Checklist

- [ ] My code follows the style guidelines (linters pass)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] Success criteria from spec.md are met

## Additional Notes

<!-- Cualquier información adicional para reviewers -->
```

### PR Requirements

**Mandatory**:

- ✅ **Title**: Follows conventional commit format
- ✅ **Description**: Completa y clara
- ✅ **Related Issue**: Link al issue/user story
- ✅ **Tests**: Unit + integration tests
- ✅ **CI/CD**: All checks passing (green)
- ✅ **Reviewers**: Al menos 1 approval
- ✅ **Conversations Resolved**: All comments addressed

**Recommended**:

- ✅ **Small PRs**: <400 lines changed (más fácil de revisar)
- ✅ **Screenshots**: Para cambios de UI
- ✅ **Performance Impact**: Si afecta performance, documentar
- ✅ **Database Migrations**: Incluir rollback scripts

### Review Process

#### Reviewer Responsibilities

**Code Quality**:

- [ ] Functionality: ¿El código hace lo que dice hacer?
- [ ] Tests: ¿Hay suficientes tests? ¿Cubren edge cases?
- [ ] Readability: ¿Es fácil de entender?
- [ ] Best Practices: ¿Sigue patrones del proyecto?

**Security**:

- [ ] No secrets hardcoded
- [ ] Input validation presente
- [ ] No SQL injection vulnerabilities
- [ ] Authentication/authorization correcta

**Performance**:

- [ ] No N+1 queries
- [ ] No loops ineficientes
- [ ] Queries optimizadas con índices
- [ ] Recursos liberados correctamente

**Documentation**:

- [ ] Funciones públicas tienen JSDoc/docstrings
- [ ] README actualizado si es necesario
- [ ] API docs actualizadas

#### Author Responsibilities

- ✅ Responder a comentarios en <24 horas
- ✅ Resolver conversaciones cuando addressed
- ✅ No hacer force push después de review (dificulta seguimiento)
- ✅ Agradecer feedback (blameless culture)

### Review Turnaround Time

| Priority | Response Time | Example |
|----------|---------------|---------|
| **P1 - Critical** | <2 horas | Hotfix, production issue |
| **P2 - High** | <8 horas | Feature blocker |
| **P3 - Medium** | <1 día | Regular feature |
| **P4 - Low** | <3 días | Refactoring, documentation |

---

## Merge Strategies

### Strategy by Branch

| Source | Target | Strategy | Reason |
|--------|--------|----------|--------|
| `feature/*` | `develop` | **Squash and Merge** | Mantener develop limpio, 1 commit por feature |
| `bugfix/*` | `develop` | **Squash and Merge** | Igual que features |
| `develop` | `main` | **Merge Commit** | Preservar historia de features |
| `release/*` | `main` | **Merge Commit** | Preservar historia de release |
| `hotfix/*` | `main` | **Merge Commit** | Trazabilidad de hotfixes |
| `hotfix/*` | `develop` | **Cherry-pick** | Solo el fix, no toda la historia |

### Squash and Merge

**When**: `feature/*` → `develop`

**Result**:

```text
Before:
  - feat(auth): add login form
  - fix(auth): typo in validation
  - refactor(auth): extract validation logic
  - test(auth): add login tests

After (1 squashed commit):
  - feat(auth): add OAuth2 authentication (#123)
```

**Commit Message**:

```text
feat(auth): add OAuth2 authentication (#123)

Implement OAuth2 with Azure AD integration.
- Add login form
- Add callback endpoint
- Store tokens in session

Closes #123
```

### Merge Commit

**When**: `develop` → `main`, `release/*` → `main`

**Result**: Preserva todos los commits, crea merge commit

```text
*   Merge branch 'develop' into main
|\
| * feat(notifications): add real-time notifications
| * feat(dashboard): add analytics widget
|/
* Previous main commit
```

### Rebase

**When**: Actualizar feature branch con cambios de `develop`

```bash
# Desde feature branch
git fetch origin
git rebase origin/develop

# Si hay conflictos, resolverlos y continuar
git rebase --continue
```

**Rules**:

- ✅ Usar rebase para actualizar feature branches
- ❌ NUNCA hacer rebase en `main` o `develop` (branches compartidos)
- ✅ Hacer rebase antes de crear PR (mantener historia limpia)

---

## Common Workflows

### Workflow 1: Nueva Feature

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feature/123-add-notifications

# 3. Desarrollar feature (commits frecuentes)
git add .
git commit -m "feat(notifications): add WebSocket connection"
git push origin feature/123-add-notifications

# 4. Actualizar branch con cambios de develop (si hay)
git fetch origin
git rebase origin/develop

# 5. Crear Pull Request (GitHub/Azure DevOps UI)
# 6. Después de approval, squash and merge
# 7. Delete branch (auto o manual)
```

### Workflow 2: Hotfix Crítico

```bash
# 1. Crear hotfix branch desde main
git checkout main
git pull origin main
git checkout -b hotfix/999-critical-security-patch

# 2. Fix issue
git add .
git commit -m "fix(auth): patch critical security vulnerability"

# 3. PR to main (con justificación)
git push origin hotfix/999-critical-security-patch

# 4. Después de merge a main, cherry-pick a develop
git checkout develop
git pull origin develop
git cherry-pick <commit-hash>
git push origin develop

# 5. Tag version en main
git checkout main
git pull origin main
git tag -a v1.2.4 -m "Hotfix: Critical security patch"
git push origin v1.2.4
```

### Workflow 3: Release

```bash
# 1. Crear release branch desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Bump version numbers
# Update package.json, version files, etc.
git commit -m "chore(release): bump version to 1.2.0"

# 3. Update CHANGELOG.md
git commit -m "docs(changelog): add v1.2.0 release notes"

# 4. PR to main (QA completa)
git push origin release/v1.2.0

# 5. Después de merge a main, tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 6. Merge back to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

---

## Versioning Strategy

### Semantic Versioning

Seguimos [SemVer 2.0.0](https://semver.org/):

```text
MAJOR.MINOR.PATCH

Example: v2.3.1
  ↑   ↑   ↑
  |   |   └─ PATCH: Bug fixes, hotfixes
  |   └───── MINOR: New features (backwards compatible)
  └───────── MAJOR: Breaking changes
```

### Examples

```text
v1.0.0 → v1.0.1  (PATCH: fix bug)
v1.0.1 → v1.1.0  (MINOR: add feature)
v1.1.0 → v2.0.0  (MAJOR: breaking change)
```

### Pre-release Versions

```text
v1.2.0-alpha.1  (Alpha release)
v1.2.0-beta.2   (Beta release)
v1.2.0-rc.1     (Release candidate)
v1.2.0          (Stable release)
```

### Git Tags

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release v1.2.0: Add notifications feature"

# Lightweight tag (not recommended)
git tag v1.2.0

# Push tag
git push origin v1.2.0

# Push all tags
git push origin --tags
```

---

## Git Hygiene

### Best Practices

**Commits**:

- ✅ Commits pequeños y atómicos (1 logical change)
- ✅ Commits frecuentes (no guardar trabajo >1 día sin commit)
- ✅ Mensajes descriptivos (no "fix", "update", "wip")
- ✅ Tests pass antes de commit

**Branches**:

- ✅ Delete branches después de merge
- ✅ Sync con `develop` regularmente (evitar long-lived branches)
- ✅ Naming consistente (feature/*, bugfix/*, etc.)

**Pull Requests**:

- ✅ PRs pequeños (<400 lines, <3 days work)
- ✅ Self-review antes de pedir review
- ✅ Responder a comentarios rápidamente

**History**:

- ✅ Mantener historia limpia (squash commits antes de merge)
- ❌ No hacer force push en branches compartidos
- ❌ No commitear código comentado (usar Git history)
- ❌ No commitear secrets, credentials, API keys

### `.gitignore` Template

```gitignore
# Dependencies
node_modules/
venv/
__pycache__/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.pyc
*.pyo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Secrets (double check!)
*.pem
*.key
secrets/
```

---

## CI/CD Integration

### Pipeline Triggers

```yaml
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]
    tags:
      - 'v*.*.*'
```

### Pipeline Checks

**All PRs must pass**:

- [ ] **Linters**: ESLint, Prettier, markdownlint
- [ ] **Unit Tests**: >80% coverage
- [ ] **Integration Tests**: All API endpoints
- [ ] **Security Scan**: SAST (SonarQube), secrets scan (gitleaks)
- [ ] **Build**: Successful compilation
- [ ] **Dependency Audit**: No critical vulnerabilities

### Commit Message Linting

**Tool**: [commitlint](https://commitlint.js.org/)

```bash
# Install
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Configure
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Add to husky pre-commit hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

**Result**: Rechaza commits que no siguen Conventional Commits

```bash
❌ git commit -m "fix bug"
# Error: subject may not be empty [subject-empty]

✅ git commit -m "fix(auth): handle null user session"
# Commit successful
```

---

## Common Issues & Solutions

### Issue 1: Conflictos de Merge

**Síntoma**: `CONFLICT (content): Merge conflict in file.js`

**Solución**:

```bash
# Opción 1: Rebase (recomendado)
git fetch origin
git rebase origin/develop

# Resolver conflictos manualmente en archivos marcados
# Buscar: <<<<<<< HEAD, =======, >>>>>>> branch

# Después de resolver
git add .
git rebase --continue

# Opción 2: Merge
git merge origin/develop
# Resolver conflictos
git add .
git commit -m "merge: resolve conflicts with develop"
```

### Issue 2: Commits Incorrectos

**Síntoma**: Commit con mensaje incorrecto o cambios no deseados

**Solución**:

```bash
# Cambiar mensaje del último commit
git commit --amend -m "fix(auth): correct typo in error message"

# Añadir archivos olvidados al último commit
git add forgotten-file.js
git commit --amend --no-edit

# Deshacer último commit (mantener cambios)
git reset HEAD~1

# Deshacer último commit (descartar cambios)
git reset --hard HEAD~1
```

**⚠️ Warning**: Solo usar `--amend` o `reset` si **NO has pusheado** el commit.

### Issue 3: Pushed a Wrong Branch

**Síntoma**: Hiciste commit a `develop` en lugar de feature branch

**Solución**:

```bash
# Crear feature branch con los commits actuales
git checkout -b feature/123-my-feature

# Volver develop al estado anterior
git checkout develop
git reset --hard origin/develop

# Ahora tus commits están en feature branch
git checkout feature/123-my-feature
git push origin feature/123-my-feature
```

### Issue 4: Forgot to Pull Before Work

**Síntoma**: Diverged branches, conflictos al pushear

**Solución**:

```bash
# Opción 1: Rebase (mantiene historia limpia)
git fetch origin
git rebase origin/develop

# Opción 2: Merge (crea merge commit)
git pull origin develop
```

---

## Tools & Automation

### Recommended Tools

**Git Clients**:

- **CLI**: Git Bash, Oh My Zsh
- **GUI**: GitKraken, SourceTree, GitHub Desktop

**VS Code Extensions**:

- GitLens: Git superpowers
- Git Graph: Visualize history
- Conventional Commits: Auto-format commit messages

**Pre-commit Hooks**:

```bash
# Install pre-commit framework
pip install pre-commit

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-merge-conflict
  
  - repo: https://github.com/gitleaks/gitleaks
    hooks:
      - id: gitleaks
  
  - repo: local
    hooks:
      - id: commitlint
        name: Commit message linting
        entry: npx commitlint --edit
        language: system
```

---

## Success Criteria

### Adoption Metrics

- [ ] **100%** de PRs siguen branch naming convention
- [ ] **>95%** de commits siguen Conventional Commits
- [ ] **100%** de PRs tienen tests
- [ ] **<10%** de PRs rechazados por CI/CD
- [ ] **<5%** de hotfixes por mes (indicador de calidad)

### Team Metrics

- [ ] **<24h** average PR review time
- [ ] **<2 days** average PR lifetime (creation → merge)
- [ ] **<3%** merge conflict rate
- [ ] **Zero** secrets leaked to Git

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Atlassian Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [commitlint](https://commitlint.js.org/)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial specification |
