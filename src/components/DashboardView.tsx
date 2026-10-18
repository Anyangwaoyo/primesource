import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Activity,
  ClipboardEdit,
  AlertTriangle,
  Layers,
  Fish,
  Utensils,
  CheckCircle2,
  ArrowRight,
  Droplets,
} from 'lucide-react';
import { TabType } from './Navigation';
import { formatTimeOnly, formatDateTime } from '../utils/formatters';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenResolveAlert?: (alertId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenResolveAlert,
}) => {
  const { ponds, alerts, feedingRecords, waterReadings, resolveAlert, activities } = useFarm();
  const [resolvedSuccessMsg, setResolvedSuccessMsg] = useState<string | null>(null);

  // Core metrics calculation
  const totalActivePonds = ponds.length;
  const totalFishCount = ponds.reduce((sum, p) => sum + p.currentFishCount, 0);

  // Today's feed kg
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysFeedKg = feedingRecords
    .filter(f => f.date === todayStr)
    .reduce((sum, f) => sum + f.quantityKg, 0);

  // Active alerts
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const latestAlert = unresolvedAlerts[0] || null;

  // Latest water readings mapped for 2-3 ponds
  const pondReadings = ponds.slice(0, 3).map(pond => {
    const readings = waterReadings.filter(r => r.pondId === pond.id);
    const latest = readings[0] || null;
    return {
      pond,
      reading: latest,
    };
  });

  const handleQuickResolve = (alertId: string) => {
    if (onOpenResolveAlert) {
      onOpenResolveAlert(alertId);
    } else {
      resolveAlert(alertId, 'Checked pond water and applied corrective limestone buffering.');
      setResolvedSuccessMsg('Alert marked as resolved!');
      setTimeout(() => setResolvedSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">

      {/* 1. HERO SECTION - Styled with Brand Sage & Forest Green */}
      <section
        id="hero-section"
        className="rounded-2xl sm:rounded-3xl bg-[#7E9F86] border border-[#6D8E75] p-5 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#1E5032]/10 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          
          {/* Brand Signature Tag from Uploaded Card */}
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#1E5032]/15 backdrop-blur-xs text-[11px] sm:text-xs font-black uppercase tracking-wider mb-3 sm:mb-4 border border-[#1E5032]/20">
            <span className="text-[#1E5032]">PRIMESOURCE</span>
            <span className="text-white">FARM</span>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0EB5B2] inline-block shadow-xs" />
            <span className="text-[#1E5032]/80 font-bold ml-1 hidden xs:inline sm:inline">• AgriTech Platform</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#143822] tracking-tight leading-tight">
            Smarter Fish Production Starts With Better Monitoring.
          </h1>
          
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-[#163D26] font-medium leading-relaxed max-w-2xl">
            PrimeSource Farm helps us monitor pond conditions, keep production records and spot problems early.
          </p>

          {/* EXACTLY 3 ACTION BUTTONS - Fully Responsive on Mobile */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5">
            <button
              onClick={() => onNavigate('monitor')}
              id="hero-btn-monitor-ponds"
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#143822] min-h-[48px]"
            >
              <Activity className="w-5 h-5 text-[#0EB5B2] shrink-0" />
              <span>1. MONITOR PONDS</span>
            </button>

            <button
              onClick={() => onNavigate('record')}
              id="hero-btn-record-production"
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl bg-white hover:bg-[#EEF3F0] text-[#1E5032] font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#CBD8CF] min-h-[48px]"
            >
              <ClipboardEdit className="w-5 h-5 text-[#1E5032] shrink-0" />
              <span>2. RECORD PRODUCTION</span>
            </button>

            <button
              onClick={() => onNavigate('alerts')}
              id="hero-btn-view-alerts"
              className={`w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[48px] ${
                unresolvedAlerts.length > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400'
                  : 'bg-[#DEE8E1] hover:bg-[#D2E0D6] text-[#1E5032] border border-[#CBD8CF]'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>3. VIEW ALERTS</span>
              {unresolvedAlerts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-950 text-amber-300 font-black">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD TOP METRICS - 4 Core Cards */}
      <section id="dashboard-top-metrics" aria-label="Farm Overview Metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          
          {/* Metric 1: Active Ponds */}
          <div
            id="metric-active-ponds"
            onClick={() => onNavigate('monitor')}
            className="bg-white rounded-2xl border border-[#CBD8CF] hover:border-[#7E9F86] p-4 sm:p-5 lg:p-6 shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-[#496350] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Active Ponds</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EEF3F0] flex items-center justify-center text-[#1E5032] shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E5032]">
              {totalActivePonds}
            </div>
            <p className="text-[11px] sm:text-xs text-[#5F8067] mt-1 font-semibold truncate">
              Catfish & Tilapia units
            </p>
          </div>

          {/* Metric 2: Total Fish */}
          <div
            id="metric-total-fish"
            onClick={() => onNavigate('monitor')}
            className="bg-white rounded-2xl border border-[#CBD8CF] hover:border-[#7E9F86] p-4 sm:p-5 lg:p-6 shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-[#496350] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Total Fish</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EEF3F0] flex items-center justify-center text-[#1E5032] shrink-0">
                <Fish className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E5032]">
              {totalFishCount.toLocaleString()}
            </div>
            <p className="text-[11px] sm:text-xs text-[#5F8067] mt-1 font-semibold truncate">
              Across all live ponds
            </p>
          </div>

          {/* Metric 3: Today's Feed */}
          <div
            id="metric-todays-feed"
            onClick={() => onNavigate('record')}
            className="bg-white rounded-2xl border border-[#CBD8CF] hover:border-[#7E9F86] p-4 sm:p-5 lg:p-6 shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-[#496350] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Today's Feed</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EEF3F0] flex items-center justify-center text-[#1E5032] shrink-0">
                <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E5032]">
              {todaysFeedKg.toFixed(1)} <span className="text-sm sm:text-lg font-bold text-[#5F8067]">kg</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#5F8067] mt-1 font-semibold truncate">
              Extruded pellets
            </p>
          </div>

          {/* Metric 4: Active Alerts */}
          <div
            id="metric-active-alerts"
            onClick={() => onNavigate('alerts')}
            className={`rounded-2xl border p-4 sm:p-5 lg:p-6 shadow-xs transition-all cursor-pointer ${
              unresolvedAlerts.length > 0
                ? 'bg-amber-50/90 border-amber-300 hover:border-amber-400'
                : 'bg-white border-[#CBD8CF]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span className={unresolvedAlerts.length > 0 ? 'text-amber-900' : 'text-[#496350]'}>Active Alerts</span>
              <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${unresolvedAlerts.length > 0 ? 'text-amber-600 animate-bounce' : 'text-[#7E9F86]'}`} />
            </div>
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${unresolvedAlerts.length > 0 ? 'text-amber-700' : 'text-[#1E5032]'}`}>
              {unresolvedAlerts.length}
            </div>
            <p className={`text-[11px] sm:text-xs mt-1 font-bold truncate ${unresolvedAlerts.length > 0 ? 'text-amber-800' : 'text-[#5F8067]'}`}>
              {unresolvedAlerts.length > 0 ? 'Pond A02 attention' : 'All ponds normal'}
            </p>
          </div>

        </div>
      </section>

      {/* Success Notification Banner */}
      {resolvedSuccessMsg && (
        <div className="bg-[#EEF3F0] border-2 border-[#7E9F86] text-[#1E5032] p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#1E5032] shrink-0" />
          <span>{resolvedSuccessMsg}</span>
        </div>
      )}

      {/* 3. LATEST ALERT SECTION */}
      <section id="dashboard-latest-alert">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#143822] flex items-center space-x-2">
            <span>Latest Alert</span>
          </h2>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-bold text-[#1E5032] hover:text-[#143822] flex items-center space-x-1 cursor-pointer py-1"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestAlert ? (
          <div
            id="latest-alert-card"
            className="rounded-2xl bg-amber-50 border-2 border-amber-400 p-4 sm:p-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-amber-300">
                      {latestAlert.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {ponds.find(p => p.id === latestAlert.pondId)?.name || latestAlert.pondId}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-950 mt-1">
                    {latestAlert.problemDetected}
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5 font-medium">
                    Current Reading: <span className="font-mono font-bold">{latestAlert.currentReading}</span> • {formatTimeOnly(latestAlert.timestamp)}
                  </p>
                </div>
              </div>

              <div className="pt-2 sm:pt-0">
                <button
                  onClick={() => handleQuickResolve(latestAlert.id)}
                  id="btn-quick-resolve-alert"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1E5032] hover:bg-[#143822] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#EEF3F0] border border-[#CBD8CF] p-4 sm:p-5 text-center flex items-center justify-center space-x-2 text-[#1E5032]">
            <CheckCircle2 className="w-5 h-5 text-[#1E5032] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">All ponds operating normally. No active alerts require attention.</span>
          </div>
        )}
      </section>

      {/* 4. POND STATUS SECTION - 2 to 3 Simple Pond Status Cards */}
      <section id="dashboard-pond-status">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#143822]">Pond Status</h2>
            <p className="text-xs text-[#5F8067] font-medium">Live operational condition of active production units</p>
          </div>
          <button
            onClick={() => onNavigate('monitor')}
            className="text-xs font-bold text-[#1E5032] hover:text-[#143822] flex items-center space-x-1 cursor-pointer py-1"
          >
            <span>Full Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {pondReadings.map(({ pond, reading }) => {
            const isAttention = pond.status === 'ATTENTION_NEEDED' || reading?.status === 'ATTENTION_NEEDED';
            const isCritical = pond.status === 'CRITICAL' || reading?.status === 'CRITICAL';
            
            return (
              <div
                key={pond.id}
                id={`pond-status-card-${pond.id}`}
                className={`rounded-2xl border p-4 sm:p-5 lg:p-6 bg-white shadow-xs transition-all ${
                  isAttention
                    ? 'border-2 border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
                    : isCritical
                    ? 'border-2 border-rose-500 bg-rose-50/20'
                    : 'border-[#CBD8CF] hover:border-[#7E9F86]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#143822]">{pond.name}</h3>
                    <p className="text-xs text-[#5F8067] font-bold">
                      {pond.currentFishCount.toLocaleString()} {pond.fishSpecies.includes('Tilapia') ? 'Tilapia' : 'Catfish'}
                    </p>
                  </div>
                  
                  <span
                    className={`text-[10px] sm:text-[11px] font-black uppercase px-2 sm:px-2.5 py-1 rounded-full ${
                      isAttention
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isCritical
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-[#EEF3F0] text-[#1E5032] border border-[#CBD8CF]'
                    }`}
                  >
                    {isAttention ? 'ATTENTION' : isCritical ? 'CRITICAL' : 'NORMAL'}
                  </span>
                </div>

                {/* Core Parameters */}
                <div className="mt-4 pt-3 sm:pt-4 border-t border-[#EEF3F0] grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div className="bg-[#EEF3F0]/70 rounded-xl p-2 sm:p-2.5">
                    <div className="text-[10px] text-[#5F8067] uppercase font-bold">Temp</div>
                    <div className="text-xs sm:text-sm font-black text-[#1E5032] mt-0.5 font-mono">
                      {reading ? `${reading.temperatureC.toFixed(1)}°C` : '27.8°C'}
                    </div>
                  </div>

                  <div className={`rounded-xl p-2 sm:p-2.5 ${reading && reading.pH < 6.5 ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-300' : 'bg-[#EEF3F0]/70'}`}>
                    <div className="text-[10px] text-[#5F8067] uppercase font-bold">pH</div>
                    <div className="text-xs sm:text-sm font-black text-[#1E5032] mt-0.5 font-mono">
                      {reading ? reading.pH.toFixed(1) : '7.2'}
                    </div>
                  </div>

                  <div className="bg-[#EEF3F0]/70 rounded-xl p-2 sm:p-2.5">
                    <div className="text-[10px] text-[#5F8067] uppercase font-bold">Oxygen</div>
                    <div className="text-xs sm:text-sm font-black text-[#1E5032] mt-0.5 font-mono">
                      {reading ? `${reading.dissolvedOxygenMgL.toFixed(1)}` : '6.5'} <span className="text-[9px] sm:text-[10px] font-normal text-[#5F8067]">mg/L</span>
                    </div>
                  </div>
                </div>

                {isAttention && (
                  <div className="mt-3 text-xs text-amber-900 bg-amber-100/80 p-2.5 rounded-xl border border-amber-300 font-medium">
                    <strong>Notice:</strong> Low pH detected. Water liming recommended.
                  </div>
                )}

                <div className="mt-4 text-[11px] text-[#7E9F86] text-right flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="flex items-center space-x-1 font-semibold text-[#5F8067]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0EB5B2]" />
                    <span>Prototype Sensor</span>
                  </span>
                  <span className="font-medium text-slate-500">{reading ? formatTimeOnly(reading.timestamp) : 'Today'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RECENT FARM ACTIVITIES */}
      <section id="dashboard-recent-activities">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#143822]">Recent Farm Activities</h2>
            <p className="text-xs text-[#5F8067] font-medium">Log of recorded feedings, sampling, water tests and actions</p>
          </div>
          <button
            onClick={() => onNavigate('record')}
            className="text-xs font-bold text-[#1E5032] hover:text-[#143822] flex items-center space-x-1 cursor-pointer py-1"
          >
            <span>Record New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#CBD8CF] divide-y divide-[#EEF3F0] shadow-xs overflow-hidden">
          {activities.slice(0, 5).map(act => {
            const pond = ponds.find(p => p.id === act.pondId);
            return (
              <div key={act.id} className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 hover:bg-[#EEF3F0]/40 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs ${
                    act.type === 'FEEDING'
                      ? 'bg-[#EEF3F0] text-[#1E5032]'
                      : act.type === 'MORTALITY'
                      ? 'bg-rose-100 text-rose-800'
                      : act.type === 'WATER_READING'
                      ? 'bg-[#E0F7F6] text-[#088C8A]'
                      : act.type === 'ALERT_TRIGGERED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#EEF3F0] text-[#1E5032]'
                  }`}>
                    {act.type === 'FEEDING' ? (
                      <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : act.type === 'WATER_READING' ? (
                      <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : act.type === 'ALERT_TRIGGERED' ? (
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs font-bold text-[#143822]">{act.title}</span>
                      <span className="text-[10px] font-bold bg-[#EEF3F0] text-[#1E5032] px-1.5 py-0.2 rounded border border-[#CBD8CF]">
                        {pond ? pond.name : act.pondId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium pl-11 sm:pl-0 shrink-0">
                  {formatDateTime(act.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
