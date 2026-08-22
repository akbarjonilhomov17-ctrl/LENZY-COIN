import React, { useState } from 'react';
import { Volume2, VolumeX, Vibrate, Calendar, ShieldCheck, Sparkles, User, Zap, Users, Crown } from 'lucide-react';
import { UserGameState } from '../types';
import { formatCoins } from '../utils/storage';
import { isAdminUser } from '../services/userService';

interface HeaderProps {
  gameState: UserGameState;
  onToggleSound: () => void;
  onToggleVibration: () => void;
  onOpenDailyBonus: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  onToggleSound,
  onToggleVibration,
  onOpenDailyBonus,
  onOpenProfile,
  onOpenAdmin
}) => {
  // Check if daily bonus is available today
  const lastClaimDate = gameState.lastDailyClaimTimestamp ? new Date(gameState.lastDailyClaimTimestamp).toDateString() : '';
  const todayDate = new Date().toDateString();
  const isDailyBonusAvailable = lastClaimDate !== todayDate;
  const isAdmin = isAdminUser(gameState.username);

  const displayName = gameState.firstName 
    ? `${gameState.firstName}${gameState.lastName ? ' ' + gameState.lastName : ''}`
    : (gameState.username ? `@${gameState.username}` : 'Foydalanuvchi');

  return (
    <header className="w-full max-w-md mx-auto px-4 pt-3 pb-2 select-none relative z-20">
      {/* Top row: User Info + Settings */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        {/* User profile & Telegram status */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Telegram profilingizni ko'rish"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              {gameState.photoUrl ? (
                <img
                  src={gameState.photoUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-full h-full rounded-full ${gameState.avatarBg || 'bg-slate-900'} flex items-center justify-center text-amber-300 font-bold text-base`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-slate-950">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 tracking-tight truncate max-w-[120px]">
                {displayName}
              </span>
              {isAdmin ? (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded-full font-extrabold shrink-0 animate-pulse">
                  ADMIN
                </span>
              ) : (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-full font-medium shrink-0">
                  TG
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-blue-400 font-mono truncate max-w-[85px]">@{gameState.username || 'user'}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Onlayn
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions: Admin Panel Button (Admin only), Daily Bonus, Sound, Vibration */}
        <div className="flex items-center gap-1.5">
          {/* Admin Panel button - Strictly visible to verified admin usernames only */}
          {isAdmin && (
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse"
              title="Lenzy Admin Panel"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Daily streak button */}
          <button
            id="header-daily-bonus-btn"
            onClick={onOpenDailyBonus}
            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isDailyBonusAvailable
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10 animate-bounce'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{gameState.dailyStreak > 0 ? `${gameState.dailyStreak}-kun` : 'Bonus'}</span>
            {isDailyBonusAvailable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          {/* Sound toggle */}
          <button
            id="header-sound-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              gameState.soundEnabled
                ? 'bg-slate-800/90 text-amber-400 border-slate-700/80'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title={gameState.soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          >
            {gameState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vibration toggle */}
          <button
            id="header-vibration-btn"
            onClick={onToggleVibration}
            className={`p-2 rounded-xl border transition-all ${
              gameState.vibrationEnabled
                ? 'bg-slate-800/90 text-amber-400 border-slate-700/80'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title={gameState.vibrationEnabled ? "Vibratsiyani o'chirish" : "Vibratsiyani yoqish"}
          >
            <Vibrate className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 px-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">Bosish quvvati</span>
            <span className="text-xs font-bold text-amber-300 mt-0.5">+{gameState.tapPower} tanga</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 leading-none">Tiklanish tezligi</span>
            <span className="text-xs font-bold text-cyan-400 mt-0.5">+{gameState.energyRechargeRate}/soniya</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <span className="text-xs font-extrabold">⚡</span>
          </div>
        </div>
      </div>
    </header>
  );
};
