import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, TestTube, CheckCircle } from 'lucide-react';

interface ManualReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPondId?: string;
}

export const ManualReadingModal: React.FC<ManualReadingModalProps> = ({
  isOpen,
  onClose,
  preselectedPondId,
}) => {
  const { ponds, addWaterReading } = useFarm();
  const [pondId, setPondId] = useState(preselectedPondId || ponds[0]?.id || '');
  const [temperatureC, setTemperatureC] = useState('28.0');
  const [pH, setPH] = useState('7.2');
  const [dissolvedOxygenMgL, setDissolvedOxygenMgL] = useState('6.5');
  const [notes, setNotes] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('Digital Pen Tester');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const temp = parseFloat(temperatureC);
    const phVal = parseFloat(pH);
    const doVal = parseFloat(dissolvedOxygenMgL);

    if (isNaN(temp) || isNaN(phVal) || isNaN(doVal)) {
      return;
    }

    const noteText = notes ? `[${equipmentUsed}] ${notes}` : `Measured with ${equipmentUsed}.`;

    addWaterReading({
      pondId,
      temperatureC: temp,
      pH: phVal,
      dissolvedOxygenMgL: doVal,
      readingSource: 'MANUAL_TESTING',
      notes: noteText,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TestTube className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Enter Manual Water Test</h3>
              <p className="text-xs text-slate-500">Record physical testing equipment measurements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Reading Logged!</h4>
            <p className="text-xs text-slate-500">Water parameters updated and checked against safe ranges.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Pond</label>
              <select
                value={pondId}
                onChange={e => setPondId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.fishSpecies}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temp (°C)
                  <span className="text-[10px] block font-normal text-slate-400">Safe: 26-30°C</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temperatureC}
                  onChange={e => setTemperatureC(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="28.0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  pH Level
                  <span className="text-[10px] block font-normal text-slate-400">Safe: 6.5-8.5</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={pH}
                  onChange={e => setPH(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="7.2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DO (mg/L)
                  <span className="text-[10px] block font-normal text-slate-400">Safe: ≥ 5.0</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={dissolvedOxygenMgL}
                  onChange={e => setDissolvedOxygenMgL(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="6.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Testing Instrument</label>
              <select
                value={equipmentUsed}
                onChange={e => setEquipmentUsed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Digital Pen Tester">Digital Electronic Pen Tester</option>
                <option value="Reagent Test Kit">Chemical Colorimetric Reagent Kit</option>
                <option value="Optical DO Meter">Handheld Optical DO Meter</option>
                <option value="Multi-Parameter Probe">Multi-Parameter Field Probe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Observations (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Water color, odor, foam, or weather context..."
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
                Save Water Reading
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
