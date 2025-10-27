# ADR-009: Spec-Driven Development Platform

**Status:** Proposed  
**Date:** 2025-10-27  
**Author:** Alberto Lacambra  
**Tags:** `spec-driven`, `ai-agents`, `developer-experience`, `methodology`

---

## Context

DXC Cloud Mind - Nirvana aims to accelerate software development through AI-powered tools and automation. However, we've identified several challenges with current development practices:

### Current State Problems

1. **"Vibe Coding" Approach**
   - Developers start coding before specifications are clear
   - Requirements emerge during implementation, causing rework
   - AI agents generate code based on vague prompts → inconsistent results
   - Documentation written after the fact, often incomplete

2. **Repetitive Technical Decisions**
   - Each project re-invents: Git workflow, security patterns, IaC structure
   - No centralized "how we do things" → inconsistency across teams
   - Onboarding new developers takes 1-2 weeks reading code to understand patterns

3. **Compliance as Afterthought**
   - Security reviews happen after development (expensive to fix)
   - FinOps controls applied manually post-deployment
   - Audit trails incomplete (decisions in Slack, not documented)

4. **Poor AI Agent Outcomes**
   - Ambiguous prompts → AI makes wrong assumptions
   - Generated code doesn't match actual requirements
   - Extensive refactoring needed (30-40% of AI-generated code)

### Industry Context

GitHub and Microsoft recently released **Spec-Kit**, an open-source toolkit for Specification-Driven Development (SDD). Key insights:

- **Spec-first approach**: Define WHAT and WHY before HOW
- **AI-friendly**: Clear specs → AI agents generate correct code
- **Iterative**: Specs evolve with project, not static documents
- **Proven results**: 
  - 50% reduction in requirement ambiguity
  - 40% less refactoring of AI-generated code
  - Faster onboarding (days vs weeks)

### Opportunity

We can leverage SDD methodology to:
1. Standardize project initiation across DXC
2. Create reusable specifications for common patterns (Git Flow, Security, IaC)
3. Improve AI agent code quality through clear instructions
4. Embed compliance (Security, FinOps) from project start
5. Accelerate onboarding with structured documentation

---

## Decision

We will implement a **Spec-Driven Development Platform** in DXC Cloud Mind - Nirvana with three core components:

### 1. Specification Library

A curated collection of reusable specifications for common domains:

- **Git Flow Best Practices**: Branch naming, commit conventions, PR templates
- **Security Best Practices**: Secrets scanning, SAST/DAST, OWASP mitigations
- **IaC Best Practices (Terraform)**: Module structure, state management, drift detection
- **FinOps Best Practices**: Tagging strategy, cost alerts, rightsizing
- **Architecture Framework**: Well-Architected pillars, design patterns
- **CI/CD Pipeline**: GitHub Actions patterns, deployment strategies
- **Testing Best Practices**: Test pyramid, coverage requirements
- **Observability**: Logging, metrics, tracing standards
- **API Design**: RESTful conventions, OpenAPI specs
- **Database Design**: Migrations, indexing, performance

**Format**: Markdown following GitHub Spec-Kit template structure
- User stories with priorities (P1, P2, P3)
- Functional requirements (FR-XXX)
- Success criteria (SC-XXX) - measurable and tech-agnostic
- Edge cases and constraints

**Storage**: `/specs-library/` directory in repository
**Versioning**: Semantic versioning (v1.0, v1.1, etc.)

### 2. AI-Powered Spec Generator (Dify Bot)

A chatbot integrated in Dify platform that assists developers in creating new specifications:

**Workflow:**
1. **Understand domain**: User describes what they want to build
2. **Query knowledge**: Bot searches Knowledge Portal for context
3. **Generate spec**: Creates `spec.md` following Spec-Kit template
   - User stories derived from description
   - Functional requirements specific to domain
   - Measurable success criteria
4. **Validate quality**: Runs checklist (completeness, clarity, testability)
5. **Iterative refinement**: User can refine until satisfied

**Integration points:**
- Azure OpenAI GPT-4o for generation
- Knowledge Portal for context retrieval
- Spec-Kit templates for structure
- Quality checklists for validation

**Expected output time**: <5 minutes for complete spec

### 3. Spec-Development Projects UI

New section in Control Center web application for managing spec-driven projects:

**Features:**
- **Project Wizard**: 4-step process to create new projects
  - Step 1: Basic info (name, description, repository)
  - Step 2: Select applicable specs (Git Flow, Security, etc.)
  - Step 3: Technical configuration (stack, constraints)
  - Step 4: Review and create
- **Dashboard**: Track project status (Specify → Plan → Tasks → Implement)
- **GitHub Integration**: Auto-create branches, commit initial structure
- **Checklist Generation**: Dynamic checklists from applied specs
- **Template Gallery**: Pre-configured project templates

**Tech Stack:**
- Frontend: Next.js 14 + React + Material UI
- Backend: Next.js API routes
- Database: PostgreSQL (new tables: `spec_projects`, `project_specs`, `spec_templates`)
- GitHub API: Octokit.js for branch/commit automation

### Implementation Approach: Phased Rollout

#### **Phase 1: Prototype (2-3 weeks)**
- Create 3 initial specs (Git Flow, Security, IaC)
- Build Dify bot for spec generation
- Validate with 3-5 developers
- **Success criteria**: 80%+ satisfaction, bot generates complete spec in <5 min

#### **Phase 2: UI Integration (3-4 weeks)**
- Implement wizard and dashboard in Control Center
- GitHub integration for branch creation
- Test with 5+ projects
- **Success criteria**: Project setup <30 min, 90%+ projects use ≥1 spec

#### **Phase 3: Library Expansion (4-6 weeks)**
- Expand to 10+ specs covering all domains
- Pilot with 20+ projects
- Collect metrics on time savings
- **Success criteria**: 50%+ reduction in repetitive decisions

#### **Phase 4: Advanced Automation (6-8 weeks)**
- Code generation from specs
- Automated compliance validation
- Template projects (Microservice, Terraform Module, etc.)
- **Success criteria**: 80%+ AI-generated code complies with specs

---

## Consequences

### Positive

1. **Faster Project Initiation**
   - From 2-3 days to <30 minutes
   - Pre-made specs eliminate decision paralysis
   - Wizard automates boilerplate setup

2. **Consistent Standards**
   - All projects follow same Git Flow, Security practices
   - Easier code reviews (reviewers know patterns)
   - Cross-team collaboration simplified

3. **Better AI Agent Output**
   - Clear specs → AI generates correct code first time
   - Estimated 40% reduction in refactoring
   - Measurable criteria enable validation

4. **Compliance by Default**
   - Security specs embedded from start
   - FinOps tagging/budgeting configured upfront
   - Audit trail complete (specs versioned in Git)

5. **Accelerated Onboarding**
   - New developers read structured specs vs code
   - From 1-2 weeks to 2-3 days
   - Reusable patterns documented

6. **Measurable ROI**
   - Time saved per project: 2-4 days
   - 50 projects/year × 3 days avg = 150 days saved
   - Fewer security incidents (30% estimated reduction)
   - Less cost overruns (FinOps specs)

### Negative

1. **Upfront Investment**
   - 12-16 weeks engineering effort for full implementation
   - Ongoing maintenance: 1-2 people part-time
   - Spec creation requires domain experts

2. **Cultural Change Required**
   - Developers accustomed to "code first"
   - Need training and evangelism
   - Resistance from teams preferring flexibility

3. **Process Overhead Risk**
   - Could slow down if specs become bureaucratic
   - **Mitigation**: Specs optional, not mandatory; wizard can be skipped

4. **Maintenance Burden**
   - Specs can become outdated
   - **Mitigation**: Quarterly review process, versioning, community contributions

5. **Adoption Uncertainty**
   - May not be adopted if perceived as extra work
   - **Mitigation**: Start with early adopters, showcase quick wins, measure time savings

### Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low adoption** | High | Medium | Pilot with enthusiastic teams, showcase time savings, make optional |
| **Specs become outdated** | Medium | High | Quarterly review cadence, versioning, assign spec owners |
| **Process slows development** | High | Low | Keep specs lightweight, wizard optional, measure time metrics |
| **AI bot generates poor specs** | Medium | Medium | Human review required, quality checklists, iterative improvement |
| **Maintenance burden** | Medium | Medium | Dedicate 1-2 people, community contributions, automate updates |

---

## Alternatives Considered

### Alternative 1: Traditional Documentation Approach
**Description**: Create comprehensive documentation wiki (Confluence, Notion)

**Pros:**
- Familiar to teams
- Low technical complexity
- Flexible structure

**Cons:**
- ❌ Not AI-friendly (unstructured)
- ❌ Becomes outdated quickly
- ❌ No enforcement mechanism
- ❌ Doesn't integrate with code

**Decision**: Rejected - doesn't solve AI agent problem, no automation

---

### Alternative 2: Code Templates / Scaffolding Tools
**Description**: Use tools like Yeoman, Cookiecutter to generate project boilerplate

**Pros:**
- Generates code immediately
- Enforces structure
- Faster than writing specs

**Cons:**
- ❌ No documentation of "why"
- ❌ Hard to customize post-generation
- ❌ Doesn't help with requirements clarity
- ❌ Templates become outdated

**Decision**: Rejected - solves setup but not requirements/planning

---

### Alternative 3: GitHub Issues + Project Boards
**Description**: Use GitHub native tools for planning and tracking

**Pros:**
- Already integrated
- Free
- Familiar to developers

**Cons:**
- ❌ No structured spec format
- ❌ No AI generation capability
- ❌ Manual process, not automated
- ❌ No reusable specs

**Decision**: Rejected - too manual, not spec-driven

---

### Alternative 4: Buy Commercial SDD Tool
**Description**: Purchase tools like ProductBoard, Aha!, Jira Align

**Pros:**
- Enterprise-ready
- Support included
- Feature-rich

**Cons:**
- ❌ Expensive ($50-100/user/month)
- ❌ Not tailored to our workflow
- ❌ No AI agent integration
- ❌ Vendor lock-in

**Decision**: Rejected - cost prohibitive, doesn't integrate with our AI platform

---

## Implementation Details

### Database Schema

```sql
-- Projects table
CREATE TABLE spec_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url VARCHAR(512) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    feature_number INT NOT NULL,
    current_phase VARCHAR(50) DEFAULT 'specify',
    spec_file_path VARCHAR(512),
    plan_file_path VARCHAR(512),
    tasks_file_path VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Specs applied to projects
CREATE TABLE project_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES spec_projects(id),
    spec_name VARCHAR(255) NOT NULL,
    spec_version VARCHAR(50),
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Spec templates library
CREATE TABLE spec_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    domain VARCHAR(100),
    version VARCHAR(50),
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

- `POST /api/spec-projects/create` - Create new project
- `GET /api/spec-projects/list` - List user's projects
- `GET /api/spec-projects/{id}` - Get project details
- `POST /api/spec-projects/{id}/generate` - Generate plan/tasks/code
- `GET /api/specs/library` - Get available specs
- `GET /api/specs/{name}` - Get spec content

### Dify Bot Configuration

```yaml
name: spec-generator-bot
model: azure-openai-gpt4o
temperature: 0.3
system_prompt: |
  You are an expert in Specification-Driven Development.
  Generate clear, testable specifications following Spec-Kit methodology.
  Focus on WHAT and WHY, not HOW (no tech stack in specs).

workflow:
  1. extract_domain
  2. query_knowledge_portal
  3. generate_user_stories
  4. generate_requirements
  5. generate_success_criteria
  6. format_as_markdown
  7. validate_quality
```

### File Structure

```
DXC_PoC_Nirvana/
├── specs-library/           # Reusable specs
│   ├── git-flow.md
│   ├── security.md
│   ├── iac-terraform.md
│   └── templates/
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
├── docs/
│   └── features/
│       └── spec-driven-development/
│           ├── README.md
│           └── GETTING_STARTED.md
└── apps/control-center-ui/
    ├── app/
    │   └── spec-projects/
    │       ├── page.tsx          # Dashboard
    │       ├── new/
    │       │   └── page.tsx      # Wizard
    │       └── [id]/
    │           └── page.tsx      # Project detail
    └── lib/
        └── spec-projects-client.ts
```

---

## Success Metrics

### Phase 1 (Validation)
- [ ] 3 specs created and validated by domain experts
- [ ] Dify bot generates complete spec in <5 minutes
- [ ] 80%+ developer satisfaction in feedback round
- [ ] All specs pass quality checklist

### Phase 2 (UI Launch)
- [ ] 5+ projects created via wizard
- [ ] Project setup time <30 minutes (vs 2-3 days baseline)
- [ ] 90%+ projects use ≥1 spec
- [ ] Zero errors in GitHub branch creation

### Phase 3 (Scale)
- [ ] 10+ specs in library
- [ ] 20+ active projects
- [ ] 50%+ reduction in repetitive technical decisions
- [ ] Measurable time savings: 100+ hours/quarter

### Phase 4 (Automation)
- [ ] 80%+ AI-generated code complies with specs
- [ ] 30%+ reduction in security findings
- [ ] 3+ template projects in production use
- [ ] 25%+ reduction in time-to-first-commit

### Business Metrics (1 Year)
- [ ] 50+ projects using spec-driven approach
- [ ] 150+ days saved across all projects
- [ ] 30% reduction in security incidents
- [ ] 20% reduction in cost overruns (FinOps specs)
- [ ] Developer satisfaction: 4.0/5.0+

---

## References

### External
- [GitHub Spec-Kit Repository](https://github.com/github/spec-kit)
- [Microsoft Blog: Spec-Driven Development](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
- [GitHub Blog: Spec-Driven Development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

### Internal
- [Feature Documentation](../../features/spec-driven-development/README.md)
- [ADR-008: Knowledge Portal Vector Database](./ADR-008-knowledge-portal-vector-database.md)

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-10-27 | 1.0 | Alberto Lacambra | Initial proposal |

---

**Decision**: Proceed with Phase 1 (Prototype & Validation) pending stakeholder approval

**Next Steps**:
1. Review this ADR with engineering leads
2. Approve budget for Phase 1 (2-3 weeks, 1-2 developers)
3. Assign team and kick off Sprint 1
4. Create initial 3 specs (Git Flow, Security, IaC)
5. Build Dify bot prototype
6. Validate with 5 developers, collect feedback
