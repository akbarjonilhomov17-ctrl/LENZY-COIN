import React from 'react';
import { X, Calendar, Sparkles, Check, Flame, Gift, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_BONUSES } from '../utils/constants';
import { formatCoins, formatNumberWithCommas } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyStreak: number;
  lastClaimTimestamp: number;
  onClaimDailyBonus: (rewardCoins: number, newStreak: number) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({
  isOpen,
  onClose,
  dailyStreak,
  lastClaimTimestamp,
  onClaimDailyBonus,
  soundEnabled,
  vibrationEnabled
}) => {
  if (!isOpen) return null;

  const now = Date.now();
  const lastClaimDate = lastClaimTimestamp ? new Date(lastClaimTimestamp).toDateString() : '';
  const todayDate = new Date(now).toDateString();
  const isClaimedToday = lastClaimDate === todayDate;

  // Calculate current target day (1 to 7)
  const currentDayIndex = isClaimedToday ? dailyStreak : (dailyStreak % 7) + 1;
  const todayReward = DAILY_BONUSES[currentDayIndex - 1] || DAILY_BONUSES[0];

  const handleClaim = () => {
    if (isClaimedToday) return;

    const newStreak = (dailyStreak % 7) + 1;
    onClaimDailyBonus(todayReward.rewardCoins, newStreak);
    
    soundEffects.playClaim(soundEnabled);
    triggerHaptic(vibrationEnabled, 35);
    
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl relative select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-2 pb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 mx-auto mb-2.5 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-100">Kundalik Bonuslar</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Har kuni o&apos;yinga kiring va tangalar miqdorini oshiring!
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mt-2 text-xs font-bold text-amber-300">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Ketma-ketlik: {dailyStreak} kun</span>
          </div>
        </div>

        {/* 7-Days Grid */}
        <div className="grid grid-cols-4 gap-2 my-3">
          {DAILY_BONUSES.map((item) => {
            const isCompleted = item.day < currentDayIndex || (item.day === currentDayIndex && isClaimedToday);
            const isToday = item.day === currentDayIndex && !isClaimedToday;
            const isLocked = item.day > currentDayIndex;

            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center relative transition-all ${
                  item.isSpecial ? 'col-span-2' : ''
                } ${
                  isToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-yellow-500/10 border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse'
                    : isCompleted
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400">{item.day}-kun</span>

                <div className="my-1.5 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : item.isSpecial ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : (
                    <Sparkles className={`w-5 h-5 ${isToday ? 'text-amber-400 animate-spin-slow' : 'text-slate-600'}`} />
                  )}
                </div>

                <span className={`text-[11px] font-extrabold ${isToday ? 'text-amber-300' : isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>
                  +{formatCoins(item.rewardCoins)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <div className="mt-4 pt-2">
          {isClaimedToday ? (
            <div className="w-full py-3 bg-slate-900 border border-slate-800 rounded-2xl text-center flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Bugungi bonus olindi. Ertaga yangilanadi!</span>
            </div>
          ) : (
            <button
              id="claim-daily-bonus-modal-btn"
              onClick={handleClaim}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Gift className="w-5 h-5" />
              <span>Bugungi bonusni olish (+{formatNumberWithCommas(todayReward.rewardCoins)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
