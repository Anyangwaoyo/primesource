import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, AlertOctagon, CheckCircle } from 'lucide-react';

interface RecordMortalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPondId?: string;
}

export const RecordMortalityModal: React.FC<RecordMortalityModalProps> = ({
  isOpen,
  onClose,
  preselectedPondId,
}) => {
  const { ponds, addMortalityRecord } = useFarm();
  const [pondId, setPondId] = useState(preselectedPondId || ponds[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadFishCount, setDeadFishCount] = useState('3');
  const [possibleObservation, setPossibleObservation] = useState('Gasping near water surface / low vigor');
  const [actionTaken, setActionTaken] = useState('Tested dissolved oxygen; activated auxiliary aeration paddle');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPond = ponds.find(p => p.id === pondId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(deadFishCount, 10);
    if (isNaN(count) || count <= 0) return;

    addMortalityRecord({
      pondId,
      date,
      deadFishCount: count,
      possibleObservation,
      actionTaken,
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
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Record Fish Mortality</h3>
              <p className="text-xs text-slate-500">Log loss, observation & immediate corrective action</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Mortality Logged</h4>
            <p className="text-xs text-slate-500">
              Pond current fish count automatically decremented.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Pond</label>
              <select
                value={pondId}
                onChange={e => setPondId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.fishSpecies} (Current: {p.currentFishCount.toLocaleString()})
                  </option>
                ))}
              </select>
              {currentPond && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current stock before log: <strong>{currentPond.currentFishCount.toLocaleString()} fish</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Dead Fish</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deadFishCount}
                  onChange={e => setDeadFishCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="3"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Possible Observation</label>
              <input
                type="text"
                required
                value={possibleObservation}
                onChange={e => setPossibleObservation(e.target.value)}
                placeholder="e.g. Gasping near inlet, cannibalism signs, scratch marks"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Action Taken</label>
              <input
                type="text"
                required
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="e.g. Isolated moribund fish, turned on aerator, applied salt bath"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Note:</span> Recording mortality automatically decrements the estimated fish count for this pond in real-time.
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
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Update Mortality Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
