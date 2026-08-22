import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, UserGameState, TaskItem } from './types';
import { 
  initializeUserOnline, 
  saveUserOnline, 
  DEFAULT_USER_STATE,
  isAdminUser 
} from './services/userService';
import { loadTasks, saveTasks } from './utils/storage';
import { getCurrentLeague } from './utils/gameHelpers';
import { soundEffects, triggerHaptic } from './utils/audio';
import { Header } from './components/Header';
import { TapView } from './components/TapView';
import { BoostsView } from './components/BoostsView';
import { TasksView } from './components/TasksView';
import { FriendsView } from './components/FriendsView';
import { LeaderboardView } from './components/LeaderboardView';
import { DailyBonusModal } from './components/DailyBonusModal';
import { LeagueModal } from './components/LeagueModal';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminModal } from './components/AdminModal';
import { Navigation } from './components/Navigation';

export default function App() {
  const [gameState, setGameState] = useState<UserGameState>(DEFAULT_USER_STATE);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tap');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Modals
  const [isDailyBonusOpen, setIsDailyBonusOpen] = useState(false);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<{ coins: number; seconds: number } | null>(null);

  // Prev League tracker for celebration
  const prevLeagueIdRef = useRef<string>('bronze');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestStateRef = useRef<UserGameState>(DEFAULT_USER_STATE);

  // Keep latestStateRef synced
  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // Debounced sync function to Firestore
  const queueOnlineSync = useCallback((state: UserGameState) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      saveUserOnline(state);
    }, 1200);
  }, []);

  // 1. Initial Online Load (Telegram + Firebase Firestore)
  useEffect(() => {
    async function loadOnline() {
      try {
        const { state, offlineCoins, offlineSeconds } = await initializeUserOnline();
        const loadedTasks = loadTasks();

        setGameState(state);
        latestStateRef.current = state;
        setTasks(loadedTasks);
        prevLeagueIdRef.current = getCurrentLeague(state.totalEarnedCoins).id;

        if (offlineCoins > 0) {
          setOfflineEarnings({ coins: offlineCoins, seconds: offlineSeconds });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    loadOnline();

    // Sync on page close / unload
    const handleUnload = () => {
      if (latestStateRef.current?.userId) {
        saveUserOnline(latestStateRef.current);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // 2. Real-time Energy Regeneration Loop (1 sec interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        const newEnergy = Math.min(prev.maxEnergy, prev.energy + prev.energyRechargeRate);
        const updated = { ...prev, energy: newEnergy };
        queueOnlineSync(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queueOnlineSync]);

  // 3. Current League calculation
  const currentLeague = getCurrentLeague(gameState.totalEarnedCoins);

  // Check for league upgrade sound
  useEffect(() => {
    if (prevLeagueIdRef.current && currentLeague.id !== prevLeagueIdRef.current) {
      soundEffects.playLeagueUp(gameState.soundEnabled);
      triggerHaptic(gameState.vibrationEnabled, 40);
      prevLeagueIdRef.current = currentLeague.id;
    }
  }, [currentLeague.id, gameState.soundEnabled, gameState.vibrationEnabled]);

  // 4. Tap Handler (Optimistic UI + Debounced Firestore Sync)
  const handleTap = useCallback((earnedCoins: number, energyUsed: number) => {
    setGameState((prev) => {
      const newCoins = prev.coins + earnedCoins;
      const newTapped = prev.totalTappedCoins + earnedCoins;
      const newTotalEarned = prev.totalEarnedCoins + earnedCoins;
      const newEnergy = Math.max(0, prev.energy - energyUsed);
      const newTapsCount = prev.totalTapsCount + 1;

      const updated = {
        ...prev,
        coins: newCoins,
        totalTappedCoins: newTapped,
        totalEarnedCoins: newTotalEarned,
        energy: newEnergy,
        totalTapsCount: newTapsCount
      };

      queueOnlineSync(updated);
      return updated;
    });
  }, [queueOnlineSync]);

  // 5. Upgrade Boost Handler
  const handleUpgradeBoost = (boostId: string, cost: number) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;
      const newCoins = prev.coins - cost;
      let newTapPower = prev.tapPower;
      let newMaxEnergy = prev.maxEnergy;
      let newRechargeRate = prev.energyRechargeRate;
      let newAutoBot = prev.autoBotLevel;
      let newMultitap = prev.multitapLevel;
      let newEnergyLimit = prev.energyLimitLevel;
      let newRechargeSpeed = prev.rechargingSpeedLevel;

      if (boostId === 'multitap') {
        newMultitap += 1;
        newTapPower += 1;
      } else if (boostId === 'energy_limit') {
        newEnergyLimit += 1;
        newMaxEnergy += 500;
      } else if (boostId === 'recharge_speed') {
        newRechargeSpeed += 1;
        newRechargeRate += 1;
      } else if (boostId === 'auto_bot') {
        newAutoBot += 1;
      }

      const updated: UserGameState = {
        ...prev,
        coins: newCoins,
        tapPower: newTapPower,
        maxEnergy: newMaxEnergy,
        energyRechargeRate: newRechargeRate,
        autoBotLevel: newAutoBot,
        multitapLevel: newMultitap,
        energyLimitLevel: newEnergyLimit,
        rechargingSpeedLevel: newRechargeSpeed,
        profitPerHour: newAutoBot * 3000
      };

      saveUserOnline(updated);
      return updated;
    });
  };

  // 6. Free Daily Boosts Handlers
  const handleActivateFullEnergy = () => {
    setGameState((prev) => {
      if (prev.fullEnergyRemaining <= 0) return prev;
      soundEffects.playUpgrade(prev.soundEnabled);
      triggerHaptic(prev.vibrationEnabled, 25);
      const updated = {
        ...prev,
        energy: prev.maxEnergy,
        fullEnergyRemaining: prev.fullEnergyRemaining - 1
      };
      saveUserOnline(updated);
      return updated;
    });
  };

  const handleActivateTurboTap = () => {
    setGameState((prev) => {
      if (prev.turboTapRemaining <= 0) return prev;
      soundEffects.playTurbo(prev.soundEnabled);
      triggerHaptic(prev.vibrationEnabled, 30);
      const updated = {
        ...prev,
        turboTapRemaining: prev.turboTapRemaining - 1,
        turboActiveUntil: Date.now() + 20000 // 20 seconds
      };
      saveUserOnline(updated);
      return updated;
    });
  };

  // 7. Task Claim Handler
  const handleClaimTask = (taskId: string, rewardCoins: number, rewardEnergy?: number) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, isClaimed: true } : t));
      saveTasks(updated);
      return updated;
    });

    setGameState((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins + rewardCoins,
        totalEarnedCoins: prev.totalEarnedCoins + rewardCoins,
        energy: rewardEnergy ? Math.min(prev.maxEnergy, prev.energy + rewardEnergy) : prev.energy
      };
      saveUserOnline(updated);
      return updated;
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<TaskItem>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
      saveTasks(updated);
      return updated;
    });
  };

  // 8. Daily Bonus Claim
  const handleClaimDailyBonus = (rewardCoins: number, newStreak: number) => {
    setGameState((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins + rewardCoins,
        totalEarnedCoins: prev.totalEarnedCoins + rewardCoins,
        dailyStreak: newStreak,
        lastDailyClaimTimestamp: Date.now()
      };
      saveUserOnline(updated);
      return updated;
    });
  };

  // Sound & Vibration Toggles
  const handleToggleSound = () => {
    setGameState((prev) => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      saveUserOnline(updated);
      return updated;
    });
  };

  const handleToggleVibration = () => {
    setGameState((prev) => {
      const updated = { ...prev, vibrationEnabled: !prev.vibrationEnabled };
      saveUserOnline(updated);
      return updated;
    });
  };

  const handleUpdateProfileState = (updates: Partial<UserGameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...updates };
      saveUserOnline(updated);
      return updated;
    });
  };

  const unclaimedTasksCount = tasks.filter((t) => 
    !t.isClaimed && (t.isCompleted || (t.type === 'tap_count' && gameState.totalTapsCount >= (t.requiredCount || 0)))
  ).length;

  return (
    <div className="flex justify-center min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* Mobile Shell Container */}
      <main className="w-full max-w-md min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative border-x border-slate-800/40 shadow-2xl overflow-hidden">
        {/* Telegram App Header */}
        <Header
          gameState={gameState}
          onToggleSound={handleToggleSound}
          onToggleVibration={handleToggleVibration}
          onOpenDailyBonus={() => setIsDailyBonusOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAdmin={() => {
            if (isAdminUser(gameState.username)) {
              setIsAdminModalOpen(true);
            }
          }}
        />

        {/* Main Tab Content */}
        {activeTab === 'tap' && (
          <TapView
            gameState={gameState}
            currentLeague={currentLeague}
            onTap={handleTap}
            onOpenLeagueModal={() => setIsLeagueModalOpen(true)}
            onOpenBoosts={() => setActiveTab('boosts')}
            onActivateFullEnergy={handleActivateFullEnergy}
            onActivateTurboTap={handleActivateTurboTap}
          />
        )}

        {activeTab === 'boosts' && (
          <BoostsView
            gameState={gameState}
            onUpgradeBoost={handleUpgradeBoost}
            onActivateFullEnergy={handleActivateFullEnergy}
            onActivateTurboTap={handleActivateTurboTap}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            gameState={gameState}
            onClaimTask={handleClaimTask}
            onUpdateTask={handleUpdateTask}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsView
            gameState={gameState}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            gameState={gameState}
          />
        )}

        {/* Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unclaimedTasksCount={unclaimedTasksCount}
          soundEnabled={gameState.soundEnabled}
          vibrationEnabled={gameState.vibrationEnabled}
        />

        {/* Modals */}
        <DailyBonusModal
          isOpen={isDailyBonusOpen}
          onClose={() => setIsDailyBonusOpen(false)}
          dailyStreak={gameState.dailyStreak}
          lastClaimTimestamp={gameState.lastDailyClaimTimestamp}
          onClaimDailyBonus={handleClaimDailyBonus}
          soundEnabled={gameState.soundEnabled}
          vibrationEnabled={gameState.vibrationEnabled}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          gameState={gameState}
          onUpdateState={handleUpdateProfileState}
        />

        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          currentUserState={gameState}
          onUpdateCurrentUser={handleUpdateProfileState}
        />

        <LeagueModal
          isOpen={isLeagueModalOpen}
          onClose={() => setIsLeagueModalOpen(false)}
          currentLeague={currentLeague}
          totalEarnedCoins={gameState.totalEarnedCoins}
        />

        {offlineEarnings && (
          <OfflineEarningsModal
            isOpen={!!offlineEarnings}
            onClose={() => setOfflineEarnings(null)}
            offlineCoins={offlineEarnings.coins}
            offlineSeconds={offlineEarnings.seconds}
            soundEnabled={gameState.soundEnabled}
            vibrationEnabled={gameState.vibrationEnabled}
          />
        )}
      </main>
    </div>
  );
}
