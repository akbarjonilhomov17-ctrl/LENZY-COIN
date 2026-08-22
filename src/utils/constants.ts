import { League, BoostItem, TaskItem, FriendItem, DailyBonusDay, LeaderboardUser } from '../types';

export const LEAGUES: League[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameUz: 'Bronza',
    minCoins: 0,
    maxCoins: 5000,
    icon: '🥉',
    color: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
    glowColor: '#d97706'
  },
  {
    id: 'silver',
    name: 'Silver',
    nameUz: 'Kumush',
    minCoins: 5000,
    maxCoins: 25000,
    icon: '🥈',
    color: 'from-slate-300 to-slate-500',
    badgeBg: 'bg-slate-700/40 text-slate-200 border-slate-500/60',
    glowColor: '#94a3b8'
  },
  {
    id: 'gold',
    name: 'Gold',
    nameUz: 'Oltin',
    minCoins: 25000,
    maxCoins: 100000,
    icon: '🥇',
    color: 'from-amber-400 to-yellow-600',
    badgeBg: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/60',
    glowColor: '#eab308'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameUz: 'Platina',
    minCoins: 100000,
    maxCoins: 500000,
    icon: '💠',
    color: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/60',
    glowColor: '#06b6d4'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameUz: 'Olmos',
    minCoins: 500000,
    maxCoins: 2000000,
    icon: '💎',
    color: 'from-blue-400 to-indigo-600',
    badgeBg: 'bg-indigo-900/40 text-indigo-300 border-indigo-500/60',
    glowColor: '#3b82f6'
  },
  {
    id: 'master',
    name: 'Master',
    nameUz: 'Usta (Master)',
    minCoins: 2000000,
    maxCoins: 10000000,
    icon: '👑',
    color: 'from-purple-400 to-pink-600',
    badgeBg: 'bg-purple-900/40 text-purple-300 border-purple-500/60',
    glowColor: '#a855f7'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    nameUz: 'Grossmeyster',
    minCoins: 10000000,
    maxCoins: 50000000,
    icon: '🔥',
    color: 'from-rose-500 to-orange-600',
    badgeBg: 'bg-rose-900/40 text-rose-300 border-rose-500/60',
    glowColor: '#f43f5e'
  },
  {
    id: 'legend',
    name: 'Lenzy Legend',
    nameUz: 'Lenzy Afsonasi',
    minCoins: 50000000,
    maxCoins: Infinity,
    icon: '⚡',
    color: 'from-amber-300 via-rose-500 to-purple-600',
    badgeBg: 'bg-gradient-to-r from-amber-900/50 to-purple-900/50 text-amber-200 border-amber-400/60',
    glowColor: '#fbbf24'
  }
];

export const INITIAL_BOOSTS_CONFIG: BoostItem[] = [
  {
    id: 'multitap',
    nameUz: 'Multi-Tap (Ko\'p tanga)',
    descUz: 'Har bir bosishda beriladigan Lenzy tangalar miqdorini oshiradi (+1 tanga)',
    level: 1,
    maxLevel: 25,
    baseCost: 200,
    costMultiplier: 2.2,
    effectValue: 1,
    effectUnit: 'tanga/bosish',
    iconName: 'Hand'
  },
  {
    id: 'energy_limit',
    nameUz: 'Energiya Sig\'imi',
    descUz: 'Maksimal energiya hajmini oshiradi (+500 energiya)',
    level: 1,
    maxLevel: 20,
    baseCost: 250,
    costMultiplier: 2.1,
    effectValue: 500,
    effectUnit: 'energiya',
    iconName: 'BatteryCharging'
  },
  {
    id: 'recharge_speed',
    nameUz: 'Qayta Tiklanish Tezligi',
    descUz: 'Har soniyada energiya tiklanish tezligini oshiradi (+1 energiya/sek)',
    level: 1,
    maxLevel: 10,
    baseCost: 800,
    costMultiplier: 2.6,
    effectValue: 1,
    effectUnit: 'energiya/sek',
    iconName: 'Zap'
  },
  {
    id: 'auto_bot',
    nameUz: 'Lenzy Tap Bot',
    descUz: 'O\'yinda bo\'lmaganingizda ham siz uchun avtomatik tanga to\'playdi (soatiga 3,000 tanga)',
    level: 0,
    maxLevel: 5,
    baseCost: 20000,
    costMultiplier: 3.5,
    effectValue: 3000,
    effectUnit: 'tanga/soat',
    iconName: 'Bot'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tg_channel',
    category: 'social',
    titleUz: 'Lenzy Coin Rasmiy Kanaliga a\'zo bo\'ling',
    descriptionUz: 'Eng so\'nggi yangiliklar, airdrop va e\'lonlarni kuzatib boring',
    rewardCoins: 25000,
    isCompleted: false,
    isClaimed: false,
    actionUrl: 'https://t.me/lenzycoin',
    iconName: 'Send',
    type: 'telegram'
  },
  {
    id: 'tg_community',
    category: 'social',
    titleUz: 'Lenzy Coin Hamjamiyat guruhiga qo\'shiling',
    descriptionUz: 'Boshqa foydalanuvchilar bilan fikr almashing va savollarga javob oling',
    rewardCoins: 15000,
    isCompleted: false,
    isClaimed: false,
    actionUrl: 'https://t.me/lenzycoin_chat',
    iconName: 'MessageSquare',
    type: 'telegram'
  },
  {
    id: 'twitter_x',
    category: 'social',
    titleUz: 'Lenzy Coin X (Twitter) sahifasini kuzating',
    descriptionUz: 'Global e\'lonlar va xalqaro tadbirlardan xabardor bo\'ling',
    rewardCoins: 20000,
    isCompleted: false,
    isClaimed: false,
    actionUrl: 'https://x.com/lenzycoin',
    iconName: 'Twitter',
    type: 'social'
  },
  {
    id: 'daily_checkin',
    category: 'daily',
    titleUz: 'Bugungi kundalik bonusni oling',
    descriptionUz: 'Ketma-ket kirib tangalar sonini ko\'paytiring',
    rewardCoins: 5000,
    rewardEnergy: 500,
    isCompleted: false,
    isClaimed: false,
    iconName: 'CalendarCheck',
    type: 'daily_claim'
  },
  {
    id: 'daily_tap_500',
    category: 'daily',
    titleUz: 'Bugun 500 marta tanga bosing',
    descriptionUz: 'Kun davomida kamida 500 marta tangaga teging',
    rewardCoins: 10000,
    rewardEnergy: 500,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Flame',
    type: 'tap_count',
    requiredCount: 500,
    currentCount: 0
  },
  {
    id: 'invite_1_friend',
    category: 'social',
    titleUz: '1 ta do\'stingizni taklif qiling',
    descriptionUz: 'Do\'stingizga o\'z referal havolangizni yuboring',
    rewardCoins: 20000,
    isCompleted: false,
    isClaimed: false,
    iconName: 'UserPlus',
    type: 'invite',
    requiredCount: 1,
    currentCount: 0
  },
  {
    id: 'invite_3_friends',
    category: 'social',
    titleUz: '3 ta do\'stingizni taklif qiling',
    descriptionUz: 'Jamoangizni kengaytiring va katta mukofot oling',
    rewardCoins: 75000,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Users',
    type: 'invite',
    requiredCount: 3,
    currentCount: 0
  },
  {
    id: 'reach_silver',
    category: 'achievements',
    titleUz: 'Kumush (Silver) ligasiga chiqing',
    descriptionUz: '5,000 tanga to\'plab yangi darajaga o\'ting',
    rewardCoins: 10000,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Award',
    type: 'level_reach',
    requiredCount: 5000,
    currentCount: 0
  },
  {
    id: 'reach_gold',
    category: 'achievements',
    titleUz: 'Oltin (Gold) ligasiga chiqing',
    descriptionUz: '25,000 tangaga erishib oltin nishonni qo\'lga kiriting',
    rewardCoins: 50000,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Crown',
    type: 'level_reach',
    requiredCount: 25000,
    currentCount: 0
  },
  {
    id: 'reach_diamond',
    category: 'achievements',
    titleUz: 'Olmos (Diamond) ligasiga chiqing',
    descriptionUz: '500,000 tanga bilan eng kuchlilar safiga kiring',
    rewardCoins: 200000,
    isCompleted: false,
    isClaimed: false,
    iconName: 'Sparkles',
    type: 'level_reach',
    requiredCount: 500000,
    currentCount: 0
  }
];

export const DAILY_BONUSES: DailyBonusDay[] = [
  { day: 1, rewardCoins: 1000 },
  { day: 2, rewardCoins: 2500 },
  { day: 3, rewardCoins: 7500 },
  { day: 4, rewardCoins: 15000 },
  { day: 5, rewardCoins: 40000 },
  { day: 6, rewardCoins: 100000 },
  { day: 7, rewardCoins: 300000, isSpecial: true }
];

export const INITIAL_FRIENDS: FriendItem[] = [
  {
    id: 'f1',
    name: 'Sardorbek Rahimov',
    username: '@sardor_dev',
    avatarBg: 'bg-emerald-600',
    joinedDate: 'Bugun',
    coinsEarned: 34500,
    isPremium: true,
    bonusClaimed: false,
    bonusAmount: 50000
  },
  {
    id: 'f2',
    name: 'Dilnoza Karimova',
    username: '@dilnoza_k',
    avatarBg: 'bg-pink-600',
    joinedDate: 'Kecha',
    coinsEarned: 18200,
    isPremium: false,
    bonusClaimed: true,
    bonusAmount: 10000
  },
  {
    id: 'f3',
    name: 'Bobur Mirzo',
    username: '@bobur_uz',
    avatarBg: 'bg-blue-600',
    joinedDate: '2 kun oldin',
    coinsEarned: 89000,
    isPremium: true,
    bonusClaimed: true,
    bonusAmount: 50000
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [];

