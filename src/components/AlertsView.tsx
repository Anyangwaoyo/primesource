import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  CheckCircle2,
  Clock,
  Play,
  CheckCircle,
} from 'lucide-react';
import { formatTimeOnly, formatDateTime } from '../utils/formatters';

interface AlertsViewProps {
  onOpenResolveAlert?: (alertId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenResolveAlert }) => {
  const { alerts, ponds, resolveAlert, simulateSensorPacket } = useFarm();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string>('Applied agricultural limestone buffer to neutralize acidity.');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  const handleResolveClick = (alertId: string) => {
    if (onOpenResolveAlert) {
      onOpenResolveAlert(alertId);
    } else {
      setResolvingId(alertId);
    }
  };

  const handleConfirmResolve = (alertId: string) => {
    resolveAlert(alertId, actionNote || 'Parameter stabilized and verified.');
    setResolvingId(null);
    setSuccessMsg('Alert successfully marked as resolved!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143822] tracking-tight">
            Pond Alerts
          </h1>
          <p className="text-xs sm:text-sm text-[#496350] font-medium mt-1">
            Real-time threshold warnings requiring immediate attention and corrective management.
          </p>
        </div>

        <div>
          <button
            onClick={() => simulateSensorPacket('POND-A02', true)}
            id="btn-simulate-alert-test"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2.5 bg-[#EEF3F0] hover:bg-[#DEE8E1] text-[#1E5032] border border-[#CBD8CF] rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs min-h-[44px]"
            title="Fire a simulated threshold warning to test the workflow"
          >
            <Play className="w-3.5 h-3.5 text-[#0EB5B2]" />
            <span>Simulate Test Alert</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-[#EEF3F0] border-2 border-[#7E9F86] text-[#1E5032] p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#1E5032] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: ACTIVE ALERTS REQUIRING ATTENTION */}
      <section id="section-active-alerts">
        <div className="flex items-center space-x-2.5 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-black text-[#143822]">
            Active Alerts Requiring Attention
          </h2>
          {activeAlerts.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              {activeAlerts.length} Active
            </span>
          )}
        </div>

        {activeAlerts.length > 0 ? (
          <div className="space-y-4">
            {activeAlerts.map(alert => {
              const pond = ponds.find(p => p.id === alert.pondId);
              const isResolving = resolvingId === alert.id;

              return (
                <div
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className="rounded-2xl sm:rounded-3xl bg-white border-2 border-amber-400 p-4 sm:p-6 lg:p-7 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      
                      {/* Status Tag */}
                      <div className="inline-block">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300">
                          {alert.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Pond Name */}
                      <h3 className="text-lg sm:text-xl font-black text-[#143822]">
                        {pond ? pond.name : alert.pondId}
                      </h3>

                      {/* Problem Description */}
                      <div className="text-xs sm:text-sm font-bold text-amber-950">
                        {alert.problemDetected}
                      </div>

                      {/* Current Reading & Timestamp */}
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p>
                          Current Reading: <span className="font-mono font-bold text-[#143822]">{alert.currentReading}</span>
                        </p>
                        <p className="flex items-center space-x-1 text-slate-500 text-[11px] sm:text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Recorded: {formatTimeOnly(alert.timestamp)}</span>
                        </p>
                      </div>

                      {/* Recommended action tip */}
                      <div className="pt-2 text-xs text-[#1E5032] bg-[#EEF3F0] p-3 rounded-xl border border-[#CBD8CF] leading-relaxed">
                        <strong className="text-[#143822]">Action Recommended:</strong> Apply agricultural limestone (calcium carbonate) or flush with fresh aerated water to safely elevate pH above 6.5.
                      </div>
                    </div>

                    {/* Action: Mark as Resolved */}
                    <div className="sm:text-right shrink-0">
                      {!isResolving ? (
                        <button
                          onClick={() => handleResolveClick(alert.id)}
                          id={`btn-mark-resolved-${alert.id}`}
                          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white font-black text-xs sm:text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
                        >
                          <CheckCircle className="w-4 h-4 text-[#0EB5B2]" />
                          <span>Mark as Resolved</span>
                        </button>
                      ) : (
                        <div className="bg-[#EEF3F0] p-3.5 sm:p-4 rounded-2xl border border-[#CBD8CF] text-left space-y-3 max-w-sm w-full">
                          <div className="text-xs font-black text-[#143822]">
                            Log Action Taken:
                          </div>
                          <input
                            type="text"
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            className="w-full px-3 py-2 text-base sm:text-xs bg-white border border-[#CBD8CF] rounded-xl text-[#143822] focus:ring-2 focus:ring-[#1E5032] min-h-[44px]"
                            placeholder="e.g. Applied 15kg limestone"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleConfirmResolve(alert.id)}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white text-xs font-bold cursor-pointer min-h-[44px]"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setResolvingId(null)}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#334638] text-xs font-semibold border border-[#CBD8CF] cursor-pointer min-h-[44px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl bg-[#EEF3F0] border-2 border-[#7E9F86] p-6 sm:p-8 text-center">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#1E5032] mx-auto mb-2" />
            <h3 className="text-sm sm:text-base font-black text-[#143822]">
              All Ponds Operating Normally
            </h3>
            <p className="text-xs text-[#496350] font-semibold mt-1 max-w-md mx-auto">
              No parameters have breached safety limits. Water quality telemetry is stable across all production units.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: HISTORY OF RESOLVED ALERTS */}
      <section id="section-resolved-alerts">
        <h2 className="text-base sm:text-lg font-black text-[#143822] mb-3 sm:mb-4">
          History of Resolved Alerts
        </h2>

        {resolvedAlerts.length > 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#CBD8CF] divide-y divide-[#EEF3F0] shadow-xs overflow-hidden">
            {resolvedAlerts.map(alert => {
              const pond = ponds.find(p => p.id === alert.pondId);
              return (
                <div key={alert.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] sm:text-xs font-black text-[#1E5032] bg-[#EEF3F0] px-2 py-0.5 rounded-md border border-[#CBD8CF]">
                        RESOLVED
                      </span>
                      <span className="font-extrabold text-[#143822] text-xs sm:text-sm">
                        {pond ? pond.name : alert.pondId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      {alert.problemDetected}
                    </p>

                    {alert.actionTaken && (
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        <strong className="text-[#334638]">Action taken:</strong> {alert.actionTaken}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium sm:text-right shrink-0">
                    <div>Resolved: {alert.resolvedAt ? formatDateTime(alert.resolvedAt) : 'Earlier today'}</div>
                    <div className="text-[#5F8067] font-semibold">By: {alert.resolvedBy || 'Farm Manager'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#CBD8CF] p-6 text-center text-xs text-[#5F8067]">
            No resolved alerts on record yet.
          </div>
        )}
      </section>

    </div>
  );
};
