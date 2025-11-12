-- Seed: Project Planner Agent
-- Add Project Planner Agent to Agent Hub catalog

INSERT INTO agents (
  name,
  slug,
  description,
  category,
  tags,
  file_path,
  tools,
  mcp_servers,
  is_active,
  is_approved,
  created_by
) VALUES (
  'Project Planner',
  'project-planner',
  'AI-powered project planning agent that automatically generates comprehensive GitHub project hierarchies with Epic > Feature > Story breakdown, dependencies, priorities, and estimates following Agile best practices. Integrates with GitHub Models (gpt-4o) and GitHub API for automated issue creation.',
  'dxc-custom',
  ARRAY['project-management', 'agile', 'github', 'automation', 'planning', 'ai', 'epic', 'feature', 'story'],
  'docs/features/agent-hub/agents/dxc-custom/project-planner.agent.md',
  '[
    "GitHub Models API (gpt-4o)",
    "GitHub REST API (Octokit)",
    "Project hierarchy generator",
    "Dependency mapper",
    "Priority assignment engine",
    "Sprint planner"
  ]'::jsonb,
  '[]'::jsonb,
  true,
  true,
  'DXC Cloud Mind'
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  tools = EXCLUDED.tools,
  updated_at = CURRENT_TIMESTAMP;
