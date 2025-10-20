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
  const [expandedResources, setExpandedResources] = useState<Set<number>>(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [applyingFix, setApplyingFix] = useState(false);
  const [prResult, setPrResult] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDriftData();
    
    // Auto-refresh cada 60 segundos si está habilitado
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDriftData();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const toggleResourceDetails = (index: number) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleApplyCorrections = async () => {
    if (!driftData?.driftedResources || driftData.driftedResources.length === 0) {
      alert('No hay recursos con drift para corregir');
      return;
    }

    try {
      setApplyingFix(true);
      
      // Obtener recomendaciones
      const response = await fetch('/api/drift/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          driftedResources: driftData.driftedResources,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al analizar correcciones');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setShowApplyModal(true);
    } catch (err: any) {
      console.error('Error al obtener recomendaciones:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setApplyingFix(false);
    }
  };

  const handleConfirmApply = async () => {
    try {
      setApplyingFix(true);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const branchName = `drift-fix-${timestamp}`;
      const commitMessage = `fix: Apply Terraform drift corrections - ${driftData.driftedResources.length} resource(s)`;
      const prTitle = `🔧 Drift Correction: ${driftData.driftedResources.length} Resource(s)`;
      
      const prDescription = `## 🎯 Drift Detection & Correction
      
**Detected:** ${new Date().toLocaleString()}
**Resources with Drift:** ${driftData.driftedResources.length}

### 📋 Summary
${recommendations.summary}

**Risk Level:** \`${recommendations.risk.toUpperCase()}\`

### 🔄 Changes to Apply

${recommendations.actions.map((action: any, idx: number) => `
#### ${idx + 1}. ${action.resource}
- **Type:** ${action.type}
- **Action:** ${action.actionType}
- **Risk:** \`${action.risk}\`
- **Description:** ${action.description}

**Changes:**
\`\`\`
${action.changes.slice(0, 5).join('\n')}
\`\`\`

**Recommendation:** ${action.recommendation}
`).join('\n---\n')}

### ✅ Overall Recommendation
${recommendations.recommendation}

---
*This PR was automatically generated by DXC Cloud Mind - Nirvana Dashboard*
*Please review carefully before merging, especially for high-risk changes.*
`;

      const response = await fetch('/api/drift/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-pr',
          branchName,
          commitMessage,
          prTitle,
          prDescription,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPrResult(result);
        const autoRefreshMsg = autoRefresh 
          ? '\n\n⏱️ El dashboard se actualizará automáticamente en 1 minuto.\nO puedes hacer click en "🔄 Ejecutar Drift Detection" para actualizar inmediatamente después del merge.'
          : '\n\n💡 Tip: Activa el auto-refresh para ver los cambios automáticamente después del merge.';
        
        alert(`✅ Pull Request creada exitosamente!\n\nBranch: ${result.branch}\nURL: ${result.prUrl || 'Ver en GitHub'}${autoRefreshMsg}`);
        setShowApplyModal(false);
        
        // Refrescar inmediatamente para mostrar el estado actual
        setTimeout(() => fetchDriftData(), 2000);
      } else {
        throw new Error(result.error || 'Error al crear Pull Request');
      }
    } catch (err: any) {
      console.error('Error al aplicar correcciones:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setApplyingFix(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Auto-refresh (1 min)</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Última comprobación</p>
            <p className="text-sm font-mono text-gray-700">
              {driftData.lastCheck ? new Date(driftData.lastCheck).toLocaleString('es-ES') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-700">{stats.totalResources}</div>
          <div className="text-sm text-blue-600 mt-1">Total Recursos</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-700">{stats.inSync}</div>
          <div className="text-sm text-green-600 mt-1">✅ En Sincronía</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="text-3xl font-bold text-orange-700">{stats.drifted}</div>
          <div className="text-sm text-orange-600 mt-1">⚠️ Con DRIFT</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-gray-700">{stats.unmanaged}</div>
          <div className="text-sm text-gray-600 mt-1">❓ Sin Gestionar</div>
        </div>
      </div>

      {/* Gráfico de Estado */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado General</h3>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 h-full bg-green-500 transition-all"
            style={{ width: `${(stats.inSync / stats.totalResources) * 100}%` }}
          ></div>
          <div 
            className="absolute h-full bg-orange-500 transition-all"
            style={{ 
              left: `${(stats.inSync / stats.totalResources) * 100}%`,
              width: `${(stats.drifted / stats.totalResources) * 100}%` 
            }}
          ></div>
          <div 
            className="absolute right-0 h-full bg-gray-400 transition-all"
            style={{ width: `${(stats.unmanaged / stats.totalResources) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>✅ {((stats.inSync / stats.totalResources) * 100).toFixed(1)}% Sincronizado</span>
          <span>⚠️ {driftPercentage}% DRIFT</span>
          <span>❓ {((stats.unmanaged / stats.totalResources) * 100).toFixed(1)}% Sin Gestionar</span>
        </div>
      </div>

      {/* Recursos con DRIFT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recursos con DRIFT Detectado ({driftData.driftedResources?.length || 0})
        </h3>
        <div className="space-y-3">
          {driftData.driftedResources && driftData.driftedResources.length > 0 ? (
            driftData.driftedResources.map((resource: any, idx: number) => {
              const isExpanded = expandedResources.has(idx);
              const hasMoreChanges = resource.changes && resource.changes.length > 3;
              
              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {resource.severity === 'critical' ? '🔴' :
                           resource.severity === 'warning' ? '🟡' : '🔵'}
                        </span>
                        <span className="font-mono text-sm font-semibold text-gray-800">
                          {resource.address || resource.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          resource.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          resource.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {resource.severity?.toUpperCase() || 'INFO'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{resource.type}</p>
                      <p className="text-sm text-gray-700 mb-2 font-medium">{resource.action}</p>
                      
                      {/* Mostrar los cambios detectados */}
                      {resource.changes && resource.changes.length > 0 && (
                        <div className="mt-2 bg-gray-50 rounded p-2 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Cambios detectados:</p>
                          <ul className="text-xs font-mono text-gray-700 space-y-1">
                            {(isExpanded ? resource.changes : resource.changes.slice(0, 3)).map((change: string, i: number) => (
                              <li key={i} className="pl-2 border-l-2 border-orange-300">
                                {change}
                              </li>
                            ))}
                            {hasMoreChanges && !isExpanded && (
                              <li className="text-gray-500 italic">... y {resource.changes.length - 3} cambios más</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    {hasMoreChanges && (
                      <button 
                        onClick={() => toggleResourceDetails(idx)}
                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? '▲ Ocultar' : '▼ Ver Todo'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700">✅ No se detectó drift. Toda la infraestructura está sincronizada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Aplicar Correcciones */}
      {showApplyModal && recommendations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`p-6 border-b ${
              recommendations.risk === 'critical' ? 'bg-red-50 border-red-200' :
              recommendations.risk === 'high' ? 'bg-orange-50 border-orange-200' :
              recommendations.risk === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🔧 Aplicar Correcciones de DRIFT
              </h2>
              <p className="text-sm text-gray-600">{recommendations.summary}</p>
              <div className={`mt-3 inline-block px-3 py-1 rounded text-sm font-semibold ${
                recommendations.risk === 'critical' ? 'bg-red-200 text-red-800' :
                recommendations.risk === 'high' ? 'bg-orange-200 text-orange-800' :
                recommendations.risk === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                Nivel de Riesgo: {recommendations.risk.toUpperCase()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Recomendación General */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Recomendación General:</h3>
                <p className="text-sm text-blue-700 whitespace-pre-line">{recommendations.recommendation}</p>
              </div>

              {/* Acciones Detalladas */}
              <h3 className="font-semibold text-gray-800 mb-3">🔄 Acciones a Realizar:</h3>
              <div className="space-y-4">
                {recommendations.actions.map((action: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {action.resource}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            action.risk === 'critical' ? 'bg-red-100 text-red-700' :
                            action.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                            action.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {action.risk.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{action.type}</p>
                        <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                        
                        {/* Cambios */}
                        {action.changes.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                              Ver cambios ({action.changes.length})
                            </summary>
                            <ul className="mt-2 text-xs font-mono text-gray-700 bg-white p-2 rounded border border-gray-200 space-y-1">
                              {action.changes.map((change: string, i: number) => (
                                <li key={i} className="pl-2 border-l-2 border-orange-300">
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                        
                        {/* Recomendación específica */}
                        <div className="mt-2 text-xs text-gray-600 italic">
                          {action.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información del PR */}
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">📝 Proceso de Pull Request:</h3>
                <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                  <li>Se creará una nueva rama con los cambios de Terraform</li>
                  <li>Se generará un commit con la descripción detallada</li>
                  <li>Se abrirá un Pull Request automáticamente en GitHub</li>
                  <li>El owner del repositorio deberá revisar y aprobar los cambios</li>
                  <li>Una vez aprobado, se puede hacer merge para aplicar las correcciones</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setRecommendations(null);
                }}
                disabled={applyingFix}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:bg-gray-200"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={applyingFix}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {applyingFix ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creando Pull Request...
                  </>
                ) : (
                  <>
                    ✅ Confirmar y Crear Pull Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={fetchDriftData}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
        >
          🔄 Ejecutar Drift Detection
        </button>
        <button 
          onClick={handleApplyCorrections}
          disabled={loading || applyingFix || !driftData?.driftedResources?.length}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
        >
          {applyingFix ? '⏳ Procesando...' : '✅ Aplicar Correcciones'}
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
