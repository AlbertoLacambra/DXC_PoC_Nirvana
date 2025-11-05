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

### Community Agents

| Agent | Source | MCP Server |
|-------|--------|------------|
| ADR Generator | [GitHub](https://github.com/github/awesome-copilot/blob/main/agents/adr-generator.agent.md) | - |
| Terraform | [GitHub](https://github.com/github/awesome-copilot/blob/main/agents/terraform.agent.md) | - |
| Azure MCP | [MCP](https://github.com/mcp/azure/azure-mcp) | Azure MCP |
| AKS MCP | [MCP](https://github.com/mcp/azure/aks-mcp) | AKS MCP |
| Azure DevOps MCP | [MCP](https://github.com/mcp/microsoft/azure-devops-mcp) | DevOps MCP |
| Microsoft Docs MCP | [MCP](https://github.com/mcp/microsoftdocs/mcp) | Docs MCP |

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
├── README.md                    # This file
├── ARCHITECTURE.md              # Technical architecture
├── CONTRIBUTING.md              # Contribution guidelines
├── agents/
│   ├── dxc-custom/              # DXC proprietary agents
│   └── community/               # Community/marketplace agents
├── prompts/                     # Reusable prompt templates
├── instructions/                # Technology-specific specs
└── chatmodes/                   # Conversational modes
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
