import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Utensils, Plus, Calendar, Clock, Layers, Filter } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface FeedingViewProps {
  onOpenFeeding: (pondId?: string) => void;
}

export const FeedingView: React.FC<FeedingViewProps> = ({ onOpenFeeding }) => {
  const { ponds, feedingRecords } = useFarm();
  const [selectedPondFilter, setSelectedPondFilter] = useState('ALL');

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = feedingRecords.filter(f => f.date === todayStr);
  const todayTotalKg = todayRecords.reduce((sum, f) => sum + f.quantityKg, 0);

  // Past 7 days (weekly)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyRecords = feedingRecords.filter(f => {
    const fDate = new Date(f.date);
    return fDate >= sevenDaysAgo;
  });
  const weeklyTotalKg = weeklyRecords.reduce((sum, f) => sum + f.quantityKg, 0);

  // Total feed used per pond
  const feedByPond = ponds.map(pond => {
    const records = feedingRecords.filter(f => f.pondId === pond.id);
    const totalKg = records.reduce((sum, f) => sum + f.quantityKg, 0);
    return {
      pond,
      totalKg,
      recordCount: records.length,
    };
  });

  const grandTotalKg = feedingRecords.reduce((sum, f) => sum + f.quantityKg, 0);

  // Filtered records
  const filteredRecords = feedingRecords
    .filter(f => selectedPondFilter === 'ALL' || f.pondId === selectedPondFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span>Feeding Records & Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily feed distribution, ration sizes, feeding response, and pond conversion
          </p>
        </div>

        <button
          onClick={() => onOpenFeeding()}
          id="btn-add-feeding-record"
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Record Feeding</span>
        </button>
      </div>

      {/* Metric Cards: Today's feeding, Weekly usage, Total per pond */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Today's Feeding */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Today's Feeding</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {todayTotalKg.toFixed(1)} <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {todayRecords.length} feeding rations recorded today
          </div>
        </div>

        {/* 2. Weekly Feed Usage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Weekly Feed Usage (7 Days)</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {weeklyTotalKg.toFixed(1)} <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg {(weeklyTotalKg / 7).toFixed(1)} kg distributed per day
          </div>
        </div>

        {/* 3. Total Feed Distributed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Farm Feed Utilized</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {grandTotalKg.toFixed(1)} <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {ponds.length} active production cycles
          </div>
        </div>

      </div>

      {/* Total Feed Used Per Pond Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">
          Total Feed Used Per Pond
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedByPond.map(({ pond, totalKg, recordCount }) => {
            const pct = grandTotalKg > 0 ? (totalKg / grandTotalKg) * 100 : 0;
            return (
              <div key={pond.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{pond.name}</span>
                    <span className="text-xs text-slate-500 block">{pond.fishSpecies}</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-amber-900">
                    {totalKg.toFixed(1)} kg
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{recordCount} feeding entries</span>
                  <span>{pct.toFixed(0)}% of farm total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Feeding Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Feeding History Log</h3>
            <p className="text-xs text-slate-500">Every recorded ration with time, pellet size, and notes</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPondFilter}
              onChange={e => setSelectedPondFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Ponds</option>
              {ponds.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Pond</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Quantity (kg)</th>
                <th className="py-3 px-4">Feed Type</th>
                <th className="py-3 px-3">Recorded By</th>
                <th className="py-3 px-4">Observations / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.map(rec => {
                const p = ponds.find(pond => pond.id === rec.pondId);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p ? p.name : rec.pondId}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {rec.feedingTime}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-amber-900">
                      {rec.quantityKg.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {rec.feedType}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {rec.recordedBy}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
