import React from 'react';
import { X, User, ShieldCheck, CheckCircle2, Trophy, Coins, Users, Hash, Send, Sparkles } from 'lucide-react';
import { UserGameState } from '../types';
import { isAdminUser } from '../services/userService';
import { getCurrentLeague } from '../utils/gameHelpers';
import { formatNumberWithCommas, formatCoins } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: UserGameState;
  onUpdateState: (updates: Partial<UserGameState>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  const isAdmin = isAdminUser(gameState.username);
  const league = getCurrentLeague(gameState.totalEarnedCoins || gameState.coins);
  const displayName = `${gameState.firstName || ''} ${gameState.lastName || ''}`.trim() || 'Lenzy Player';
  const cleanUsername = (gameState.username || 'user').replace(/^@/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Close button */}
        <button
          id="profile-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Profili</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-100">Rasmiy O&apos;yinchi Profili</h3>
          <p className="text-[11px] text-slate-400">
            Telegram hisobingiz orqali avtomatik sinxronlangan ma&apos;lumotlar
          </p>
        </div>

        {/* Telegram Profile Card */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

          {/* Telegram Avatar */}
          <div className="relative mb-2.5">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-sky-400 to-amber-600 shadow-xl shadow-sky-500/10">
              {gameState.photoUrl ? (
                <img
                  src={gameState.photoUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover bg-slate-950"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-full h-full rounded-full ${gameState.avatarBg || 'bg-indigo-600'} flex items-center justify-center text-white font-black text-2xl`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-1 border-2 border-slate-900 shadow" title="Telegram tasdiqlangan">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Names & Username */}
          <h4 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
            <span>{displayName}</span>
            {isAdmin && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black rounded-md">
                ADMIN
              </span>
            )}
          </h4>
          <div className="text-xs text-sky-400 font-semibold mt-0.5 font-mono">
            @{cleanUsername}
          </div>

          {/* Verified Badge */}
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Telegram orqali ulangan</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Telegram ID */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Hash className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium block">Telegram ID</span>
              <span className="text-xs font-bold text-slate-200 font-mono truncate block">
                {gameState.telegramId || '12849204'}
              </span>
            </div>
          </div>

          {/* League */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium block">Liga</span>
              <span className="text-xs font-bold text-amber-300 truncate block">
                {league.name}
              </span>
            </div>
          </div>

          {/* Total Coins */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium block">Balans</span>
              <span className="text-xs font-bold text-yellow-400 truncate block">
                {formatCoins(gameState.coins)}
              </span>
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium block">Do&apos;stlar</span>
              <span className="text-xs font-bold text-indigo-300 truncate block">
                {gameState.referralCount || 0} ta
              </span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-2.5 bg-slate-950/40 border border-slate-800/50 rounded-xl text-[11px] text-slate-400 text-center leading-relaxed">
          💡 Profil rasmi va @username o&apos;zgartirish uchun Telegram sozlamalaridan foydalaning. O&apos;yinda ular avtomatik yangilanadi.
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-extrabold text-xs shadow-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 active:scale-95 transition-all"
        >
          Tushunarli
        </button>
      </div>
    </div>
  );
};
