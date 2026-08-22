import React from 'react';
import { Bot, Sparkles, Check, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCoins, formatNumberWithCommas } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface OfflineEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offlineCoins: number;
  offlineSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  isOpen,
  onClose,
  offlineCoins,
  offlineSeconds,
  soundEnabled,
  vibrationEnabled
}) => {
  if (!isOpen || offlineCoins <= 0) return null;

  const minutes = Math.floor(offlineSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  const timeString = hours > 0 ? `${hours} soat ${remainingMins} daqiqa` : `${minutes} daqiqa`;

  const handleCollect = () => {
    soundEffects.playClaim(soundEnabled);
    triggerHaptic(vibrationEnabled, 30);
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.5 }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Animated Bot Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-400 to-purple-600 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-bounce">
          <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
            <Bot className="w-8 h-8 text-purple-300" />
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-100">Xush kelibsiz!</h3>
        <p className="text-xs text-slate-400 mt-1">
          Siz o&apos;yinda bo&apos;lmagan vaqtingizda (<span className="text-slate-200 font-semibold">{timeString}</span>), Lenzy Tap Bot siz uchun tangalar to&apos;pladi:
        </p>

        {/* Big Profit Box */}
        <div className="my-4 p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-2xl">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
            +{formatNumberWithCommas(offlineCoins)}
          </span>
          <span className="text-xs font-bold text-amber-400 block mt-0.5">LENZY COIN</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCollect}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Daromadni hisobga olish</span>
        </button>
      </div>
    </div>
  );
};
