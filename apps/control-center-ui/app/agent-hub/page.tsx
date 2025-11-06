'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  FunnelIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'dxc-custom' | 'community';
  tags: string[];
  usage_count: number;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

type ViewMode = 'grid' | 'list';
type CategoryFilter = 'all' | 'dxc-custom' | 'community';

export default function AgentHubPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [categoryFilter, searchQuery]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('isActive', 'true');
      params.append('isApproved', 'true');

      const response = await fetch(`/api/agent-hub/agents?${params}`);
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (agentId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(agentId)) {
        newFavorites.delete(agentId);
      } else {
        newFavorites.add(agentId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Hub</h1>
              <p className="mt-1 text-sm text-gray-500">
                Discover and execute specialized AI agents for your workflows
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name, description, or tags..."
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
                    Category
                  </label>
                  <div className="space-y-2">
                    {(['all', 'dxc-custom', 'community'] as CategoryFilter[]).map((cat) => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={categoryFilter === cat}
                          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {cat === 'all' ? 'All Agents' : cat.replace('-', ' ')}
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

      {/* Agent Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isFavorite={favorites.has(agent.id)}
                onToggleFavorite={() => toggleFavorite(agent.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isFavorite={favorites.has(agent.id)}
                onToggleFavorite={() => toggleFavorite(agent.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Agent Card Component
function AgentCard({ 
  agent, 
  isFavorite, 
  onToggleFavorite 
}: { 
  agent: Agent; 
  isFavorite: boolean; 
  onToggleFavorite: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                agent.category === 'dxc-custom'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {agent.category === 'dxc-custom' ? 'DXC' : 'Community'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{agent.description}</p>
          </div>
          <button
            onClick={onToggleFavorite}
            className="ml-2 text-gray-400 hover:text-yellow-500"
          >
            {isFavorite ? (
              <StarIconSolid className="h-5 w-5 text-yellow-500" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{agent.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {agent.usage_count} executions
          </div>
          <Link
            href={`/agent-hub/agents/${agent.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Agent List Item Component
function AgentListItem({ 
  agent, 
  isFavorite, 
  onToggleFavorite 
}: { 
  agent: Agent; 
  isFavorite: boolean; 
  onToggleFavorite: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                agent.category === 'dxc-custom'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {agent.category === 'dxc-custom' ? 'DXC Custom' : 'Community'}
              </span>
              {agent.tags && agent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">{agent.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              {agent.usage_count} executions
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onToggleFavorite}
              className="p-2 text-gray-400 hover:text-yellow-500"
            >
              {isFavorite ? (
                <StarIconSolid className="h-5 w-5 text-yellow-500" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
            </button>
            <Link
              href={`/agent-hub/agents/${agent.id}`}
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
