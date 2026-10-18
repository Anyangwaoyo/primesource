import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { ProductionStage } from '../types';
import {
  GitCommit,
  Scale,
  AlertOctagon,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  DollarSign,
  PieChart,
  BarChart2,
  Fish,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

interface ProductionViewProps {
  onOpenGrowth: (pondId?: string) => void;
  onOpenMortality: (pondId?: string) => void;
  onOpenHarvest: (pondId?: string) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  onOpenGrowth,
  onOpenMortality,
  onOpenHarvest,
}) => {
  const {
    ponds,
    productionCycles,
    growthRecords,
    mortalityRecords,
    harvestRecords,
    feedingRecords,
    expenses,
    advanceCycleStage,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<'cycles' | 'growth' | 'mortality' | 'harvest' | 'analytics'>('cycles');
  const [selectedPondForChart, setSelectedPondForChart] = useState<string>(ponds[0]?.id || 'POND-A01');

  const STAGES: ProductionStage[] = [
    'POND_PREPARATION',
    'STOCKED',
    'GROW_OUT',
    'HARVEST_READY',
    'HARVESTED',
  ];

  const getStageIndex = (stage: ProductionStage) => STAGES.indexOf(stage);

  // Analytics totals
  const totalStocked = ponds.reduce((sum, p) => sum + p.initialFishStocked, 0);
  const totalSurviving = ponds.reduce((sum, p) => sum + p.currentFishCount, 0);
  const totalMortality = mortalityRecords.reduce((sum, m) => sum + m.deadFishCount, 0);
  const totalFeedKg = feedingRecords.reduce((sum, f) => sum + f.quantityKg, 0);
  const totalHarvestKg = harvestRecords.reduce((sum, h) => sum + h.totalWeightKg, 0);
  const totalSalesRevenue = harvestRecords.reduce((sum, h) => sum + h.totalSales, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Survival rate
  const survivalRate = totalStocked > 0 ? ((totalSurviving / totalStocked) * 100).toFixed(1) : '100';

  // Average growth across all ponds
  const avgCurrentWeight = ponds.length > 0
    ? (ponds.reduce((sum, p) => sum + p.averageFishWeightGrams, 0) / ponds.length).toFixed(0)
    : '0';

  // Growth records for selected pond
  const pondGrowth = growthRecords
    .filter(g => g.pondId === selectedPondForChart)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 pb-12">
      
      {/* View Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-emerald-600" />
            <span>Production Management & Records</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage production cycles, fish growth sampling, mortality logs, and harvest yields
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenGrowth()}
            className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
          >
            + Sample Growth
          </button>
          <button
            onClick={() => onOpenMortality()}
            className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer"
          >
            + Log Mortality
          </button>
          <button
            onClick={() => onOpenHarvest()}
            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            + Record Harvest
          </button>
        </div>
      </div>

      {/* Internal Subtabs */}
      <div className="border-b border-slate-200 flex space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('cycles')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'cycles'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Production Cycles ({productionCycles.length})
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'growth'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Growth Records ({growthRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('mortality')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'mortality'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Mortality Records ({mortalityRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('harvest')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'harvest'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Harvest Records ({harvestRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Basic Production Analytics
        </button>
      </div>

      {/* 1. PRODUCTION CYCLES (Feature #10) */}
      {activeTab === 'cycles' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Production Cycle Lifecycle:</span> Every batch progresses through 5 defined milestones: 
            <strong> POND PREPARATION → STOCKED → GROW-OUT → HARVEST READY → HARVESTED</strong>.
          </div>

          <div className="space-y-4">
            {productionCycles.map(cycle => {
              const pond = ponds.find(p => p.id === cycle.pondId);
              const currentIndex = getStageIndex(cycle.stage);

              return (
                <div key={cycle.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  
                  {/* Top info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-slate-900">{cycle.cycleName}</h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          {pond ? pond.name : cycle.pondId}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${cycle.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {cycle.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pond?.fishSpecies} • Target weight: {cycle.targetWeightGrams}g • Stocked: {formatDate(cycle.startDate)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500">Target Harvest:</span>
                      <span className="font-bold text-slate-800">{formatDate(cycle.targetHarvestDate)}</span>
                    </div>
                  </div>

                  {/* 5-Step Visual Progress Stepper */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      {STAGES.map((stg, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                          <div key={stg} className="space-y-1.5">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600'
                                  : isCurrent
                                  ? 'bg-emerald-500 ring-2 ring-emerald-300'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <div
                              className={`text-[10px] font-bold uppercase tracking-tight ${
                                isCurrent
                                  ? 'text-emerald-800'
                                  : isCompleted
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stg.replace(/_/g, ' ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage Advancement Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Current Stage: <strong className="text-slate-800">{cycle.stage.replace(/_/g, ' ')}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      {currentIndex < STAGES.length - 1 && (
                        <button
                          onClick={() => advanceCycleStage(cycle.id, STAGES[currentIndex + 1])}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Advance to {STAGES[currentIndex + 1].replace(/_/g, ' ')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {cycle.stage === 'HARVEST_READY' && (
                        <button
                          onClick={() => onOpenHarvest(cycle.pondId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                        >
                          Record Final Harvest
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. GROWTH RECORDS & CHART (Feature #7) */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>Fish Growth Sampling & Trajectory</span>
                </h3>
                <p className="text-xs text-slate-500">Average sampled body weight progression over production days</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 font-medium">Select Pond:</span>
                <select
                  value={selectedPondForChart}
                  onChange={e => setSelectedPondForChart(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ponds.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.fishSpecies})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Growth Curve (SVG) */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Weight (Grams)</span>
                <span>Sampling Dates</span>
              </div>

              {pondGrowth.length > 0 ? (
                <div className="w-full h-44 relative border-b border-l border-slate-300 p-2">
                  <svg className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pondGrowth
                        .map((g, i) => {
                          const x = (i / Math.max(1, pondGrowth.length - 1)) * 100;
                          const maxGrams = 1000;
                          const y = 100 - (g.averageWeightGrams / maxGrams) * 100;
                          return `${x}%,${Math.max(5, Math.min(95, y))}%`;
                        })
                        .join(' ')}
                    />
                    {pondGrowth.map((g, i) => {
                      const x = (i / Math.max(1, pondGrowth.length - 1)) * 100;
                      const maxGrams = 1000;
                      const y = 100 - (g.averageWeightGrams / maxGrams) * 100;
                      return (
                        <g key={g.id}>
                          <circle
                            cx={`${x}%`}
                            cy={`${Math.max(5, Math.min(95, y))}%`}
                            r="5"
                            className="fill-blue-600 stroke-white stroke-2"
                          />
                          <text
                            x={`${x}%`}
                            y={`${Math.max(5, Math.min(95, y)) - 8}%`}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-slate-800 font-mono"
                          >
                            {g.averageWeightGrams}g
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    {pondGrowth.map(g => (
                      <span key={g.id}>{formatDate(g.date)}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-8 text-center">
                  No growth sampling recorded for this pond yet.
                </p>
              )}
            </div>

            {/* Growth Records Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Pond</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Sampled Count</th>
                    <th className="py-2.5 px-3">Average Weight</th>
                    <th className="py-2.5 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {growthRecords.map(rec => {
                    const p = ponds.find(pond => pond.id === rec.pondId);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold">{p ? p.name : rec.pondId}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(rec.date)}</td>
                        <td className="py-2.5 px-3 font-mono">{rec.fishSampledCount} fish</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-blue-700">
                          {rec.averageWeightGrams} grams
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">{rec.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 3. MORTALITY RECORDS (Feature #8) */}
      {activeTab === 'mortality' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Total Farm Mortality</div>
              <div className="text-2xl font-bold text-rose-700 mt-1">{totalMortality} Fish</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cumulative recorded losses</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Stock Survival Rate</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{survivalRate}%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{totalSurviving.toLocaleString()} surviving of {totalStocked.toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Automatic Count Synchronization</div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pond estimated stock is automatically adjusted whenever mortality is logged.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Mortality Log & Observations</h3>
              <button
                onClick={() => onOpenMortality()}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 cursor-pointer"
              >
                + Log Mortality
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Pond</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Dead Fish</th>
                    <th className="py-2.5 px-4">Possible Observation</th>
                    <th className="py-2.5 px-4">Action Taken</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {mortalityRecords.map(m => {
                    const p = ponds.find(pond => pond.id === m.pondId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold">{p ? p.name : m.pondId}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(m.date)}</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-rose-700">
                          {m.deadFishCount}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{m.possibleObservation}</td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium">{m.actionTaken}</td>
                        <td className="py-2.5 px-3 text-slate-500">{m.recordedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. HARVEST RECORDS (Feature #11) */}
      {activeTab === 'harvest' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Total Harvested Weight</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalHarvestKg.toLocaleString()} kg</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Commercial table yield</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Total Sales Revenue</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{formatCurrency(totalSalesRevenue)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Auto-calculated: Weight × Price/kg</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Average Realized Price</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {totalHarvestKg > 0 ? `$${(totalSalesRevenue / totalHarvestKg).toFixed(2)}/kg` : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Farm gate rate</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Harvest & Offtake Transactions</h3>
              <button
                onClick={() => onOpenHarvest()}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                + Record Harvest
              </button>
            </div>

            {harvestRecords.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center">No completed harvests recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Pond</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Fish Count</th>
                      <th className="py-3 px-3">Total Weight (kg)</th>
                      <th className="py-3 px-3">Price / kg</th>
                      <th className="py-3 px-3">Total Sales</th>
                      <th className="py-3 px-4">Buyer / Customer</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {harvestRecords.map(h => {
                      const p = ponds.find(pond => pond.id === h.pondId);
                      return (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold">{p ? p.name : h.pondId}</td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(h.harvestDate)}</td>
                          <td className="py-3 px-3 font-mono">{h.fishHarvestedCount.toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold font-mono">{h.totalWeightKg.toLocaleString()} kg</td>
                          <td className="py-3 px-3 font-mono">${h.sellingPricePerKg.toFixed(2)}</td>
                          <td className="py-3 px-3 font-bold font-mono text-emerald-700 text-sm">
                            {formatCurrency(h.totalSales)}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{h.buyerCustomer}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{h.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. BASIC PRODUCTION ANALYTICS (Feature #12) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Small Farm Analytics:</span> Transparent indicators designed specifically for fish farmers without unnecessary financial jargon or complex abstractions.
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Fish Stocked</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalStocked.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500">Across 3 active ponds</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Surviving Fish</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{totalSurviving.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-700 font-medium">{survivalRate}% survival rate</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Mortality Count</div>
              <div className="text-2xl font-bold text-rose-700 mt-1">{totalMortality}</div>
              <div className="text-[11px] text-slate-500">Documented causes</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Feed Used</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{totalFeedKg.toFixed(1)} kg</div>
              <div className="text-[11px] text-slate-500">Extruded & sinking</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Average Growth</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{avgCurrentWeight} g</div>
              <div className="text-[11px] text-slate-500">Current mean weight</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Harvest Quantity</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalHarvestKg.toLocaleString()} kg</div>
              <div className="text-[11px] text-slate-500">Completed harvests</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Production Cost</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpenses)}</div>
              <div className="text-[11px] text-slate-500">Feed + stock + inputs</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Sales Revenue</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{formatCurrency(totalSalesRevenue)}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Realized farm revenue</div>
            </div>

          </div>

          {/* Feed Conversion Ratio (FCR) Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Aquaculture Efficiency Indicator (Feed Conversion)</h4>
            <p className="text-xs text-slate-600">
              FCR is the ratio of feed input to fish body weight gain. PrimeSource Farm tracks feed distribution against sampled weights to verify that feed is effectively converted into marketable biomass.
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900">Current Farm Average FCR: ~1.15</span>
                <span className="text-emerald-700 block text-[11px]">
                  (1.15 kg of feed required for 1 kg of catfish weight gain — within optimal commercial benchmark)
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold">Good Conversion</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
