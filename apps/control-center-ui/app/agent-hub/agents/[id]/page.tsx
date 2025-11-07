'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  RocketLaunchIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'dxc-custom' | 'community';
  tags: string[];
  file_path: string;
  content?: string; // Content loaded from markdown file
  tools: string[];
  required_roles: string[];
  usage_count: number;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  metadata: {
    author?: string;
    version?: string;
    source_url?: string;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAgentDetails(params.id as string);
    }
  }, [params.id]);

  const fetchAgentDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent-hub/agents/${id}`);
      if (response.ok) {
        const json = await response.json();
        const data = json.data; // API returns {data: agent}
        setAgent(data);
      } else {
        console.error('Agent not found');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Not Found</h2>
        <Link href="/agent-hub" className="mt-4 text-blue-600 hover:text-blue-700">
          Back to Agent Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/agent-hub"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Agent Hub
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    agent.category === 'dxc-custom'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {agent.category === 'dxc-custom' ? 'DXC Custom' : 'Community'}
                </span>
              </div>
              <p className="mt-3 text-lg text-gray-600">{agent.description}</p>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="ml-4 p-2 text-gray-400 hover:text-yellow-500"
            >
              {isFavorite ? (
                <StarIconSolid className="h-6 w-6 text-yellow-500" />
              ) : (
                <StarIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowExecuteDialog(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Execute Agent
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Instructions */}
            {agent.content && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Instructions</h2>
                <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200">
                  {agent.content}
                </pre>
              </div>
            )}

            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {agent.tools && agent.tools.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h2>
                <div className="space-y-2">
                  {agent.tools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Required Roles:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(agent.required_roles || []).map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Executions</div>
                  <div className="text-2xl font-bold text-gray-900">{agent.usage_count}</div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    Created {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {agent.metadata && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <div className="space-y-3 text-sm">
                  {agent.metadata.author && (
                    <div>
                      <div className="text-gray-600">Author</div>
                      <div className="text-gray-900 font-medium">{agent.metadata.author}</div>
                    </div>
                  )}
                  {agent.metadata.version && (
                    <div>
                      <div className="text-gray-600">Version</div>
                      <div className="text-gray-900 font-medium">{agent.metadata.version}</div>
                    </div>
                  )}
                  {agent.metadata.source_url && (
                    <div>
                      <div className="text-gray-600">Source</div>
                      <a
                        href={agent.metadata.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium break-all"
                      >
                        View on GitHub
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execute Dialog */}
      {showExecuteDialog && (
        <ExecuteAgentDialog
          agent={agent}
          onClose={() => setShowExecuteDialog(false)}
        />
      )}
    </div>
  );
}

// Execute Agent Dialog Component
function ExecuteAgentDialog({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [context, setContext] = useState('');
  const [parameters, setParameters] = useState('{}');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      let parsedParams = {};
      if (parameters.trim()) {
        parsedParams = JSON.parse(parameters);
      }

      const response = await fetch(`/api/agent-hub/agents/${agent.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: context || undefined,
          parameters: parsedParams,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Execution error:', error);
      setResult({ error: 'Failed to execute agent' });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Execute {agent.name}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Provide context for the agent..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parameters (JSON, optional)
            </label>
            <textarea
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          {result && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Result</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {executing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Executing...
              </>
            ) : (
              <>
                <RocketLaunchIcon className="h-5 w-5" />
                Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
