'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  WrenchScrewdriverIcon,
  ServerIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tool_count: number;
  version: string;
  endpoint: string;
  authentication_type: string;
  connection_status?: {
    success: boolean;
    message: string;
    latency_ms?: number;
  };
  metadata: {
    version: string;
    vendor: string;
    documentation_url?: string;
  };
}

interface MCPTool {
  name: string;
  description: string;
  category: 'resource' | 'query' | 'action' | 'analysis';
  server_id: string;
  server_name: string;
  required_permissions: string[];
  estimated_duration?: string;
}

export default function MCPToolsPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServer, setSelectedServer] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch servers with connection test
      const serversResponse = await fetch('/api/mcp/servers?test_connection=true&include_tools=false');
      const serversData = await serversResponse.json();
      setServers(serversData.servers || []);

      // Fetch all tools
      const toolsResponse = await fetch('/api/mcp/tools');
      const toolsData = await toolsResponse.json();
      setTools(toolsData.tools || []);
    } catch (error) {
      console.error('Error fetching MCP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesServer = selectedServer === 'all' || tool.server_id === selectedServer;

    return matchesSearch && matchesCategory && matchesServer;
  });

  const categories = ['all', 'resource', 'query', 'action', 'analysis'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <Link 
            href="/agent-hub"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Agent Hub
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">MCP Tools & Servers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Model Context Protocol servers and available tools for agents
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200">
            <Link href="/agent-hub" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
              Agents
            </Link>
            <Link href="/agent-hub/prompts" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
              Prompts
            </Link>
            <Link href="/agent-hub/instructions" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
              Instructions
            </Link>
            <Link href="/agent-hub/chatmodes" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
              Chat Modes
            </Link>
            <Link href="/mcp/tools" className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
              MCP Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Server</label>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Servers</option>
                {servers.map(server => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Servers Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ServerIcon className="h-5 w-5" />
                  MCP Servers
                </h2>
                <div className="space-y-3">
                  {servers.map(server => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="lg:col-span-3">
              {filteredTools.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tools found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTools.map((tool, index) => (
                    <ToolCard key={`${tool.server_id}-${tool.name}-${index}`} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Server Card Component
function ServerCard({ server }: { server: MCPServer }) {
  const isOnline = server.connection_status?.success ?? false;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{server.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{server.tool_count} tools</p>
        </div>
        <div className="flex-shrink-0">
          {isOnline ? (
            <CheckCircleIcon className="h-5 w-5 text-green-600" title="Online" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-600" title="Offline" />
          )}
        </div>
      </div>
      
      {server.connection_status?.latency_ms !== undefined && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          {server.connection_status.latency_ms}ms
        </div>
      )}
      
      <div className="mt-2">
        <span className="text-xs text-gray-600">v{server.version}</span>
      </div>
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool }: { tool: MCPTool }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resource':
        return 'bg-blue-100 text-blue-700';
      case 'query':
        return 'bg-green-100 text-green-700';
      case 'action':
        return 'bg-orange-100 text-orange-700';
      case 'analysis':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{tool.name}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(tool.category)}`}>
              {tool.category}
            </span>
          </div>
          <p className="text-xs text-gray-600">{tool.description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {tool.server_name}
        </div>
        {tool.estimated_duration && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {tool.estimated_duration}
          </div>
        )}
      </div>

      {tool.required_permissions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tool.required_permissions.slice(0, 2).map(perm => (
            <span key={perm} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {perm}
            </span>
          ))}
          {tool.required_permissions.length > 2 && (
            <span className="text-xs text-gray-500">
              +{tool.required_permissions.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
