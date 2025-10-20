'use client';

import { useState } from 'react';

type SRETab = 'overview' | 'incidents' | 'observability' | 'recommendations';

export default function SREAgentPage() {
  const [activeTab, setActiveTab] = useState<SRETab>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/dxc-logo.jpg" 
                alt="DXC Technology" 
                className="h-10 w-auto"
              />
              <div className="h-10 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">🛡️</span>
                  Azure SRE Agent
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Powered by Azure AI & Microsoft Model Context Protocol
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                AZURE MCP
              </span>
              <a 
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                ← Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Overview</div>
                  <div className="text-xs opacity-70">Dashboard Principal</div>
                </div>
              </div>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'incidents'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Incidents</div>
                  <div className="text-xs opacity-70">Response & RCA</div>
                </div>
              </div>
              {activeTab === 'incidents' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('observability')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'observability'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Observability</div>
                  <div className="text-xs opacity-70">Metrics & Logs</div>
                </div>
              </div>
              {activeTab === 'observability' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'recommendations'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Recommendations</div>
                  <div className="text-xs opacity-70">Reliability & Best Practices</div>
                </div>
              </div>
              {activeTab === 'recommendations' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'incidents' && <IncidentsTab />}
        {activeTab === 'observability' && <ObservabilityTab />}
        {activeTab === 'recommendations' && <RecommendationsTab />}
      </div>
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">Azure SRE Agent</h2>
            <p className="text-blue-100 text-lg mb-4">
              Site Reliability Engineering impulsado por Azure AI
            </p>
            <p className="text-blue-200 text-sm max-w-2xl">
              El Azure SRE Agent utiliza el <strong>Model Context Protocol (MCP)</strong> de Microsoft 
              para proporcionar capacidades avanzadas de observabilidad, gestión de incidentes y 
              análisis de confiabilidad. Integrado directamente con Azure Monitor, Application Insights 
              y Azure Resource Graph.
            </p>
          </div>
          <div className="text-6xl">🛡️</div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="text-3xl mb-3">🚨</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Incident Response</h3>
          <p className="text-gray-600 text-sm mb-3">
            Detección automática de incidentes, triage inteligente y recomendaciones de resolución.
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Root Cause Analysis con AI</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Correlation entre métricas y logs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Runbooks automatizados</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Observability Insights</h3>
          <p className="text-gray-600 text-sm mb-3">
            Análisis profundo de métricas, logs y trazas distribuidas en tiempo real.
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Azure Monitor integration</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Application Insights analytics</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Distributed tracing</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="text-3xl mb-3">💡</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Reliability Recommendations</h3>
          <p className="text-gray-600 text-sm mb-3">
            Sugerencias proactivas para mejorar la confiabilidad y disponibilidad.
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>SLI/SLO monitoring</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Error budget tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Best practices validation</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Azure MCP Integration */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔌</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Model Context Protocol (MCP) Integration
            </h3>
            <p className="text-blue-700 mb-4">
              El Azure SRE Agent utiliza el MCP de Microsoft para proporcionar contexto rico 
              y capacidades de razonamiento avanzadas a través de Azure OpenAI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm">🔍 Context Providers</div>
                <div className="text-blue-600 text-xs mt-1">
                  Azure Monitor, App Insights, Resource Graph, Log Analytics
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm">🤖 AI Capabilities</div>
                <div className="text-blue-600 text-xs mt-1">
                  GPT-4 Turbo, Semantic search, Anomaly detection
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm">📊 Data Sources</div>
                <div className="text-blue-600 text-xs mt-1">
                  Metrics, Logs, Traces, Events, Alerts
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm">⚡ Actions</div>
                <div className="text-blue-600 text-xs mt-1">
                  Auto-remediation, Scaling, Alerting, Runbooks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Link */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📚</span>
          Recursos y Documentación
        </h3>
        <div className="space-y-3">
          <a 
            href="https://techcommunity.microsoft.com/blog/appsonazureblog/expanding-the-public-preview-of-the-azure-sre-agent/4458514"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">
                  Azure SRE Agent - Public Preview
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Microsoft Tech Community - Announcement & Features
                </div>
              </div>
              <span className="text-blue-600">→</span>
            </div>
          </a>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800 text-sm">🔧 Getting Started</div>
              <div className="text-xs text-gray-600 mt-1">
                Configure Azure credentials, enable MCP, deploy agent
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800 text-sm">📖 Best Practices</div>
              <div className="text-xs text-gray-600 mt-1">
                SRE principles, SLO management, incident response
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <div className="font-semibold text-yellow-900">Integración en Progreso</div>
            <div className="text-sm text-yellow-700 mt-1">
              El Azure SRE Agent está en fase de integración. Las capacidades completas estarán 
              disponibles próximamente una vez configurado el MCP y las credenciales de Azure.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Incidents Tab
// ============================================

function IncidentsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Incident Management</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Próximamente: Detección automática de incidentes, análisis de causa raíz con AI, 
            y recomendaciones de resolución basadas en histórico.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Observability Tab
// ============================================

function ObservabilityTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Observability & Performance</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Próximamente: Análisis en tiempo real de métricas de Azure Monitor, 
            Application Insights y Log Analytics con correlación inteligente.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Recommendations Tab
// ============================================

function RecommendationsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Reliability Recommendations</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Próximamente: Recomendaciones proactivas para mejorar SLIs, 
            optimizar error budgets y aplicar best practices de SRE.
          </p>
        </div>
      </div>
    </div>
  );
}
