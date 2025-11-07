'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface ChatMode {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  model_config: {
    model: string;
    temperature?: number;
    max_tokens?: number;
  };
  tags: string[];
  tools: string[];
  usage_count: number;
  created_at: string;
}

export default function ChatModesPage() {
  const [chatModes, setChatModes] = useState<ChatMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extracted unique tags from all chat modes
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchChatModes();
  }, [searchQuery]);

  const fetchChatModes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/agent-hub/chatmodes?${params}`);
      const data = await response.json();
      setChatModes(data.chatmodes || []);

      // Extract unique tags
      const tags = new Set<string>();
      (data.chatmodes || []).forEach((mode: ChatMode) => {
        mode.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error fetching chat modes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredChatModes = chatModes.filter(mode => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(tag => mode.tags?.includes(tag));
  });

  const getRoleCategory = (tags: string[]) => {
    const roleCategories = {
      'Cloud Architects': ['azure', 'cloud', 'architecture'],
      'Developers': ['typescript', 'python', 'frontend', 'backend'],
      'DevOps': ['devops', 'terraform', 'kubernetes'],
      'Data': ['dba', 'database', 'data-science'],
      'Security': ['security'],
    };

    for (const [category, keywords] of Object.entries(roleCategories)) {
      if (tags.some(tag => keywords.some(k => tag.toLowerCase().includes(k)))) {
        return category;
      }
    }
    return 'Other';
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
            <h1 className="text-3xl font-bold text-gray-900">Chat Modes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Start specialized conversations with role-based AI assistants
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
            <Link href="/agent-hub/chatmodes" className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
              Chat Modes
            </Link>
            <Link href="/mcp/tools" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
              MCP Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search chat modes by name, description, or tags..."
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                >
                  {tag}
                  <span className="text-blue-900">×</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1 text-gray-600 text-sm hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredChatModes.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chat modes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatModes.map((chatMode) => (
              <ChatModeCard key={chatMode.id} chatMode={chatMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Chat Mode Card Component
function ChatModeCard({ chatMode }: { chatMode: ChatMode }) {
  const getCategoryColor = (tags: string[]) => {
    if (tags.some(t => t.includes('azure') || t.includes('cloud'))) {
      return 'from-blue-500 to-cyan-500';
    }
    if (tags.some(t => t.includes('developer') || t.includes('typescript'))) {
      return 'from-purple-500 to-pink-500';
    }
    if (tags.some(t => t.includes('devops') || t.includes('terraform'))) {
      return 'from-green-500 to-emerald-500';
    }
    if (tags.some(t => t.includes('dba') || t.includes('database'))) {
      return 'from-orange-500 to-red-500';
    }
    if (tags.some(t => t.includes('security'))) {
      return 'from-red-500 to-rose-500';
    }
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryColor(chatMode.tags)}`}></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              {chatMode.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{chatMode.description}</p>
          </div>
        </div>

        {/* Model Info */}
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-100 rounded">
            {chatMode.model_config.model}
          </span>
          {chatMode.model_config.temperature !== undefined && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              temp: {chatMode.model_config.temperature}
            </span>
          )}
        </div>

        {/* Tags */}
        {chatMode.tags && chatMode.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chatMode.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                {tag}
              </span>
            ))}
            {chatMode.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{chatMode.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Tools */}
        {chatMode.tools && chatMode.tools.length > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            <span className="font-medium">Tools:</span> {chatMode.tools.length} available
          </div>
        )}

        {/* Stats and Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">{chatMode.usage_count} sessions</div>
          <Link
            href={`/agent-hub/chatmodes/${chatMode.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
