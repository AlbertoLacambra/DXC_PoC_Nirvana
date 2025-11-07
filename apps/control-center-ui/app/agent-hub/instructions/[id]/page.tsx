'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Instruction {
  id: string;
  name: string;
  description: string;
  technology: string[];
  apply_to: string;
  tags: string[];
  file_path: string;
  content?: string;
  usage_count: number;
  created_at: string;
  metadata: {
    author?: string;
    version?: string;
    source_url?: string;
  };
}

export default function InstructionDetailPage() {
  const params = useParams();
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchInstructionDetails(params.id as string);
    }
  }, [params.id]);

  const fetchInstructionDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent-hub/instructions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInstruction(data);
        
        // Fetch content from file
        if (data.file_path) {
          const contentResponse = await fetch(`/${data.file_path}`);
          if (contentResponse.ok) {
            const contentText = await contentResponse.text();
            setContent(contentText);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching instruction:', error);
    } finally {
      setLoading(false);
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

  const downloadContent = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

  if (!instruction) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-900">Instruction Not Found</h2>
        <Link href="/agent-hub/instructions" className="mt-4 text-blue-600 hover:text-blue-700">
          Back to Instructions Browser
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
            href="/agent-hub/instructions"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Instructions Browser
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{instruction.name}</h1>
              <p className="mt-3 text-lg text-gray-600">{instruction.description}</p>

              {/* Technologies */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {instruction.technology}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instruction Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CodeBracketIcon className="h-5 w-5" />
                  Instruction Content
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(content || instruction.description)}
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
                    onClick={() => downloadContent(
                      content || instruction.description,
                      instruction.file_path.split('/').pop() || 'instruction.md'
                    )}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Download instruction"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {content ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto border border-gray-200">
                    {content}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-200">
                  {instruction.description}
                </div>
              )}
            </div>

            {/* Apply To */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">File Pattern</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <code className="text-sm text-gray-900 font-mono">{instruction.apply_to}</code>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                This instruction applies to files matching the pattern above.
              </p>
            </div>

            {/* Tags */}
            {instruction.tags && instruction.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {instruction.tags.map((tag) => (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Applications</div>
                  <div className="text-2xl font-bold text-gray-900">{instruction.usage_count}</div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Technologies</div>
                  <div className="text-xl font-bold text-gray-900">
                    {instruction.technology.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {instruction.metadata && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <div className="space-y-3 text-sm">
                  {instruction.metadata.author && (
                    <div>
                      <div className="text-gray-600">Author</div>
                      <div className="text-gray-900 font-medium">{instruction.metadata.author}</div>
                    </div>
                  )}
                  {instruction.metadata.version && (
                    <div>
                      <div className="text-gray-600">Version</div>
                      <div className="text-gray-900 font-medium">{instruction.metadata.version}</div>
                    </div>
                  )}
                  {instruction.metadata.source_url && (
                    <div>
                      <div className="text-gray-600">Source</div>
                      <a
                        href={instruction.metadata.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium break-all"
                      >
                        View Source
                      </a>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600">File Path</div>
                    <code className="text-xs text-gray-900 break-all">{instruction.file_path}</code>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => copyToClipboard(content || instruction.description)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  Copy Content
                </button>
                <button
                  onClick={() => downloadContent(
                    content || instruction.description,
                    instruction.file_path.split('/').pop() || 'instruction.md'
                  )}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
