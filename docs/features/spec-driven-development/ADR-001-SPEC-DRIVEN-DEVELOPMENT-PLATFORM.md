# ADR-001: Spec-Driven Development Platform Architecture

**Status**: In Progress  
**Date**: 2025-10-28  
**Decision Makers**: DXC Cloud Mind - Nirvana Team  
**Technical Story**: Build a comprehensive Spec-Driven Development platform to standardize project creation and ensure best practices compliance across all cloud projects.

---

## Context

DXC's cloud teams face several challenges when initiating new projects:

1. **Inconsistent Standards**: Different teams apply varying standards for Git workflows, security, infrastructure-as-code, and testing
2. **Knowledge Scattered**: Best practices documentation exists in multiple locations (Confluence, SharePoint, wikis) making it hard to discover and apply
3. **Manual Application**: Developers must manually read, interpret, and implement standards, leading to errors and omissions
4. **Version Control**: No centralized system to track evolution of standards over time
5. **Compliance Gaps**: Difficulty ensuring all projects meet required security, compliance, and governance standards
6. **Repetitive Work**: Each new project requires recreating standard configurations (CI/CD pipelines, security policies, IaC templates)

**Business Impact**:
- Slower time-to-market for new projects
- Higher risk of security/compliance violations
- Increased technical debt from inconsistent implementations
- Developer frustration from repetitive setup tasks

---

## Decision

We will build the **Nirvana Spec-Driven Development Platform**, a comprehensive ecosystem that:

1. **Centralizes Specifications**: Create a library of reusable, versioned specifications covering all aspects of cloud development (Git workflows, security, IaC, testing, observability, FinOps, compliance)

2. **AI-Powered Spec Generation**: Integrate with Dify to provide an AI bot that generates customized specifications based on project requirements using natural language conversations

3. **Browser & Selection UI**: Provide an intuitive web interface to browse, search, filter, and select specifications from the library

4. **Project Scaffolding**: Implement a wizard-based scaffolder that applies selected specs to generate complete, ready-to-use project structures

5. **Automated Deployment**: Enable autonomous deployment following the generated specifications and best practices

6. **Version Management**: Track spec evolution over time with semantic versioning and changelog support

---

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DXC Cloud Mind - Nirvana                         │
│                   Spec-Driven Development Platform                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Spec Library   │      │   Dify Bot      │      │   Nirvana UI    │
│   (PostgreSQL)  │◄────►│  (AI Generator) │◄────►│  (Next.js 14)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   REST API      │      │  Azure OpenAI   │      │  Spec Browser   │
│  (8 endpoints)  │      │   (GPT-4o)      │      │   UI Components │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                                                    │
         └────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │ Project Generator   │
                        │   Engine (Phase 3)  │
                        └─────────────────────┘
```

### Component Details

#### 1. Spec Library (Database Layer)

**Technology**: Azure Database for PostgreSQL Flexible Server (reused existing)

**Schema**:
- **`specs`** table (21 columns, 13 indexes)
  - Core metadata: name, displayName, description, category, status
  - Content: markdown specification
  - Relationships: tags, applicableTo, dependencies, conflicts
  - Metrics: popularity (auto-calculated from usage)
  - Full-text search support (GIN indexes on tsvector)

- **`spec_versions`** table (7 columns, 3 indexes)
  - Semantic versioning (X.Y.Z)
  - Version-specific content and changelog
  - Temporal tracking (createdAt)

- **`spec_usage`** table (6 columns, 3 indexes)
  - Project application tracking
  - Usage analytics for popularity calculation
  - Timestamp tracking

**Key Features**:
- Full-text search across name, description, tags
- Automatic popularity calculation via triggers
- Automatic timestamp updates
- Unique constraints on spec names and version combinations

#### 2. REST API (Application Layer)

**Technology**: Next.js 14 App Router API Routes

**Endpoints** (8 total):

| Endpoint | Method | Purpose | Features |
|----------|--------|---------|----------|
| `/api/specs` | GET | List specs | Filtering, pagination, sorting, search |
| `/api/specs` | POST | Create spec | Atomic transaction (spec + v1.0.0) |
| `/api/specs/:id` | GET | Get spec | Includes recent versions and usage |
| `/api/specs/:id` | PUT | Update spec | Metadata updates only |
| `/api/specs/:id` | DELETE | Delete spec | Usage validation (409 if in use) |
| `/api/specs/search` | GET | Full-text search | PostgreSQL tsvector, relevance ranking |
| `/api/specs/:id/versions` | GET | List versions | Pagination, chronological order |
| `/api/specs/:id/versions` | POST | Create version | Semver validation, duplicate check |

**Key Features**:
- TypeScript type safety
- Consistent JSON response format
- Comprehensive error handling (400, 404, 409, 500)
- Transaction support for data integrity
- Optimized queries with Prisma ORM

#### 3. Dify AI Bot (Spec Generation)

**Technology**: Dify Platform with Azure OpenAI GPT-4o

**Capabilities**:
- Natural language conversation to gather requirements
- Context-aware spec generation based on project type
- Integration with existing spec library
- Support for multiple spec categories:
  - Development (Git Flow, branching strategies)
  - Infrastructure (Terraform, ARM templates, Bicep)
  - Security (authentication, authorization, secrets management)
  - Testing (unit, integration, e2e strategies)
  - Observability (monitoring, logging, tracing)
  - FinOps (cost optimization, tagging)
  - Compliance (GDPR, SOC2, ISO 27001)

**Deployment**: Running at 10.0.2.91 on AKS cluster

#### 4. Nirvana UI (Presentation Layer)

**Technology**: Next.js 14 with React, TypeScript, Material-UI

**Planned Components**:
- **SpecCard**: Individual spec display with metadata
- **SpecGrid**: Responsive grid layout for spec browsing
- **SpecFilters**: Category, status, tags, required filters
- **SpecSearch**: Debounced search with autocomplete
- **SpecDetailModal**: Full spec content with version history
- **Project Scaffolder Wizard**: Multi-step project generation
- **Compatibility Checker**: Dependency and conflict validation

**Deployment**: localhost:3000 (development), will deploy to AKS

---

## Technical Decisions

### Decision 1: PostgreSQL vs. Document Database

**Chosen**: PostgreSQL

**Rationale**:
- Reuses existing Azure Database for PostgreSQL (zero additional cost)
- Excellent full-text search capabilities (tsvector/tsquery)
- Strong ACID guarantees for data integrity
- Advanced indexing (GIN indexes for arrays and full-text)
- Team familiarity with relational databases

**Alternatives Considered**:
- MongoDB: Would require new infrastructure ($$$), less efficient full-text search
- CosmosDB: Expensive, overkill for structured data
- Elasticsearch: Additional infrastructure cost, complexity

### Decision 2: Next.js API Routes vs. Separate Backend

**Chosen**: Next.js API Routes (App Router)

**Rationale**:
- Single codebase for UI and API (simpler deployment)
- Type sharing between frontend and backend (TypeScript)
- Integrated routing and middleware
- Server-side rendering support for future needs
- Smaller attack surface (no CORS complexity)

**Alternatives Considered**:
- Express.js: Requires separate deployment, CORS configuration
- NestJS: Heavier framework, steeper learning curve
- FastAPI: Different language (Python), team uses TypeScript

### Decision 3: Prisma vs. Raw SQL

**Chosen**: Prisma ORM

**Rationale**:
- Type-safe database queries (compile-time validation)
- Automatic migration generation
- Excellent TypeScript integration
- Clean query API reduces SQL injection risks
- Good performance with query optimization
- Can use raw SQL when needed (e.g., full-text search)

**Alternatives Considered**:
- TypeORM: Less mature, inconsistent documentation
- Raw SQL: More verbose, no type safety, manual validation

### Decision 4: Semantic Versioning

**Chosen**: Strict SemVer (X.Y.Z) with validation

**Rationale**:
- Industry standard for version management
- Clear communication of change severity
- Tooling support across ecosystem
- Enables dependency version constraints (minVersion, maxVersion)

**Format**: `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes to spec structure/content
- MINOR: Backwards-compatible additions
- PATCH: Bug fixes, clarifications, typos

### Decision 5: Atomic Transactions for Spec Creation

**Chosen**: Create spec + initial version (1.0.0) in single transaction

**Rationale**:
- Ensures data consistency (no orphaned specs)
- Prevents race conditions
- Simpler error recovery (all-or-nothing)
- Better user experience (single API call)

**Implementation**: Prisma `$transaction` with rollback on failure

### Decision 6: Infrastructure Reuse Strategy

**Chosen**: Reuse ALL existing infrastructure (PostgreSQL, Dify, AKS)

**Rationale**:
- **Zero additional cost** (critical business requirement)
- Faster time-to-market (no provisioning delays)
- Reduced operational complexity
- Leverages existing monitoring and backup strategies

**Reused Resources**:
- Azure Database for PostgreSQL: dify-postgres-9107e36a
- AKS Cluster: dify-aks namespace
- Dify Platform: 10.0.2.91
- Azure OpenAI: Existing GPT-4o deployment

---

## Data Model

### Spec Object Structure

```typescript
{
  // Identity
  id: UUID;
  name: string;              // Unique, kebab-case (e.g., "git-flow-best-practices")
  displayName: string;       // Human-readable (e.g., "Git Flow Best Practices")
  
  // Content
  description: string;       // Brief summary
  content: string;           // Full markdown specification
  
  // Classification
  category: SpecCategory;    // development | infrastructure | security | testing | observability | finops | compliance
  status: SpecStatus;        // draft | active | deprecated | archived
  tags: string[];            // Searchable keywords
  
  // Applicability
  applicableTo: string[];    // Project types (nextjs, terraform, python-api, etc.)
  dependencies: string[];    // Required specs (other spec names)
  conflicts: string[];       // Incompatible specs
  required: boolean;         // Is this spec mandatory?
  
  // Version Constraints
  minVersion: string;        // Minimum compatible version
  maxVersion: string;        // Maximum compatible version
  
  // Metrics
  popularity: number;        // Auto-calculated from usage (0-100)
  
  // Audit
  createdBy: string;         // Creator identifier
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### SpecVersion Object Structure

```typescript
{
  id: UUID;
  specId: UUID;              // Foreign key to specs
  version: string;           // SemVer format (X.Y.Z)
  content: string;           // Version-specific markdown content
  changelog: string;         // Description of changes
  createdAt: DateTime;
}
```

---

## Implementation Phases

### ✅ Phase 1: Spec Library & Bot Generator (COMPLETED)

**Deliverables**:
- ✅ 4 markdown templates for spec generation
- ✅ 3 predefined specs (Git Flow, Security, IaC Terraform)
- ✅ Dify bot workflow with Azure OpenAI integration
- ✅ DSL import file (656 lines YAML)
- ✅ Deployment documentation (DEPLOYMENT_MANUAL.md, QUICKSTART.md)

**Lines of Code**: ~11,500  
**Completion Date**: 2025-10-25

### ✅ Phase 2.1: Database Setup (COMPLETED)

**Deliverables**:
- ✅ Database schema design (3 tables, 19 indexes)
- ✅ Migration script (001_create_specs_tables.sql - 247 lines)
- ✅ Seed data script (002_seed_predefined_specs.sql - 280 lines)
- ✅ Prisma schema (127 lines with multi-platform support)
- ✅ Setup automation script (setup-database.sh - 195 lines)
- ✅ Comprehensive documentation (DATABASE_README.md - 465 lines)

**Lines of Code**: ~2,000  
**Completion Date**: 2025-10-26

### ✅ Phase 2.2: Execute Database Setup (COMPLETED)

**Deliverables**:
- ✅ Migrations executed in Azure PostgreSQL
- ✅ 3 specs seeded (git-flow, security, iac-terraform)
- ✅ Prisma client generated (multi-platform: Windows, WSL, Linux)
- ✅ Environment configuration (.env.local with DATABASE_URL)
- ✅ Database verification script (verify-database-setup.js - 152 lines)

**Completion Date**: 2025-10-27

**Challenges Solved**:
- ✅ Prisma binary targets for multi-platform support
- ✅ Environment variable loading in Node.js scripts
- ✅ Azure PostgreSQL private network access (used AKS pod)

### ✅ Phase 2.3: Spec Library Manager API (COMPLETED)

**Deliverables**:
- ✅ 8 RESTful API endpoints (816 lines total)
  - ✅ GET /api/specs (list with filters)
  - ✅ POST /api/specs (create with transaction)
  - ✅ GET /api/specs/:id (get by ID)
  - ✅ PUT /api/specs/:id (update)
  - ✅ DELETE /api/specs/:id (delete)
  - ✅ GET /api/specs/search (full-text search)
  - ✅ GET /api/specs/:id/versions (list versions)
  - ✅ POST /api/specs/:id/versions (create version)

**Lines of Code**: ~2,131  
**Completion Date**: 2025-10-28

**Key Features Implemented**:
- ✅ Advanced filtering (category, status, tags, required, search)
- ✅ Full-text search with relevance ranking (PostgreSQL tsvector/tsquery)
- ✅ Offset-based pagination with hasMore indicator
- ✅ Sorting (popularity, name, createdAt, updatedAt)
- ✅ Data integrity (duplicate checks, usage validation, atomic transactions)
- ✅ Comprehensive error handling (400, 404, 409, 500)
- ✅ TypeScript interfaces for all requests/responses
- ✅ Consistent JSON response format

### ✅ Phase 2.4: API Documentation (COMPLETED)

**Deliverables**:
- ✅ Complete API reference (API_DOCUMENTATION.md - 650+ lines)
- ✅ Implementation summary (SESSION_SUMMARY_PHASE_2.3.md - 700+ lines)
- ✅ cURL examples for all endpoints
- ✅ Postman/Thunder Client setup guide
- ✅ Data model documentation
- ✅ Error code reference

**Lines of Code**: ~1,350  
**Completion Date**: 2025-10-28

---

### 🚧 Phase 2.5: Test API Endpoints (IN PROGRESS)

**Planned Deliverables**:
- [ ] API testing setup (port-forward or AKS deployment)
- [ ] Test suite for all 8 endpoints
- [ ] CRUD operation validation
- [ ] Filtering and search tests
- [ ] Pagination edge case tests
- [ ] Error handling validation
- [ ] Performance benchmarks (100+ specs)

**Estimated Lines of Code**: ~500  
**Target Date**: 2025-10-29

**Testing Approach**:
1. Set up port-forward to Azure PostgreSQL: `kubectl port-forward -n dify svc/dify-postgres 5432:5432`
2. Test each endpoint with cURL/Postman
3. Validate responses against expected schemas
4. Test error scenarios (404, 409, 400)
5. Verify database state after operations
6. Measure query performance

---

### 📋 Phase 2.6: Spec Browser UI (PLANNED)

**Planned Deliverables**:
- [ ] SpecCard component (individual spec display)
- [ ] SpecGrid component (responsive grid layout)
- [ ] SpecFilters component (category, status, tags, required)
- [ ] SpecSearch component (debounced search, autocomplete)
- [ ] SpecDetailModal component (full content, version history, usage)
- [ ] Spec Browser page (/specs/browse)
- [ ] Integration with API endpoints
- [ ] URL query params for shareable filtered views
- [ ] Infinite scroll or "Load More" pagination

**Estimated Lines of Code**: ~1,500  
**Target Date**: 2025-10-30 - 2025-10-31

**Technologies**:
- React 18 with TypeScript
- Material-UI (MUI) components
- React Query for data fetching
- Markdown rendering (react-markdown)
- Syntax highlighting (prism-react-renderer)

---

### 📋 Phase 2.7: Project Scaffolder UI (PLANNED)

**Planned Deliverables**:
- [ ] Multi-step wizard component
  - Step 1: Select project type (Next.js, Terraform, Python API, etc.)
  - Step 2: Select specs (checkboxes with compatibility indicators)
  - Step 3: Configure project (name, directory, custom options)
  - Step 4: Review and confirm
- [ ] Compatibility checker logic
  - Validate required dependencies
  - Show conflict warnings
  - Suggest related specs
- [ ] Project configuration form
- [ ] Preview generated structure
- [ ] Integration with generator engine

**Estimated Lines of Code**: ~2,000  
**Target Date**: 2025-11-01 - 2025-11-03

**User Flow**:
```
1. User selects "Create New Project"
2. Wizard Step 1: Choose project type (dropdown)
3. Wizard Step 2: Browse/filter/select specs (multi-select with previews)
   - Show compatibility badges (✅ compatible, ⚠️ warning, ❌ conflict)
   - Auto-select required dependencies
   - Show suggested specs based on selection
4. Wizard Step 3: Configure project details
   - Project name
   - Target directory
   - Custom variables (interpolated into specs)
5. Wizard Step 4: Review summary
   - List of selected specs with versions
   - Preview directory structure
   - Estimated generation time
6. Click "Generate Project"
   - Call generator engine API
   - Show progress spinner
   - Display success/error message
```

---

### 📋 Phase 3: Project Generator Engine (PLANNED)

**Planned Deliverables**:
- [ ] Generator engine API (POST /api/generate)
- [ ] Template interpolation system (Handlebars or Nunjucks)
- [ ] File system generation logic
- [ ] Git repository initialization
- [ ] CI/CD pipeline scaffolding (Azure Pipelines, GitHub Actions)
- [ ] Spec application tracking (insert into spec_usage table)
- [ ] Generated project validation
- [ ] Rollback mechanism on errors

**Estimated Lines of Code**: ~3,000  
**Target Date**: 2025-11-04 - 2025-11-08

**Key Challenges**:
- Template variable resolution from multiple specs
- Conflict resolution when specs overlap
- File merging strategies (append vs replace)
- Maintaining idempotency (re-running generator)

---

### 📋 Phase 4: Dify Integration & Spec Evolution (PLANNED)

**Planned Deliverables**:
- [ ] Dify webhook integration
- [ ] API endpoint for bot-generated specs (POST /api/specs/from-bot)
- [ ] Spec evolution workflow (suggest new versions)
- [ ] Approval process for AI-generated specs
- [ ] Feedback loop (usage metrics → spec improvements)
- [ ] Automated spec testing (validate generated content)

**Estimated Lines of Code**: ~1,500  
**Target Date**: 2025-11-09 - 2025-11-12

---

### 📋 Phase 5: Advanced Features (PLANNED)

**Planned Deliverables**:
- [ ] Spec analytics dashboard
  - Usage trends over time
  - Most popular specs
  - Version adoption rates
  - Project compliance scores
- [ ] Spec collaboration features
  - Comments and discussions
  - Collaborative editing
  - Change proposals
- [ ] Spec templates (create specs from templates)
- [ ] Bulk operations (bulk update, bulk archive)
- [ ] Export/import (JSON, YAML formats)
- [ ] Webhook notifications (spec updated, new version)

**Estimated Lines of Code**: ~2,500  
**Target Date**: 2025-11-13 - 2025-11-20

---

## Progress Summary

### Overall Progress: 45% Complete

| Phase | Status | Lines of Code | Completion Date |
|-------|--------|---------------|-----------------|
| Phase 1: Spec Library & Bot | ✅ Complete | 11,500 | 2025-10-25 |
| Phase 2.1: Database Setup | ✅ Complete | 2,000 | 2025-10-26 |
| Phase 2.2: Execute Database | ✅ Complete | 150 | 2025-10-27 |
| Phase 2.3: API Implementation | ✅ Complete | 2,131 | 2025-10-28 |
| Phase 2.4: API Documentation | ✅ Complete | 1,350 | 2025-10-28 |
| **Phase 2.5: API Testing** | 🚧 In Progress | 0 / 500 | Target: 2025-10-29 |
| Phase 2.6: Spec Browser UI | 📋 Planned | 0 / 1,500 | Target: 2025-10-30 |
| Phase 2.7: Scaffolder UI | 📋 Planned | 0 / 2,000 | Target: 2025-11-01 |
| Phase 3: Generator Engine | 📋 Planned | 0 / 3,000 | Target: 2025-11-04 |
| Phase 4: Dify Integration | 📋 Planned | 0 / 1,500 | Target: 2025-11-09 |
| Phase 5: Advanced Features | 📋 Planned | 0 / 2,500 | Target: 2025-11-13 |

**Total Completed**: 17,131 lines of code  
**Total Remaining**: ~11,000 lines of code (estimated)  
**Total Project**: ~28,131 lines of code (estimated)

---

## Consequences

### Positive

1. **Standardization**: All projects follow consistent best practices
2. **Speed**: New projects created in minutes instead of days
3. **Quality**: Reduced human error through automation
4. **Knowledge Centralization**: Single source of truth for standards
5. **Compliance**: Built-in validation ensures regulatory requirements
6. **Cost Efficiency**: Reuses existing infrastructure ($0 additional cost)
7. **Scalability**: Can easily add new specs and categories
8. **Version Control**: Track evolution of standards over time
9. **AI-Powered**: Leverages GPT-4o for intelligent spec generation
10. **Developer Experience**: Reduces cognitive load and repetitive tasks

### Negative

1. **Initial Learning Curve**: Teams need training on new workflow
2. **Maintenance Overhead**: Specs must be kept up-to-date
3. **Database Dependency**: Requires Azure PostgreSQL availability
4. **Network Constraints**: API only accessible from AKS (private network)
5. **Spec Conflicts**: Complex dependency resolution required
6. **Template Complexity**: Advanced interpolation may be difficult to debug

### Mitigation Strategies

1. **Training**: Create comprehensive user guides and video tutorials
2. **Ownership**: Assign spec maintainers per category
3. **High Availability**: Use Azure PostgreSQL zone redundancy
4. **Port Forwarding**: Document kubectl port-forward for local dev
5. **Validation**: Implement compatibility checker with clear warnings
6. **Testing**: Create sandbox environment for template testing

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database failure (data loss) | High | Low | Daily backups, point-in-time restore enabled |
| API performance degradation | Medium | Medium | Add caching layer (Redis), optimize queries |
| Spec conflicts causing build failures | High | Medium | Robust validation, clear conflict warnings |
| AI-generated specs with errors | Medium | Medium | Human review process, automated testing |
| Team resistance to new workflow | Medium | High | Change management, early adopter program |
| Network access issues | Low | Medium | Document port-forward, provide VPN access |
| Prisma migration failures | Medium | Low | Test migrations in dev, backup before migrate |

---

## Metrics for Success

### Technical Metrics

- **API Response Time**: < 200ms for list endpoints (p95)
- **Full-Text Search**: < 500ms for complex queries (p95)
- **Database Query Performance**: All queries using indexes
- **API Availability**: 99.9% uptime
- **Test Coverage**: > 80% for API endpoints
- **Type Safety**: 100% TypeScript coverage (no `any` except Prisma limitations)

### Business Metrics

- **Time to Create Project**: < 5 minutes (vs 2-4 hours manual)
- **Spec Reuse Rate**: > 70% of projects use library specs
- **Compliance Score**: > 95% of projects meet all required specs
- **Developer Satisfaction**: > 4.0/5.0 rating
- **Spec Adoption**: > 50 unique specs in library within 3 months
- **Active Users**: > 100 developers using platform within 6 months

---

## Future Considerations

### Potential Enhancements

1. **Spec Marketplace**: Allow teams to share specs across organizations
2. **AI Spec Refinement**: Use usage data to auto-improve specs
3. **Multi-Cloud Support**: Extend beyond Azure (AWS, GCP specs)
4. **VS Code Extension**: Generate projects directly from IDE
5. **GitHub Integration**: Auto-PR with spec updates
6. **Spec Testing Framework**: Validate specs against real projects
7. **Spec Recommendations**: ML-based suggestions based on project context
8. **Audit Trail**: Full history of who applied which specs to which projects
9. **Spec Inheritance**: Create spec hierarchies (base → specialized)
10. **Custom Spec Languages**: Support DSLs beyond Markdown

### Scalability Planning

- **Current**: Single PostgreSQL instance (Azure Flexible Server)
- **Stage 2** (> 10K specs): Add read replicas
- **Stage 3** (> 100K specs): Partition by category, implement caching
- **Stage 4** (> 1M specs): Distributed database (Cosmos DB), CDN for content

---

## References

### Documentation

- [NIRVANA_SPEC_ECOSYSTEM_ARCHITECTURE.md](./NIRVANA_SPEC_ECOSYSTEM_ARCHITECTURE.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [SESSION_SUMMARY_PHASE_2.3.md](./SESSION_SUMMARY_PHASE_2.3.md)
- [PHASE_2_IMPLEMENTATION.md](./PHASE_2_IMPLEMENTATION.md)
- [database/README.md](../../database/README.md)

### Code Repositories

- Main Repo: `AlbertoLacambra/DXC_PoC_Nirvana`
- Branch: `master`
- Latest Commit: `49efaab` (Phase 2.3 API Implementation)

### External Resources

- [Dify Documentation](https://docs.dify.ai/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Semantic Versioning 2.0.0](https://semver.org/)

---

## Appendix A: Database Schema

```sql
-- specs table (21 columns, 13 indexes)
CREATE TABLE specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    category spec_category NOT NULL,
    status spec_status DEFAULT 'draft',
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    applicable_to TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    conflicts TEXT[] DEFAULT '{}',
    required BOOLEAN DEFAULT false,
    popularity INTEGER DEFAULT 0,
    min_version VARCHAR(20),
    max_version VARCHAR(20),
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- spec_versions table (7 columns, 3 indexes)
CREATE TABLE spec_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES specs(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    changelog TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(spec_id, version)
);

-- spec_usage table (6 columns, 3 indexes)
CREATE TABLE spec_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES specs(id) ON DELETE CASCADE,
    project_id VARCHAR(200) NOT NULL,
    project_name VARCHAR(200),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100)
);
```

---

## Appendix B: API Response Examples

### GET /api/specs (Success)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "git-flow-best-practices",
      "displayName": "Git Flow Best Practices",
      "description": "Comprehensive Git workflow guidelines",
      "category": "development",
      "status": "active",
      "tags": ["git", "workflow", "ci-cd"],
      "required": true,
      "popularity": 100,
      "_count": {
        "versions": 3,
        "usage": 87
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /api/specs (Error - Duplicate)

```json
{
  "success": false,
  "error": "Spec already exists",
  "message": "A spec with name 'git-flow-best-practices' already exists"
}
```

---

## Appendix C: Prisma Schema

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
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
  id            String        @id @default(uuid()) @db.Uuid
  name          String        @unique @db.VarChar(100)
  displayName   String        @map("display_name") @db.VarChar(200)
  description   String?       @db.Text
  category      SpecCategory
  status        SpecStatus    @default(draft)
  content       String        @db.Text
  tags          String[]      @default([])
  applicableTo  String[]      @map("applicable_to") @default([])
  dependencies  String[]      @default([])
  conflicts     String[]      @default([])
  required      Boolean       @default(false)
  popularity    Int           @default(0)
  minVersion    String?       @map("min_version") @db.VarChar(20)
  maxVersion    String?       @map("max_version") @db.VarChar(20)
  createdBy     String        @map("created_by") @db.VarChar(100) @default("system")
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt     DateTime      @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  versions      SpecVersion[]
  usage         SpecUsage[]

  @@map("specs")
}

model SpecVersion {
  id        String   @id @default(uuid()) @db.Uuid
  specId    String   @map("spec_id") @db.Uuid
  version   String   @db.VarChar(20)
  content   String   @db.Text
  changelog String   @default("") @db.Text
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(6)

  spec Spec @relation(fields: [specId], references: [id], onDelete: Cascade)

  @@unique([specId, version], name: "unique_spec_version")
  @@map("spec_versions")
}

model SpecUsage {
  id          String   @id @default(uuid()) @db.Uuid
  specId      String   @map("spec_id") @db.Uuid
  projectId   String   @map("project_id") @db.VarChar(200)
  projectName String?  @map("project_name") @db.VarChar(200)
  appliedAt   DateTime @default(now()) @map("applied_at") @db.Timestamp(6)
  appliedBy   String?  @map("applied_by") @db.VarChar(100)

  spec Spec @relation(fields: [specId], references: [id], onDelete: Cascade)

  @@map("spec_usage")
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-28  
**Next Review**: 2025-11-28
