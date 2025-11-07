'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Prompt {
  id: string;
  name: string;
  description: string;
  mode: 'system' | 'user' | 'assistant';
  category: string;
  tags: string[];
  template: string;
  variables: any[];
  usage_count: number;
  created_at: string;
}

type ModeFilter = 'all' | 'system' | 'user' | 'assistant';

export default function PromptLibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, [modeFilter, searchQuery]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (modeFilter !== 'all') params.append('mode', modeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/agent-hub/prompts?${params}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (promptId: string, template: string) => {
    try {
      await navigator.clipboard.writeText(template);
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and use reusable prompt templates for your AI workflows
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200">
            <Link
              href="/agent-hub"
              className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            >
              Agents
            </Link>
            <Link
              href="/agent-hub/prompts"
              className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Prompts
            </Link>
            <Link
              href="/agent-hub/instructions"
              className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            >
              Instructions
            </Link>
            <Link
              href="/agent-hub/chatmodes"
              className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            >
              Chat Modes
            </Link>
            <Link
              href="/mcp/tools"
              className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            >
              MCP Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <div className="space-y-2">
                    {(['all', 'system', 'user', 'assistant'] as ModeFilter[]).map((mode) => (
                      <label key={mode} className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value={mode}
                          checked={modeFilter === mode}
                          onChange={(e) => setModeFilter(e.target.value as ModeFilter)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {mode === 'all' ? 'All Modes' : mode}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prompts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isCopied={copiedId === prompt.id}
                onCopy={() => copyToClipboard(prompt.id, prompt.template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Prompt Card Component
function PromptCard({
  prompt,
  isCopied,
  onCopy,
}: {
  prompt: Prompt;
  isCopied: boolean;
  onCopy: () => void;
}) {
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'system':
        return 'bg-purple-100 text-purple-700';
      case 'user':
        return 'bg-blue-100 text-blue-700';
      case 'assistant':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getModeColor(prompt.mode)}`}>
                {prompt.mode}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{prompt.description}</p>
          </div>
        </div>

        {/* Template Preview */}
        <div className="mt-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-4 font-mono">
              {prompt.template}
            </pre>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{prompt.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Variables */}
        {prompt.variables && prompt.variables.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-1">Variables:</div>
            <div className="flex flex-wrap gap-1">
              {prompt.variables.map((variable: any) => (
                <span
                  key={variable.name}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-mono"
                >
                  {`{{${variable.name}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">{prompt.usage_count} uses</div>
          <div className="flex gap-2">
            <button
              onClick={onCopy}
              className={`p-2 rounded-lg transition-colors ${
                isCopied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Copy to clipboard"
            >
              {isCopied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <ClipboardDocumentIcon className="h-4 w-4" />
              )}
            </button>
            <Link
              href={`/agent-hub/prompts/${prompt.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
