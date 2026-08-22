import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserGameState, TelegramUser, LeaderboardUser, FriendItem, LeaderboardCategory } from '../types';

const USER_ID_KEY = 'lenzy_user_unique_id';

const AVATAR_COLORS = [
  'bg-amber-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-orange-600'
];

export const ADMIN_USERNAMES = ['lenzy_dev', 'lenzy_admin'];

export function isAdminUser(username?: string): boolean {
  if (!username) return false;
  const clean = username.replace(/^@/, '').toLowerCase().trim();
  return ADMIN_USERNAMES.includes(clean);
}

export function getRandomAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Extracts Telegram WebApp user from all available sources:
 * 1. window.Telegram.WebApp.initDataUnsafe.user
 * 2. window.Telegram.WebApp.initData (URL decoded query string)
 * 3. window.location.hash (#tgWebAppData=...)
 * 4. window.location.search (?tgWebAppData=...)
 * 5. Cached localStorage from previous Telegram session
 */
export function getTelegramData(): { user?: TelegramUser; startParam?: string } {
  try {
    if (typeof window === 'undefined') return {};

    let user: TelegramUser | undefined;
    let startParam: string | undefined;

    // 1. Direct Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (e) {
        console.warn('Telegram WebApp ready/expand error:', e);
      }

      // Check initDataUnsafe
      const unsafeUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (unsafeUser && unsafeUser.id) {
        user = unsafeUser;
      }
      if (window.Telegram.WebApp.initDataUnsafe?.start_param) {
        startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
      }

      // If user not in initDataUnsafe, parse raw initData string
      if (!user && window.Telegram.WebApp.initData) {
        try {
          const params = new URLSearchParams(window.Telegram.WebApp.initData);
          const userStr = params.get('user');
          if (userStr) {
            user = JSON.parse(decodeURIComponent(userStr));
          }
          if (!startParam) {
            startParam = params.get('start_param') || undefined;
          }
        } catch (err) {
          console.warn('Error parsing initData string:', err);
        }
      }
    }

    // 2. Check URL Hash (used by Telegram Web and Desktop: #tgWebAppData=...)
    if (!user && window.location.hash) {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const tgData = hashParams.get('tgWebAppData');
        if (tgData) {
          const subParams = new URLSearchParams(tgData);
          const userStr = subParams.get('user');
          if (userStr) {
            user = JSON.parse(decodeURIComponent(userStr));
          }
          if (!startParam) {
            startParam = subParams.get('start_param') || undefined;
          }
        } else {
          const userStr = hashParams.get('user');
          if (userStr) {
            user = JSON.parse(decodeURIComponent(userStr));
          }
        }
      } catch (err) {
        console.warn('Error parsing URL hash for Telegram user:', err);
      }
    }

    // 3. Check URL Search Query (e.g. ?tgWebAppData=... or ?user=...)
    if (!user && window.location.search) {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const tgData = searchParams.get('tgWebAppData');
        if (tgData) {
          const subParams = new URLSearchParams(tgData);
          const userStr = subParams.get('user');
          if (userStr) {
            user = JSON.parse(decodeURIComponent(userStr));
          }
          if (!startParam) {
            startParam = subParams.get('start_param') || undefined;
          }
        } else {
          const userStr = searchParams.get('user');
          if (userStr) {
            user = JSON.parse(decodeURIComponent(userStr));
          }
        }
      } catch (err) {
        console.warn('Error parsing URL search for Telegram user:', err);
      }
    }

    // 4. Cache valid Telegram user to localStorage
    if (user && user.id) {
      localStorage.setItem('lenzy_tg_id', String(user.id));
      if (user.first_name) localStorage.setItem('lenzy_tg_first_name', user.first_name);
      if (user.last_name) localStorage.setItem('lenzy_tg_last_name', user.last_name);
      if (user.username) localStorage.setItem('lenzy_tg_username', user.username);
      if (user.photo_url) localStorage.setItem('lenzy_tg_photo', user.photo_url);
    } else {
      // 5. Fallback from localStorage if previously stored
      const cachedId = localStorage.getItem('lenzy_tg_id');
      const cachedFirst = localStorage.getItem('lenzy_tg_first_name');
      if (cachedId && cachedFirst) {
        user = {
          id: parseInt(cachedId, 10) || 0,
          first_name: cachedFirst,
          last_name: localStorage.getItem('lenzy_tg_last_name') || undefined,
          username: localStorage.getItem('lenzy_tg_username') || undefined,
          photo_url: localStorage.getItem('lenzy_tg_photo') || undefined,
        };
      }
    }

    return { user, startParam };
  } catch (e) {
    console.warn('Telegram data extraction error:', e);
    return {};
  }
}

/**
 * Extracts referral code from URL query (?ref=...) or Telegram start_param
 */
export function getReferralCode(): string | null {
  const { startParam } = getTelegramData();
  if (startParam) {
    if (startParam.startsWith('ref_')) {
      return startParam.replace('ref_', '');
    }
    return startParam;
  }

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) return ref;
  }

  return null;
}

/**
 * Get or generate persistent User ID
 */
export function getOrCreateUserId(tgUser?: TelegramUser): string {
  if (tgUser?.id) {
    const tgId = `tg_${tgUser.id}`;
    localStorage.setItem(USER_ID_KEY, tgId);
    return tgId;
  }

  const storedId = localStorage.getItem(USER_ID_KEY);
  if (storedId) return storedId;

  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  localStorage.setItem(USER_ID_KEY, newId);
  return newId;
}

export const DEFAULT_USER_STATE: UserGameState = {
  userId: '',
  telegramId: '',
  username: 'player',
  firstName: 'Player',
  lastName: '',
  photoUrl: undefined,
  avatarBg: 'bg-amber-600',
  referredBy: null,
  referralCount: 0,

  coins: 0,
  totalTappedCoins: 0,
  totalEarnedCoins: 0,
  energy: 1000,
  maxEnergy: 1000,
  energyRechargeRate: 1,
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

/**
 * Initialize user from Firebase Firestore or create initial document
 */
export async function initializeUserOnline(): Promise<{ state: UserGameState; offlineCoins: number; offlineSeconds: number }> {
  const { user: tgUser } = getTelegramData();
  const userId = getOrCreateUserId(tgUser);
  const refCode = getReferralCode();

  const userDocRef = doc(db, 'users', userId);

  const tgUsername = tgUser?.username || (tgUser?.first_name ? tgUser.first_name.toLowerCase().replace(/[^a-z0-9_]/g, '') : undefined);
  const tgFirst = tgUser?.first_name;
  const tgLast = tgUser?.last_name || '';
  const tgPhoto = tgUser?.photo_url;

  let loadedState: UserGameState = {
    ...DEFAULT_USER_STATE,
    userId,
    telegramId: tgUser?.id ? String(tgUser.id) : (localStorage.getItem('lenzy_tg_id') || String(Date.now()).slice(-6)),
    username: tgUsername || localStorage.getItem('lenzy_tg_username') || `user_${userId.slice(-5)}`,
    firstName: tgFirst || localStorage.getItem('lenzy_tg_first_name') || 'Player',
    lastName: tgLast || localStorage.getItem('lenzy_tg_last_name') || '',
    photoUrl: tgPhoto || localStorage.getItem('lenzy_tg_photo') || undefined,
    avatarBg: getRandomAvatarBg(tgFirst || tgUsername || userId),
  };

  let offlineCoins = 0;
  let offlineSeconds = 0;

  try {
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      
      // Update with latest real Telegram details if present
      const finalUsername = tgUsername || (data.username && data.username !== 'LenzyUser' && data.username !== 'LenzyPlayer' ? data.username : `user_${userId.slice(-5)}`);
      const finalFirstName = tgFirst || (data.firstName && data.firstName !== 'Lenzy' ? data.firstName : 'Player');
      const finalLastName = tgLast !== '' ? tgLast : (data.lastName ?? '');
      const finalPhoto = tgPhoto || data.photoUrl || undefined;

      loadedState = {
        ...DEFAULT_USER_STATE,
        ...data,
        userId,
        telegramId: tgUser?.id ? String(tgUser.id) : (data.telegramId || loadedState.telegramId),
        username: finalUsername,
        firstName: finalFirstName,
        lastName: finalLastName,
        photoUrl: finalPhoto,
        avatarBg: data.avatarBg || getRandomAvatarBg(finalFirstName || finalUsername || 'User'),
        referralCount: data.referralCount ?? 0,
        referredBy: data.referredBy ?? null,
      };

      // Calculate offline earnings from Auto Tap Bot if purchased
      if (loadedState.autoBotLevel > 0 && loadedState.lastActiveTimestamp) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - loadedState.lastActiveTimestamp) / 1000);
        // Max 3 hours offline earnings
        const cappedSeconds = Math.min(diffSeconds, 3 * 3600);
        if (cappedSeconds > 30) {
          const coinsPerSec = (loadedState.autoBotLevel * 3000) / 3600;
          offlineCoins = Math.floor(cappedSeconds * coinsPerSec);
          offlineSeconds = cappedSeconds;
          loadedState.coins += offlineCoins;
          loadedState.totalEarnedCoins += offlineCoins;
        }
      }

      // Update active timestamp and latest Telegram profile
      await updateDoc(userDocRef, {
        lastActiveTimestamp: Date.now(),
        firstName: loadedState.firstName,
        lastName: loadedState.lastName,
        username: loadedState.username,
        photoUrl: loadedState.photoUrl || null,
        avatarBg: loadedState.avatarBg,
        telegramId: loadedState.telegramId,
        coins: loadedState.coins,
        totalEarnedCoins: loadedState.totalEarnedCoins
      });

    } else {
      // New user registration in Firestore!
      let welcomeBonus = 0;
      let referredByVal: string | null = null;

      // Handle referral bonus if valid referrer
      if (refCode && refCode !== userId) {
        try {
          const referrerDocRef = doc(db, 'users', refCode);
          const referrerSnap = await getDoc(referrerDocRef);

          if (referrerSnap.exists()) {
            referredByVal = refCode;
            welcomeBonus = 10000;
            // Reward referrer with +1 referral count and +10,000 coins
            await updateDoc(referrerDocRef, {
              referralCount: increment(1),
              coins: increment(10000),
              totalEarnedCoins: increment(10000)
            });
          }
        } catch (err) {
          console.warn('Referral check error:', err);
        }
      }

      loadedState.coins += welcomeBonus;
      loadedState.totalEarnedCoins += welcomeBonus;
      loadedState.referredBy = referredByVal;

      await setDoc(userDocRef, {
        ...loadedState,
        createdAt: Date.now(),
        lastActiveTimestamp: Date.now(),
        isOnline: true
      });
    }
  } catch (error) {
    console.error('Firestore init error, using local fallback:', error);
    // Fallback to local storage
    const local = localStorage.getItem('lenzy_user_game_state');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        loadedState = { ...loadedState, ...parsed };
      } catch (e) {
        console.warn('Local parse error:', e);
      }
    }
  }

  return { state: loadedState, offlineCoins, offlineSeconds };
}

/**
 * Save user game state to Firestore with local cache
 */
export async function saveUserOnline(state: UserGameState): Promise<void> {
  // Always cache in localStorage instantly
  try {
    localStorage.setItem('lenzy_user_game_state', JSON.stringify(state));
  } catch (e) {
    // Ignore storage quota
  }

  if (!state.userId) return;

  try {
    const userDocRef = doc(db, 'users', state.userId);
    await setDoc(userDocRef, {
      userId: state.userId,
      telegramId: state.telegramId,
      username: state.username,
      firstName: state.firstName,
      lastName: state.lastName || null,
      photoUrl: state.photoUrl || null,
      avatarBg: state.avatarBg,
      referredBy: state.referredBy || null,
      referralCount: state.referralCount || 0,

      coins: state.coins,
      totalTappedCoins: state.totalTappedCoins,
      totalEarnedCoins: state.totalEarnedCoins,
      energy: state.energy,
      maxEnergy: state.maxEnergy,
      energyRechargeRate: state.energyRechargeRate,
      tapPower: state.tapPower,
      profitPerHour: state.profitPerHour,

      multitapLevel: state.multitapLevel,
      energyLimitLevel: state.energyLimitLevel,
      rechargingSpeedLevel: state.rechargingSpeedLevel,
      autoBotLevel: state.autoBotLevel,

      fullEnergyRemaining: state.fullEnergyRemaining,
      turboTapRemaining: state.turboTapRemaining,
      turboActiveUntil: state.turboActiveUntil,

      dailyStreak: state.dailyStreak,
      lastDailyClaimTimestamp: state.lastDailyClaimTimestamp,

      totalTapsCount: state.totalTapsCount,
      friendsCount: state.friendsCount,
      lastActiveTimestamp: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving state to Firestore:', err);
  }
}

/**
 * Update custom profile (e.g. for testing in browser without Telegram)
 */
export async function updateProfile(
  userId: string, 
  data: { firstName: string; lastName?: string; username: string; photoUrl?: string }
): Promise<void> {
  localStorage.setItem('lenzy_tg_first_name', data.firstName);
  localStorage.setItem('lenzy_tg_last_name', data.lastName || '');
  localStorage.setItem('lenzy_tg_username', data.username);
  if (data.photoUrl) {
    localStorage.setItem('lenzy_tg_photo', data.photoUrl);
  }

  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    firstName: data.firstName,
    lastName: data.lastName || null,
    username: data.username,
    photoUrl: data.photoUrl || null,
  });
}

/**
 * Fetch real leaderboard from Firestore database (NO BOTS, only real registered users)
 */
export async function fetchOnlineLeaderboard(
  category: LeaderboardCategory,
  currentUser: UserGameState
): Promise<LeaderboardUser[]> {
  try {
    const usersCol = collection(db, 'users');
    
    // Sort by totalEarnedCoins, totalTapsCount, or referralCount
    let sortField = 'totalTapsCount';
    if (category === 'coins') {
      sortField = 'totalEarnedCoins';
    } else if (category === 'referrals') {
      sortField = 'referralCount';
    }
    
    const q = query(usersCol, orderBy(sortField, 'desc'), limit(100));
    
    const snap = await getDocs(q);
    const users: LeaderboardUser[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const isCurrentUser = docSnap.id === currentUser.userId;
      
      const displayName = d.firstName 
        ? `${d.firstName}${d.lastName ? ' ' + d.lastName : ''}`
        : (d.username || 'Lenzy Player');

      users.push({
        id: docSnap.id,
        rank: 0, // Assigned after sorting
        name: isCurrentUser ? `${displayName} (Siz)` : displayName,
        username: d.username ? `@${d.username}` : `@user_${docSnap.id.slice(-4)}`,
        photoUrl: isCurrentUser ? (currentUser.photoUrl || d.photoUrl) : d.photoUrl || undefined,
        avatarBg: d.avatarBg || getRandomAvatarBg(displayName),
        totalTapsCount: isCurrentUser ? Math.max(currentUser.totalTapsCount, d.totalTapsCount || 0) : (d.totalTapsCount || 0),
        totalEarnedCoins: isCurrentUser ? Math.max(currentUser.totalEarnedCoins, d.totalEarnedCoins || 0) : (d.totalEarnedCoins || 0),
        coins: isCurrentUser ? currentUser.coins : (d.coins || 0),
        referralCount: isCurrentUser ? Math.max(currentUser.referralCount, d.referralCount || 0) : (d.referralCount || 0),
        isCurrentUser
      });
    });

    // Ensure current user is included if database is brand new or current user has 0
    const hasCurrent = users.some(u => u.isCurrentUser);
    if (!hasCurrent && currentUser.userId) {
      const displayName = currentUser.firstName 
        ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}`
        : (currentUser.username || 'Lenzy Player');

      users.push({
        id: currentUser.userId,
        rank: 0,
        name: `${displayName} (Siz)`,
        username: currentUser.username ? `@${currentUser.username}` : `@user_${currentUser.userId.slice(-4)}`,
        photoUrl: currentUser.photoUrl,
        avatarBg: currentUser.avatarBg,
        totalTapsCount: currentUser.totalTapsCount,
        totalEarnedCoins: currentUser.totalEarnedCoins,
        coins: currentUser.coins,
        referralCount: currentUser.referralCount,
        isCurrentUser: true
      });
    }

    // Sort descending by selected category
    if (category === 'coins') {
      users.sort((a, b) => b.totalEarnedCoins - a.totalEarnedCoins || b.coins - a.coins || b.totalTapsCount - a.totalTapsCount);
    } else if (category === 'taps') {
      users.sort((a, b) => b.totalTapsCount - a.totalTapsCount || b.totalEarnedCoins - a.totalEarnedCoins);
    } else {
      users.sort((a, b) => b.referralCount - a.referralCount || b.totalEarnedCoins - a.totalEarnedCoins);
    }

    // Assign 1-indexed ranks
    return users.map((u, i) => ({ ...u, rank: i + 1 }));
  } catch (error) {
    console.error('Error fetching online leaderboard:', error);
    
    // Fallback: only current user
    const displayName = currentUser.firstName 
      ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}`
      : (currentUser.username || 'Lenzy Player');

    return [{
      id: currentUser.userId || 'current',
      rank: 1,
      name: `${displayName} (Siz)`,
      username: currentUser.username ? `@${currentUser.username}` : `@user`,
      photoUrl: currentUser.photoUrl,
      avatarBg: currentUser.avatarBg,
      totalTapsCount: currentUser.totalTapsCount,
      totalEarnedCoins: currentUser.totalEarnedCoins,
      coins: currentUser.coins,
      referralCount: currentUser.referralCount,
      isCurrentUser: true
    }];
  }
}

/**
 * Fetch real friends referred by current user from Firestore (NO BOTS, only real invited users)
 */
export async function fetchOnlineFriends(userId: string): Promise<FriendItem[]> {
  if (!userId) return [];

  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('referredBy', '==', userId), limit(100));
    const snap = await getDocs(q);

    const friends: FriendItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const name = d.firstName 
        ? `${d.firstName}${d.lastName ? ' ' + d.lastName : ''}`
        : (d.username || 'Do\'st');

      const dateStr = d.createdAt 
        ? new Date(d.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })
        : 'Bugun';

      friends.push({
        id: docSnap.id,
        name,
        username: d.username ? `@${d.username}` : `@user_${docSnap.id.slice(-4)}`,
        photoUrl: d.photoUrl || undefined,
        avatarBg: d.avatarBg || getRandomAvatarBg(name),
        joinedDate: dateStr,
        coinsEarned: d.coins || 0,
        isPremium: false,
        bonusClaimed: true, // Automatically credited to referrer upon joining
        bonusAmount: 10000
      });
    });

    return friends;
  } catch (error) {
    console.error('Error fetching online friends:', error);
    return [];
  }
}

/**
 * Admin Panel: Fetch all registered users in Firestore
 */
export async function adminFetchAllUsers(): Promise<UserGameState[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: UserGameState[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        ...DEFAULT_USER_STATE,
        ...data,
        userId: docSnap.id
      } as UserGameState);
    });

    // Sort by totalEarnedCoins or coins descending
    users.sort((a, b) => (b.coins || 0) - (a.coins || 0));
    return users;
  } catch (error) {
    console.error('Admin fetch all users error:', error);
    return [];
  }
}

/**
 * Admin Panel: Update specific player data in Firestore
 */
export async function adminUpdateUser(userId: string, updates: Partial<UserGameState>): Promise<void> {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    ...updates,
    lastActiveTimestamp: Date.now()
  });
}

/**
 * Admin Panel: Delete / ban a player from Firestore
 */
export async function adminDeleteUser(userId: string): Promise<void> {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
}

/**
 * Admin Panel: Give coin bonuses or airdrop to ALL users in Firestore
 */
export async function adminBonusToAllUsers(bonusAmount: number): Promise<number> {
  if (bonusAmount <= 0) return 0;
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    let count = 0;

    const promises = snap.docs.map(async (docSnap) => {
      try {
        await updateDoc(docSnap.ref, {
          coins: increment(bonusAmount),
          totalEarnedCoins: increment(bonusAmount)
        });
        count++;
      } catch (err) {
        console.warn(`Could not add bonus to user ${docSnap.id}:`, err);
      }
    });

    await Promise.all(promises);
    return count;
  } catch (error) {
    console.error('Admin bonus to all error:', error);
    return 0;
  }
}

/**
 * Admin Panel: Get aggregated live stats
 */
export async function adminFetchStats(): Promise<{
  totalUsers: number;
  totalCoins: number;
  totalTaps: number;
  totalReferrals: number;
}> {
  try {
    const users = await adminFetchAllUsers();
    const totalUsers = users.length;
    let totalCoins = 0;
    let totalTaps = 0;
    let totalReferrals = 0;

    users.forEach((u) => {
      totalCoins += u.coins || 0;
      totalTaps += u.totalTapsCount || 0;
      totalReferrals += u.referralCount || 0;
    });

    return { totalUsers, totalCoins, totalTaps, totalReferrals };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { totalUsers: 0, totalCoins: 0, totalTaps: 0, totalReferrals: 0 };
  }
}

