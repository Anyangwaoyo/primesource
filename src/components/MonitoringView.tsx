import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  AlertTriangle,
  Cpu,
  Clock,
  RefreshCw,
  Droplets,
  Thermometer,
  Wind,
  PlusCircle,
} from 'lucide-react';
import { formatTimeOnly } from '../utils/formatters';
import { TabType } from './Navigation';

interface MonitoringViewProps {
  onNavigate?: (tab: TabType) => void;
  onOpenIotModal?: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  onNavigate,
  onOpenIotModal,
}) => {
  const { ponds, waterReadings, simulateSensorPacket } = useFarm();

  // Show only 2 to 3 ponds as requested by prompt
  const displayPonds = ponds.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Prototype Disclaimer Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143822] tracking-tight">
            Pond Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#496350] font-medium mt-1">
            Live telemetry of water temperature, pH and dissolved oxygen across active production units.
          </p>
        </div>

        {/* Prototype Sensor Data Label */}
        <div className="flex items-center">
          <div
            id="badge-prototype-sensor-data"
            onClick={onOpenIotModal}
            className="w-full sm:w-auto inline-flex items-center space-x-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#EEF3F0] border border-[#7E9F86] text-[#1E5032] text-xs font-bold shadow-xs cursor-pointer hover:bg-[#DEE8E1] transition-colors"
            title="Click to view IoT hardware interface"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#7E9F86] flex items-center justify-center text-white shrink-0">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5 font-black uppercase tracking-wide text-[11px] sm:text-xs">
                <span>Prototype Sensor Data</span>
                <span className="w-2 h-2 rounded-full bg-[#0EB5B2] inline-block shadow-xs" />
              </div>
              <p className="text-[10px] text-[#5F8067] font-medium hidden xs:block sm:block">IoT hardware interface simulated for pitch</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 to 3 Ponds Grid - Responsive on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {displayPonds.map(pond => {
          const readings = waterReadings
            .filter(r => r.pondId === pond.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const latest = readings[0] || null;

          // Determine status
          let statusText: 'NORMAL' | 'ATTENTION NEEDED' | 'CRITICAL' = 'NORMAL';
          if (pond.status === 'CRITICAL' || latest?.status === 'CRITICAL') {
            statusText = 'CRITICAL';
          } else if (pond.status === 'ATTENTION_NEEDED' || latest?.status === 'ATTENTION_NEEDED') {
            statusText = 'ATTENTION NEEDED';
          }

          const isAttention = statusText === 'ATTENTION NEEDED';
          const isCritical = statusText === 'CRITICAL';

          const temperatureC = latest ? latest.temperatureC.toFixed(1) : '27.8';
          const pH = latest ? latest.pH.toFixed(1) : '7.2';
          const dissolvedOxygen = latest ? latest.dissolvedOxygenMgL.toFixed(1) : '6.5';
          const lastReadingTime = latest ? formatTimeOnly(latest.timestamp) : '09:15 AM';

          const speciesLabel = pond.fishSpecies.includes('Tilapia') ? 'Tilapia' : 'Catfish';

          return (
            <div
              key={pond.id}
              id={`monitoring-card-${pond.id}`}
              className={`rounded-2xl sm:rounded-3xl bg-white border p-4 sm:p-6 shadow-xs flex flex-col justify-between transition-all ${
                isAttention
                  ? 'border-2 border-amber-500 ring-4 ring-amber-100/70 bg-amber-50/20'
                  : isCritical
                  ? 'border-2 border-rose-500 ring-4 ring-rose-100/70 bg-rose-50/20'
                  : 'border-[#CBD8CF] hover:border-[#7E9F86]'
              }`}
            >
              <div>
                {/* Header: Pond Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#143822] tracking-tight">
                      {pond.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-[#5F8067] mt-0.5">
                      {pond.currentFishCount.toLocaleString()} {speciesLabel}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full tracking-wider shrink-0 ${
                      isAttention
                        ? 'bg-amber-100 text-amber-900 border-2 border-amber-400'
                        : isCritical
                        ? 'bg-rose-100 text-rose-900 border-2 border-rose-400'
                        : 'bg-[#EEF3F0] text-[#1E5032] border-2 border-[#CBD8CF]'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                {/* Attention Alert Banner if required */}
                {isAttention && (
                  <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-medium">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Attention Required</span>
                    </div>
                    <p className="mt-1 text-amber-900 font-medium leading-normal text-[11px] sm:text-xs">
                      Low pH reading (5.4) detected. Water is acidic and requires limestone buffer.
                    </p>
                  </div>
                )}

                {/* Parameters Display */}
                <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
                  
                  {/* Water Temperature */}
                  <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#EEF3F0]/80 border border-[#CBD8CF]">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                        <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#334638] uppercase tracking-wide">
                        Water Temp
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#1E5032] font-mono">
                      {temperatureC}°C
                    </div>
                  </div>

                  {/* pH Level */}
                  <div className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
                    Number(pH) < 6.5 || Number(pH) > 8.5
                      ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                      : 'bg-[#EEF3F0]/80 border-[#CBD8CF]'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${Number(pH) < 6.5 ? 'bg-amber-200 text-amber-800' : 'bg-[#DEE8E1] text-[#1E5032]'}`}>
                        <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#334638] uppercase tracking-wide">
                        pH Level
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black font-mono text-[#1E5032]">
                      {pH}
                    </div>
                  </div>

                  {/* Dissolved Oxygen */}
                  <div className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
                    Number(dissolvedOxygen) < 5.0
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-[#EEF3F0]/80 border-[#CBD8CF]'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#E0F7F6] flex items-center justify-center text-[#088C8A] shrink-0">
                        <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#334638] uppercase tracking-wide">
                        Dissolved O₂
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#1E5032] font-mono">
                      {dissolvedOxygen} <span className="text-[10px] sm:text-xs font-semibold text-[#5F8067]">mg/L</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Card Footer: Last reading & Quick actions (44px min-height targets) */}
              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-[#EEF3F0]">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="flex items-center space-x-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#7E9F86]" />
                    <span>Last Reading:</span>
                  </span>
                  <span className="font-bold text-[#143822] font-mono">{lastReadingTime}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => simulateSensorPacket(pond.id, pond.id === 'POND-A02')}
                    className="flex-1 py-3 px-3 rounded-xl bg-[#EEF3F0] hover:bg-[#DEE8E1] text-[#1E5032] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-[#CBD8CF] min-h-[44px]"
                    title="Simulate telemetry data packet update"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#5F8067] shrink-0" />
                    <span className="truncate">Simulate Tick</span>
                  </button>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('record')}
                      className="py-3 px-4 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white text-xs font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-xs min-h-[44px] shrink-0"
                      title="Log manual test reading"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[10px] text-[#5F8067] uppercase tracking-wider font-bold inline-flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0EB5B2]" />
                    <span>Prototype Sensor Data</span>
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Safe Threshold Guide Card */}
      <div className="rounded-2xl bg-white border border-[#CBD8CF] p-4 sm:p-5 text-xs text-[#334638] shadow-xs">
        <div className="font-black text-[#143822] uppercase tracking-wide mb-2.5 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0EB5B2] shrink-0" />
          <span>Aquaculture Safe Parameter Thresholds</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 font-semibold">
          <div className="flex items-center space-x-2 bg-[#EEF3F0]/60 p-2.5 rounded-xl border border-[#CBD8CF]">
            <span className="w-2 h-2 rounded-full bg-[#1E5032] shrink-0" />
            <span>Water Temp: <strong className="text-[#143822]">26.0°C – 30.0°C</strong></span>
          </div>
          <div className="flex items-center space-x-2 bg-[#EEF3F0]/60 p-2.5 rounded-xl border border-[#CBD8CF]">
            <span className="w-2 h-2 rounded-full bg-[#1E5032] shrink-0" />
            <span>pH Range: <strong className="text-[#143822]">6.5 – 8.5</strong></span>
          </div>
          <div className="flex items-center space-x-2 bg-[#EEF3F0]/60 p-2.5 rounded-xl border border-[#CBD8CF]">
            <span className="w-2 h-2 rounded-full bg-[#1E5032] shrink-0" />
            <span>Dissolved Oxygen: <strong className="text-[#143822]">≥ 5.0 mg/L</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
