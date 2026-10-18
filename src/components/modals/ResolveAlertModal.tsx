import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Alert } from '../../types';
import { X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface ResolveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

export const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
}) => {
  const { ponds, resolveAlert } = useFarm();
  const [actionTaken, setActionTaken] = useState(
    'Applied agricultural lime (calcium carbonate) to buffer acidic pH and refreshed clean pond inflow water.'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !alert) return null;

  const pond = ponds.find(p => p.id === alert.pondId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken.trim()) return;

    resolveAlert(alert.id, actionTaken.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Resolve Water Alert</h3>
              <p className="text-xs text-slate-500">Record corrective farm action taken</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-lg font-semibold text-slate-800">Alert Marked as Resolved</h4>
            <p className="text-xs text-slate-500">
              Pond condition re-evaluated and corrective action logged to activity timeline.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Alert Summary Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900">
                  {pond ? pond.name : alert.pondId}
                </span>
                <span className="text-[11px] text-amber-700">
                  Recorded: {formatDateTime(alert.timestamp)}
                </span>
              </div>
              <p className="text-amber-800 font-medium">{alert.problemDetected}</p>
              <div className="font-mono text-[11px] text-amber-900/80 bg-white/70 px-2 py-1 rounded">
                Reading: {alert.currentReading}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corrective Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="Detail the biological/chemical intervention, water exchange, aeration or feeding adjustment made..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Disclaimer per prompt */}
            <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>System Guidance:</strong> PrimeSource Farm identifies unusual readings to help the farmer respond earlier. It does not diagnose diseases or automatically determine biological pathology.
              </span>
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
                Confirm Action & Resolve Alert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
