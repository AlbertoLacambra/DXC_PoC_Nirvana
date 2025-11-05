# Nirvana Agent Hub

> **Multi-Agent Orchestration System for DXC Cloud Mind - Nirvana**

The Nirvana Agent Hub is a comprehensive platform that provides specialized AI agents, reusable prompts, technology-specific instructions, and custom chat modes to accelerate software development and cloud operations.

---

## 🎯 Overview

The Agent Hub consists of four core components:

### 1. **Nirvana Agents** 🤖

Specialized AI agents integrated with Model Context Protocol (MCP) servers:

- **DXC Custom Agents**: Business-focused agents for DXC-specific workflows
- **Community Agents**: Curated agents from GitHub Copilot ecosystem and MCP marketplace

[Browse Agents →](./agents/)

### 2. **Nirvana Reusable Prompts** 📝

Task-specific prompts for common development activities:

- Code generation and documentation
- Azure cost optimization
- Specification and README creation
- SQL query optimization
- And more...

[Browse Prompts →](./prompts/)

### 3. **Nirvana Instructions** 📚

Technology-specific coding standards and best practices:

- Terraform, Ansible, Docker, Kubernetes
- Azure Functions, Logic Apps, DevOps Pipelines
- Database administration (SQL Server, PostgreSQL, MongoDB)
- GitHub Actions, PowerShell, Markdown

[Browse Instructions →](./instructions/)

### 4. **Nirvana Chat Modes** 💬

Context-aware conversational modes for specialized workflows:

- Azure Principal Architect
- Terraform Planning & Implementation
- Database Administration (MS SQL, PostgreSQL)
- Prompt Engineering
- Tech Debt Remediation

[Browse Chat Modes →](./chatmodes/)

---

## 🚀 Quick Start

### For Users

#### Using Agents

```bash
# List available agents
GET /api/agents?category=community

# Execute an agent
POST /api/agents/terraform/execute
{
  "context": "Create AKS cluster with monitoring",
  "parameters": {
    "resourceGroup": "aks-rg",
    "region": "northeurope"
  }
}
```

#### Using Prompts

```bash
# Get prompt template
GET /api/prompts/az-cost-optimize

# Render prompt with variables
POST /api/prompts/az-cost-optimize/render
{
  "subscriptionId": "739aaf91-5cb2-45a6-ab4f-abf883e9d3f7",
  "resourceGroup": "dify-rg"
}
```

#### Using Chat Modes

```bash
# Start chat mode session
POST /api/chatmodes/azure-principal-architect/session
{
  "context": "Design high-availability web application"
}

# Send message
POST /api/chatmodes/sessions/{sessionId}/message
{
  "message": "What database should I use for this scenario?"
}
```

### For Administrators

#### Adding a Custom Agent

1. Create agent definition file:

```json
// agents/dxc-custom/my-agent.agent.json
{
  "id": "my-custom-agent",
  "name": "My Custom Agent",
  "category": "dxc-custom",
  "description": "Agent for specific DXC workflow",
  "capabilities": ["code-generation", "review"],
  "permissions": {
    "roles": ["admin", "developer"]
  },
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.7,
    "systemPrompt": "You are an expert in..."
  }
}
```

2. Add to repository:

```bash
git add agents/dxc-custom/my-agent.agent.json
git commit -m "feat: Add custom agent for X workflow"
git push
```

3. Agent will be automatically indexed and available in UI

---

## 📊 Agent Categories

### DXC Custom Agents

| Agent | Purpose | Permissions |
|-------|---------|-------------|
| Cloud Cost Optimizer | Azure cost analysis and recommendations | Admin, Developer |
| Security Compliance | Security posture assessment | Admin only |
| Migration Assessment | Legacy to cloud migration planning | Admin, Developer |
| Incident Response | Automated incident triage | Admin, Developer |
| Architecture Review | Solution architecture validation | Admin, Developer |

### Community Agents (2)

| Agent | Description | Source |
|-------|-------------|--------|
| ADR Generator | Generate Architecture Decision Records with best practices | [awesome-copilot](https://github.com/github/awesome-copilot) |
| Terraform | Infrastructure as Code specialist for Azure resources | [awesome-copilot](https://github.com/github/awesome-copilot) |

---

## 📋 Complete Content Inventory

### Reusable Prompts (11)

| Prompt | Description | Use Case |
|--------|-------------|----------|
| first-ask | Initial clarification questions for requirements | Project kickoff, scope definition |
| specifications | Generate detailed technical specifications | Project planning, documentation |
| educational-comments | Add learning-focused code comments | Code review, knowledge transfer |
| function-comments | Generate comprehensive function documentation | API documentation, maintenance |
| az-cost-optimize | Azure cost optimization recommendations | FinOps, cost reduction |
| readme | Create comprehensive README files | Project documentation |
| github-copilot | GitHub Copilot best practices guide | Developer onboarding |
| sql-query-optimize | SQL query performance optimization | Database tuning |
| testing | Generate comprehensive test suites | Quality assurance |
| code-review | Systematic code review checklist | PR reviews, quality gates |
| debugging | Structured debugging methodology | Issue resolution |

### Instruction Sets (16)

| Instruction Set | Technology | Description |
|----------------|------------|-------------|
| ansible | Ansible | Playbook best practices, role structure, idempotency |
| terraform | Terraform | Module design, state management, security controls |
| docker | Docker | Multi-stage builds, layer optimization, security scanning |
| kubernetes | Kubernetes | Manifest structure, resource limits, security contexts |
| azure-functions | Azure Functions | Serverless patterns, triggers, bindings, monitoring |
| reactjs | React | Component patterns, hooks, state management, performance |
| typescript | TypeScript | Type safety, interfaces, generics, best practices |
| python | Python | PEP 8, type hints, async patterns, testing |
| nodejs | Node.js | Express patterns, async/await, error handling |
| java | Java | Spring Boot, dependency injection, RESTful APIs |
| golang | Go | Idiomatic Go, concurrency, error handling |
| github-actions | GitHub Actions | CI/CD workflows, matrix builds, security |
| azure-devops | Azure DevOps | YAML pipelines, templates, deployment strategies |
| security-owasp | Security | OWASP Top 10 mitigations, secure coding practices |
| powershell | PowerShell | Cmdlet development, error handling, modules |
| nextjs | Next.js | SSR/SSG, API routes, optimization, deployment |

### Chat Modes (13)

| Chat Mode | Role | Expertise |
|-----------|------|-----------|
| azure-architect | Cloud Solutions Architect | Azure Well-Architected Framework, cloud-native design |
| terraform-planning | IaC Planning Specialist | Module architecture, state management, workspace strategy |
| terraform-implementation | IaC Developer | Terraform code implementation, security controls, CI/CD |
| devops-engineer | DevOps Specialist | CI/CD pipelines, containerization, monitoring, automation |
| security-analyst | Security Expert | OWASP Top 10, threat modeling, security controls, compliance |
| frontend-developer | Frontend Developer | React/Vue/Angular, responsive design, accessibility, performance |
| backend-developer | Backend Developer | REST/GraphQL APIs, databases, microservices, authentication |
| fullstack-developer | Full Stack Developer | End-to-end development, monorepo patterns, deployment |
| dba-sqlserver | SQL Server DBA | Performance tuning, Always On, indexing, TDE encryption |
| dba-postgresql | PostgreSQL DBA | JSONB, full-text search, replication, partitioning |
| dba-mongodb | MongoDB DBA | Document design, aggregation framework, sharding, replica sets |
| data-scientist | Data Science Specialist | ML/AI, model training, feature engineering, deployment |
| cloud-architect | Multi-Cloud Architect | Azure/AWS/GCP, migration strategies, resilience patterns |

**Total Content**: 42 components (2 agents + 11 prompts + 16 instructions + 13 chat modes)

---

## 🔐 Access Control

### Role-Based Permissions

| Role | Agents | Prompts | Instructions | Chat Modes | MCP Access |
|------|--------|---------|--------------|------------|------------|
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | All servers |
| **Developer** | Read, Execute | Read, Use | Read, Apply | Read, Use | Azure, DevOps |
| **Business User** | Read (approved) | Read (curated) | - | Read (curated) | Docs only |

### Requesting Access

1. Navigate to Agent Hub in Control Center UI
2. Browse agents and click "Request Access"
3. Provide business justification
4. Admin reviews and approves/denies
5. Email notification sent on decision

---

## 🛠️ Development

### Project Structure

```
docs/features/agent-hub/
├── README.md                    # This file - comprehensive documentation
├── agents/
│   ├── dxc-custom/              # DXC proprietary agents (5 placeholders)
│   └── community/               # Community agents (2 imported)
│       ├── adr-generator.agent.md
│       └── terraform.agent.md
├── prompts/                     # Reusable prompt templates (11 imported)
│   ├── first-ask.prompt.md
│   ├── specifications.prompt.md
│   ├── educational-comments.prompt.md
│   ├── function-comments.prompt.md
│   ├── az-cost-optimize.prompt.md
│   ├── readme.prompt.md
│   ├── github-copilot.prompt.md
│   ├── sql-query-optimize.prompt.md
│   ├── testing.prompt.md
│   ├── code-review.prompt.md
│   └── debugging.prompt.md
├── instructions/                # Technology-specific standards (16 imported)
│   ├── ansible.instructions.md
│   ├── terraform.instructions.md
│   ├── docker.instructions.md
│   ├── kubernetes.instructions.md
│   ├── azure-functions.instructions.md
│   ├── reactjs.instructions.md
│   ├── typescript.instructions.md
│   ├── python.instructions.md
│   ├── nodejs.instructions.md
│   ├── java.instructions.md
│   ├── golang.instructions.md
│   ├── github-actions.instructions.md
│   ├── azure-devops.instructions.md
│   ├── security-owasp.instructions.md
│   ├── powershell.instructions.md
│   └── nextjs.instructions.md
└── chatmodes/                   # Conversational modes (13 imported)
    ├── azure-architect.chatmode.md
    ├── terraform-planning.chatmode.md
    ├── terraform-implementation.chatmode.md
    ├── devops-engineer.chatmode.md
    ├── security-analyst.chatmode.md
    ├── frontend-developer.chatmode.md
    ├── backend-developer.chatmode.md
    ├── fullstack-developer.chatmode.md
    ├── dba-sqlserver.chatmode.md
    ├── dba-postgresql.chatmode.md
    ├── dba-mongodb.chatmode.md
    ├── data-scientist.chatmode.md
    └── cloud-architect.chatmode.md
```

### Adding New Content

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

**Quick checklist**:
- [ ] Create appropriately named file (`.agent.json`, `.prompt.md`, `.instructions.md`, `.chatmode.json`)
- [ ] Follow schema definition
- [ ] Add metadata (author, source, tags)
- [ ] Test locally
- [ ] Submit PR with clear description
- [ ] Request review from Agent Hub maintainers

---

## 📈 Usage Analytics

### Metrics Dashboard

Access real-time metrics at: `/agent-hub/analytics`

**Key Metrics**:
- Agent execution count by category
- Most popular prompts (by usage)
- Chat mode session duration
- User adoption rate by role
- MCP server health status

---

## 🔗 Integration

### MCP Server Configuration

```typescript
// apps/control-center-ui/lib/mcp/config.ts
export const mcpServers = {
  azure: {
    url: process.env.AZURE_MCP_URL,
    apiKey: process.env.AZURE_MCP_KEY,
    enabled: true
  },
  aks: {
    url: process.env.AKS_MCP_URL,
    apiKey: process.env.AKS_MCP_KEY,
    enabled: true
  },
  // ...
};
```

### API Integration

```typescript
import { AgentHubClient } from '@/lib/agent-hub';

const client = new AgentHubClient();

// Execute agent
const result = await client.agents.execute('terraform', {
  action: 'plan',
  workspace: '/path/to/terraform'
});

// Render prompt
const prompt = await client.prompts.render('az-cost-optimize', {
  subscriptionId: 'xxx',
  resourceGroup: 'my-rg'
});

// Start chat mode
const session = await client.chatmodes.createSession('azure-architect', {
  context: 'Design multi-region app'
});
```

---

## 📚 Resources

- **Architecture Decision Record**: [ADR-011](../../architecture/adr/ADR-011-nirvana-agent-hub-multi-agent-system.md)
- **GitHub Copilot Awesome List**: [Link](https://github.com/github/awesome-copilot)
- **Model Context Protocol**: [Specification](https://github.com/mcp)
- **Dify Documentation**: [Agents](https://docs.dify.ai/)

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code of conduct
- Submission guidelines
- Agent/prompt quality standards
- Review process

---

## 📄 License

This project is part of DXC Cloud Mind - Nirvana and follows the repository's license.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/discussions)
- **Internal**: DXC Cloud Mind Slack channel

---

**Last Updated**: 2025-11-05  
**Maintainer**: Alberto Lacambra (@AlbertoLacambra)  
**Phase 1 Status**: ✅ Complete (42 components imported)  
**Next Phase**: Backend API Implementation (Week 3-4)
