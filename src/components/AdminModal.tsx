import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  Users, 
  Coins, 
  Zap, 
  Search, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Gift, 
  RefreshCw, 
  CheckCircle2, 
  Crown, 
  TrendingUp, 
  Sliders, 
  RotateCcw
} from 'lucide-react';
import { UserGameState } from '../types';
import { 
  adminFetchAllUsers, 
  adminUpdateUser, 
  adminDeleteUser, 
  adminBonusToAllUsers,
  adminResetAllUsersStats,
  adminFetchStats,
  isAdminUser,
  getRandomAvatarBg
} from '../services/userService';
import { formatNumberWithCommas, formatCoins } from '../utils/storage';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserState: UserGameState;
  onUpdateCurrentUser: (updates: Partial<UserGameState>) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currentUserState,
  onUpdateCurrentUser
}) => {
  // Data states
  const [users, setUsers] = useState<UserGameState[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalCoins: 0, totalTaps: 0, totalReferrals: 0 });
  
  // Selected user for editing
  const [editingUser, setEditingUser] = useState<UserGameState | null>(null);
  const [editCoins, setEditCoins] = useState('');
  const [editTapPower, setEditTapPower] = useState('');
  const [editEnergy, setEditEnergy] = useState('');
  const [editMaxEnergy, setEditMaxEnergy] = useState('');
  const [editReferrals, setEditReferrals] = useState('');
  const [editUsername, setEditUsername] = useState('');

  // Bulk action states
  const [bulkBonusAmount, setBulkBonusAmount] = useState('50000');
  const [isSendingBonus, setIsSendingBonus] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, statsData] = await Promise.all([
        adminFetchAllUsers(),
        adminFetchStats()
      ]);
      setUsers(allUsers);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdminUser(currentUserState.username)) {
      loadData();
    }
  }, [isOpen, currentUserState.username]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Give instant boost to current admin user (saves to cloud instantly)
  const handleBoostCurrentAdmin = async (coins: number, tapPower: number, maxEnergy: number) => {
    const updated = {
      coins: (currentUserState.coins || 0) + coins,
      totalEarnedCoins: (currentUserState.totalEarnedCoins || 0) + coins,
      tapPower: Math.max(currentUserState.tapPower, tapPower),
      maxEnergy: Math.max(currentUserState.maxEnergy, maxEnergy),
      energy: Math.max(currentUserState.energy, maxEnergy),
    };
    onUpdateCurrentUser(updated);
    if (currentUserState.userId) {
      try {
        await adminUpdateUser(currentUserState.userId, updated);
      } catch (err) {
        console.error('Failed to sync admin boost to Firestore:', err);
      }
    }
    soundEffects.playUpgrade(currentUserState.soundEnabled);
    triggerHaptic(currentUserState.vibrationEnabled, 30);
    showNotification(`Admin hisobiga +${formatCoins(coins)} tanga va quvvat berildi!`);
    loadData();
  };

  // Give bonus to ALL users
  const handleSendBonusToAll = async () => {
    const amt = parseInt(bulkBonusAmount, 10);
    if (!amt || amt <= 0) return;

    setIsSendingBonus(true);
    try {
      const count = await adminBonusToAllUsers(amt);
      soundEffects.playClaim(currentUserState.soundEnabled);
      triggerHaptic(currentUserState.vibrationEnabled, 35);
      showNotification(`Barcha ${count} ta o'yinchiga +${formatNumberWithCommas(amt)} tanga yuborildi!`);
      
      // Update local state for current user
      onUpdateCurrentUser({
        coins: currentUserState.coins + amt,
        totalEarnedCoins: currentUserState.totalEarnedCoins + amt
      });

      await loadData();
    } catch (err) {
      console.error('Error sending bonus to all:', err);
      showNotification('Bonus tarqatishda xatolik yuz berdi.');
    } finally {
      setIsSendingBonus(false);
    }
  };

  // Reset ALL players statistics to 0
  const handleResetAllStats = async () => {
    const confirmed = window.confirm(
      "⚠️ DIQQAT! Barcha o'yinchilarning statistikasi (tangalar, taplar, darajalar, referallar) 0 ga tushirilsinmi?\n\nBu amal bazadagi barcha foydalanuvchilarni 0 qiladi!"
    );
    if (!confirmed) return;

    setIsResettingAll(true);
    try {
      const resetCount = await adminResetAllUsersStats();
      showNotification(`Barcha ${resetCount} ta o'yinchilar statistikasi 0 ga tushirildi!`);
      soundEffects.playCritTap(currentUserState.soundEnabled);
      triggerHaptic(currentUserState.vibrationEnabled, 50);

      // Reset current user state live
      onUpdateCurrentUser({
        coins: 0,
        totalTappedCoins: 0,
        totalEarnedCoins: 0,
        totalTapsCount: 0,
        referralCount: 0,
        friendsCount: 0,
        multitapLevel: 1,
        energyLimitLevel: 1,
        rechargingSpeedLevel: 1,
        autoBotLevel: 0,
        profitPerHour: 0,
        tapPower: 1,
        energy: 1000,
        maxEnergy: 1000,
        dailyStreak: 0,
        lastDailyClaimTimestamp: 0
      });

      await loadData();
    } catch (err) {
      console.error('Error resetting all stats:', err);
      alert('Statistikalarni 0 ga tushirishda xatolik yuz berdi.');
    } finally {
      setIsResettingAll(false);
    }
  };

  // Open Edit User modal
  const handleStartEditUser = (user: UserGameState) => {
    setEditingUser(user);
    setEditCoins(String(user.coins || 0));
    setEditTapPower(String(user.tapPower || 1));
    setEditEnergy(String(user.energy || 1000));
    setEditMaxEnergy(String(user.maxEnergy || 1000));
    setEditReferrals(String(user.referralCount || 0));
    setEditUsername(user.username || '');
  };

  // Save edited user
  const handleSaveUserEdit = async () => {
    if (!editingUser) return;

    const coinsVal = Math.max(0, parseInt(editCoins, 10) || 0);
    const tapPowerVal = Math.max(1, parseInt(editTapPower, 10) || 1);
    const energyVal = Math.max(0, parseInt(editEnergy, 10) || 0);
    const maxEnergyVal = Math.max(500, parseInt(editMaxEnergy, 10) || 1000);
    const referralsVal = Math.max(0, parseInt(editReferrals, 10) || 0);

    const updates: Partial<UserGameState> = {
      coins: coinsVal,
      totalEarnedCoins: Math.max(editingUser.totalEarnedCoins || 0, coinsVal),
      tapPower: tapPowerVal,
      energy: energyVal,
      maxEnergy: maxEnergyVal,
      referralCount: referralsVal,
      username: editUsername.replace(/^@/, '').trim() || editingUser.username
    };

    try {
      await adminUpdateUser(editingUser.userId, updates);
      
      // If editing current user, update live
      if (editingUser.userId === currentUserState.userId) {
        onUpdateCurrentUser(updates);
      }

      showNotification(`@${editingUser.username || editingUser.userId} muvaffaqiyatli yangilandi!`);
      soundEffects.playUpgrade(currentUserState.soundEnabled);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      console.error('Error saving user edit:', err);
      showNotification("Tahrirlashda xatolik yuz berdi!");
    }
  };

  // Reset Single User Stats to 0
  const handleResetSingleUser = async (user: UserGameState) => {
    const confirmed = window.confirm(
      `@${user.username || user.userId} foydalanuvchisining barcha tanga, tap va referallari 0 ga tushirilsinmi?`
    );
    if (!confirmed) return;

    const zeroState: Partial<UserGameState> = {
      coins: 0,
      totalTappedCoins: 0,
      totalEarnedCoins: 0,
      totalTapsCount: 0,
      referralCount: 0,
      friendsCount: 0,
      multitapLevel: 1,
      energyLimitLevel: 1,
      rechargingSpeedLevel: 1,
      autoBotLevel: 0,
      profitPerHour: 0,
      tapPower: 1,
      energy: 1000,
      maxEnergy: 1000,
      dailyStreak: 0,
      lastDailyClaimTimestamp: 0
    };

    try {
      await adminUpdateUser(user.userId, zeroState);
      if (user.userId === currentUserState.userId) {
        onUpdateCurrentUser(zeroState);
      }
      showNotification(`@${user.username || user.userId} statistikasi 0 qilindi!`);
      soundEffects.playCritTap(currentUserState.soundEnabled);
      await loadData();
    } catch (err) {
      console.error('Error resetting single user:', err);
      showNotification('Xatolik yuz berdi!');
    }
  };

  // Delete user
  const handleDeleteUser = async (user: UserGameState) => {
    if (!window.confirm(`Rostdan ham @${user.username || user.userId} o'yinchisini bazadan o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await adminDeleteUser(user.userId);
      showNotification(`@${user.username || user.userId} bazadan o'chirildi!`);
      soundEffects.playTap(currentUserState.soundEnabled);
      await loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      showNotification("Foydalanuvchini o'chirishda xatolik yuz berdi.");
    }
  };

  // Strictly visible ONLY to verified admin users (lenzy_dev and lenzy_admin)
  if (!isOpen || !isAdminUser(currentUserState.username)) return null;

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const id = (u.userId || '').toLowerCase();
    return name.includes(q) || username.includes(q) || id.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100">
        
        {/* 1. Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-100">Lenzy Boshqaruv Paneli</h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Siz: <span className="text-amber-400 font-mono font-bold">@{currentUserState.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notification Toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-500/20 border-y border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* 2. Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Database Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">O&apos;yinchilar</span>
              </div>
              <span className="text-base font-extrabold text-slate-100">{stats.totalUsers} ta</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Coins className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Jami tanga</span>
              </div>
              <span className="text-sm font-extrabold text-amber-300 truncate block">
                {formatCoins(stats.totalCoins)}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Jami taplar</span>
              </div>
              <span className="text-sm font-extrabold text-purple-300">
                {formatNumberWithCommas(stats.totalTaps)}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Referallar</span>
              </div>
              <span className="text-base font-extrabold text-emerald-300">{stats.totalReferrals} ta</span>
            </div>
          </div>

          {/* Admin Self-Boost Shortcuts */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Admin hisobini to&apos;ldirish</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">
                Balans: {formatCoins(currentUserState.coins)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleBoostCurrentAdmin(1000000, 10, 5000)}
                className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-[11px] font-bold text-amber-300 active:scale-95 transition-all text-center"
              >
                +1,000,000 🪙
              </button>
              <button
                onClick={() => handleBoostCurrentAdmin(10000000, 50, 15000)}
                className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-[11px] font-bold text-amber-300 active:scale-95 transition-all text-center"
              >
                +10,000,000 🪙
              </button>
              <button
                onClick={() => handleBoostCurrentAdmin(100000000, 200, 50000)}
                className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[11px] font-extrabold active:scale-95 transition-all text-center shadow"
              >
                GOD MODE ⚡
              </button>
            </div>
          </div>

          {/* Global Airdrop / Bonus to ALL users */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Barcha o&apos;yinchilarga Tanga Tarqatish (Airdrop)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={bulkBonusAmount}
                  onChange={(e) => setBulkBonusAmount(e.target.value)}
                  placeholder="Miqdor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">tanga</span>
              </div>

              <button
                onClick={handleSendBonusToAll}
                disabled={isSendingBonus}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow active:scale-95 transition-all disabled:opacity-50"
              >
                {isSendingBonus ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Gift className="w-3.5 h-3.5" />
                )}
                <span>Tarqatish</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset All Players Statistics */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">Hammani statistikasini 0 qilish</span>
              </div>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-900/40 border border-rose-700/50 px-2 py-0.5 rounded-full">
                Danger Zone
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Barcha o&apos;yinchilarning tangalari, taplari, referallari va darajalarini 0 ga tushiradi (profil o&apos;chirilmaydi).
            </p>
            <button
              onClick={handleResetAllStats}
              disabled={isResettingAll}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow active:scale-98 transition-all disabled:opacity-50"
            >
              {isResettingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Barcha O&apos;yinchilar Statistikasini 0 Qilish</span>
            </button>
          </div>

          {/* Registered Players List & Controls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                  Barcha O&apos;yinchilar ({filteredUsers.length})
                </h4>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 text-xs"
                title="Yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                <span>Yangilash</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Username, ism yoki ID bo'yicha qidirish..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Player Cards */}
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                <span>O&apos;yinchilar yuklanmoqda...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
                Hech qanday o&apos;yinchi topilmadi
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isCurrent = user.userId === currentUserState.userId;
                  const isUserAdmin = isAdminUser(user.username);
                  const name = user.firstName 
                    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
                    : (user.username || 'Lenzy User');

                  return (
                    <div
                      key={user.userId}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent 
                          ? 'bg-amber-950/20 border-amber-500/40' 
                          : isUserAdmin
                          ? 'bg-indigo-950/20 border-indigo-500/40'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full ${user.avatarBg || getRandomAvatarBg(name)} flex items-center justify-center text-white font-bold text-xs`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100 truncate">{name}</span>
                              {isUserAdmin && (
                                <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 rounded font-bold">
                                  ADMIN
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                                  SIZ
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-400 font-mono block truncate">
                              @{user.username || 'user'} • ID: {user.userId.slice(-6)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Edit user button */}
                          <button
                            onClick={() => handleStartEditUser(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                            title="Tahrirlash / Tangalar berish"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick 0 qilish button */}
                          <button
                            onClick={() => handleResetSingleUser(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/40 text-amber-400 border border-slate-700 hover:border-amber-500/40"
                            title="Statistikasini 0 ga tushirish"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Delete button */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40"
                              title="Bazadan butunlay o'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* User Stats Grid */}
                      <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Tanga</span>
                          <span className="font-bold text-amber-400">{formatCoins(user.coins || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Taplar</span>
                          <span className="font-bold text-purple-300">{formatNumberWithCommas(user.totalTapsCount || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Referal</span>
                          <span className="font-bold text-emerald-300">{user.referralCount || 0} ta</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Quvvat</span>
                          <span className="font-bold text-cyan-300">+{user.tapPower || 1} / tap</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Lenzy Coin v2.0 Admin Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* Sub-modal: Edit User Details */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-100">
                  @{editingUser.username || editingUser.userId} tahrirlash
                </h4>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Tangalar balansi (Coins)</label>
                <input
                  type="number"
                  value={editCoins}
                  onChange={(e) => setEditCoins(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-amber-400 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Tap Quvvati (+per tap)</label>
                  <input
                    type="number"
                    value={editTapPower}
                    onChange={(e) => setEditTapPower(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-cyan-300 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Referallar soni</label>
                  <input
                    type="number"
                    value={editReferrals}
                    onChange={(e) => setEditReferrals(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-emerald-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Maksimal Energiya</label>
                  <input
                    type="number"
                    value={editMaxEnergy}
                    onChange={(e) => setEditMaxEnergy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Joriy Energiya</label>
                  <input
                    type="number"
                    value={editEnergy}
                    onChange={(e) => setEditEnergy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick add coins buttons */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setEditCoins(prev => String((parseInt(prev, 10) || 0) + 100000))}
                className="px-2 py-1 bg-slate-800 text-[10px] text-amber-300 rounded-lg font-bold hover:bg-slate-700"
              >
                +100k
              </button>
              <button
                type="button"
                onClick={() => setEditCoins(prev => String((parseInt(prev, 10) || 0) + 1000000))}
                className="px-2 py-1 bg-slate-800 text-[10px] text-amber-300 rounded-lg font-bold hover:bg-slate-700"
              >
                +1M
              </button>
              <button
                type="button"
                onClick={() => setEditCoins(prev => String((parseInt(prev, 10) || 0) + 10000000))}
                className="px-2 py-1 bg-slate-800 text-[10px] text-amber-300 rounded-lg font-bold hover:bg-slate-700"
              >
                +10M
              </button>
              <button
                type="button"
                onClick={() => setEditCoins('0')}
                className="px-2 py-1 bg-rose-950/40 text-[10px] text-rose-300 border border-rose-800/40 rounded-lg font-bold hover:bg-rose-900/60 ml-auto"
              >
                0 qilish
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveUserEdit}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-slate-950 shadow"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
