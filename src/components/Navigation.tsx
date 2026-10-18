import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ClipboardEdit,
  AlertTriangle,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export type TabType = 'dashboard' | 'monitor' | 'record' | 'alerts';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const { alerts, ponds } = useFarm();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const attentionPonds = ponds.filter(p => p.status !== 'HEALTHY');

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'monitor',
      label: 'Monitor Ponds',
      icon: <Activity className="w-4 h-4 shrink-0" />,
      badge: attentionPonds.length > 0 ? `${attentionPonds.length}` : undefined,
      badgeColor: attentionPonds.length > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : undefined,
    },
    {
      id: 'record',
      label: 'Record Production',
      icon: <ClipboardEdit className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'alerts',
      label: 'View Alerts',
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      badge: unresolvedAlerts.length > 0 ? unresolvedAlerts.length : undefined,
      badgeColor: unresolvedAlerts.length > 0 ? 'bg-amber-500 text-slate-950 font-black' : undefined,
    },
  ];

  return (
    <nav className="bg-white border-b border-[#CBD8CF] sticky top-16 z-20 shadow-xs hidden md:block">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar space-x-1.5 sm:space-x-3 py-2 scroll-smooth touch-pan-x -mx-3 px-3 sm:mx-0 sm:px-0">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] shrink-0 ${
                  isActive
                    ? 'bg-[#1E5032] text-white shadow-xs'
                    : 'text-[#2D4535] hover:text-[#1E5032] hover:bg-[#EEF3F0]'
                }`}
              >
                <span className={isActive ? 'text-[#0EB5B2]' : 'text-[#5F8067]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${
                      item.badgeColor || (isActive ? 'bg-[#143822] text-[#A4C4AC]' : 'bg-[#DEE8E1] text-[#1E5032]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
