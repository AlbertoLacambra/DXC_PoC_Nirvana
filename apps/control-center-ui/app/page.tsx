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
              src="/dxc-logo.svg" 
              alt="DXC Technology" 
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback si no encuentra el logo SVG, intenta PNG
                e.currentTarget.src = '/dxc-logo.png';
                e.currentTarget.onerror = null; // Evita loop infinito
              }}
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
        
        {/* Test Button */}
        <div className="mb-12 text-center">
          <a 
            href="/test-chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            🧪 Probar Chat con Dify
          </a>
        </div>

        {/* Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <a 
            href="/dashboards"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Dashboards</h2>
            <p className="text-gray-600">
              Visualización de métricas, DRIFT y Pipelines
            </p>
          </a>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Vibe Coding</h2>
            <p className="text-gray-600">
              Generación de proyectos completos desde lenguaje natural
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Knowledge Portal</h2>
            <p className="text-gray-600">
              Asistente RAG con documentación técnica
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">💰</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">FinOps</h2>
            <p className="text-gray-600">
              Analytics y optimización de costos
            </p>
          </div>
        </div>

        {/* Footer con Copyright */}
        <footer className="mt-16 pb-8 text-center">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DXC Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Developed by <span className="font-semibold text-blue-600">DXC Cloud Team</span>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
