/**
 * MCP Server Registry Configuration
 * 
 * Defines available Model Context Protocol (MCP) servers that provide
 * tools and capabilities to agents in the Agent Hub.
 * 
 * Each MCP server exposes a set of tools that agents can invoke to perform
 * operations on Azure, Kubernetes, DevOps, and documentation resources.
 */

export interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  enabled: boolean;
  authentication: {
    type: 'bearer' | 'api-key' | 'oauth2' | 'none';
    credentials?: {
      token?: string;
      apiKey?: string;
      clientId?: string;
      clientSecret?: string;
    };
  };
  tools: MCPTool[];
  metadata: {
    version: string;
    vendor: string;
    documentation_url?: string;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  category: 'resource' | 'query' | 'action' | 'analysis';
  parameters: MCPToolParameter[];
  required_permissions: string[];
  estimated_duration?: string; // e.g., "2-5s", "1-2m"
}

export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
  enum?: any[];
}

/**
 * MCP Server Registry
 * 
 * This configuration is loaded at runtime and can be updated dynamically
 * without redeploying the application.
 */
export const MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'azure-mcp',
    name: 'Azure MCP Server',
    description: 'Provides tools for managing Azure resources, subscriptions, and services',
    endpoint: process.env.AZURE_MCP_ENDPOINT || 'http://localhost:3001/mcp',
    enabled: true,
    authentication: {
      type: 'bearer',
      credentials: {
        token: process.env.AZURE_MCP_TOKEN,
      },
    },
    tools: [
      {
        name: 'list_subscriptions',
        description: 'List all Azure subscriptions accessible to the current user',
        category: 'query',
        parameters: [],
        required_permissions: ['azure.subscriptions.read'],
      },
      {
        name: 'list_resource_groups',
        description: 'List resource groups in a specific subscription',
        category: 'query',
        parameters: [
          {
            name: 'subscription_id',
            type: 'string',
            description: 'Azure subscription ID',
            required: true,
          },
        ],
        required_permissions: ['azure.resourceGroups.read'],
      },
      {
        name: 'list_resources',
        description: 'List resources in a resource group',
        category: 'query',
        parameters: [
          {
            name: 'subscription_id',
            type: 'string',
            description: 'Azure subscription ID',
            required: true,
          },
          {
            name: 'resource_group',
            type: 'string',
            description: 'Resource group name',
            required: true,
          },
          {
            name: 'resource_type',
            type: 'string',
            description: 'Filter by resource type (e.g., Microsoft.Compute/virtualMachines)',
            required: false,
          },
        ],
        required_permissions: ['azure.resources.read'],
      },
      {
        name: 'get_resource_details',
        description: 'Get detailed information about a specific Azure resource',
        category: 'query',
        parameters: [
          {
            name: 'resource_id',
            type: 'string',
            description: 'Full Azure resource ID',
            required: true,
          },
        ],
        required_permissions: ['azure.resources.read'],
      },
      {
        name: 'estimate_cost',
        description: 'Estimate monthly cost for Azure resources',
        category: 'analysis',
        parameters: [
          {
            name: 'resource_ids',
            type: 'array',
            description: 'Array of Azure resource IDs',
            required: true,
          },
        ],
        required_permissions: ['azure.costs.read'],
        estimated_duration: '3-5s',
      },
    ],
    metadata: {
      version: '1.0.0',
      vendor: 'DXC Technology',
      documentation_url: 'https://docs.dxc.com/mcp/azure',
    },
  },
  {
    id: 'aks-mcp',
    name: 'AKS MCP Server',
    description: 'Provides tools for managing Azure Kubernetes Service clusters',
    endpoint: process.env.AKS_MCP_ENDPOINT || 'http://localhost:3002/mcp',
    enabled: true,
    authentication: {
      type: 'bearer',
      credentials: {
        token: process.env.AKS_MCP_TOKEN,
      },
    },
    tools: [
      {
        name: 'list_clusters',
        description: 'List all AKS clusters in a subscription',
        category: 'query',
        parameters: [
          {
            name: 'subscription_id',
            type: 'string',
            description: 'Azure subscription ID',
            required: true,
          },
        ],
        required_permissions: ['aks.clusters.read'],
      },
      {
        name: 'get_cluster_nodes',
        description: 'Get nodes in an AKS cluster',
        category: 'query',
        parameters: [
          {
            name: 'cluster_name',
            type: 'string',
            description: 'AKS cluster name',
            required: true,
          },
          {
            name: 'resource_group',
            type: 'string',
            description: 'Resource group name',
            required: true,
          },
        ],
        required_permissions: ['aks.nodes.read'],
      },
      {
        name: 'list_namespaces',
        description: 'List Kubernetes namespaces in a cluster',
        category: 'query',
        parameters: [
          {
            name: 'cluster_name',
            type: 'string',
            description: 'AKS cluster name',
            required: true,
          },
        ],
        required_permissions: ['aks.namespaces.read'],
      },
      {
        name: 'get_pods',
        description: 'Get pods in a namespace',
        category: 'query',
        parameters: [
          {
            name: 'cluster_name',
            type: 'string',
            description: 'AKS cluster name',
            required: true,
          },
          {
            name: 'namespace',
            type: 'string',
            description: 'Kubernetes namespace',
            required: true,
          },
          {
            name: 'label_selector',
            type: 'string',
            description: 'Label selector (e.g., app=nginx)',
            required: false,
          },
        ],
        required_permissions: ['aks.pods.read'],
      },
      {
        name: 'scale_deployment',
        description: 'Scale a Kubernetes deployment',
        category: 'action',
        parameters: [
          {
            name: 'cluster_name',
            type: 'string',
            description: 'AKS cluster name',
            required: true,
          },
          {
            name: 'namespace',
            type: 'string',
            description: 'Kubernetes namespace',
            required: true,
          },
          {
            name: 'deployment_name',
            type: 'string',
            description: 'Deployment name',
            required: true,
          },
          {
            name: 'replicas',
            type: 'number',
            description: 'Number of replicas',
            required: true,
          },
        ],
        required_permissions: ['aks.deployments.write'],
        estimated_duration: '5-10s',
      },
    ],
    metadata: {
      version: '1.0.0',
      vendor: 'DXC Technology',
      documentation_url: 'https://docs.dxc.com/mcp/aks',
    },
  },
  {
    id: 'azdo-mcp',
    name: 'Azure DevOps MCP Server',
    description: 'Provides tools for Azure DevOps pipelines, repos, and work items',
    endpoint: process.env.AZDO_MCP_ENDPOINT || 'http://localhost:3003/mcp',
    enabled: true,
    authentication: {
      type: 'api-key',
      credentials: {
        apiKey: process.env.AZDO_PAT,
      },
    },
    tools: [
      {
        name: 'list_projects',
        description: 'List all Azure DevOps projects in an organization',
        category: 'query',
        parameters: [
          {
            name: 'organization',
            type: 'string',
            description: 'Azure DevOps organization name',
            required: true,
          },
        ],
        required_permissions: ['azdo.projects.read'],
      },
      {
        name: 'list_pipelines',
        description: 'List pipelines in a project',
        category: 'query',
        parameters: [
          {
            name: 'organization',
            type: 'string',
            description: 'Azure DevOps organization name',
            required: true,
          },
          {
            name: 'project',
            type: 'string',
            description: 'Project name',
            required: true,
          },
        ],
        required_permissions: ['azdo.pipelines.read'],
      },
      {
        name: 'get_pipeline_runs',
        description: 'Get recent runs of a pipeline',
        category: 'query',
        parameters: [
          {
            name: 'organization',
            type: 'string',
            description: 'Azure DevOps organization name',
            required: true,
          },
          {
            name: 'project',
            type: 'string',
            description: 'Project name',
            required: true,
          },
          {
            name: 'pipeline_id',
            type: 'number',
            description: 'Pipeline ID',
            required: true,
          },
          {
            name: 'top',
            type: 'number',
            description: 'Number of runs to retrieve',
            required: false,
            default: 10,
          },
        ],
        required_permissions: ['azdo.pipelines.read'],
      },
      {
        name: 'trigger_pipeline',
        description: 'Trigger a pipeline run',
        category: 'action',
        parameters: [
          {
            name: 'organization',
            type: 'string',
            description: 'Azure DevOps organization name',
            required: true,
          },
          {
            name: 'project',
            type: 'string',
            description: 'Project name',
            required: true,
          },
          {
            name: 'pipeline_id',
            type: 'number',
            description: 'Pipeline ID',
            required: true,
          },
          {
            name: 'branch',
            type: 'string',
            description: 'Branch to run pipeline on',
            required: false,
            default: 'main',
          },
        ],
        required_permissions: ['azdo.pipelines.execute'],
        estimated_duration: '1-2s',
      },
    ],
    metadata: {
      version: '1.0.0',
      vendor: 'DXC Technology',
      documentation_url: 'https://docs.dxc.com/mcp/azdo',
    },
  },
  {
    id: 'docs-mcp',
    name: 'Microsoft Docs MCP Server',
    description: 'Provides search and retrieval from Microsoft documentation',
    endpoint: process.env.DOCS_MCP_ENDPOINT || 'http://localhost:3004/mcp',
    enabled: true,
    authentication: {
      type: 'none',
    },
    tools: [
      {
        name: 'search_docs',
        description: 'Search Microsoft documentation',
        category: 'query',
        parameters: [
          {
            name: 'query',
            type: 'string',
            description: 'Search query',
            required: true,
          },
          {
            name: 'product',
            type: 'string',
            description: 'Product filter (e.g., azure, dotnet, kubernetes)',
            required: false,
          },
          {
            name: 'top',
            type: 'number',
            description: 'Number of results',
            required: false,
            default: 10,
          },
        ],
        required_permissions: [],
      },
      {
        name: 'get_article',
        description: 'Get full content of a documentation article',
        category: 'query',
        parameters: [
          {
            name: 'url',
            type: 'string',
            description: 'Documentation article URL',
            required: true,
          },
        ],
        required_permissions: [],
      },
      {
        name: 'get_api_reference',
        description: 'Get API reference documentation',
        category: 'query',
        parameters: [
          {
            name: 'api_name',
            type: 'string',
            description: 'API name (e.g., Azure.ResourceManager)',
            required: true,
          },
          {
            name: 'language',
            type: 'string',
            description: 'Programming language',
            required: false,
            enum: ['csharp', 'python', 'typescript', 'java'],
          },
        ],
        required_permissions: [],
      },
    ],
    metadata: {
      version: '1.0.0',
      vendor: 'Microsoft',
      documentation_url: 'https://learn.microsoft.com',
    },
  },
];

/**
 * Get MCP server by ID
 */
export function getMCPServer(serverId: string): MCPServerConfig | undefined {
  return MCP_SERVERS.find(server => server.id === serverId);
}

/**
 * Get all enabled MCP servers
 */
export function getEnabledMCPServers(): MCPServerConfig[] {
  return MCP_SERVERS.filter(server => server.enabled);
}

/**
 * Get all tools across all MCP servers
 */
export function getAllMCPTools(): Array<MCPTool & { server_id: string; server_name: string }> {
  const tools: Array<MCPTool & { server_id: string; server_name: string }> = [];
  
  MCP_SERVERS.forEach(server => {
    if (server.enabled) {
      server.tools.forEach(tool => {
        tools.push({
          ...tool,
          server_id: server.id,
          server_name: server.name,
        });
      });
    }
  });
  
  return tools;
}

/**
 * Check if user has permission to use a tool
 */
export function hasToolPermission(
  userRoles: string[],
  tool: MCPTool
): boolean {
  if (tool.required_permissions.length === 0) {
    return true; // Public tool
  }
  
  // Check if user has at least one required permission
  return tool.required_permissions.some(permission => 
    userRoles.includes(permission) || userRoles.includes('admin')
  );
}
