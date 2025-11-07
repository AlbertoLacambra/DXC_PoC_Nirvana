'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-6xl">
        {/* Header con Logo y Título */}
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Logo DXC */}
            <img 
              src="/dxc-logo.jpg" 
              alt="DXC Technology" 
              className="h-12 w-auto"
            />
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-800">
                DXC Cloud Mind
              </h1>
              <p className="text-xl text-blue-600 font-semibold">Nirvana</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plataforma unificada de desarrollo Cloud impulsada por IA
          </p>
        </div>
        
        {/* Integration Info */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💬</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Chatbot Integrado - Nirvana Tech Support Assistant
                </h3>
                <p className="text-gray-700 mb-3">
                  El chatbot flotante está disponible en <strong>todas las páginas</strong> usando el widget embebido de Dify. 
                  Busca el botón verde en la esquina inferior derecha 🤖
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-300 text-green-700 rounded-lg font-semibold">
                  ✅ Widget Activo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos Principales */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-blue-600">🎯</span>
            Observabilidad & Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a 
              href="/dashboards"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Dashboards</h2>
              <p className="text-gray-600 text-sm">
                Visualización de métricas, DRIFT y Pipelines
              </p>
            </a>
            
            <a 
              href="/sre-agent"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-blue-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">🛡️</div>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  AZURE MCP
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">SRE Agent</h2>
              <p className="text-gray-700 text-sm">
                Site Reliability Engineering con Azure AI
              </p>
            </a>
            
            <a 
              href="/finops"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">💰</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">FinOps</h2>
              <p className="text-gray-600 text-sm">
                Analytics y optimización de costos Cloud
              </p>
            </a>
          </div>
        </div>

        {/* Módulos de Desarrollo */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-purple-600">⚡</span>
            Desarrollo & Automatización
          </h3>
          
          {/* Featured: Agent Hub - NEW SECTION */}
          <div className="mb-6">
            <a 
              href="/agent-hub"
              className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-5xl">🤖</div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold">Agent Hub</h2>
                        <span className="bg-yellow-400 text-gray-900 text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                          ✨ NEW
                        </span>
                      </div>
                      <p className="text-indigo-100 text-lg">
                        Catálogo unificado de agentes, prompts, instrucciones y chat modes especializados
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 flex-wrap">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      🎯 2 Agents
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      💬 11 Prompts
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      📋 16 Instructions
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      🎭 13 Chat Modes
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      🔧 17 MCP Tools
                    </span>
                  </div>
                </div>
                <div className="text-6xl opacity-80 hidden lg:block">
                  →
                </div>
              </div>
            </a>
          </div>

          {/* Featured: Project Development Hub */}
          <div className="mb-6">
            <a 
              href="/development"
              className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-5xl">🚀</div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">Project Development Hub</h2>
                      <p className="text-purple-100 text-lg">
                        Centro unificado de desarrollo basado en especificaciones
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      📚 Spec Library
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      ⚡ Project Generator
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold">
                      🎯 6 Project Types
                    </span>
                  </div>
                </div>
                <div className="text-6xl opacity-80 hidden lg:block">
                  →
                </div>
              </div>
            </a>
          </div>

          {/* Other Development Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MCP Tools & Servers */}
            <a 
              href="/mcp/tools"
              className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-cyan-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">🔧</div>
                <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  MCP
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">MCP Tools</h2>
              <p className="text-gray-700 text-sm">
                17 herramientas MCP en 4 servidores (Azure, AKS, DevOps, Docs)
              </p>
            </a>

            {/* Spec-Driven Project Development */}
            <a 
              href="/projects/new"
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-purple-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">🚀</div>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  NEW
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">New Project</h2>
              <p className="text-gray-700 text-sm">
                Crear proyectos desde specs reutilizables con wizard interactivo
              </p>
            </a>

            {/* Spec Library Browser */}
            <a 
              href="/specs/browse"
              className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-indigo-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">📚</div>
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  LIBRARY
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Spec Library</h2>
              <p className="text-gray-700 text-sm">
                Explorar especificaciones técnicas reutilizables y templates
              </p>
            </a>

            {/* Knowledge Portal */}
            <a 
              href="/knowledge-search"
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-green-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">🧠</div>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  VECTOR DB
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Knowledge Portal</h2>
              <p className="text-gray-700 text-sm">
                Búsqueda semántica en documentación técnica con pgvector
              </p>
            </a>
          </div>
        </div>

        {/* Footer con Copyright */}
        <footer className="mt-16 pb-8 text-center">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DXC Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Developed by <span className="font-semibold text-blue-600">DXC Iberia Cloud Team</span>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
