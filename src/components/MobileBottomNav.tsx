import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ClipboardEdit,
  AlertTriangle,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { TabType } from './Navigation';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { alerts, ponds } = useFarm();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const attentionPonds = ponds.filter(p => p.status !== 'HEALTHY');

  const navItems: {
    id: TabType;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
    badge?: number;
    badgeVariant?: 'amber' | 'emerald';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (isActive: boolean) => (
        <LayoutDashboard className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#0EB5B2]' : 'text-[#7E9F86]'}`} />
      ),
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: (isActive: boolean) => (
        <Activity className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#0EB5B2]' : 'text-[#7E9F86]'}`} />
      ),
      badge: attentionPonds.length > 0 ? attentionPonds.length : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'record',
      label: 'Record',
      icon: (isActive: boolean) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isActive
            ? 'bg-[#0EB5B2] text-white shadow-md scale-105'
            : 'bg-[#1E5032] text-white'
        }`}>
          <ClipboardEdit className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (isActive: boolean) => (
        <AlertTriangle className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-500' : 'text-[#7E9F86]'}`} />
      ),
      badge: unresolvedAlerts.length > 0 ? unresolvedAlerts.length : undefined,
      badgeVariant: 'amber',
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#CBD8CF] shadow-[0_-4px_16px_rgba(20,56,34,0.08)] pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-tab-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer select-none active:scale-95 ${
                isActive ? 'text-[#143822] font-black' : 'text-[#5F8067] font-semibold hover:text-[#1E5032]'
              }`}
            >
              {/* Active Indicator Top Bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1E5032] rounded-b-full shadow-xs" />
              )}

              {/* Icon with relative positioning for badge */}
              <div className="relative flex items-center justify-center">
                {item.icon(isActive)}

                {/* Notification Badge */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[18px] text-[10px] font-black rounded-full bg-amber-500 text-slate-950 border border-white shadow-xs text-center flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Tab Label */}
              <span className={`text-[10px] tracking-tight mt-1 leading-none ${isActive ? 'text-[#143822] font-black' : 'text-[#5F8067]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
