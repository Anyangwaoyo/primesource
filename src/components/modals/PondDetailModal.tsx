import React from 'react';
import { Pond } from '../../types';
import { useFarm } from '../../context/FarmContext';
import {
  X,
  Layers,
  Thermometer,
  Droplet,
  Wind,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Utensils,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatDateTime, formatTimeOnly } from '../../utils/formatters';

interface PondDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pond: Pond | null;
  onOpenManualReading: (pondId: string) => void;
  onOpenFeeding: (pondId: string) => void;
  onOpenGrowth: (pondId: string) => void;
  onOpenMortality: (pondId: string) => void;
  onOpenHarvest: (pondId: string) => void;
}

export const PondDetailModal: React.FC<PondDetailModalProps> = ({
  isOpen,
  onClose,
  pond,
  onOpenManualReading,
  onOpenFeeding,
  onOpenGrowth,
  onOpenMortality,
  onOpenHarvest,
}) => {
  const { waterReadings, activities, alerts, feedingRecords, growthRecords, mortalityRecords } = useFarm();

  if (!isOpen || !pond) return null;

  // Filter pond-specific data
  const pondReadings = waterReadings.filter(r => r.pondId === pond.id);
  const latestReading = pondReadings[0];
  const pondAlerts = alerts.filter(a => a.pondId === pond.id && !a.resolved);
  const pondActivities = activities.filter(a => a.pondId === pond.id);
  const pondFeedTotal = feedingRecords
    .filter(f => f.pondId === pond.id)
    .reduce((sum, f) => sum + f.quantityKg, 0);
  const pondMortalityTotal = mortalityRecords
    .filter(m => m.pondId === pond.id)
    .reduce((sum, m) => sum + m.deadFishCount, 0);

  const survivalRate = pond.initialFishStocked > 0
    ? ((pond.currentFishCount / pond.initialFishStocked) * 100).toFixed(1)
    : '100';

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'WATER_READING':
        return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
      case 'FEEDING':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'ALERT_TRIGGERED':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'ALERT_RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'MORTALITY':
        return <AlertOctagon className="w-3.5 h-3.5 text-red-600" />;
      case 'GROWTH_SAMPLE':
        return <Scale className="w-3.5 h-3.5 text-purple-600" />;
      case 'HARVEST':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-lg">{pond.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    pond.status === 'HEALTHY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pond.status === 'ATTENTION_NEEDED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {pond.status.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-medium">
                  {pond.productionStage.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">{pond.fishSpecies} • {pond.pondType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Alert Banner if any */}
          {pondAlerts.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-amber-900">Attention Required for {pond.name}</div>
                <div className="text-amber-800">{pondAlerts[0].problemDetected}</div>
                <div className="font-mono text-[11px] text-amber-900 mt-1">
                  Reading: {pondAlerts[0].currentReading}
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 font-medium">Surviving Fish</div>
              <div className="text-lg font-bold text-slate-900">
                {pond.currentFishCount.toLocaleString()}
                <span className="text-xs text-slate-500 font-normal"> / {pond.initialFishStocked.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">{survivalRate}% survival rate</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 font-medium">Average Weight</div>
              <div className="text-lg font-bold text-slate-900">{pond.averageFishWeightGrams} g</div>
              <div className="text-[10px] text-slate-500">Biomass ~{((pond.currentFishCount * pond.averageFishWeightGrams) / 1000).toFixed(0)} kg</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 font-medium">Total Feed Used</div>
              <div className="text-lg font-bold text-slate-900">{pondFeedTotal.toFixed(1)} kg</div>
              <div className="text-[10px] text-slate-500">Documented rations</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[11px] text-slate-500 font-medium">Next Expected Harvest</div>
              <div className="text-base font-bold text-slate-900">{formatDate(pond.expectedHarvestDate)}</div>
              <div className="text-[10px] text-slate-500">Stocked {formatDate(pond.dateStocked)}</div>
            </div>
          </div>

          {/* Latest Water Quality */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Latest Water Quality Readings
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {latestReading ? `Updated ${formatDateTime(latestReading.timestamp)}` : 'No reading yet'}
              </span>
            </div>

            {latestReading ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-md bg-blue-50/50 border border-blue-100">
                  <div className="text-[11px] text-slate-500">Water Temp</div>
                  <div className="text-base font-bold text-slate-900">{latestReading.temperatureC}°C</div>
                  <div className="text-[10px] text-slate-500">Safe: 26.0 - 30.0°C</div>
                </div>

                <div className={`p-2.5 rounded-md border ${
                  latestReading.pH < 6.5 || latestReading.pH > 8.5
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-emerald-50/50 border-emerald-100'
                }`}>
                  <div className="text-[11px] text-slate-500">pH Level</div>
                  <div className={`text-base font-bold ${
                    latestReading.pH < 6.5 || latestReading.pH > 8.5 ? 'text-amber-800' : 'text-slate-900'
                  }`}>
                    {latestReading.pH}
                  </div>
                  <div className="text-[10px] text-slate-500">Safe: 6.5 - 8.5</div>
                </div>

                <div className={`p-2.5 rounded-md border ${
                  latestReading.dissolvedOxygenMgL < 5.0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-teal-50/50 border-teal-100'
                }`}>
                  <div className="text-[11px] text-slate-500">Dissolved Oxygen</div>
                  <div className={`text-base font-bold ${
                    latestReading.dissolvedOxygenMgL < 5.0 ? 'text-amber-800' : 'text-slate-900'
                  }`}>
                    {latestReading.dissolvedOxygenMgL} mg/L
                  </div>
                  <div className="text-[10px] text-slate-500">Safe: ≥ 5.0 mg/L</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No water readings recorded for this pond.</p>
            )}
          </div>

          {/* Feature #9: Pond Activity Timeline */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Pond Activity Log (Timeline)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">{pondActivities.length} Events</span>
            </div>

            {pondActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No activity events recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {pondActivities.map(act => (
                  <div key={act.id} className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{act.title}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(act.timestamp)}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pond Quick Actions */}
          <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => {
                onClose();
                onOpenManualReading(pond.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer"
            >
              + Manual Water Test
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenFeeding(pond.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 cursor-pointer"
            >
              + Record Feed
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenGrowth(pond.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 rounded-lg border border-purple-200 cursor-pointer"
            >
              + Sample Weight
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenMortality(pond.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
            >
              + Log Mortality
            </button>
            {pond.productionStage === 'HARVEST_READY' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHarvest(pond.id);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                Complete Harvest
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
