-- =====================================================
-- Agent Hub Content Seeder
-- =====================================================
-- Description: Seed database with 42 imported components
-- Author: Alberto Lacambra
-- Date: 2025-11-06
-- Version: 1.0.0
-- =====================================================
-- Content: 2 agents, 11 prompts, 16 instructions, 13 chat modes
-- =====================================================

BEGIN;

-- =====================================================
-- 1. SEED AGENTS (2 community agents)
-- =====================================================

INSERT INTO agents (
    name, slug, category, description, file_path, content,
    tools, mcp_servers, tags, author, source_url, required_roles
) VALUES 
(
    'ADR Generator',
    'adr-generator',
    'community',
    'Generate Architecture Decision Records following best practices and templates',
    'docs/features/agent-hub/agents/community/adr-generator.agent.md',
    NULL, -- Content will be loaded from file
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['architecture', 'documentation', 'adr', 'decision-records'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/agents/adr-generator.agent.md',
    ARRAY['developer', 'admin']
),
(
    'Terraform',
    'terraform',
    'community',
    'Infrastructure as Code specialist for Azure resources with best practices',
    'docs/features/agent-hub/agents/community/terraform.agent.md',
    NULL,
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['terraform', 'iac', 'infrastructure', 'azure', 'devops'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/agents/terraform.agent.md',
    ARRAY['developer', 'admin']
);

-- =====================================================
-- 2. SEED PROMPTS (11 reusable prompts)
-- =====================================================

INSERT INTO prompts (
    name, slug, description, file_path, content, template,
    mode, tools, variables, tags, category, use_case, author, source_url
) VALUES 
(
    'First Ask',
    'first-ask',
    'Initial clarification questions to understand requirements and scope',
    'docs/features/agent-hub/prompts/first-ask.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['requirements', 'scoping', 'discovery', 'planning'],
    'planning',
    'Project kickoff, requirements gathering, scope definition',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/first-ask.prompt.md'
),
(
    'Create Specification',
    'specifications',
    'Generate detailed technical specifications from requirements',
    'docs/features/agent-hub/prompts/specifications.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['documentation', 'specifications', 'requirements'],
    'documentation',
    'Creating technical specs, system design documentation',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/create-specification.prompt.md'
),
(
    'Educational Comments',
    'educational-comments',
    'Add learning-focused comments to code for knowledge transfer',
    'docs/features/agent-hub/prompts/educational-comments.prompt.md',
    NULL,
    NULL,
    'edit',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['documentation', 'code-comments', 'learning', 'knowledge-transfer'],
    'documentation',
    'Code review, onboarding, documentation, teaching',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/add-educational-comments.prompt.md'
),
(
    'Function Comments',
    'function-comments',
    'Generate comprehensive JSDoc/docstring comments for functions',
    'docs/features/agent-hub/prompts/function-comments.prompt.md',
    NULL,
    NULL,
    'edit',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['documentation', 'jsdoc', 'docstring', 'api-docs'],
    'documentation',
    'API documentation, function documentation, maintainability',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/add-function-comments.prompt.md'
),
(
    'Azure Cost Optimize',
    'az-cost-optimize',
    'Analyze Azure resources and provide cost optimization recommendations',
    'docs/features/agent-hub/prompts/az-cost-optimize.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[{"name": "subscriptionId", "type": "string", "required": true}, {"name": "resourceGroup", "type": "string", "required": false}]'::jsonb,
    ARRAY['azure', 'cost-optimization', 'finops', 'cloud'],
    'optimization',
    'Azure cost analysis, FinOps, cost reduction strategies',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/az-cost-optimize.prompt.md'
),
(
    'Create README',
    'readme',
    'Generate comprehensive README.md files for projects',
    'docs/features/agent-hub/prompts/readme.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['documentation', 'readme', 'project-setup'],
    'documentation',
    'Project documentation, repository setup, onboarding',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/create-readme.prompt.md'
),
(
    'GitHub Copilot Best Practices',
    'github-copilot',
    'Guide for effective GitHub Copilot usage and best practices',
    'docs/features/agent-hub/prompts/github-copilot.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['github-copilot', 'ai', 'best-practices', 'productivity'],
    'learning',
    'Copilot onboarding, productivity tips, AI-assisted development',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/github-copilot-best-practices.prompt.md'
),
(
    'SQL Query Optimize',
    'sql-query-optimize',
    'Analyze and optimize SQL queries for better performance',
    'docs/features/agent-hub/prompts/sql-query-optimize.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['sql', 'database', 'optimization', 'performance'],
    'optimization',
    'Database performance tuning, query optimization, indexing',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/sql-optimization.prompt.md'
),
(
    'Testing',
    'testing',
    'Generate comprehensive test suites with unit, integration, and E2E tests',
    'docs/features/agent-hub/prompts/testing.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['testing', 'unit-tests', 'integration-tests', 'quality'],
    'testing',
    'Test generation, quality assurance, TDD, coverage',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/testing.prompt.md'
),
(
    'Code Review',
    'code-review',
    'Systematic code review with security, performance, and best practices checks',
    'docs/features/agent-hub/prompts/code-review.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['code-review', 'quality', 'security', 'best-practices'],
    'review',
    'Pull request reviews, code quality gates, security audits',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/code-review.prompt.md'
),
(
    'Debugging',
    'debugging',
    'Structured debugging methodology for troubleshooting issues',
    'docs/features/agent-hub/prompts/debugging.prompt.md',
    NULL,
    NULL,
    'chat',
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY['debugging', 'troubleshooting', 'error-handling'],
    'debugging',
    'Issue resolution, error analysis, root cause analysis',
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/prompts/debugging.prompt.md'
);

-- =====================================================
-- 3. SEED INSTRUCTIONS (16 technology standards)
-- =====================================================

INSERT INTO instructions (
    name, slug, description, file_path, content,
    technology, technology_version, apply_to, tags, related_technologies, author, source_url
) VALUES 
(
    'Ansible Best Practices',
    'ansible',
    'Ansible playbook structure, role design, and idempotency patterns',
    'docs/features/agent-hub/instructions/ansible.instructions.md',
    NULL,
    'ansible',
    NULL,
    '*.yml,*.yaml',
    ARRAY['ansible', 'configuration-management', 'automation', 'devops'],
    ARRAY['terraform', 'kubernetes'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/ansible.instructions.md'
),
(
    'Terraform Best Practices',
    'terraform',
    'Terraform module design, state management, and security controls',
    'docs/features/agent-hub/instructions/terraform.instructions.md',
    NULL,
    'terraform',
    '1.5+',
    '*.tf',
    ARRAY['terraform', 'iac', 'infrastructure', 'azure'],
    ARRAY['ansible', 'kubernetes', 'azure'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/terraform.instructions.md'
),
(
    'Docker Best Practices',
    'docker',
    'Multi-stage builds, layer optimization, security scanning',
    'docs/features/agent-hub/instructions/docker.instructions.md',
    NULL,
    'docker',
    NULL,
    'Dockerfile,docker-compose.yml',
    ARRAY['docker', 'containers', 'containerization', 'devops'],
    ARRAY['kubernetes', 'azure'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/docker.instructions.md'
),
(
    'Kubernetes Best Practices',
    'kubernetes',
    'Manifest structure, resource limits, security contexts, deployment strategies',
    'docs/features/agent-hub/instructions/kubernetes.instructions.md',
    NULL,
    'kubernetes',
    '1.28+',
    '*.yaml,*.yml',
    ARRAY['kubernetes', 'k8s', 'orchestration', 'devops'],
    ARRAY['docker', 'helm', 'azure'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/kubernetes.instructions.md'
),
(
    'Azure Functions Best Practices',
    'azure-functions',
    'Serverless patterns, triggers, bindings, and monitoring',
    'docs/features/agent-hub/instructions/azure-functions.instructions.md',
    NULL,
    'azure-functions',
    'v4',
    '*.cs,*.js,*.ts,*.py',
    ARRAY['azure', 'serverless', 'functions', 'cloud'],
    ARRAY['azure', 'typescript', 'python'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/azure-functions.instructions.md'
),
(
    'ReactJS Best Practices',
    'reactjs',
    'Component patterns, hooks, state management, and performance',
    'docs/features/agent-hub/instructions/reactjs.instructions.md',
    NULL,
    'react',
    '18+',
    '*.jsx,*.tsx',
    ARRAY['react', 'frontend', 'javascript', 'ui'],
    ARRAY['typescript', 'nextjs'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md'
),
(
    'TypeScript Best Practices',
    'typescript',
    'Type safety, interfaces, generics, and advanced patterns',
    'docs/features/agent-hub/instructions/typescript.instructions.md',
    NULL,
    'typescript',
    '5+',
    '*.ts,*.tsx',
    ARRAY['typescript', 'javascript', 'types', 'programming'],
    ARRAY['nodejs', 'react', 'nextjs'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/typescript.instructions.md'
),
(
    'Python Best Practices',
    'python',
    'PEP 8, type hints, async patterns, and testing',
    'docs/features/agent-hub/instructions/python.instructions.md',
    NULL,
    'python',
    '3.11+',
    '*.py',
    ARRAY['python', 'programming', 'scripting'],
    ARRAY['azure-functions', 'data-science'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/python.instructions.md'
),
(
    'Node.js Best Practices',
    'nodejs',
    'Express patterns, async/await, error handling, and performance',
    'docs/features/agent-hub/instructions/nodejs.instructions.md',
    NULL,
    'nodejs',
    '20+',
    '*.js,*.ts',
    ARRAY['nodejs', 'javascript', 'backend', 'api'],
    ARRAY['typescript', 'express'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/nodejs.instructions.md'
),
(
    'Java Best Practices',
    'java',
    'Spring Boot, dependency injection, RESTful APIs, and testing',
    'docs/features/agent-hub/instructions/java.instructions.md',
    NULL,
    'java',
    '17+',
    '*.java',
    ARRAY['java', 'spring-boot', 'backend', 'enterprise'],
    ARRAY['maven', 'gradle'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md'
),
(
    'Go Best Practices',
    'golang',
    'Idiomatic Go, concurrency, error handling, and testing',
    'docs/features/agent-hub/instructions/golang.instructions.md',
    NULL,
    'go',
    '1.21+',
    '*.go',
    ARRAY['golang', 'go', 'programming', 'backend'],
    ARRAY['kubernetes', 'microservices'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/golang.instructions.md'
),
(
    'GitHub Actions Best Practices',
    'github-actions',
    'CI/CD workflows, matrix builds, security, and optimization',
    'docs/features/agent-hub/instructions/github-actions.instructions.md',
    NULL,
    'github-actions',
    NULL,
    '.github/workflows/*.yml',
    ARRAY['github-actions', 'ci-cd', 'devops', 'automation'],
    ARRAY['docker', 'kubernetes'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/github-actions.instructions.md'
),
(
    'Azure DevOps Pipelines Best Practices',
    'azure-devops',
    'YAML pipelines, templates, deployment strategies, and security',
    'docs/features/agent-hub/instructions/azure-devops.instructions.md',
    NULL,
    'azure-devops',
    NULL,
    'azure-pipelines.yml',
    ARRAY['azure-devops', 'ci-cd', 'devops', 'pipelines'],
    ARRAY['docker', 'kubernetes', 'azure'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/azure-devops.instructions.md'
),
(
    'OWASP Security Best Practices',
    'security-owasp',
    'OWASP Top 10 mitigations and secure coding practices',
    'docs/features/agent-hub/instructions/security-owasp.instructions.md',
    NULL,
    'security',
    NULL,
    '*',
    ARRAY['security', 'owasp', 'cybersecurity', 'best-practices'],
    ARRAY['typescript', 'python', 'java'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/security-owasp.instructions.md'
),
(
    'PowerShell Best Practices',
    'powershell',
    'Cmdlet development, error handling, modules, and automation',
    'docs/features/agent-hub/instructions/powershell.instructions.md',
    NULL,
    'powershell',
    '7+',
    '*.ps1,*.psm1',
    ARRAY['powershell', 'scripting', 'automation', 'windows'],
    ARRAY['azure', 'devops'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/powershell.instructions.md'
),
(
    'Next.js Best Practices',
    'nextjs',
    'SSR/SSG, API routes, optimization, and deployment',
    'docs/features/agent-hub/instructions/nextjs.instructions.md',
    NULL,
    'nextjs',
    '14+',
    '*.tsx,*.ts,*.jsx,*.js',
    ARRAY['nextjs', 'react', 'frontend', 'fullstack'],
    ARRAY['react', 'typescript'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/instructions/nextjs.instructions.md'
);

-- =====================================================
-- 4. SEED CHAT MODES (13 specialized modes)
-- =====================================================

INSERT INTO chat_modes (
    name, slug, description, file_path, content, system_prompt,
    model, temperature, tools, role_category, expertise_areas, tags, author, source_url
) VALUES 
(
    'Azure Architect',
    'azure-architect',
    'Azure Solutions Architect expert for cloud-native design and Well-Architected Framework',
    'docs/features/agent-hub/chatmodes/azure-architect.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'architect',
    ARRAY['azure', 'cloud-architecture', 'well-architected-framework'],
    ARRAY['azure', 'architecture', 'cloud', 'design'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/azure-architect.chatmode.md'
),
(
    'Terraform Planning',
    'terraform-planning',
    'Infrastructure planning specialist for Terraform module architecture and state management',
    'docs/features/agent-hub/chatmodes/terraform-planning.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'architect',
    ARRAY['terraform', 'infrastructure-planning', 'iac'],
    ARRAY['terraform', 'iac', 'planning', 'architecture'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/terraform-planning.chatmode.md'
),
(
    'Terraform Implementation',
    'terraform-implementation',
    'Terraform code implementation specialist with security controls and CI/CD integration',
    'docs/features/agent-hub/chatmodes/terraform-implementation.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'developer',
    ARRAY['terraform', 'iac', 'implementation'],
    ARRAY['terraform', 'iac', 'coding', 'implementation'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/terraform-implementation.chatmode.md'
),
(
    'DevOps Engineer',
    'devops-engineer',
    'CI/CD and automation specialist for pipelines, containerization, and monitoring',
    'docs/features/agent-hub/chatmodes/devops-engineer.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'devops',
    ARRAY['ci-cd', 'automation', 'containers', 'monitoring'],
    ARRAY['devops', 'ci-cd', 'automation', 'docker', 'kubernetes'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/devops-engineer.chatmode.md'
),
(
    'Security Analyst',
    'security-analyst',
    'Application and infrastructure security specialist with OWASP expertise',
    'docs/features/agent-hub/chatmodes/security-analyst.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'security',
    ARRAY['security', 'owasp', 'threat-modeling', 'compliance'],
    ARRAY['security', 'owasp', 'cybersecurity', 'compliance'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/security-analyst.chatmode.md'
),
(
    'Frontend Developer',
    'frontend-developer',
    'Modern UI development specialist for React, Vue, and responsive design',
    'docs/features/agent-hub/chatmodes/frontend-developer.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'developer',
    ARRAY['frontend', 'react', 'ui-ux', 'accessibility'],
    ARRAY['frontend', 'react', 'vue', 'javascript', 'ui'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/frontend-developer.chatmode.md'
),
(
    'Backend Developer',
    'backend-developer',
    'API and server-side development specialist for REST, GraphQL, and microservices',
    'docs/features/agent-hub/chatmodes/backend-developer.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'developer',
    ARRAY['backend', 'api', 'microservices', 'databases'],
    ARRAY['backend', 'api', 'rest', 'graphql', 'nodejs'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/backend-developer.chatmode.md'
),
(
    'Full Stack Developer',
    'fullstack-developer',
    'End-to-end development specialist with frontend, backend, and DevOps expertise',
    'docs/features/agent-hub/chatmodes/fullstack-developer.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'developer',
    ARRAY['fullstack', 'frontend', 'backend', 'devops'],
    ARRAY['fullstack', 'react', 'nodejs', 'typescript'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/fullstack-developer.chatmode.md'
),
(
    'DBA SQL Server',
    'dba-sqlserver',
    'SQL Server database administration specialist for performance tuning and high availability',
    'docs/features/agent-hub/chatmodes/dba-sqlserver.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'dba',
    ARRAY['sql-server', 'database', 'performance-tuning', 'high-availability'],
    ARRAY['sql-server', 'database', 'dba', 'microsoft'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/dba-sqlserver.chatmode.md'
),
(
    'DBA PostgreSQL',
    'dba-postgresql',
    'PostgreSQL database administration specialist with advanced features expertise',
    'docs/features/agent-hub/chatmodes/dba-postgresql.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'dba',
    ARRAY['postgresql', 'database', 'replication', 'jsonb'],
    ARRAY['postgresql', 'database', 'dba', 'sql'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/dba-postgresql.chatmode.md'
),
(
    'DBA MongoDB',
    'dba-mongodb',
    'MongoDB NoSQL database specialist for document design and aggregation',
    'docs/features/agent-hub/chatmodes/dba-mongodb.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'dba',
    ARRAY['mongodb', 'nosql', 'document-database', 'aggregation'],
    ARRAY['mongodb', 'nosql', 'database', 'dba'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/dba-mongodb.chatmode.md'
),
(
    'Data Scientist',
    'data-scientist',
    'Machine learning and data analysis specialist for model training and deployment',
    'docs/features/agent-hub/chatmodes/data-scientist.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'data-science',
    ARRAY['machine-learning', 'data-analysis', 'python', 'ai'],
    ARRAY['data-science', 'machine-learning', 'ai', 'python'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/data-scientist.chatmode.md'
),
(
    'Cloud Architect',
    'cloud-architect',
    'Multi-cloud solutions architect for Azure, AWS, and GCP with migration expertise',
    'docs/features/agent-hub/chatmodes/cloud-architect.chatmode.md',
    NULL,
    NULL,
    'gpt-4',
    0.7,
    '[]'::jsonb,
    'architect',
    ARRAY['multi-cloud', 'azure', 'aws', 'gcp', 'migration'],
    ARRAY['cloud', 'architecture', 'azure', 'aws', 'gcp'],
    'GitHub Copilot Community',
    'https://github.com/github/awesome-copilot/blob/main/chatmodes/cloud-architect.chatmode.md'
);

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify counts
SELECT 
    'Agents' as entity, COUNT(*) as count FROM agents
UNION ALL
SELECT 
    'Prompts', COUNT(*) FROM prompts
UNION ALL
SELECT 
    'Instructions', COUNT(*) FROM instructions
UNION ALL
SELECT 
    'Chat Modes', COUNT(*) FROM chat_modes;

-- Should output:
-- Agents: 2
-- Prompts: 11
-- Instructions: 16
-- Chat Modes: 13
-- Total: 42 components

-- =====================================================
-- END OF SEEDER
-- =====================================================
