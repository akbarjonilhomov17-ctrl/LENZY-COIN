import React, { useState } from 'react';
import { Zap, Flame, Hand, BatteryCharging, Bot, ArrowUpRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserGameState, BoostItem } from '../types';
import { INITIAL_BOOSTS_CONFIG } from '../utils/constants';
import { calculateBoostCost } from '../utils/gameHelpers';
import { formatNumberWithCommas, formatCoins } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface BoostsViewProps {
  gameState: UserGameState;
  onUpgradeBoost: (boostId: string, cost: number) => void;
  onActivateFullEnergy: () => void;
  onActivateTurboTap: () => void;
}

export const BoostsView: React.FC<BoostsViewProps> = ({
  gameState,
  onUpgradeBoost,
  onActivateFullEnergy,
  onActivateTurboTap
}) => {
  const [selectedBoost, setSelectedBoost] = useState<BoostItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const getBoostLevel = (boostId: string): number => {
    switch (boostId) {
      case 'multitap': return gameState.multitapLevel;
      case 'energy_limit': return gameState.energyLimitLevel;
      case 'recharge_speed': return gameState.rechargingSpeedLevel;
      case 'auto_bot': return gameState.autoBotLevel;
      default: return 1;
    }
  };

  const handleUpgradeClick = (boost: BoostItem) => {
    const currentLevel = getBoostLevel(boost.id);
    if (currentLevel >= boost.maxLevel) return;

    const cost = calculateBoostCost(boost.baseCost, boost.costMultiplier, currentLevel);
    if (gameState.coins < cost) {
      soundEffects.playTap(gameState.soundEnabled);
      triggerHaptic(gameState.vibrationEnabled, 50);
      setFeedbackMsg(`Mablag' yetarli emas! Sizga yana ${formatNumberWithCommas(cost - gameState.coins)} tanga kerak.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    // Process upgrade
    onUpgradeBoost(boost.id, cost);
    soundEffects.playUpgrade(gameState.soundEnabled);
    triggerHaptic(gameState.vibrationEnabled, 25);

    // Confetti effect for big upgrades
    if (currentLevel >= 3 || boost.id === 'auto_bot') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const isTurboActive = gameState.turboActiveUntil > Date.now();

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 pb-20 pt-2 overflow-y-auto space-y-4 select-none">
      {/* 1. Header with Coins Balance */}
      <div className="text-center py-2 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
        <span className="text-xs text-slate-400 font-medium">Mavjud Balans</span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            {formatNumberWithCommas(gameState.coins)}
          </span>
          <span className="text-sm font-bold text-amber-400">LENZY</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
          Kuchaytirgichlar orqali tangalarni tezroq va avtomatlashtirilgan tarzda to&apos;plang
        </p>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Free Daily Boosts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Bepul Kundalik Boostlar
          </h3>
          <span className="text-[11px] text-slate-500">Har 24 soatda yangilanadi</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Full Energy */}
          <button
            id="boosts-full-energy-card"
            onClick={onActivateFullEnergy}
            disabled={gameState.fullEnergyRemaining <= 0 || gameState.energy >= gameState.maxEnergy}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all ${
              gameState.fullEnergyRemaining > 0 && gameState.energy < gameState.maxEnergy
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/40 hover:border-amber-400 active:scale-98'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <span className="text-[11px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                {gameState.fullEnergyRemaining}/3
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">To&apos;liq Energiya</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Energiyani darhol 100% to&apos;ldiradi</p>
            </div>
          </button>

          {/* Turbo Tap */}
          <button
            id="boosts-turbo-tap-card"
            onClick={onActivateTurboTap}
            disabled={gameState.turboTapRemaining <= 0 || isTurboActive}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all ${
              gameState.turboTapRemaining > 0 && !isTurboActive
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 border-orange-500/40 hover:border-orange-400 active:scale-98'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Flame className="w-5 h-5 fill-orange-400" />
              </div>
              <span className="text-[11px] font-extrabold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
                {gameState.turboTapRemaining}/3
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Lenzy Turbo</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">20s davomida 5x tangalar & 0 energiya</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Main Upgrades List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Asosiy Kuchaytirgichlar
          </h3>
          <span className="text-[11px] text-slate-500">Doimiy yaxshilanishlar</span>
        </div>

        <div className="space-y-2">
          {INITIAL_BOOSTS_CONFIG.map(boost => {
            const currentLevel = getBoostLevel(boost.id);
            const isMaxed = currentLevel >= boost.maxLevel;
            const nextCost = isMaxed ? 0 : calculateBoostCost(boost.baseCost, boost.costMultiplier, currentLevel);
            const canAfford = !isMaxed && gameState.coins >= nextCost;

            const renderIcon = () => {
              switch (boost.id) {
                case 'multitap': return <Hand className="w-5 h-5 text-amber-400" />;
                case 'energy_limit': return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
                case 'recharge_speed': return <Zap className="w-5 h-5 text-cyan-400" />;
                case 'auto_bot': return <Bot className="w-5 h-5 text-purple-400" />;
                default: return <Sparkles className="w-5 h-5 text-amber-400" />;
              }
            };

            return (
              <div
                key={boost.id}
                id={`boost-item-${boost.id}`}
                className="bg-slate-900/85 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                    {renderIcon()}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100">{boost.nameUz}</span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {currentLevel > 0 ? `${currentLevel}-daraja` : 'Olinmagan'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{boost.descUz}</span>
                    
                    {/* Current stats */}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      {boost.id === 'multitap' && <span>Hozir: +{gameState.tapPower} tanga</span>}
                      {boost.id === 'energy_limit' && <span>Hozir: {gameState.maxEnergy} energiya</span>}
                      {boost.id === 'recharge_speed' && <span>Hozir: +{gameState.energyRechargeRate}/s</span>}
                      {boost.id === 'auto_bot' && (
                        <span className={gameState.autoBotLevel > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                          {gameState.autoBotLevel > 0 ? `Aktiv: +${formatCoins(gameState.autoBotLevel * 3000)}/soat` : 'Oflayn rejimda ishlaydi'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleUpgradeClick(boost)}
                  disabled={isMaxed || !canAfford}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center min-w-[90px] transition-all ${
                    isMaxed
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                  }`}
                >
                  {isMaxed ? (
                    <span className="text-[11px]">MAX</span>
                  ) : (
                    <>
                      <span className="text-[10px] leading-tight opacity-90">{currentLevel === 0 ? 'Sotib olish' : 'Oshirish'}</span>
                      <span className="text-xs font-extrabold">{formatCoins(nextCost)}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
