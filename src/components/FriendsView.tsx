import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Share2, Sparkles, Star, Gift, TrendingUp, RefreshCw, UserCheck } from 'lucide-react';
import { FriendItem, UserGameState } from '../types';
import { fetchOnlineFriends } from '../services/userService';
import { formatCoins } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface FriendsViewProps {
  gameState: UserGameState;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  gameState
}) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate official referral link (using window origin or telegram bot)
  const botUsername = 'lenzycoin_bot';
  const webOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const refLink = `https://t.me/${botUsername}?start=ref_${gameState.userId}`;
  const webRefLink = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?ref=${gameState.userId}` : refLink;

  const loadFriends = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const realFriends = await fetchOnlineFriends(gameState.userId);
      setFriends(realFriends);
    } catch (err) {
      console.error('Error loading real friends:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [gameState.userId, gameState.referralCount]);

  const handleCopy = () => {
    const textToCopy = refLink;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    soundEffects.playCritTap(gameState.soundEnabled);
    triggerHaptic(gameState.vibrationEnabled, 20);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    const text = encodeURIComponent("🪙 Lenzy Coin o'yinida menga qo'shiling va 10,000 bepul start tangalarini qo'lga kiriting! ⚡");
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
    soundEffects.playTap(gameState.soundEnabled);
  };

  const totalEarnedFromFriends = friends.length * 10000 + friends.reduce((sum, f) => sum + Math.floor(f.coinsEarned * 0.1), 0);

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 pb-24 pt-2 overflow-y-auto space-y-4 select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-4 shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h2 className="text-base font-extrabold text-slate-100">Haqiqiy Do&apos;stlarni Taklif Qiling</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Har bir taklif qilingan haqiqiy o&apos;yinchi uchun +10,000 tanga va ularning doimiy daromadidan 10% komissiya oling.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-medium block">Taklif qilinganlar</span>
            <span className="text-sm font-extrabold text-slate-100">{friends.length} ta o&apos;yinchi</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-medium block">Ishlab topilgan</span>
            <span className="text-sm font-extrabold text-amber-400">+{formatCoins(totalEarnedFromFriends)}</span>
          </div>
        </div>
      </div>

      {/* 2. Referral Rewards Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Taklif qilish shartlari
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Regular friend */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">Har bir do&apos;st</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-amber-400">+10,000</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Sizga va do&apos;stingizga</span>
            </div>
          </div>

          {/* 10% Cashflow pill */}
          <div className="p-3 bg-slate-900/80 border border-emerald-500/30 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">10% Komissiya</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-emerald-400">Doimiy</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Do&apos;st taplaridan ulush</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Share & Copy Link Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent text-xs text-slate-300 flex-1 outline-none px-2 font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Telegram orqali do&apos;stlarga ulashish</span>
        </button>
      </div>

      {/* 4. Real Friends List (No Bots) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Taklif qilingan do&apos;stlaringiz ({friends.length})
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
              Jonli
            </span>
          </div>

          <button
            onClick={() => loadFriends(true)}
            disabled={isRefreshing}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Do&apos;stlar ro&apos;yxati yuklanmoqda...</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Hozircha hech kim havola orqali kirmadi</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Yuqoridagi havolani do&apos;stlaringizga yuboring. Ular o&apos;yinga kirishi bilan bu yerda avtomatik ko&apos;rinadi!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="p-3 bg-slate-900/85 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-md bg-slate-800 flex items-center justify-center">
                    {friend.photoUrl ? (
                      <img
                        src={friend.photoUrl}
                        alt={friend.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${friend.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-100 truncate">{friend.name}</span>
                    <span className="text-[10px] text-blue-400 font-mono">{friend.username} • {friend.joinedDate}</span>
                    <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      +{formatCoins(friend.coinsEarned)} tanga to&apos;pladi
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-emerald-400 block">+10,000</span>
                  <span className="text-[9px] text-slate-400">Bonus olindi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
