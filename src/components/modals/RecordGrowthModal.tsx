import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Scale, CheckCircle } from 'lucide-react';

interface RecordGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPondId?: string;
}

export const RecordGrowthModal: React.FC<RecordGrowthModalProps> = ({
  isOpen,
  onClose,
  preselectedPondId,
}) => {
  const { ponds, addGrowthRecord } = useFarm();
  const [pondId, setPondId] = useState(preselectedPondId || ponds[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fishSampledCount, setFishSampledCount] = useState('30');
  const [averageWeightGrams, setAverageWeightGrams] = useState('480');
  const [notes, setNotes] = useState('Routine net sampling batch; active vigor and healthy gill coloration.');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(fishSampledCount, 10);
    const avgWeight = parseFloat(averageWeightGrams);
    if (isNaN(count) || count <= 0 || isNaN(avgWeight) || avgWeight <= 0) return;

    addGrowthRecord({
      pondId,
      date,
      fishSampledCount: count,
      averageWeightGrams: avgWeight,
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
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Sample Fish Growth</h3>
              <p className="text-xs text-slate-500">Record batch weight sampling and biometric progress</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Growth Sampling Saved</h4>
            <p className="text-xs text-slate-500">Pond average fish weight updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Pond</label>
              <select
                value={pondId}
                onChange={e => setPondId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.fishSpecies} (Current avg: {p.averageFishWeightGrams}g)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sampling Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number Sampled</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={fishSampledCount}
                  onChange={e => setFishSampledCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Average Weight per Fish (Grams)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={averageWeightGrams}
                onChange={e => setAverageWeightGrams(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="480"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target market size is typically 700g–1000g for catfish, 400g–600g for tilapia.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sampling Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Feed conversion observations, size uniformity, grading needs..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Record Growth Sample
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
