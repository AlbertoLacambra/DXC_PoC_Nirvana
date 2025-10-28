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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-3">🚀</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Vibe Coding</h2>
              <p className="text-gray-600 text-sm">
                Generación de proyectos completos desde lenguaje natural
              </p>
            </div>
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
