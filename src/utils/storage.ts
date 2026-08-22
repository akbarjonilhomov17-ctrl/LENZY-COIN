import { UserGameState, TaskItem, FriendItem } from '../types';
import { INITIAL_TASKS, INITIAL_FRIENDS } from './constants';

const STORAGE_KEYS = {
  GAME_STATE: 'lenzy_coin_game_state_v1',
  TASKS: 'lenzy_coin_tasks_v1',
  FRIENDS: 'lenzy_coin_friends_v1',
  LAST_LOGIN_CHECK: 'lenzy_coin_last_login_v1'
};

export const DEFAULT_USER_STATE: UserGameState = {
  userId: 'user_default',
  username: 'LenzyUser',
  firstName: 'Lenzy',
  lastName: 'User',
  photoUrl: undefined,
  avatarBg: 'bg-amber-600',
  referredBy: null,
  referralCount: 0,
  telegramId: '78291044',
  coins: 0,
  totalTappedCoins: 0,
  totalEarnedCoins: 0,
  energy: 1000,
  maxEnergy: 1000,
  energyRechargeRate: 1, // 1 energy per second
  tapPower: 1,
  profitPerHour: 0,
  
  multitapLevel: 1,
  energyLimitLevel: 1,
  rechargingSpeedLevel: 1,
  autoBotLevel: 0,
  
  fullEnergyRemaining: 3,
  turboTapRemaining: 3,
  turboActiveUntil: 0,
  
  dailyStreak: 0,
  lastDailyClaimTimestamp: 0,
  
  totalTapsCount: 0,
  friendsCount: 0,
  
  lastActiveTimestamp: Date.now(),
  soundEnabled: true,
  vibrationEnabled: true
};

export function loadGameState(): {
  state: UserGameState;
  offlineCoins: number;
  offlineSeconds: number;
} {
  if (typeof window === 'undefined') {
    return { state: DEFAULT_USER_STATE, offlineCoins: 0, offlineSeconds: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    let state: UserGameState = raw ? { ...DEFAULT_USER_STATE, ...JSON.parse(raw) } : { ...DEFAULT_USER_STATE };

    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - (state.lastActiveTimestamp || now)) / 1000));
    
    // Regenerate energy during time away
    const energyToAdd = elapsedSeconds * state.energyRechargeRate;
    state.energy = Math.min(state.maxEnergy, state.energy + energyToAdd);
    
    // Calculate offline auto-bot earnings (if autoBotLevel > 0)
    let offlineCoins = 0;
    if (state.autoBotLevel > 0 && elapsedSeconds > 30) {
      // Auto-bot runs for up to 3 hours (10800 seconds) offline
      const cappedSeconds = Math.min(10800, elapsedSeconds);
      const coinsPerSecond = (state.autoBotLevel * 3000) / 3600;
      offlineCoins = Math.floor(cappedSeconds * coinsPerSecond);
      if (offlineCoins > 0) {
        state.coins += offlineCoins;
        state.totalEarnedCoins += offlineCoins;
      }
    }

    // Reset daily boosters if day changed (check 24h cycle or new calendar day)
    const lastActiveDate = new Date(state.lastActiveTimestamp).toDateString();
    const todayDate = new Date(now).toDateString();
    if (lastActiveDate !== todayDate) {
      state.fullEnergyRemaining = 3;
      state.turboTapRemaining = 3;
    }

    state.lastActiveTimestamp = now;
    saveGameState(state);

    return {
      state,
      offlineCoins,
      offlineSeconds: elapsedSeconds
    };
  } catch (e) {
    console.error('Error loading game state:', e);
    return { state: DEFAULT_USER_STATE, offlineCoins: 0, offlineSeconds: 0 };
  }
}

export function saveGameState(state: UserGameState): void {
  if (typeof window === 'undefined') return;
  try {
    state.lastActiveTimestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving game state:', e);
  }
}

export function loadTasks(): TaskItem[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const saved: TaskItem[] = JSON.parse(raw);
    
    // Merge with INITIAL_TASKS in case new tasks are added
    return INITIAL_TASKS.map(task => {
      const found = saved.find(s => s.id === task.id);
      return found ? { ...task, ...found } : task;
    });
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function loadFriends(): FriendItem[] {
  if (typeof window === 'undefined') return INITIAL_FRIENDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    return raw ? JSON.parse(raw) : INITIAL_FRIENDS;
  } catch {
    return INITIAL_FRIENDS;
  }
}

export function saveFriends(friends: FriendItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.error('Error saving friends:', e);
  }
}

export function formatCoins(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('uz-UZ');
}

export function formatNumberWithCommas(num: number): string {
  return Math.floor(num).toLocaleString('uz-UZ');
}
