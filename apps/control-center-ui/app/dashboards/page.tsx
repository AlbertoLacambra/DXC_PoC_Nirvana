'use client';

import { useState, useEffect } from 'react';

type DashboardType = 'drift' | 'pipelines';

export default function DashboardsPage() {
  const [activeDashboard, setActiveDashboard] = useState<DashboardType>('drift');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/dxc-logo.svg" 
                alt="DXC Technology" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/dxc-logo.png';
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="h-10 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dashboards
                </h1>
                <p className="text-sm text-gray-500">DXC Cloud Mind - Nirvana</p>
              </div>
            </div>
            <a 
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>

      {/* Dashboard Selector */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveDashboard('drift')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeDashboard === 'drift'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔄</span>
                <div className="text-left">
                  <div className="text-sm font-bold">DRIFT Monitor</div>
                  <div className="text-xs opacity-80">Infraestructura vs Código</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveDashboard('pipelines')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeDashboard === 'pipelines'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">⚙️</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Pipeline Status</div>
                  <div className="text-xs opacity-80">Estado de Ejecución</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {activeDashboard === 'drift' && <DriftDashboard />}
          {activeDashboard === 'pipelines' && <PipelinesDashboard />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center">
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DXC Technology. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Developed by <span className="font-semibold text-blue-600">DXC Cloud Team</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Componente DRIFT Dashboard
function DriftDashboard() {
  const [driftData, setDriftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDriftData();
  }, []);

  const fetchDriftData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/drift');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener datos de DRIFT');
      }
      
      const data = await response.json();
      setDriftData(data);
    } catch (err: any) {
      console.error('Error fetching drift data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Cargando datos de DRIFT...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error al cargar datos</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchDriftData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!driftData || !driftData.stats) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">⚠️ No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const stats = driftData.stats;
  const driftPercentage = ((stats.drifted / stats.totalResources) * 100).toFixed(1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🔄 DRIFT Monitor
          </h2>
          <p className="text-gray-600">
            Estado de sincronización entre infraestructura y código Terraform
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Última comprobación</p>
          <p className="text-sm font-mono text-gray-700">
            {driftData.lastCheck ? new Date(driftData.lastCheck).toLocaleString('es-ES') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-700">{driftData.totalResources}</div>
          <div className="text-sm text-blue-600 mt-1">Total Recursos</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-700">{driftData.inSync}</div>
          <div className="text-sm text-green-600 mt-1">✅ En Sincronía</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="text-3xl font-bold text-orange-700">{driftData.drifted}</div>
          <div className="text-sm text-orange-600 mt-1">⚠️ Con DRIFT</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-gray-700">{driftData.unmanaged}</div>
          <div className="text-sm text-gray-600 mt-1">❓ Sin Gestionar</div>
        </div>
      </div>

      {/* Gráfico de Estado */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado General</h3>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 h-full bg-green-500 transition-all"
            style={{ width: `${(driftData.inSync / driftData.totalResources) * 100}%` }}
          ></div>
          <div 
            className="absolute h-full bg-orange-500 transition-all"
            style={{ 
              left: `${(driftData.inSync / driftData.totalResources) * 100}%`,
              width: `${(driftData.drifted / driftData.totalResources) * 100}%` 
            }}
          ></div>
          <div 
            className="absolute right-0 h-full bg-gray-400 transition-all"
            style={{ width: `${(driftData.unmanaged / driftData.totalResources) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>✅ {((driftData.inSync / driftData.totalResources) * 100).toFixed(1)}% Sincronizado</span>
          <span>⚠️ {driftPercentage}% DRIFT</span>
          <span>❓ {((driftData.unmanaged / driftData.totalResources) * 100).toFixed(1)}% Sin Gestionar</span>
        </div>
      </div>

      {/* Recursos con DRIFT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recursos con DRIFT Detectado ({driftData.driftedResources?.length || 0})
        </h3>
        <div className="space-y-3">
          {driftData.driftedResources && driftData.driftedResources.length > 0 ? (
            driftData.driftedResources.map((resource: any, idx: number) => (
            <div 
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${
                      resource.severity === 'critical' ? '🔴' :
                      resource.severity === 'warning' ? '🟡' : '🔵'
                    }`}></span>
                    <span className="font-mono text-sm font-semibold text-gray-800">
                      {resource.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      resource.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      resource.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {resource.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{resource.type}</p>
                  <p className="text-sm text-gray-700">{resource.drift}</p>
                </div>
                <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700">✅ No se detectó drift. Toda la infraestructura está sincronizada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={fetchDriftData}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
        >
          🔄 Ejecutar Drift Detection
        </button>
        <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
          ✅ Aplicar Correcciones
        </button>
        <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
          📥 Exportar Reporte
        </button>
      </div>
    </div>
  );
}

// Componente Pipelines Dashboard
function PipelinesDashboard() {
  const [pipelinesData, setPipelinesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelinesData();
    // Auto-refresh cada 30 segundos para pipelines en ejecución
    const interval = setInterval(fetchPipelinesData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPipelinesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/pipelines');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener datos de pipelines');
      }
      
      const data = await response.json();
      setPipelinesData(data);
    } catch (err: any) {
      console.error('Error fetching pipelines data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pipelinesData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-gray-600">Cargando datos de pipelines...</p>
        </div>
      </div>
    );
  }

  if (error && !pipelinesData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error al cargar datos</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchPipelinesData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!pipelinesData || !pipelinesData.stats) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">⚠️ No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const stats = pipelinesData.stats;
  const recentRuns = pipelinesData.recentRuns || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🔄';
      case 'succeeded': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '⛔';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'succeeded': return 'bg-green-100 text-green-700 border-green-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ⚙️ Pipeline Status
          </h2>
          <p className="text-gray-600">
            Estado en tiempo real de las pipelines CI/CD
          </p>
          {pipelinesData.lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: {new Date(pipelinesData.lastUpdate).toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <button 
          onClick={fetchPipelinesData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-700">{pipelinesData.totalPipelines}</div>
          <div className="text-sm text-purple-600 mt-1">Total Pipelines</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-700">{pipelinesData.running}</div>
          <div className="text-sm text-blue-600 mt-1">🔄 En Ejecución</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-700">{pipelinesData.succeeded}</div>
          <div className="text-sm text-green-600 mt-1">✅ Exitosas</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="text-3xl font-bold text-red-700">{pipelinesData.failed}</div>
          <div className="text-sm text-red-600 mt-1">❌ Fallidas</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-gray-700">{pipelinesData.cancelled}</div>
          <div className="text-sm text-gray-600 mt-1">⛔ Canceladas</div>
        </div>
      </div>

      {/* Ejecuciones Recientes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ejecuciones Recientes ({recentRuns.length})
        </h3>
        {recentRuns.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <span className="text-4xl mb-2 block">⚠️</span>
            <p className="text-yellow-700 font-medium">No hay ejecuciones recientes</p>
            <p className="text-yellow-600 text-sm mt-1">Las pipelines aparecerán aquí cuando se ejecuten</p>
          </div>
        ) : (
          <div className="space-y-3">
          {recentRuns.map((run: any, idx: number) => (
            <div 
              key={idx}
              className={`border rounded-lg p-4 transition-all ${
                run.status === 'running' ? 'bg-blue-50 border-blue-200 animate-pulse' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl">{getStatusIcon(run.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-gray-800">
                        {run.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(run.status)}`}>
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>📌 {run.branch}</span>
                      <span>🔗 {run.commit}</span>
                      <span>⏰ {run.startedAt}</span>
                      <span>⏱️ {run.duration}</span>
                      <span>👤 {run.triggeredBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                    📄 Logs
                  </button>
                  {run.status === 'running' && (
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                      ⛔ Cancelar
                    </button>
                  )}
                  {run.status === 'failed' && (
                    <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                      🔄 Reintentar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Gráfico de Éxito */}
      {stats.totalPipelines > 0 && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasa de Éxito</h3>
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 h-full bg-green-500"
              style={{ width: `${(stats.succeeded / stats.totalPipelines) * 100}%` }}
            ></div>
            <div 
              className="absolute h-full bg-red-500"
              style={{ 
                left: `${(stats.succeeded / stats.totalPipelines) * 100}%`,
                width: `${(stats.failed / stats.totalPipelines) * 100}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>✅ {((stats.succeeded / stats.totalPipelines) * 100).toFixed(1)}% Exitosas</span>
            <span>❌ {((stats.failed / stats.totalPipelines) * 100).toFixed(1)}% Fallidas</span>
          </div>
        </div>
      )}
    </div>
  );
}
