import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Droplet,
  Fish,
  Utensils,
  AlertOctagon,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    ponds,
    productionCycles,
    waterReadings,
    feedingRecords,
    growthRecords,
    mortalityRecords,
    harvestRecords,
    expenses,
  } = useFarm();

  const [selectedPondId, setSelectedPondId] = useState<string>('ALL');
  const [reportPeriod, setReportPeriod] = useState<'30' | '90' | 'all'>('all');

  // Aggregations
  const filteredPonds = selectedPondId === 'ALL'
    ? ponds
    : ponds.filter(p => p.id === selectedPondId);

  const totalStocked = filteredPonds.reduce((sum, p) => sum + p.initialFishStocked, 0);
  const totalCurrent = filteredPonds.reduce((sum, p) => sum + p.currentFishCount, 0);
  
  const relevantMortality = mortalityRecords.filter(m =>
    selectedPondId === 'ALL' ? true : m.pondId === selectedPondId
  );
  const totalMortality = relevantMortality.reduce((sum, m) => sum + m.deadFishCount, 0);
  const survivalRate = totalStocked > 0
    ? (((totalStocked - totalMortality) / totalStocked) * 100).toFixed(1)
    : '100';

  const relevantFeeds = feedingRecords.filter(f =>
    selectedPondId === 'ALL' ? true : f.pondId === selectedPondId
  );
  const totalFeedKg = relevantFeeds.reduce((sum, f) => sum + f.quantityKg, 0);

  const relevantHarvests = harvestRecords.filter(h =>
    selectedPondId === 'ALL' ? true : h.pondId === selectedPondId
  );
  const totalHarvestKg = relevantHarvests.reduce((sum, h) => sum + h.totalWeightKg, 0);
  const totalRevenue = relevantHarvests.reduce((sum, h) => sum + h.totalSales, 0);

  const relevantExpenses = expenses.filter(e =>
    selectedPondId === 'ALL' ? true : e.pondId === selectedPondId
  );
  const totalExpenses = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netOperatingProfit = totalRevenue - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['PrimeSource Farm Production Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Scope: ${selectedPondId === 'ALL' ? 'Entire Farm' : selectedPondId}`],
      [],
      ['Metric', 'Value'],
      ['Total Fish Stocked', totalStocked],
      ['Surviving Fish Count', totalCurrent],
      ['Total Mortality Count', totalMortality],
      ['Survival Rate', `${survivalRate}%`],
      ['Total Feed Used (kg)', totalFeedKg],
      ['Total Harvest Yield (kg)', totalHarvestKg],
      ['Gross Sales Revenue', totalRevenue],
      ['Recorded Production Expenses', totalExpenses],
      ['Net Farm Position', netOperatingProfit],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `primesource_farm_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Production Analytics & Reports</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured management summary for yield, input expenses, survival, and fish sales
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPondId}
            onChange={e => setSelectedPondId(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Ponds Consolidated</option>
            {ponds.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.fishSpecies})</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        
        {/* Farm Letterhead */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black">
                PSF
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">PRIMESOURCE FARM</h2>
                <div className="text-xs text-slate-500">AgriTech Fish-Production Business & Management</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Operational Farm Production & Commercial Offtake Report
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-600">
            <div><strong>Report Scope:</strong> {selectedPondId === 'ALL' ? 'Consolidated Farm' : selectedPondId}</div>
            <div><strong>Generated By:</strong> Farm Manager / Admin</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Core Yield & Financial Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Survival Rate</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{survivalRate}%</div>
              <div className="text-[11px] text-slate-500">{totalCurrent.toLocaleString()} / {totalStocked.toLocaleString()} fish</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Cumulative Feed</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalFeedKg.toFixed(1)} kg</div>
              <div className="text-[11px] text-slate-500">{relevantFeeds.length} feeding entries</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Harvest Sales</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{formatCurrency(totalRevenue)}</div>
              <div className="text-[11px] text-slate-500">{totalHarvestKg.toLocaleString()} kg total weight</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Recorded Expenses</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpenses)}</div>
              <div className="text-[11px] text-slate-500">Inputs, fingerlings & feeds</div>
            </div>
          </div>
        </div>

        {/* Ponds Status Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Production Pond Status Overview
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Pond</th>
                  <th className="py-2.5 px-3">Species</th>
                  <th className="py-2.5 px-3">Stocked</th>
                  <th className="py-2.5 px-3">Current Count</th>
                  <th className="py-2.5 px-3">Avg Weight</th>
                  <th className="py-2.5 px-3">Production Stage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4">Expected Harvest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                {filteredPonds.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4 font-bold font-sans">{p.name}</td>
                    <td className="py-2.5 px-3 font-sans">{p.fishSpecies}</td>
                    <td className="py-2.5 px-3">{p.initialFishStocked.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold">{p.currentFishCount.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{p.averageFishWeightGrams} g</td>
                    <td className="py-2.5 px-3 font-sans">{p.productionStage.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans">{formatDate(p.expectedHarvestDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses vs Harvest Sales Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Expenses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Production Expenses ({formatCurrency(totalExpenses)})
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relevantExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="py-2 px-3 text-slate-500">{formatDate(e.date)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{e.category}</td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{e.description}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Harvest Realizations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Harvest Sales Realization ({formatCurrency(totalRevenue)})
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Weight</th>
                    <th className="py-2 px-3 text-right">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relevantHarvests.map(h => (
                    <tr key={h.id}>
                      <td className="py-2 px-3 text-slate-500">{formatDate(h.harvestDate)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{h.buyerCustomer}</td>
                      <td className="py-2 px-3 font-mono">{h.totalWeightKg} kg</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(h.totalSales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Manager Signoff */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            PrimeSource Farm Aquaculture Management System • Prototype Version 1.0
          </div>
          <div className="flex items-center space-x-6">
            <div>
              <span className="block border-b border-slate-400 w-36 mb-1" />
              <span>Farm Manager Signature</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
