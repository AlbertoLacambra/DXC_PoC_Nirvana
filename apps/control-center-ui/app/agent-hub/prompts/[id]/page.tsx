'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  PlayIcon,
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
  content?: string; // Content loaded from markdown file
  variables: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
    default?: any;
  }>;
  usage_count: number;
  created_at: string;
  metadata: {
    author?: string;
    source_url?: string;
  };
}

export default function PromptDetailPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [renderedTemplate, setRenderedTemplate] = useState('');
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPromptDetails(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (prompt?.variables) {
      const defaults: Record<string, any> = {};
      prompt.variables.forEach((v) => {
        if (v.default !== undefined) {
          defaults[v.name] = v.default;
        }
      });
      setVariableValues(defaults);
    }
  }, [prompt]);

  const fetchPromptDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent-hub/prompts/${id}`);
      if (response.ok) {
        const json = await response.json();
        const data = json.data; // API returns {data: prompt}
        setPrompt(data);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!prompt) return;
    
    setRendering(true);
    try {
      const response = await fetch(`/api/agent-hub/prompts/${prompt.id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: variableValues }),
      });

      const data = await response.json();
      if (data.rendered_template) {
        setRenderedTemplate(data.rendered_template);
      }
    } catch (error) {
      console.error('Error rendering template:', error);
    } finally {
      setRendering(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadTemplate = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt?.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-900">Prompt Not Found</h2>
        <Link href="/agent-hub/prompts" className="mt-4 text-blue-600 hover:text-blue-700">
          Back to Prompt Library
        </Link>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/agent-hub/prompts"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Prompt Library
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{prompt.name}</h1>
                <span className={`px-3 py-1 text-sm rounded-full ${getModeColor(prompt.mode)}`}>
                  {prompt.mode}
                </span>
              </div>
              <p className="mt-3 text-lg text-gray-600">{prompt.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Template</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(prompt.content || prompt.template)}
                    className={`p-2 rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadTemplate(prompt.content || prompt.template)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Download template"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200">
                {prompt.content || prompt.template}
              </pre>
            </div>

            {/* Variables Input */}
            {prompt.variables && prompt.variables.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Variables</h2>
                <div className="space-y-4">
                  {prompt.variables.map((variable) => (
                    <div key={variable.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                        <span className="ml-2 text-xs text-gray-500">({variable.type})</span>
                      </label>
                      {variable.description && (
                        <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                      )}
                      {variable.type === 'array' || variable.type === 'object' ? (
                        <textarea
                          value={JSON.stringify(variableValues[variable.name] || variable.default || (variable.type === 'array' ? [] : {}), null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setVariableValues({ ...variableValues, [variable.name]: parsed });
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                      ) : (
                        <input
                          type={variable.type === 'number' ? 'number' : 'text'}
                          value={variableValues[variable.name] ?? variable.default ?? ''}
                          onChange={(e) =>
                            setVariableValues({
                              ...variableValues,
                              [variable.name]: variable.type === 'number' ? Number(e.target.value) : e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleRender}
                  disabled={rendering}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rendering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rendering...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5" />
                      Render Template
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Rendered Output */}
            {renderedTemplate && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Rendered Output</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(renderedTemplate)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => downloadTemplate(renderedTemplate)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200">
                  {renderedTemplate}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Uses</div>
                  <div className="text-2xl font-bold text-gray-900">{prompt.usage_count}</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {prompt.metadata && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <div className="space-y-3 text-sm">
                  {prompt.metadata.author && (
                    <div>
                      <div className="text-gray-600">Author</div>
                      <div className="text-gray-900 font-medium">{prompt.metadata.author}</div>
                    </div>
                  )}
                  {prompt.metadata.source_url && (
                    <div>
                      <div className="text-gray-600">Source</div>
                      <a
                        href={prompt.metadata.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium break-all"
                      >
                        View Source
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
