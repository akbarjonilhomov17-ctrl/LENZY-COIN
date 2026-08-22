import React, { useState } from 'react';
import { CheckCircle2, Clock, Send, MessageSquare, Twitter, CalendarCheck, Flame, UserPlus, Users, Award, Crown, Sparkles, ArrowUpRight, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, UserGameState } from '../types';
import { formatNumberWithCommas, formatCoins } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface TasksViewProps {
  tasks: TaskItem[];
  gameState: UserGameState;
  onClaimTask: (taskId: string, rewardCoins: number, rewardEnergy?: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  gameState,
  onClaimTask,
  onUpdateTask
}) => {
  const [activeTab, setActiveTab] = useState<'social' | 'daily' | 'achievements'>('social');
  const [checkingTaskId, setCheckingTaskId] = useState<string | null>(null);

  // Filter tasks based on category
  const filteredTasks = tasks.filter(t => t.category === activeTab);

  // Check progress for count/level tasks
  const getTaskProgress = (task: TaskItem): { isReadyToClaim: boolean; progressStr?: string; percent?: number } => {
    if (task.isClaimed) return { isReadyToClaim: false };
    if (task.isCompleted) return { isReadyToClaim: true };

    if (task.type === 'tap_count' && task.requiredCount) {
      const current = Math.min(task.requiredCount, gameState.totalTapsCount);
      const isReady = current >= task.requiredCount;
      return {
        isReadyToClaim: isReady,
        progressStr: `${current} / ${task.requiredCount}`,
        percent: Math.min(100, (current / task.requiredCount) * 100)
      };
    }

    if (task.type === 'invite' && task.requiredCount) {
      const realInvites = Math.max(gameState.referralCount || 0, gameState.friendsCount || 0);
      const current = Math.min(task.requiredCount, realInvites);
      const isReady = current >= task.requiredCount;
      return {
        isReadyToClaim: isReady,
        progressStr: `${current} / ${task.requiredCount} do'st`,
        percent: Math.min(100, (current / task.requiredCount) * 100)
      };
    }

    if (task.type === 'level_reach' && task.requiredCount) {
      const current = Math.min(task.requiredCount, gameState.totalEarnedCoins);
      const isReady = current >= task.requiredCount;
      return {
        isReadyToClaim: isReady,
        progressStr: `${formatCoins(current)} / ${formatCoins(task.requiredCount)}`,
        percent: Math.min(100, (current / task.requiredCount) * 100)
      };
    }

    if (task.type === 'daily_claim') {
      const isClaimedToday = gameState.lastDailyClaimTimestamp && new Date(gameState.lastDailyClaimTimestamp).toDateString() === new Date().toDateString();
      return {
        isReadyToClaim: !!isClaimedToday
      };
    }

    return { isReadyToClaim: false };
  };

  const handleStartTask = (task: TaskItem) => {
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank');
    }

    // Trigger checking simulation for social tasks
    setCheckingTaskId(task.id);
    soundEffects.playTap(gameState.soundEnabled);

    setTimeout(() => {
      onUpdateTask(task.id, { isCompleted: true });
      setCheckingTaskId(null);
      soundEffects.playCritTap(gameState.soundEnabled);
      triggerHaptic(gameState.vibrationEnabled, 20);
    }, 2800);
  };

  const handleClaim = (task: TaskItem) => {
    onClaimTask(task.id, task.rewardCoins, task.rewardEnergy);
    soundEffects.playClaim(gameState.soundEnabled);
    triggerHaptic(gameState.vibrationEnabled, 30);
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 }
    });
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Send': return <Send className="w-5 h-5 text-blue-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      case 'Twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'CalendarCheck': return <CalendarCheck className="w-5 h-5 text-amber-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'UserPlus': return <UserPlus className="w-5 h-5 text-emerald-400" />;
      case 'Users': return <Users className="w-5 h-5 text-indigo-400" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const totalRewardsAvailable = tasks.filter(t => !t.isClaimed).reduce((sum, t) => sum + t.rewardCoins, 0);

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 pb-20 pt-2 overflow-y-auto space-y-4 select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
        </div>
        <h2 className="text-base font-extrabold text-slate-100">Vazifalar & Mukofotlar</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Qo&apos;shimcha <span className="text-amber-400 font-bold">+{formatCoins(totalRewardsAvailable)}</span> Lenzy tanga ishlab oling
        </p>
      </div>

      {/* 2. Category Tabs */}
      <div className="grid grid-cols-3 bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab('social')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'social'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Telegram
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kundalik
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Yutuqlar
        </button>
      </div>

      {/* 3. Task List */}
      <div className="space-y-2.5">
        {filteredTasks.map(task => {
          const { isReadyToClaim, progressStr, percent } = getTaskProgress(task);
          const isChecking = checkingTaskId === task.id;

          return (
            <div
              key={task.id}
              id={`task-card-${task.id}`}
              className={`p-3.5 rounded-2xl border transition-all ${
                task.isClaimed
                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                  : isReadyToClaim
                  ? 'bg-gradient-to-r from-slate-900 to-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/85 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                    {renderIcon(task.iconName)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{task.titleUz}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.descriptionUz}</p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-amber-400">
                        +{formatNumberWithCommas(task.rewardCoins)} tanga
                      </span>
                      {task.rewardEnergy && (
                        <span className="text-[10px] text-cyan-400 font-bold">
                          +{task.rewardEnergy} energiya
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0">
                  {task.isClaimed ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Olindi</span>
                    </div>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(task)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      Olish
                    </button>
                  ) : isChecking ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Tekshiruv...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>Bajarish</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar for count tasks */}
              {progressStr && !task.isClaimed && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                    <span>Jarayon</span>
                    <span className="text-amber-300 font-bold">{progressStr}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all"
                      style={{ width: `${percent || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
