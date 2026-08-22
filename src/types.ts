export type TabType = 'tap' | 'boosts' | 'tasks' | 'friends' | 'leaderboard';

export interface League {
  id: string;
  name: string;
  nameUz: string;
  minCoins: number;
  maxCoins: number;
  icon: string;
  color: string;
  badgeBg: string;
  glowColor: string;
}

export interface BoostItem {
  id: string;
  nameUz: string;
  descUz: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectValue: number; // e.g. +1 tap or +500 energy
  effectUnit: string;
  iconName: string;
}

export interface DailyFreeBoost {
  type: 'full_energy' | 'turbo_tap';
  nameUz: string;
  descUz: string;
  availableCount: number;
  maxDailyCount: number;
  lastUsedTimestamp: number;
  iconName: string;
}

export interface TaskItem {
  id: string;
  category: 'social' | 'daily' | 'achievements';
  titleUz: string;
  descriptionUz: string;
  rewardCoins: number;
  rewardEnergy?: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionUrl?: string;
  iconName: string;
  type: 'telegram' | 'social' | 'invite' | 'tap_count' | 'level_reach' | 'daily_claim';
  requiredCount?: number;
  currentCount?: number;
}

export interface FriendItem {
  id: string;
  name: string;
  username: string;
  photoUrl?: string;
  avatarBg: string;
  joinedDate: string;
  coinsEarned: number;
  isPremium: boolean;
  bonusClaimed: boolean;
  bonusAmount: number;
}

export interface DailyBonusDay {
  day: number;
  rewardCoins: number;
  isSpecial?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit?: boolean;
}

export type LeaderboardCategory = 'taps' | 'referrals';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  username: string;
  photoUrl?: string;
  avatarBg: string;
  totalTapsCount: number;
  totalEarnedCoins: number;
  coins: number;
  referralCount: number;
  isCurrentUser?: boolean;
}

export interface UserGameState {
  userId: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  avatarBg: string;
  referredBy?: string | null;
  referralCount: number;

  coins: number;
  totalTappedCoins: number;
  totalEarnedCoins: number;
  energy: number;
  maxEnergy: number;
  energyRechargeRate: number; // energy per second
  tapPower: number;
  profitPerHour: number;
  
  // Boost levels
  multitapLevel: number;
  energyLimitLevel: number;
  rechargingSpeedLevel: number;
  autoBotLevel: number; // 0 = not bought, 1+ = active
  
  // Free daily boosters
  fullEnergyRemaining: number;
  turboTapRemaining: number;
  turboActiveUntil: number; // timestamp
  
  // Daily Streak
  dailyStreak: number;
  lastDailyClaimTimestamp: number;
  
  // Stats
  totalTapsCount: number;
  friendsCount: number;
  
  // Timestamps & settings
  lastActiveTimestamp: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: TelegramUser;
          start_param?: string;
        };
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

