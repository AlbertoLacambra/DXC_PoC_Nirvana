'use client';

import { useState } from 'react';
import { useKnowledgePortal, KnowledgeChunk } from '@/lib/knowledge-portal-client';

/**
 * Componente de búsqueda en Knowledge Portal
 * Permite buscar en la documentación indexada sin configurar Dify UI
 */
export default function KnowledgeSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  const { search } = useKnowledgePortal();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await search(query, {
        topK: 5,
        threshold: 0.50,
      });

      setResults(result.chunks);
      setExecutionTime(result.execution_time_ms);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Error al buscar en la documentación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
            >
              ← Volver
            </a>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 Knowledge Portal
          </h1>
          <p className="text-gray-600">
            Busca en la documentación técnica de DXC Cloud Nirvana
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {results.length > 0 && `${results.length} resultados encontrados en ${executionTime}ms`}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: ¿Cómo configurar Azure OpenAI en Dify?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🔍 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((chunk, index) => (
              <div
                key={chunk.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {index + 1}. {chunk.file_path.split('/').pop()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      📁 {chunk.file_path}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {(chunk.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 rounded p-4 mb-3">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {chunk.content.substring(0, 400)}
                    {chunk.content.length > 400 && '...'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📄 {chunk.source_type}</span>
                    {chunk.language && <span>🌐 {chunk.language}</span>}
                    {chunk.category && <span>🏷️ {chunk.category}</span>}
                    <span>
                      📊 Chunk {chunk.chunk_index + 1}/{chunk.total_chunks}
                    </span>
                  </div>
                  <a
                    href={`https://github.com/AlbertoLacambra/DXC_PoC_Nirvana/blob/master/${chunk.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    Ver en GitHub →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              No se encontraron resultados para "{query}"
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta reformular tu pregunta o usa términos más generales
            </p>
          </div>
        )}

        {/* Initial State */}
        {!query && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg mb-4">
              👋 Haz una pregunta para buscar en la documentación
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-sm text-gray-500">📌 Ejemplos de búsquedas:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• ¿Cómo configurar Azure OpenAI en Dify?</li>
                <li>• Explica la arquitectura hub-spoke del proyecto</li>
                <li>• ¿Qué es el FinOps Optimizer y cómo funciona?</li>
                <li>• Muestra código del componente DifyChatButton</li>
                <li>• ¿Cómo se configura el drift detection?</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 Esta búsqueda usa <strong>embeddings de Azure OpenAI</strong> y <strong>PostgreSQL pgvector</strong>
          </p>
          <p className="mt-1">
            📊 Base de datos: 637 chunks indexados | Threshold: 0.50 | Top K: 5
          </p>
        </div>
      </div>
    </div>
  );
}
