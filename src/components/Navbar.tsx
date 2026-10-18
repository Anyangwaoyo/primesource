import React from 'react';
import { useFarm } from '../context/FarmContext';
import { Waves, Bell, Cpu, Play, Square } from 'lucide-react';
import { TabType } from './Navigation';

interface NavbarProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenIotModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab, onOpenIotModal }) => {
  const { alerts, isLiveSimulationActive, toggleLiveSimulation } = useFarm();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <header className="sticky top-0 z-30 bg-[#143822] border-b border-[#1E5032] text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center space-x-2 sm:space-x-3 text-left group cursor-pointer focus:outline-none min-h-[44px]"
            id="brand-header-button"
            aria-label="PrimeSource Farm Dashboard"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#7E9F86] flex items-center justify-center text-[#1E5032] shadow-xs ring-2 ring-[#7E9F86]/30 group-hover:bg-[#8FAFA8] transition-colors shrink-0">
              <Waves className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1 sm:space-x-1.5 leading-none">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-[#8FAFA8] group-hover:text-[#A4C4AC] transition-colors">
                  PRIMESOURCE
                </span>
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                  FARM
                </span>
                {/* Brand signature turquoise dot */}
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0EB5B2] inline-block shadow-xs shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#A4C4AC] font-medium mt-0.5 hidden md:block">
                Smarter Fish Production & Monitoring
              </p>
            </div>
          </button>

          {/* Right Action Badges - Touch-Friendly & Mobile-Adaptive */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Prototype Sensor Data Button */}
            <button
              onClick={onOpenIotModal}
              id="btn-prototype-hardware-info"
              className="flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl bg-[#1E5032] hover:bg-[#25633E] text-[#E0ECE3] border border-[#7E9F86]/30 text-xs font-bold transition-colors cursor-pointer min-w-[36px] sm:min-w-0"
              title="Hardware Ingest / Sensor Status"
              aria-label="Prototype Sensor Data"
            >
              <Cpu className="w-4 h-4 text-[#0EB5B2] shrink-0" />
              <span className="hidden sm:inline">Prototype Sensors</span>
              <span className="sm:hidden text-[11px]">IoT</span>
            </button>

            {/* Live Data Simulation Toggle */}
            <button
              onClick={toggleLiveSimulation}
              id="btn-toggle-live-simulation"
              className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl text-xs font-bold border transition-colors cursor-pointer min-w-[36px] sm:min-w-0 ${
                isLiveSimulationActive
                  ? 'bg-[#1E5032] border-[#0EB5B2] text-white'
                  : 'bg-[#143822] border-[#1E5032] text-[#A4C4AC] hover:text-white hover:bg-[#1E5032]'
              }`}
              title="Toggle automatic sensor data ticks"
              aria-label="Toggle Live Simulation"
            >
              {isLiveSimulationActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#0EB5B2] animate-ping mr-0.5" />
                  <Square className="w-3.5 h-3.5 text-[#0EB5B2]" />
                  <span className="hidden md:inline">Simulating</span>
                  <span className="md:hidden text-[11px]">Live</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#A4C4AC]" />
                  <span className="hidden md:inline">Simulate</span>
                  <span className="md:hidden text-[11px]">Sim</span>
                </>
              )}
            </button>

            {/* Quick Alerts Button */}
            <button
              onClick={() => onNavigateTab('alerts')}
              id="btn-navbar-alerts"
              className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                unresolvedAlerts.length > 0
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50 hover:bg-amber-500/30'
                  : 'bg-[#1E5032] text-[#E0ECE3] border border-[#7E9F86]/30 hover:text-white'
              }`}
              aria-label="View Alerts"
            >
              <Bell className={`w-3.5 h-3.5 ${unresolvedAlerts.length > 0 ? 'text-amber-400 animate-pulse' : 'text-[#A4C4AC]'}`} />
              <span className="hidden sm:inline">Alerts</span>
              {unresolvedAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] bg-amber-500 text-slate-950 font-black">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
