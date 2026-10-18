import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { ProductionStage } from '../../types';
import { X, Layers, CheckCircle } from 'lucide-react';

interface CreatePondModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePondModal: React.FC<CreatePondModalProps> = ({ isOpen, onClose }) => {
  const { ponds, addPond } = useFarm();
  const nextPondNumber = ponds.length + 1;
  const [name, setName] = useState(`Pond A0${nextPondNumber}`);
  const [fishSpecies, setFishSpecies] = useState('African Catfish (Clarias gariepinus)');
  const [dateStocked, setDateStocked] = useState(new Date().toISOString().split('T')[0]);
  const [initialFishStocked, setInitialFishStocked] = useState('1000');
  const [averageFishWeightGrams, setAverageFishWeightGrams] = useState('20');
  const [productionStage, setProductionStage] = useState<ProductionStage>('STOCKED');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().split('T')[0];
  });
  const [pondType, setPondType] = useState('Concrete Tank with Aerator');
  const [waterCapacityLitres, setWaterCapacityLitres] = useState('35000');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockedCount = parseInt(initialFishStocked, 10);
    const avgWeight = parseFloat(averageFishWeightGrams);
    const capacity = parseInt(waterCapacityLitres, 10);

    if (isNaN(stockedCount) || stockedCount <= 0 || isNaN(avgWeight) || avgWeight <= 0) {
      return;
    }

    addPond({
      name,
      fishSpecies,
      dateStocked,
      initialFishStocked: stockedCount,
      averageFishWeightGrams: avgWeight,
      productionStage,
      expectedHarvestDate,
      pondType,
      waterCapacityLitres: capacity || 30000,
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Create New Pond</h3>
              <p className="text-xs text-slate-500">Configure pond parameters, species, and initial stocking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Pond Created & Active!</h4>
            <p className="text-xs text-slate-500">Stocking cycle initialized and added to monitoring.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pond Name / ID</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pond Type</label>
                <select
                  value={pondType}
                  onChange={e => setPondType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Concrete Tank with Aerator">Concrete Tank with Aerator</option>
                  <option value="Earthen Pond with Inflow Canal">Earthen Pond with Inflow Canal</option>
                  <option value="Tarpaulin Recirculating Tank">Tarpaulin Recirculating Tank</option>
                  <option value="HDPE Lined Reservoir">HDPE Lined Reservoir</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fish Species</label>
              <select
                value={fishSpecies}
                onChange={e => setFishSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="African Catfish (Clarias gariepinus)">African Catfish (Clarias gariepinus)</option>
                <option value="Nile Tilapia (Oreochromis niloticus)">Nile Tilapia (Oreochromis niloticus)</option>
                <option value="Hybrid Catfish (Hetero-clarias)">Hybrid Catfish (Hetero-clarias)</option>
                <option value="Carp (Cyprinus carpio)">Common Carp (Cyprinus carpio)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Fish Stocked</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={initialFishStocked}
                  onChange={e => setInitialFishStocked(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Avg Weight (g)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={averageFishWeightGrams}
                  onChange={e => setAverageFishWeightGrams(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date Stocked</label>
                <input
                  type="date"
                  required
                  value={dateStocked}
                  onChange={e => setDateStocked(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Harvest Date</label>
                <input
                  type="date"
                  required
                  value={expectedHarvestDate}
                  onChange={e => setExpectedHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Production Stage</label>
                <select
                  value={productionStage}
                  onChange={e => setProductionStage(e.target.value as ProductionStage)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="POND_PREPARATION">Pond Preparation</option>
                  <option value="STOCKED">Stocked</option>
                  <option value="GROW_OUT">Grow-Out</option>
                  <option value="HARVEST_READY">Harvest Ready</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Water Capacity (Litres)</label>
                <input
                  type="number"
                  value={waterCapacityLitres}
                  onChange={e => setWaterCapacityLitres(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Hatchery source, certificate number, or specific stocking objectives..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
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
                Register Pond
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
