'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  CodeBracketIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Instruction {
  id: string;
  name: string;
  description: string;
  technology: string[];
  apply_to: string;
  tags: string[];
  file_path: string;
  usage_count: number;
  created_at: string;
}

export default function InstructionsBrowserPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedTechs, setExpandedTechs] = useState<Set<string>>(new Set());

  // Technology categories for filtering
  const techCategories = {
    'Languages': ['Python', 'TypeScript', 'JavaScript', 'Java', '.NET', 'Go'],
    'Cloud': ['Azure', 'AWS', 'GCP', 'Kubernetes', 'Docker'],
    'Infrastructure': ['Terraform', 'Ansible', 'Helm', 'CloudFormation'],
    'Databases': ['PostgreSQL', 'MongoDB', 'Redis', 'SQL Server'],
    'Frontend': ['React', 'Next.js', 'Vue', 'Angular'],
    'DevOps': ['CI/CD', 'Jenkins', 'GitHub Actions', 'ArgoCD'],
  };

  useEffect(() => {
    fetchInstructions();
  }, [selectedTechnologies, searchQuery]);

  const fetchInstructions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      selectedTechnologies.forEach(tech => params.append('technology', tech));

      const response = await fetch(`/api/agent-hub/instructions?${params}`);
      const data = await response.json();
      setInstructions(data.instructions || []);
    } catch (error) {
      console.error('Error fetching instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedTechs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Instructions Browser</h1>
            <p className="mt-1 text-sm text-gray-500">
              Discover coding standards and best practices for various technologies
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
            <Link href="/agent-hub/instructions" className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
              Instructions
            </Link>
            <Link href="/agent-hub/chatmodes" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent">
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
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search instructions by name, description, or technology..."
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
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Selected Technologies */}
          {selectedTechnologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => toggleTechnology(tech)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                >
                  {tech}
                  <span className="text-blue-900">×</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedTechnologies([])}
                className="px-3 py-1 text-gray-600 text-sm hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Technology Filters</h3>
                <div className="space-y-2">
                  {Object.entries(techCategories).map(([category, techs]) => (
                    <div key={category}>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                      >
                        <span>{category}</span>
                        {expandedTechs.has(category) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      {expandedTechs.has(category) && (
                        <div className="ml-4 space-y-1 mb-2">
                          {techs.map((tech) => (
                            <label key={tech} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={selectedTechnologies.includes(tech)}
                                onChange={() => toggleTechnology(tech)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                              />
                              <span className="ml-2 text-gray-600">{tech}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : instructions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No instructions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {instructions.map((instruction) => (
                  <InstructionCard key={instruction.id} instruction={instruction} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Instruction Card Component
function InstructionCard({ instruction }: { instruction: Instruction }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{instruction.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{instruction.description}</p>

            {/* Technologies */}
            <div className="mt-4 flex flex-wrap gap-2">
              {instruction.technology.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Apply To */}
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Applies to:</span>{' '}
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">{instruction.apply_to}</code>
            </div>

            {/* Tags */}
            {instruction.tags && instruction.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {instruction.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">{instruction.usage_count} applications</div>
          <Link
            href={`/agent-hub/instructions/${instruction.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
