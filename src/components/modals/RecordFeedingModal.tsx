import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Utensils, CheckCircle } from 'lucide-react';

interface RecordFeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPondId?: string;
}

export const RecordFeedingModal: React.FC<RecordFeedingModalProps> = ({
  isOpen,
  onClose,
  preselectedPondId,
}) => {
  const { ponds, addFeedingRecord } = useFarm();
  const [pondId, setPondId] = useState(preselectedPondId || ponds[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantityKg, setQuantityKg] = useState('12.5');
  const [feedType, setFeedType] = useState('3mm Floating Extruded Pellets (42% Protein)');
  const [feedingTime, setFeedingTime] = useState('08:30 AM');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0) return;

    addFeedingRecord({
      pondId,
      date,
      quantityKg: qty,
      feedType,
      feedingTime,
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Record Feeding</h3>
              <p className="text-xs text-slate-500">Log feed distribution and feeding response</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Feeding Logged!</h4>
            <p className="text-xs text-slate-500">Today's feed metrics and pond history updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Pond</label>
              <select
                value={pondId}
                onChange={e => setPondId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.fishSpecies} ({p.currentFishCount.toLocaleString()} fish)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feeding Time</label>
                <input
                  type="text"
                  required
                  value={feedingTime}
                  onChange={e => setFeedingTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Used (kg)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                value={quantityKg}
                onChange={e => setQuantityKg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10.0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feed Type</label>
              <select
                value={feedType}
                onChange={e => setFeedType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2mm Starter Extruded Pellets (45% Protein)">2mm Starter Extruded Pellets (45% Protein)</option>
                <option value="3mm Floating Extruded Pellets (42% Protein)">3mm Floating Extruded Pellets (42% Protein)</option>
                <option value="4mm Grower Floating Pellets (38% Protein)">4mm Grower Floating Pellets (38% Protein)</option>
                <option value="6mm Finisher Pellets (35% Protein)">6mm Finisher Pellets (35% Protein)</option>
                <option value="2.5mm Tilapia Sinking Grower Feed">2.5mm Tilapia Sinking Grower Feed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feeding Response / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Aggressive feeding, consumed in 10 mins"
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
                Save Feeding Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
