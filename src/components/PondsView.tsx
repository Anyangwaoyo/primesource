import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Pond, ProductionStage } from '../types';
import {
  Layers,
  Plus,
  Fish,
  Calendar,
  Scale,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Droplet,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface PondsViewProps {
  onOpenCreatePond: () => void;
  onSelectPond: (pond: Pond) => void;
  onOpenManualReading: (pondId: string) => void;
  onOpenFeeding: (pondId: string) => void;
  onOpenHarvest: (pondId: string) => void;
}

export const PondsView: React.FC<PondsViewProps> = ({
  onOpenCreatePond,
  onSelectPond,
  onOpenManualReading,
  onOpenFeeding,
  onOpenHarvest,
}) => {
  const { ponds, updatePond } = useFarm();
  const [filterSpecies, setFilterSpecies] = useState('ALL');

  const filteredPonds = ponds.filter(p => {
    if (filterSpecies === 'ALL') return true;
    return p.fishSpecies.toLowerCase().includes(filterSpecies.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Healthy</span>
          </span>
        );
      case 'ATTENTION_NEEDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Attention Needed</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStageBadge = (stage: ProductionStage) => {
    const map: Record<ProductionStage, { label: string; bg: string }> = {
      POND_PREPARATION: { label: 'Pond Preparation', bg: 'bg-slate-100 text-slate-700' },
      STOCKED: { label: 'Stocked', bg: 'bg-blue-100 text-blue-800' },
      GROW_OUT: { label: 'Grow-Out Stage', bg: 'bg-emerald-100 text-emerald-800' },
      HARVEST_READY: { label: 'Harvest Ready', bg: 'bg-purple-100 text-purple-800' },
      HARVESTED: { label: 'Harvested', bg: 'bg-slate-200 text-slate-600' },
    };
    const s = map[stage] || { label: stage, bg: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Pond Management</span>
            <span className="text-xs font-normal text-slate-500">({ponds.length} Registered Ponds)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor stocking densities, production stages, biomass estimates, and health statuses
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Species Filter */}
          <select
            value={filterSpecies}
            onChange={e => setFilterSpecies(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Fish Species</option>
            <option value="Catfish">Catfish</option>
            <option value="Tilapia">Tilapia</option>
          </select>

          <button
            onClick={onOpenCreatePond}
            id="btn-create-pond"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Pond</span>
          </button>
        </div>
      </div>

      {/* Ponds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPonds.map(pond => {
          const survivalPct = pond.initialFishStocked > 0
            ? ((pond.currentFishCount / pond.initialFishStocked) * 100).toFixed(1)
            : '100';

          const estimatedBiomassKg = ((pond.currentFishCount * pond.averageFishWeightGrams) / 1000).toFixed(0);

          return (
            <div
              key={pond.id}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                pond.status !== 'HEALTHY'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-slate-900">{pond.name}</h2>
                      {getStatusBadge(pond.status)}
                    </div>
                    <div className="text-xs font-medium text-emerald-800 mt-0.5">{pond.fishSpecies}</div>
                    <div className="text-[11px] text-slate-400">{pond.pondType}</div>
                  </div>

                  <div className="text-right">
                    {getStageBadge(pond.productionStage)}
                  </div>
                </div>

                {/* Stocking & Fish Count Box */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Stocked</div>
                    <div className="font-bold text-slate-800 text-sm">
                      {pond.initialFishStocked.toLocaleString()} fish
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDate(pond.dateStocked)}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Surviving Count</div>
                    <div className="font-bold text-slate-900 text-sm">
                      {pond.currentFishCount.toLocaleString()} fish
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{survivalPct}% survival</div>
                  </div>
                </div>

                {/* Biometrics & Harvest Data */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>Average Fish Weight</span>
                    </span>
                    <span className="font-bold text-slate-800">{pond.averageFishWeightGrams} grams</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Fish className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated Pond Biomass</span>
                    </span>
                    <span className="font-bold text-slate-800">~{estimatedBiomassKg} kg</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Expected Harvest</span>
                    </span>
                    <span className="font-bold text-slate-800">{formatDate(pond.expectedHarvestDate)}</span>
                  </div>
                </div>

                {pond.notes && (
                  <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-600 line-clamp-2">
                    {pond.notes}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectPond(pond)}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details & Log</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenFeeding(pond.id)}
                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded transition-colors cursor-pointer"
                    title="Record Feed for this pond"
                  >
                    <Utensils className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenManualReading(pond.id)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded transition-colors cursor-pointer"
                    title="Enter Water Reading for this pond"
                  >
                    <Droplet className="w-4 h-4" />
                  </button>
                  {pond.productionStage === 'HARVEST_READY' && (
                    <button
                      onClick={() => onOpenHarvest(pond.id)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Complete Harvest"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-700" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
