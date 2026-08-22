import React from 'react';
import { Coins, Zap, CheckSquare, Users, Trophy } from 'lucide-react';
import { TabType } from '../types';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unclaimedTasksCount: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unclaimedTasksCount,
  soundEnabled,
  vibrationEnabled
}) => {
  const tabs = [
    { id: 'tap' as TabType, label: 'O\'yin', icon: Coins },
    { id: 'boosts' as TabType, label: 'Boostlar', icon: Zap },
    { id: 'tasks' as TabType, label: 'Vazifalar', icon: CheckSquare, badge: unclaimedTasksCount > 0 ? unclaimedTasksCount : undefined },
    { id: 'friends' as TabType, label: 'Do\'stlar', icon: Users },
    { id: 'leaderboard' as TabType, label: 'Reyting', icon: Trophy },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab !== tabId) {
      soundEffects.playTap(soundEnabled);
      triggerHaptic(vibrationEnabled, 10);
      onSelectTab(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 pb-2 pt-1 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl select-none">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1 rounded-full border border-slate-900 min-w-[14px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
