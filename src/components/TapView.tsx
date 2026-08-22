import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, Flame, Trophy, Sparkles, ChevronRight, Award, Battery } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserGameState, League, FloatingText } from '../types';
import { formatNumberWithCommas, formatCoins } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';
import { getNextLeague } from '../utils/gameHelpers';
import lenzyLogoImg from '../assets/images/lenzy_coin_logo_1787387708156.jpg';

interface TapViewProps {
  gameState: UserGameState;
  currentLeague: League;
  onTap: (earnedCoins: number, energyUsed: number) => void;
  onOpenLeagueModal: () => void;
  onOpenBoosts: () => void;
  onActivateFullEnergy: () => void;
  onActivateTurboTap: () => void;
}

export const TapView: React.FC<TapViewProps> = ({
  gameState,
  currentLeague,
  onTap,
  onOpenLeagueModal,
  onOpenBoosts,
  onActivateFullEnergy,
  onActivateTurboTap
}) => {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' });
  const [isPressed, setIsPressed] = useState(false);
  const coinRef = useRef<HTMLDivElement>(null);
  
  // Turbo mode countdown
  const isTurboActive = gameState.turboActiveUntil > Date.now();
  const [turboSecondsLeft, setTurboSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isTurboActive) {
      setTurboSecondsLeft(0);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((gameState.turboActiveUntil - Date.now()) / 1000));
      setTurboSecondsLeft(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [isTurboActive, gameState.turboActiveUntil]);

  // Next league info
  const nextLeague = getNextLeague(currentLeague.id);
  const currentLeagueProgress = nextLeague
    ? Math.min(100, Math.max(0, ((gameState.totalEarnedCoins - currentLeague.minCoins) / (nextLeague.minCoins - currentLeague.minCoins)) * 100))
    : 100;

  // Handle tap on coin (Multi-touch support)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!coinRef.current) return;

    // Check if player has energy (unless Turbo is active, in which case energy is free!)
    const effectiveTapPower = isTurboActive ? gameState.tapPower * 5 : gameState.tapPower;
    const requiredEnergy = isTurboActive ? 0 : gameState.tapPower;

    if (!isTurboActive && gameState.energy < requiredEnergy) {
      // Not enough energy!
      triggerHaptic(gameState.vibrationEnabled, 40);
      return;
    }

    // 10% Chance for Critical Strike (3x coins!)
    const isCrit = Math.random() < 0.12;
    const finalEarnedCoins = isCrit ? effectiveTapPower * 3 : effectiveTapPower;

    // Trigger tap audio & haptics
    if (isCrit) {
      soundEffects.playCritTap(gameState.soundEnabled);
      triggerHaptic(gameState.vibrationEnabled, 30);
    } else {
      soundEffects.playTap(gameState.soundEnabled);
      triggerHaptic(gameState.vibrationEnabled, 15);
    }

    // 3D Tilt calculation
    const rect = coinRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 14;
    const rotateY = (x / (rect.width / 2)) * 14;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.96)`
    });
    setIsPressed(true);

    // Add floating text
    const textId = Date.now() + Math.random();
    const textStr = isCrit ? `🔥 +${finalEarnedCoins}` : `+${finalEarnedCoins}`;
    
    // Spawn floating number around click coordinate
    setFloatingTexts(prev => [
      ...prev.slice(-15),
      {
        id: textId,
        x: e.clientX,
        y: e.clientY - 20,
        text: textStr,
        isCrit
      }
    ]);

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 900);

    onTap(finalEarnedCoins, requiredEnergy);
  }, [isTurboActive, gameState.tapPower, gameState.energy, gameState.soundEnabled, gameState.vibrationEnabled, onTap]);

  const handlePointerUp = () => {
    setIsPressed(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-between px-4 pb-2 w-full max-w-md mx-auto select-none touch-manipulation overflow-hidden"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 1. Main Coin Score & League Progress */}
      <div className="flex flex-col items-center w-full mt-1 mb-2">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <img src={lenzyLogoImg} alt="Lenzy" className="w-full h-full object-cover" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
            {formatNumberWithCommas(gameState.coins)}
          </span>
        </div>

        {/* League progression line */}
        <div 
          onClick={onOpenLeagueModal}
          className="mt-2.5 flex items-center gap-2 px-3 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-full cursor-pointer transition-all w-4/5 justify-between"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs">{currentLeague.icon}</span>
            <span className="text-[11px] font-semibold text-slate-300 truncate">{currentLeague.nameUz}</span>
          </div>

          {nextLeague ? (
            <div className="flex items-center gap-2 flex-1 max-w-[130px] ml-2">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-300"
                  style={{ width: `${currentLeagueProgress}%` }}
                ></div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>
          ) : (
            <span className="text-[10px] text-amber-400 font-bold">Maksimal daraja!</span>
          )}
        </div>
      </div>

      {/* Turbo Active Announcement Banner */}
      {isTurboActive && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full py-1.5 px-3 mb-2 rounded-xl bg-gradient-to-r from-rose-600/30 via-amber-500/30 to-orange-600/30 border border-amber-500/50 flex items-center justify-between shadow-lg shadow-amber-500/20 animate-pulse"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
            <span className="text-xs font-bold text-amber-200">TURBO REJIMI: 5X KO&apos;PAYTIRGICH!</span>
          </div>
          <span className="text-xs font-extrabold text-white bg-red-600/80 px-2 py-0.5 rounded-full">
            {turboSecondsLeft}s
          </span>
        </motion.div>
      )}

      {/* 2. Giant 3D Interactive Coin */}
      <div className="relative my-auto flex items-center justify-center p-4">
        {/* Ambient Glowing Halo */}
        <div 
          className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${
            isTurboActive 
              ? 'bg-gradient-to-tr from-rose-600/50 via-amber-500/50 to-orange-500/50 scale-125 animate-pulse'
              : 'bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-cyan-500/10 scale-100'
          }`}
        />

        {/* Outer Ring & Coin Container */}
        <div
          ref={coinRef}
          onPointerDown={handlePointerDown}
          style={tiltStyle}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-pointer transition-transform duration-75 ease-out select-none"
        >
          {/* Animated decorative outer rim */}
          <div className={`absolute -inset-2.5 rounded-full border-2 transition-all ${
            isTurboActive 
              ? 'border-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-spin-slow'
              : 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          }`} style={{ animationDuration: '18s' }}></div>

          {/* 3D Coin Inner Frame */}
          <div className="w-full h-full rounded-full p-2.5 bg-gradient-to-br from-amber-300 via-amber-600 to-amber-950 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center justify-center border-4 border-amber-300/60">
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-slate-950 flex items-center justify-center">
              <img 
                src={lenzyLogoImg} 
                alt="Lenzy Coin" 
                className="w-full h-full object-cover pointer-events-none drop-shadow-2xl scale-105"
                draggable={false}
              />
              
              {/* Glossy lighting reflection highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Floating Numbers Animation */}
        <AnimatePresence>
          {floatingTexts.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -90, scale: item.isCrit ? 1.4 : 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: `${item.x}px`,
                top: `${item.y}px`,
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999
              }}
              className={`font-black tracking-tight select-none drop-shadow-lg ${
                item.isCrit
                  ? 'text-2xl text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.9)]'
                  : 'text-xl text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]'
              }`}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Energy Bar & Quick Free Boosts Section */}
      <div className="w-full space-y-2 mt-auto">
        {/* Energy bar container */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-slate-200">Energiya:</span>
              <span className="font-extrabold text-amber-400 text-sm">{Math.floor(gameState.energy)}</span>
              <span className="text-slate-500 font-normal">/ {gameState.maxEnergy}</span>
            </div>

            <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
              <span>+{gameState.energyRechargeRate}/soniya</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-850 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                gameState.energy / gameState.maxEnergy < 0.2
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-sm shadow-amber-400/50'
              }`}
              style={{ width: `${Math.min(100, (gameState.energy / gameState.maxEnergy) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Free Daily Boost Triggers */}
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Full Energy */}
          <button
            id="quick-full-energy-btn"
            onClick={onActivateFullEnergy}
            disabled={gameState.fullEnergyRemaining <= 0 || gameState.energy >= gameState.maxEnergy}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
              gameState.fullEnergyRemaining > 0 && gameState.energy < gameState.maxEnergy
                ? 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-slate-200 active:scale-95'
                : 'bg-slate-950/60 border-slate-850 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">To&apos;liq quvvat</span>
                <span className="text-[9px] text-slate-400">{gameState.fullEnergyRemaining}/3 bugun</span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">TEKIN</span>
          </button>

          {/* Quick Turbo Tap */}
          <button
            id="quick-turbo-tap-btn"
            onClick={onActivateTurboTap}
            disabled={gameState.turboTapRemaining <= 0 || isTurboActive}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
              gameState.turboTapRemaining > 0 && !isTurboActive
                ? 'bg-slate-900 hover:bg-slate-800 border-orange-500/40 text-slate-200 active:scale-95'
                : 'bg-slate-950/60 border-slate-850 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-tight">Lenzy Turbo</span>
                <span className="text-[9px] text-slate-400">{gameState.turboTapRemaining}/3 bugun</span>
              </div>
            </div>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-1.5 py-0.5 rounded">5X</span>
          </button>
        </div>
      </div>
    </div>
  );
};
