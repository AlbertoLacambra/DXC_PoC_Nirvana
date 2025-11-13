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
  const agentEndpoint = 'https://sre-agent-mindful-moments--b003a886.5472589d.eastus2.azuresre.ai';
  const agentName = 'sre-agent-mindful-moments';
  const resourceGroup = 'rg-mindful-moments-dev';
  
  return (
    <div className="space-y-6">
      {/* Hero Section with Live Agent Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold">Azure SRE Agent</h2>
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-blue-100 text-lg mb-4">
              AI-powered Site Reliability Engineering
            </p>
            <div className="space-y-2 text-sm text-blue-100">
              <p className="flex items-center gap-2">
                <span>🤖</span>
                <span><strong>Agent:</strong> {agentName}</span>
              </p>
              <p className="flex items-center gap-2">
                <span>📦</span>
                <span><strong>Monitoring:</strong> {resourceGroup}</span>
              </p>
              <p className="flex items-center gap-2">
                <span>🌍</span>
                <span><strong>Region:</strong> East US 2</span>
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <a
                href={agentEndpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>💬</span>
                <span>Open Agent Chat</span>
                <span>→</span>
              </a>
              <a
                href="https://portal.azure.com/#view/Microsoft_Azure_SRE/SREAgentBlade/agentName/sre-agent-mindful-moments"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-40 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <span>⚙️</span>
                <span>Azure Portal</span>
              </a>
            </div>
          </div>
          <div className="text-6xl">🛡️</div>
        </div>
      </div>

      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔍</span>
            <span className="text-xs text-gray-500">Real-time</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">Active</div>
          <div className="text-xs text-gray-600">Agent Status</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-xs text-gray-500">Monitored</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">15+</div>
          <div className="text-xs text-gray-600">Azure Resources</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚨</span>
            <span className="text-xs text-gray-500">Last 24h</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">0</div>
          <div className="text-xs text-gray-600">Active Incidents</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-gray-500">Avg</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">45s</div>
          <div className="text-xs text-gray-600">Response Time</div>
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

      {/* Azure SRE Agent Features */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🤖</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              AI-Powered Incident Management
            </h3>
            <p className="text-blue-700 mb-4">
              Your Azure SRE Agent uses advanced AI to analyze metrics, logs, and traces from 
              Application Insights and Azure Monitor to provide automated root cause analysis 
              and intelligent remediation suggestions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                  <span>🔍</span>
                  <span>Automated RCA</span>
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  Correlates metrics, logs, and traces to identify root causes
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                  <span>📊</span>
                  <span>Data Sources</span>
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  Azure Monitor, App Insights, Log Analytics integrated
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                  <span>�</span>
                  <span>Natural Language</span>
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  Ask questions in plain English to investigate issues
                </div>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                  <span>⚡</span>
                  <span>Auto-Remediation</span>
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  Autonomous actions with human-in-the-loop approval
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

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <span>🎯</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open(agentEndpoint, '_blank')}
            className="bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold text-green-900">Ask the Agent</div>
            <div className="text-xs text-green-600 mt-1">
              "What resources are you managing?"
            </div>
          </button>
          
          <button
            onClick={() => window.open(agentEndpoint, '_blank')}
            className="bg-white hover:bg-red-50 border-2 border-red-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold text-red-900">Investigate Issues</div>
            <div className="text-xs text-red-600 mt-1">
              "Why am I seeing 5xx errors?"
            </div>
          </button>
          
          <button
            onClick={() => window.open(agentEndpoint, '_blank')}
            className="bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-blue-900">Get Insights</div>
            <div className="text-xs text-blue-600 mt-1">
              "Show me app health summary"
            </div>
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold text-green-900">Azure SRE Agent - Ready</div>
            <div className="text-sm text-green-700 mt-1">
              Agent deployed in <strong>East US 2</strong>. Monitoring <strong>{resourceGroup}</strong> with AI-powered root cause analysis and autonomous incident response.
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
