'use client';

import { useState, useEffect } from 'react';

type FinOpsTab = 'overview' | 'cost-analysis' | 'optimization' | 'governance' | 'reporting';

export default function FinOpsPage() {
  const [activeTab, setActiveTab] = useState<FinOpsTab>('overview');
  const [loading, setLoading] = useState(false);
  const [finopsData, setFinopsData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchFinOpsOverview();
    }
  }, [activeTab]);

  const fetchFinOpsOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finops');
      const data = await response.json();
      
      if (data.success) {
        setFinopsData(data);
      }
    } catch (err: any) {
      console.error('Error fetching FinOps data:', err);
    } finally {
      setLoading(false);
    }
  };

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
                  <span className="text-3xl">💰</span>
                  FinOps Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Powered by FOCUS Framework & Microsoft FinOps Toolkit
                </p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-purple-600 bg-purple-50'
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cost-analysis')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'cost-analysis'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Cost Analysis</div>
                  <div className="text-xs opacity-70">FOCUS-compliant</div>
                </div>
              </div>
              {activeTab === 'cost-analysis' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('optimization')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'optimization'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Optimization</div>
                  <div className="text-xs opacity-70">Right-sizing & Savings</div>
                </div>
              </div>
              {activeTab === 'optimization' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('governance')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'governance'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Governance</div>
                  <div className="text-xs opacity-70">Policies & Tagging</div>
                </div>
              </div>
              {activeTab === 'governance' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reporting')}
              className={`px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'reporting'
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Reporting</div>
                  <div className="text-xs opacity-70">Showback & Export</div>
                </div>
              </div>
              {activeTab === 'reporting' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'overview' && <OverviewTab loading={loading} data={finopsData} />}
        {activeTab === 'cost-analysis' && <CostAnalysisTab />}
        {activeTab === 'optimization' && <OptimizationTab />}
        {activeTab === 'governance' && <GovernanceTab />}
        {activeTab === 'reporting' && <ReportingTab />}
      </div>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center">
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DXC Technology. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Developed by <span className="font-semibold text-blue-600">DXC Iberia Cloud Team</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// OVERVIEW TAB - Dashboard Principal con KPIs
// ============================================
function OverviewTab({ loading, data }: { loading: boolean; data: any }) {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">FinOps Cloud Analytics</h2>
            <p className="text-purple-100 mb-4">
              Optimización continua de costos y recursos cloud basada en FOCUS y FinOps Toolkit
            </p>
            <div className="flex gap-4 items-center">
              <a 
                href="https://focus.finops.org/" 
                target="_blank"
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all"
              >
                📘 FOCUS Framework
              </a>
              <a 
                href="https://microsoft.github.io/finops-toolkit/" 
                target="_blank"
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all"
              >
                🔧 FinOps Toolkit
              </a>
              <div className="px-3 py-1 bg-yellow-400 bg-opacity-90 text-yellow-900 rounded-full text-xs font-bold">
                🧪 DEMO DATA
              </div>
            </div>
          </div>
          <div className="text-6xl">💰</div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Cargando análisis FinOps...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              icon="💳"
              title="Costo Mensual"
              value={data?.summary?.totalMonthlyCost || 0}
              format="currency"
              color="blue"
              subtitle="Gasto actual"
            />
            <KPICard
              icon="💰"
              title="Ahorro Potencial"
              value={data?.summary?.potentialSavings || 0}
              format="currency"
              color="green"
              subtitle="Por optimizar"
            />
            <KPICard
              icon="⚠️"
              title="Recursos Infrautilizados"
              value={data?.summary?.underutilizedCount || 0}
              format="number"
              color="orange"
              subtitle="Requieren atención"
            />
            <KPICard
              icon="📊"
              title="FinOps Score"
              value={data?.summary?.optimizationScore || 0}
              format="score"
              color="purple"
              subtitle="Eficiencia actual"
            />
          </div>

          {/* FinOps Toolkit Modules */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🔧</span>
              Microsoft FinOps Toolkit - Módulos Activos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ToolkitModule
                name="Cost Optimizer"
                status="active"
                description="Right-sizing, Reserved Instances, Savings Plans analysis"
                icon="⚡"
              />
              <ToolkitModule
                name="Rate Optimization"
                status="active"
                description="Commitment-based discounts, Spot instances opportunities"
                icon="💵"
              />
              <ToolkitModule
                name="Governance"
                status="active"
                description="Policy compliance, tagging strategy, budget alerts"
                icon="🛡️"
              />
              <ToolkitModule
                name="Reporting"
                status="pending"
                description="Showback/Chargeback, anomaly detection, Power BI export"
                icon="📈"
              />
              <ToolkitModule
                name="FinOps Hubs"
                status="pending"
                description="Centralized cost management workspace"
                icon="🏢"
              />
              <ToolkitModule
                name="PowerBI Reports"
                status="pending"
                description="Pre-built dashboards and analytics"
                icon="📊"
              />
            </div>
          </div>

          {/* FOCUS Framework Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <span className="text-4xl">📘</span>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-blue-900 mb-2">
                  FOCUS Framework Compliance
                </h4>
                <p className="text-blue-700 mb-4">
                  Todos los datos están normalizados según el estándar <strong>FinOps Open Cost and Usage Specification (FOCUS)</strong>,
                  garantizando compatibilidad multi-cloud y consistencia en reporting.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">✅ Cost</div>
                    <div className="text-blue-600 text-xs">Billing data</div>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">✅ Usage</div>
                    <div className="text-blue-600 text-xs">Consumption metrics</div>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">✅ Pricing</div>
                    <div className="text-blue-600 text-xs">Rate information</div>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">✅ Resources</div>
                    <div className="text-blue-600 text-xs">Metadata & tags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// COST ANALYSIS TAB - Basado en FOCUS
// ============================================
function CostAnalysisTab() {
  const [loading, setLoading] = useState(true);
  const [costData, setCostData] = useState<any>(null);

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finops');
      const data = await response.json();
      if (data.success) {
        setCostData(data.costs);
      }
    } catch (err) {
      console.error('Error fetching cost data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Cargando análisis de costos FOCUS...</p>
      </div>
    );
  }

  const focusData = costData?.focus;
  const trendData = costData?.trend || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">💳</span>
          Cost Analysis - FOCUS Compliant
        </h3>
        <p className="text-gray-600 mb-6">
          Análisis de costos normalizado según FOCUS specification. Datos estructurados para garantizar
          consistencia multi-cloud y compatibilidad con herramientas FinOps estándar.
        </p>
        
        {/* FOCUS Core Dimensions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-blue-900 mb-3">📊 FOCUS Core Dimensions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-800">Billing Period:</strong>
              <p className="text-blue-600">{focusData?.billingPeriod?.month || 'N/A'}</p>
              <p className="text-xs text-blue-500">
                {focusData?.billingPeriod?.start} a {focusData?.billingPeriod?.end}
              </p>
            </div>
            <div>
              <strong className="text-blue-800">Provider:</strong>
              <p className="text-blue-600">Microsoft Azure</p>
            </div>
            <div>
              <strong className="text-blue-800">Total Billed Cost:</strong>
              <p className="text-blue-600 text-lg font-bold">
                €{focusData?.totalBilledCost?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <strong className="text-blue-800">Effective Cost:</strong>
              <p className="text-blue-600 text-lg font-bold">
                €{focusData?.totalEffectiveCost?.toFixed(2) || '0.00'}
              </p>
              {focusData?.totalEffectiveCost < focusData?.totalBilledCost && (
                <p className="text-xs text-green-600">
                  ✅ Ahorro: €{(focusData.totalBilledCost - focusData.totalEffectiveCost).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cost by Service Category (FOCUS) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">📦 Cost by Service Category</h4>
          <div className="space-y-3">
            {focusData?.byServiceCategory && Object.entries(focusData.byServiceCategory)
              .filter(([_, cost]) => (cost as number) > 0)
              .sort(([_, a], [__, b]) => (b as number) - (a as number))
              .map(([category, cost]) => {
                const costNum = cost as number;
                const percentage = (costNum / focusData.totalBilledCost) * 100;
                return (
                  <div key={category} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">{category}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-semibold text-gray-700">
                            €{costNum.toFixed(2)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cost by Pricing Category (FOCUS) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">💰 Cost by Pricing Category</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {focusData?.byPricingCategory && Object.entries(focusData.byPricingCategory)
              .filter(([_, cost]) => (cost as number) > 0)
              .map(([category, cost]) => {
                const costNum = cost as number;
                const percentage = (costNum / focusData.totalBilledCost) * 100;
                const colorClass = 
                  category === 'Reserved' ? 'bg-green-50 border-green-200 text-green-700' :
                  category === 'Spot' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                  category === 'On-Demand' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                  'bg-gray-50 border-gray-200 text-gray-700';
                
                return (
                  <div key={category} className={`border rounded-lg p-4 ${colorClass}`}>
                    <div className="text-xs font-medium mb-1">{category}</div>
                    <div className="text-lg font-bold">€{costNum.toFixed(0)}</div>
                    <div className="text-xs opacity-75">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cost by Resource Group */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">🏢 Cost by Resource Group</h4>
          <div className="space-y-2">
            {focusData?.byResourceGroup && Object.entries(focusData.byResourceGroup)
              .sort(([_, a], [__, b]) => (b as number) - (a as number))
              .map(([rg, cost]) => {
                const costNum = cost as number;
                const percentage = (costNum / focusData.totalBilledCost) * 100;
                return (
                  <div key={rg} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{rg}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      <span className="text-sm font-bold text-gray-900">€{costNum.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cost Trend (últimos 6 meses) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">📈 Cost Trend (últimos 6 meses)</h4>
          {trendData.length > 0 ? (
            <div className="space-y-2">
              {trendData.map((month: any) => (
                <div key={month.month} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-24 text-sm font-medium text-gray-700">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-gray-900">
                        €{month.billedCost.toFixed(2)}
                      </div>
                      {month.variance !== 0 && (
                        <span className={`text-xs font-semibold ${month.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {month.variance > 0 ? '↑' : '↓'} {Math.abs(month.variance).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Effective: €{month.effectiveCost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos de tendencia disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTIMIZATION TAB - FinOps Toolkit
// ============================================
function OptimizationTab() {
  const [optimizerData, setOptimizerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoOptimizing, setAutoOptimizing] = useState(false);
  const [autoOptResult, setAutoOptResult] = useState<any>(null);

  useEffect(() => {
    async function fetchOptimizerData() {
      try {
        setLoading(true);
        const response = await fetch('/api/finops?optimizer=true');
        const data = await response.json();
        
        if (data.success && data.optimizer) {
          setOptimizerData(data.optimizer);
        } else {
          setError(data.error || 'No optimizer data available');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch optimizer data');
      } finally {
        setLoading(false);
      }
    }

    fetchOptimizerData();
  }, []);

  const handleAutoOptimize = async (dryRun: boolean) => {
    try {
      setAutoOptimizing(true);
      setAutoOptResult(null);
      
      const url = `/api/finops?action=auto-optimize${dryRun ? '&dryRun=true' : ''}`;
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();
      
      setAutoOptResult(result);
      
      if (result.success && result.result.prCreated) {
        alert(`✅ Pull Request creado exitosamente!\n\nPR #${result.result.pr.prNumber}\n${result.result.pr.prUrl}\n\nTotal Savings: €${result.result.pr.totalMonthlySavings.toFixed(2)}/mes`);
      } else if (result.success) {
        alert(`ℹ️ Preview generado:\n\n${result.result.changesGenerated} cambios Terraform\nAhorros: €${result.result.terraformChanges.reduce((sum: number, c: any) => sum + c.monthlySavings, 0).toFixed(2)}/mes`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setAutoOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">⏳ Analizando recursos y generando recomendaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">❌ Error: {error}</p>
      </div>
    );
  }

  if (!optimizerData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No hay datos de optimizer disponibles</p>
      </div>
    );
  }

  const summary = optimizerData.summary;

  return (
    <div className="space-y-6">
      {/* Header con total savings */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-2">
              €{summary.totalMonthlySavings.toFixed(2)}<span className="text-xl">/mes</span>
            </h3>
            <p className="text-green-100 text-lg">
              Ahorros potenciales identificados
            </p>
            <p className="text-green-200 text-sm mt-1">
              €{summary.totalAnnualSavings.toFixed(2)} anuales
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl mb-2">⚡</div>
            <div className="bg-green-400 text-green-900 px-4 py-2 rounded-lg font-bold">
              Score: {summary.optimizationScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 Auto-Optimization Section - LEVEL 2 Feature */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🤖</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-2xl font-bold">Auto-Optimization con PR</h4>
                <p className="text-purple-100 mt-1">
                  Genera automáticamente Pull Requests con cambios Terraform para implementar las recomendaciones de FinOps
                </p>
              </div>
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                LEVEL 2
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-purple-200 text-xs mb-1">✓ Detección automática</div>
                  <div className="font-semibold">Recomendaciones de alta prioridad</div>
                </div>
                <div>
                  <div className="text-purple-200 text-xs mb-1">✓ Generación de código</div>
                  <div className="font-semibold">Cambios Terraform validados</div>
                </div>
                <div>
                  <div className="text-purple-200 text-xs mb-1">✓ Workflow integrado</div>
                  <div className="font-semibold">PR con análisis detallado</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAutoOptimize(true)}
                disabled={autoOptimizing}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>👁️</span>
                {autoOptimizing ? 'Analizando...' : 'Preview (Dry-Run)'}
              </button>
              
              <button
                onClick={() => handleAutoOptimize(false)}
                disabled={autoOptimizing}
                className="bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🚀</span>
                {autoOptimizing ? 'Ejecutando...' : 'Auto-Apply & Create PR'}
              </button>
            </div>

            {autoOptResult && (
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-semibold mb-2">Resultado:</div>
                  {autoOptResult.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span>✅</span>
                        <span>Operación exitosa</span>
                      </div>
                      <div className="text-purple-100 text-xs space-y-1">
                        <div>• Recomendaciones analizadas: {autoOptResult.result.recommendationsAnalyzed}</div>
                        <div>• Cambios generados: {autoOptResult.result.changesGenerated}</div>
                        {autoOptResult.result.pr && (
                          <>
                            <div>• PR creado: #{autoOptResult.result.pr.prNumber}</div>
                            <div>• Ahorros totales: €{autoOptResult.result.pr.totalMonthlySavings.toFixed(2)}/mes</div>
                            <div>
                              <a 
                                href={autoOptResult.result.pr.prUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-yellow-300 hover:text-yellow-200 underline"
                              >
                                🔗 Ver Pull Request
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-200">
                      <span>❌</span>
                      <span>Error: {autoOptResult.result.errors.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de recursos analizados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-800">{summary.resourcesAnalyzed}</div>
          <div className="text-sm text-gray-600">Recursos Analizados</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600">{summary.underutilizedCount}</div>
          <div className="text-sm text-gray-600">Infrautilizados (&lt;20%)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{summary.optimalCount}</div>
          <div className="text-sm text-gray-600">Óptimos (20-90%)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{summary.overutilizedCount}</div>
          <div className="text-sm text-gray-600">Sobreutilizados (&gt;90%)</div>
        </div>
      </div>

      {/* Savings breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Desglose de ahorros</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-800">Right-Sizing</div>
                <div className="text-sm text-gray-600">{summary.rightsizingRecommendations} recomendaciones</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                €{summary.savingsFromRightSizing.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">/mes</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <div className="font-semibold text-gray-800">Reserved Instances</div>
                <div className="text-sm text-gray-600">{summary.reservedInstanceRecommendations} oportunidades</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                €{summary.savingsFromReservedInstances.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">/mes</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-semibold text-gray-800">Spot Instances</div>
                <div className="text-sm text-gray-600">{summary.spotInstanceOpportunities} workloads elegibles</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">
                €{summary.savingsFromSpotInstances.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">/mes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-Sizing Recommendations */}
      {optimizerData.rightsizing && optimizerData.rightsizing.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span> Recomendaciones de Right-Sizing
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Recurso</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU Actual</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Recomendado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Utilización</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Ahorro/Mes</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optimizerData.rightsizing.slice(0, 10).map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{rec.resourceName}</div>
                      <div className="text-xs text-gray-500">{rec.resourceGroup}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {rec.currentSku.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        rec.recommendationType === 'downsize' ? 'bg-green-100 text-green-800' :
                        rec.recommendationType === 'upsize' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rec.recommendationType === 'shutdown' ? 'SHUTDOWN' : rec.recommendedSku.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div>CPU: {rec.currentUtilization.cpuAverage.toFixed(1)}%</div>
                        <div>RAM: {rec.currentUtilization.memoryAverage.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-green-600">
                        €{Math.abs(rec.monthlySavings).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        rec.priority >= 8 ? 'bg-red-100 text-red-800' :
                        rec.priority >= 5 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}/10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {optimizerData.rightsizing.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Mostrando 10 de {optimizerData.rightsizing.length} recomendaciones
            </p>
          )}
        </div>
      )}

      {/* Reserved Instance Recommendations */}
      {optimizerData.reservedInstances && optimizerData.reservedInstances.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>💎</span> Oportunidades de Reserved Instances
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VM Size</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Cantidad</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Término</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Ahorro/Mes</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">% Ahorro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optimizerData.reservedInstances.slice(0, 5).map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{rec.vmSize}</td>
                    <td className="px-4 py-3 text-xs">{rec.location}</td>
                    <td className="px-4 py-3 text-center font-semibold">{rec.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.term === '3year' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.term === '3year' ? '3 años' : '1 año'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      €{rec.monthlySavings.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-600 font-bold">{rec.savingsPercentage}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spot Instance Eligibility */}
      {optimizerData.spotInstances && optimizerData.spotInstances.filter((s: any) => s.isEligible).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚡</span> Workloads elegibles para Spot Instances
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Recurso</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Workload Type</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Tolerancia</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Ahorro/Mes</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optimizerData.spotInstances.filter((s: any) => s.isEligible).slice(0, 10).map((spot: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{spot.resourceName}</div>
                      <div className="text-xs text-gray-500 font-mono">{spot.currentSku}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                        {spot.workloadType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        spot.interruptionTolerance === 'high' ? 'bg-green-100 text-green-800' :
                        spot.interruptionTolerance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {spot.interruptionTolerance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-600">
                      €{spot.monthlySavings.toFixed(2)}
                      <div className="text-xs text-gray-500">({spot.savingsPercentage}%)</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        spot.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        spot.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {spot.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>🧪 DEMO DATA:</strong> Estos datos son simulados para propósitos de demostración.
          En producción, se integrarían directamente con Azure Monitor API y Azure Cost Management para análisis en tiempo real.
        </p>
      </div>
    </div>
  );
}

// ============================================
// GOVERNANCE TAB - Policies & Tagging
// ============================================
function GovernanceTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">🛡️</span>
          FinOps Governance & Policies
        </h3>
        <p className="text-gray-600 mb-6">
          Cost allocation, tagging strategy, budget management y policy compliance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🏷️</span> Tagging Strategy
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Estrategia de etiquetado para cost allocation y chargeback
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Environment (dev, staging, prod)</li>
              <li>✅ CostCenter (department code)</li>
              <li>✅ Project (initiative name)</li>
              <li>✅ Owner (responsible team)</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💰</span> Budget Alerts
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Alertas automáticas basadas en umbrales de gasto
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>⚠️ Warning at 80% budget</li>
              <li>🚨 Critical at 100% budget</li>
              <li>📧 Email notifications to owners</li>
              <li>🔔 Teams webhook integration</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">🚧 Azure Policy integration en desarrollo</p>
          <p className="text-sm text-gray-500 mt-2">
            Próximamente: Compliance scanning, policy enforcement, automated remediation
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REPORTING TAB - Showback & Export
// ============================================
function ReportingTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📈</span>
          FinOps Reporting & Analytics
        </h3>
        <p className="text-gray-600 mb-6">
          Showback, Chargeback y exportación a Power BI usando FinOps Toolkit
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-pink-900 mb-1">Power BI Export</h4>
            <p className="text-xs text-pink-700">
              Dashboards pre-built del FinOps Toolkit
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">💸</div>
            <h4 className="font-semibold text-indigo-900 mb-1">Showback Reports</h4>
            <p className="text-xs text-indigo-700">
              Visibility de costos por departamento
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-semibold text-purple-900 mb-1">Chargeback</h4>
            <p className="text-xs text-purple-700">
              Asignación de costos a cost centers
            </p>
          </div>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">🚧 Power BI connector en desarrollo</p>
          <p className="text-sm text-gray-500 mt-2">
            Próximamente: Export automático, anomaly detection, custom dashboards
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================
function KPICard({ icon, title, value, format, color, subtitle }: any) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
  };

  const formattedValue = format === 'currency' 
    ? `€${value.toFixed(2)}` 
    : format === 'score'
    ? `${value}/100`
    : value;

  return (
    <div className={`bg-gradient-to-br rounded-lg p-6 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-sm font-medium opacity-80 mb-1">{title}</div>
      <div className="text-3xl font-bold">{formattedValue}</div>
      <div className="text-xs opacity-70 mt-2">{subtitle}</div>
    </div>
  );
}

function ToolkitModule({ name, status, description, icon }: any) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-300',
    pending: 'bg-gray-100 text-gray-600 border-gray-300',
  };

  return (
    <div className={`border rounded-lg p-4 ${statusColors[status as keyof typeof statusColors]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white bg-opacity-50">
          {status === 'active' ? '✅ Active' : '⏳ Pending'}
        </span>
      </div>
      <h4 className="font-bold mb-1">{name}</h4>
      <p className="text-xs opacity-80">{description}</p>
    </div>
  );
}
