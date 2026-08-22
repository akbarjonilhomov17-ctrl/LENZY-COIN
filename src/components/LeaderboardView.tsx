import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Search, Flame, Users, RefreshCw, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { LeaderboardUser, UserGameState, LeaderboardCategory } from '../types';
import { fetchOnlineLeaderboard } from '../services/userService';
import { formatCoins, formatNumberWithCommas } from '../utils/storage';
import { soundEffects } from '../utils/audio';

interface LeaderboardViewProps {
  gameState: UserGameState;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  gameState
}) => {
  const [category, setCategory] = useState<LeaderboardCategory>('taps');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load online leaderboard from Firestore
  const loadLeaderboard = async (cat: LeaderboardCategory, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchOnlineLeaderboard(cat, gameState);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(category);
  }, [category, gameState.totalTapsCount, gameState.referralCount, gameState.coins]);

  const handleTabChange = (newCat: LeaderboardCategory) => {
    if (category === newCat) return;
    setCategory(newCat);
    soundEffects.playTap(gameState.soundEnabled);
  };

  // Filtered by search query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredUsers.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const currentUserInList = users.find(u => u.isCurrentUser) || {
    id: gameState.userId,
    rank: users.length + 1,
    name: gameState.firstName ? `${gameState.firstName} (Siz)` : `${gameState.username} (Siz)`,
    username: `@${gameState.username}`,
    photoUrl: gameState.photoUrl,
    avatarBg: gameState.avatarBg,
    totalTapsCount: gameState.totalTapsCount,
    totalEarnedCoins: gameState.totalEarnedCoins,
    coins: gameState.coins,
    referralCount: gameState.referralCount,
    isCurrentUser: true
  };

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28 pt-2 overflow-y-auto space-y-4 select-none">
      {/* 1. Header with Trophy */}
      <div className="text-center py-1">
        <div className="inline-flex p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 mb-1.5 shadow-lg shadow-amber-500/10">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-slate-100">Jonli Onlayn Reyting</h2>
        <p className="text-xs text-slate-400">
          Haqiqiy o&apos;yinchilar orasida yetakchilik uchun kurash
        </p>
      </div>

      {/* 2. Category Switcher Tabs (Eng ko'p tap VS Eng ko'p do'st taklif qilgan) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => handleTabChange('taps')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            category === 'taps'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Eng ko&apos;p tap</span>
        </button>

        <button
          onClick={() => handleTabChange('referrals')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            category === 'referrals'
              ? 'bg-gradient-to-r from-blue-500 to-sky-400 text-slate-950 shadow-md shadow-blue-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Eng ko&apos;p taklif</span>
        </button>
      </div>

      {/* 3. Search Bar + Live Refresh */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O'yinchini qidirish..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
          />
        </div>

        <button
          onClick={() => loadLeaderboard(category, true)}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors shrink-0"
          title="Reytingni yangilash"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Onlayn o&apos;yinchilar yuklanmoqda...</span>
        </div>
      ) : (
        <>
          {/* 4. Top 3 Podium */}
          {filteredUsers.length >= 1 && (
            <div className="grid grid-cols-3 gap-2 items-end pt-5 pb-2">
              {/* 2nd Place */}
              {second ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-1">
                    <div className="w-12 h-12 rounded-full p-0.5 border-2 border-slate-400 flex items-center justify-center shadow-lg bg-slate-800">
                      {second.photoUrl ? (
                        <img
                          src={second.photoUrl}
                          alt={second.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full ${second.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                          {second.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-2 -right-1 bg-slate-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                      2
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 truncate max-w-[90px] text-center mt-1">
                    {second.name}
                  </span>
                  <span className={`text-[10px] font-extrabold ${category === 'taps' ? 'text-amber-300' : 'text-sky-300'}`}>
                    {category === 'taps' ? `${formatNumberWithCommas(second.totalTapsCount)} tap` : `${second.referralCount} do'st`}
                  </span>
                  <div className="w-full h-16 bg-gradient-to-t from-slate-800 to-slate-700/60 rounded-t-xl mt-2 border-t-2 border-slate-400 flex items-center justify-center">
                    <Medal className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              {/* 1st Place */}
              {first && (
                <div className="flex flex-col items-center -mt-4">
                  <div className="relative mb-1">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                    </div>
                    <div className="w-16 h-16 rounded-full p-1 border-2 border-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/30 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600">
                      {first.photoUrl ? (
                        <img
                          src={first.photoUrl}
                          alt={first.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full ${first.avatarBg} flex items-center justify-center text-white font-extrabold text-lg`}>
                          {first.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-2 -right-1 bg-yellow-400 text-slate-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                      1
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-300 truncate max-w-[100px] text-center mt-1">
                    {first.name}
                  </span>
                  <span className={`text-[11px] font-extrabold ${category === 'taps' ? 'text-yellow-400' : 'text-sky-300'}`}>
                    {category === 'taps' ? `${formatNumberWithCommas(first.totalTapsCount)} tap` : `${first.referralCount} do'st`}
                  </span>
                  <div className="w-full h-22 bg-gradient-to-t from-amber-900/80 via-yellow-700/60 to-yellow-600/60 rounded-t-xl mt-2 border-t-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {third ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-1">
                    <div className="w-12 h-12 rounded-full p-0.5 border-2 border-amber-600 flex items-center justify-center shadow-lg bg-slate-800">
                      {third.photoUrl ? (
                        <img
                          src={third.photoUrl}
                          alt={third.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full ${third.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                          {third.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-2 -right-1 bg-amber-600 text-amber-100 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                      3
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 truncate max-w-[90px] text-center mt-1">
                    {third.name}
                  </span>
                  <span className={`text-[10px] font-extrabold ${category === 'taps' ? 'text-amber-300' : 'text-sky-300'}`}>
                    {category === 'taps' ? `${formatNumberWithCommas(third.totalTapsCount)} tap` : `${third.referralCount} do'st`}
                  </span>
                  <div className="w-full h-12 bg-gradient-to-t from-amber-950 to-amber-900/60 rounded-t-xl mt-2 border-t-2 border-amber-600 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          )}

          {/* 5. Full Real Leaderboard List (No Bots) */}
          <div className="space-y-1.5">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Hech qanday o&apos;yinchi topilmadi.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                    user.isCurrentUser
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank number badge */}
                    <div className={`w-6 text-center text-xs font-extrabold ${
                      user.rank === 1 ? 'text-yellow-400 font-black text-sm' :
                      user.rank === 2 ? 'text-slate-300 font-black' :
                      user.rank === 3 ? 'text-amber-500 font-black' :
                      'text-slate-500'
                    }`}>
                      #{user.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-md bg-slate-800 flex items-center justify-center">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${user.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name & Username */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold truncate ${user.isCurrentUser ? 'text-amber-300' : 'text-slate-200'}`}>
                          {user.name}
                        </span>
                        {user.isCurrentUser && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                            SIZ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono truncate">
                        {user.username}
                      </span>
                    </div>
                  </div>

                  {/* Metric Score (Taps or Referrals) */}
                  <div className="text-right shrink-0">
                    {category === 'taps' ? (
                      <>
                        <span className="text-xs font-black text-amber-300 block">
                          {formatNumberWithCommas(user.totalTapsCount)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">bosishlar</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-black text-sky-300 block">
                          {user.referralCount} ta
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">do&apos;st</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Sticky Bottom Bar for Current User's Live Position */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-30">
        <div className="bg-slate-950/95 border-2 border-amber-500/80 rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
              #{currentUserInList.rank}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-slate-100">
                  {gameState.firstName || gameState.username} (Siz)
                </span>
              </div>
              <span className="text-[10px] text-blue-400 font-mono">@{gameState.username}</span>
            </div>
          </div>

          <div className="text-right">
            {category === 'taps' ? (
              <>
                <span className="text-xs font-extrabold text-amber-300 block">
                  {formatNumberWithCommas(gameState.totalTapsCount)} tap
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Sizning bosishlaringiz</span>
              </>
            ) : (
              <>
                <span className="text-xs font-extrabold text-sky-300 block">
                  {gameState.referralCount} ta do&apos;st
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Sizning takliflaringiz</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
