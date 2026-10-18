import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, ShoppingBag, CheckCircle, Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface RecordHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPondId?: string;
}

export const RecordHarvestModal: React.FC<RecordHarvestModalProps> = ({
  isOpen,
  onClose,
  preselectedPondId,
}) => {
  const { ponds, productionCycles, addHarvestRecord } = useFarm();
  const [pondId, setPondId] = useState(preselectedPondId || ponds[0]?.id || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [fishHarvestedCount, setFishHarvestedCount] = useState('780');
  const [totalWeightKg, setTotalWeightKg] = useState('720');
  const [sellingPricePerKg, setSellingPricePerKg] = useState('3.80');
  const [buyerCustomer, setBuyerCustomer] = useState('Apex Fishery Offtakers Ltd');
  const [notes, setNotes] = useState('Prime quality commercial table size; fresh live off-take at farm gate.');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPond = ponds.find(p => p.id === pondId);
  const activeCycle = productionCycles.find(c => c.pondId === pondId && c.status === 'ACTIVE');

  const count = parseInt(fishHarvestedCount, 10) || 0;
  const weightKg = parseFloat(totalWeightKg) || 0;
  const priceKg = parseFloat(sellingPricePerKg) || 0;
  const calculatedTotal = weightKg * priceKg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0 || weightKg <= 0 || priceKg <= 0) return;

    addHarvestRecord({
      pondId,
      cycleId: activeCycle ? activeCycle.id : `cyc-adhoc-${Date.now()}`,
      harvestDate,
      fishHarvestedCount: count,
      totalWeightKg: weightKg,
      sellingPricePerKg: priceKg,
      buyerCustomer: buyerCustomer.trim() || 'Wholesale Buyer',
      notes: notes.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Record Pond Harvest</h3>
              <p className="text-xs text-slate-500">Log harvested yield, selling price, and revenue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Harvest Recorded!</h4>
            <p className="text-xs text-slate-500">
              Total sales calculated: {formatCurrency(calculatedTotal)}. Pond cycle completed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Pond</label>
              <select
                value={pondId}
                onChange={e => setPondId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.fishSpecies} (Estimated remaining: {p.currentFishCount.toLocaleString()} fish)
                  </option>
                ))}
              </select>
              {currentPond && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current production stage: <strong>{currentPond.productionStage.replace(/_/g, ' ')}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={e => setHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fish Harvested Count</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={fishHarvestedCount}
                  onChange={e => setFishHarvestedCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Harvest Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={totalWeightKg}
                  onChange={e => setTotalWeightKg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="720"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price per kg ($)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  required
                  value={sellingPricePerKg}
                  onChange={e => setSellingPricePerKg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="3.80"
                />
              </div>
            </div>

            {/* Auto-calculated Total Sales Banner */}
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="text-xs text-emerald-800 font-medium">Automatic Total Sales Calculation</div>
                  <div className="text-[11px] text-emerald-600">
                    {weightKg.toLocaleString()} kg × ${priceKg.toFixed(2)} / kg
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-900">{formatCurrency(calculatedTotal)}</div>
                <div className="text-[10px] text-emerald-700">Gross Revenue</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer / Customer</label>
              <input
                type="text"
                required
                value={buyerCustomer}
                onChange={e => setBuyerCustomer(e.target.value)}
                placeholder="e.g. Lagoon Seafood Wholesalers"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Meat quality, processing method, payment term..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Complete Harvest & Record Sales
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
