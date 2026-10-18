import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import { Navbar } from './components/Navbar';
import { Navigation, TabType } from './components/Navigation';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { MonitoringView } from './components/MonitoringView';
import { RecordProductionView } from './components/RecordProductionView';
import { AlertsView } from './components/AlertsView';
import { IotApiModal } from './components/modals/IotApiModal';

const FarmApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isIotModalOpen, setIsIotModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#1E2B22] flex flex-col font-sans antialiased selection:bg-[#7E9F86]/30 overflow-x-hidden">
      
      {/* 1. Header with Brand Theme & Mobile Optimization */}
      <Navbar
        onNavigateTab={setCurrentTab}
        onOpenIotModal={() => setIsIotModalOpen(true)}
      />

      {/* 2. Desktop/Tablet Tab Navigation: Dashboard | Monitor Ponds | Record Production | View Alerts */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* 3. Main Views with mobile bottom padding to clear the bottom bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView onNavigate={setCurrentTab} />
        )}

        {currentTab === 'monitor' && (
          <MonitoringView
            onNavigate={setCurrentTab}
            onOpenIotModal={() => setIsIotModalOpen(true)}
          />
        )}

        {currentTab === 'record' && (
          <RecordProductionView />
        )}

        {currentTab === 'alerts' && (
          <AlertsView />
        )}
      </main>

      {/* 4. Minimal Brand Footer - Extra padding on mobile to clear bottom nav */}
      <footer className="border-t border-[#CBD8CF] bg-white py-5 px-4 sm:px-6 text-center text-xs text-[#5F8067] print:hidden mt-4 sm:mt-12 pb-24 md:pb-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#143822]">PRIMESOURCE</span>
            <span className="font-extrabold text-[#7E9F86]">FARM</span>
            <span className="w-2 h-2 rounded-full bg-[#0EB5B2] inline-block" />
            <span className="text-[#5F8067] font-medium hidden sm:inline">• AgriTech Fish Production Platform</span>
          </div>
          
          <div className="flex items-center space-x-3 text-[#496350] font-semibold text-xs">
            <span>MONITOR → RECORD → RESPOND</span>
            <span>•</span>
            <button
              onClick={() => setIsIotModalOpen(true)}
              className="text-[#1E5032] hover:text-[#143822] font-bold underline cursor-pointer py-1"
            >
              Hardware Ingest API
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Dedicated Native Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* IoT Hardware Integration Modal */}
      <IotApiModal
        isOpen={isIotModalOpen}
        onClose={() => setIsIotModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <FarmApp />
    </FarmProvider>
  );
}
