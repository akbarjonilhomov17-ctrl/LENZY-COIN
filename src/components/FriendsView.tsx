import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Share2, Sparkles, Gift, TrendingUp, RefreshCw, Globe, Send, ShieldCheck, Edit3, Play, ExternalLink, HelpCircle, CheckCircle2, MessageCircle, Terminal, Bot, ChevronRight, X, Code2, Cpu } from 'lucide-react';
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
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedNode, setCopiedNode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showBotCodeModal, setShowBotCodeModal] = useState(false);
  const [selectedBotLang, setSelectedBotLang] = useState<'python' | 'nodejs'>('python');

  const [botUsername, setBotUsername] = useState(() => {
    return localStorage.getItem('lenzy_custom_bot_username') || 'LenzyCoinBot';
  });
  const [isEditingBot, setIsEditingBot] = useState(false);
  const [customBotInput, setCustomBotInput] = useState(botUsername);

  // Base Game URL
  const getBaseGameUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
    return `${origin}${pathname}`;
  };
  const baseGameUrl = getBaseGameUrl();

  // Clean bot username
  const cleanBot = botUsername.replace(/^@/, '').trim() || 'LenzyCoinBot';

  // Standard Telegram Bot Referral Link: https://t.me/BotUsername?start=ref_USERID
  const tgBotReferralLink = `https://t.me/${cleanBot}?start=ref_${gameState.userId}`;
  
  // Direct Web App Link fallback
  const directWebLink = `${baseGameUrl}?ref=${gameState.userId}`;

  // Active current link to copy and share
  const currentLink = tgBotReferralLink;

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
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentLink);
    }
    setCopied(true);
    soundEffects.playCritTap(gameState.soundEnabled);
    triggerHaptic(gameState.vibrationEnabled, 25);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyBaseUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(baseGameUrl);
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleShare = () => {
    const inviteText = encodeURIComponent(
      `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 boshlang'ich bonus tangalarini oling! ⚡\n\n👇 Boshlash uchun botga kiring:\n${tgBotReferralLink}`
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(tgBotReferralLink)}&text=${inviteText}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
    soundEffects.playTap(gameState.soundEnabled);
  };

  const handleTestLink = () => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(currentLink);
    } else {
      window.open(currentLink, '_blank');
    }
  };

  const handleSaveBotUsername = () => {
    const bClean = customBotInput.replace(/^@/, '').trim();
    setBotUsername(bClean || 'LenzyCoinBot');
    localStorage.setItem('lenzy_custom_bot_username', bClean || 'LenzyCoinBot');
    setIsEditingBot(false);
  };

  const pythonBotCode = `# ==============================================================================
# 🎮 LENZY COIN - TELEGRAM BOT SERVER (Python)
# O'rnatish: pip install pyTelegramBotAPI
# Ishga tushirish: python bot.py
# ==============================================================================
import os
import telebot
from telebot import types

BOT_TOKEN = "BOT_TOKENINGIZNI_SHU_YERGA_YOZING"
GAME_URL = "${baseGameUrl}"
BANNER_URL = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80"

bot = telebot.TeleBot(BOT_TOKEN, parse_mode="HTML")

# Pastki doimiy WebApp menyu tugmasini ulash
try:
    bot.set_chat_menu_button(
        menu_button=types.MenuButtonWebApp(
            type="web_app",
            text="🎮 Lenzy Coin O'ynash",
            web_app=types.WebAppInfo(url=GAME_URL)
        )
    )
except Exception as e:
    print("Menu button:", e)

@bot.message_handler(commands=['start'])
def handle_start(message: types.Message):
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Do'st"
    args = message.text.split()
    ref_code = None
    if len(args) > 1:
        ref_code = args[1].replace("ref_", "").strip()

    # 1-HOLAT: Agar do'st taklif havolasi orqali kirgan bo'lsa
    if ref_code:
        ref_game_url = f"{GAME_URL}?ref={ref_code}"
        text = (
            f"👋 <b>Assalomu alaykum, {first_name}!</b>\\n\\n"
            f"🎁 <b>Siz do'stingiz taklifi bilan keldingiz!</b>\\n\\n"
            f"🪙 <b>Lenzy Coin</b> — Telegramdagi eng qiziqarli kliker o'yini.\\n\\n"
            f"⚡ <b>Siz uchun sovg'a:</b>\\n"
            f"Quyidagi tugmani bosing va <b>+10,000 tanga</b> start bonusiga ega bo'ling!\\n\\n"
            f"👇 <i>O'yinga kirish uchun bosing:</i>"
        )
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(
            types.InlineKeyboardButton(
                text="🎮 O'yinga kirish va +10,000 tanga olish 🎁",
                web_app=types.WebAppInfo(url=ref_game_url)
            )
        )
        bot.send_photo(message.chat.id, BANNER_URL, caption=text, reply_markup=markup)
        return

    # 2-HOLAT: Oddiy /start bosilganda
    direct_game_url = f"{GAME_URL}?ref=tg_{user_id}"
    bot_user = bot.get_me().username
    share_link = f"https://t.me/{bot_user}?start=ref_{user_id}"
    share_msg = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\\n{share_link}"

    text = (
        f"👋 <b>Assalomu alaykum, {first_name}!</b>\\n\\n"
        f"🪙 <b>Lenzy Coin</b> rasmiy o'yiniga xush kelibsiz!\\n\\n"
        f"• 👆 Ekranga bosib tangalar to'plang\\n"
        f"• ⚡ Boostlar va Avto-bot faollashtiring\\n"
        f"• 👥 Har bir do'st uchun <b>+10,000 tanga</b> oling!\\n\\n"
        f"👇 <i>O'yinni boshlash:</i>"
    )
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("🎮 O'yinni boshlash 🚀", web_app=types.WebAppInfo(url=direct_game_url)),
        types.InlineKeyboardButton("👥 Do'stlarni taklif qilish", url=f"https://t.me/share/url?url={share_link}&text={share_msg}")
    )
    bot.send_photo(message.chat.id, BANNER_URL, caption=text, reply_markup=markup)

print("🚀 Bot ishga tushdi...")
bot.infinity_polling()`;

  const nodeBotCode = `/**
 * 🎮 LENZY COIN - TELEGRAM BOT (Node.js)
 * O'rnatish: npm install node-telegram-bot-api
 * Ishga tushirish: node bot.js
 */
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = 'BOT_TOKENINGIZNI_SHU_YERGA_YOZING';
const GAME_URL = '${baseGameUrl}';
const BANNER_URL = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Pastki WebApp tugmasini ulash
bot.setChatMenuButton({
  menu_button: {
    type: 'web_app',
    text: "🎮 Lenzy Coin O'ynash",
    web_app: { url: GAME_URL }
  }
}).catch(console.warn);

bot.onText(/\\/start(?:\\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || "Do'st";
  const rawParam = match ? match[1] : null;

  const botInfo = await bot.getMe();
  const botUsername = botInfo.username;

  // 1-HOLAT: Do'st havolasi orqali kirganda
  if (rawParam && rawParam.startsWith('ref_')) {
    const refCode = rawParam.replace('ref_', '');
    const refGameUrl = \`\${GAME_URL}?ref=\${refCode}\`;

    const text = \`👋 <b>Assalomu alaykum, \${firstName}!</b>\\n\\n\` +
      \`🎁 <b>Siz do'stingiz taklifi bilan keldingiz!</b>\\n\\n\` +
      \`🪙 <b>Lenzy Coin</b> — Telegramdagi eng qiziqarli kliker o'yini.\\n\\n\` +
      \`⚡ <b>Siz uchun sovg'a:</b>\\n\` +
      \`Quyidagi tugmani bosing va <b>+10,000 tanga</b> start bonusiga ega bo'ling!\\n\\n\` +
      \`👇 <i>O'yinga kirish uchun bosing:</i>\`;

    const keyboard = {
      inline_keyboard: [
        [{ text: "🎮 O'yinga kirish va +10,000 tanga olish 🎁", web_app: { url: refGameUrl } }]
      ]
    };

    return bot.sendPhoto(chatId, BANNER_URL, { caption: text, parse_mode: 'HTML', reply_markup: keyboard });
  }

  // 2-HOLAT: Oddiy /start
  const directGameUrl = \`\${GAME_URL}?ref=tg_\${userId}\`;
  const shareLink = \`https://t.me/\${botUsername}?start=ref_\${userId}\`;
  const shareText = \`🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\\n\${shareLink}\`;

  const text = \`👋 <b>Assalomu alaykum, \${firstName}!</b>\\n\\n\` +
    \`🪙 <b>Lenzy Coin</b> rasmiy o'yiniga xush kelibsiz!\\n\\n\` +
    \`• 👆 Ekranga bosib tangalar to'plang\\n\` +
    \`• ⚡ Boostlar va Avto-bot faollashtiring\\n\` +
    \`• 👥 Har bir do'st uchun <b>+10,000 tanga</b> oling!\\n\\n\` +
    \`👇 <i>O'yinni boshlash:</i>\`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "🎮 O'yinni boshlash 🚀", web_app: { url: directGameUrl } }],
      [{ text: "👥 Do'stlarni taklif qilish", url: \`https://t.me/share/url?url=\${encodeURIComponent(shareLink)}&text=\${encodeURIComponent(shareText)}\` }]
    ]
  };

  bot.sendPhoto(chatId, BANNER_URL, { caption: text, parse_mode: 'HTML', reply_markup: keyboard });
});

console.log("🚀 Node.js Telegram Bot ishga tushdi...");`;

  const handleCopyPython = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pythonBotCode);
    }
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2500);
  };

  const handleCopyNode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(nodeBotCode);
    }
    setCopiedNode(true);
    setTimeout(() => setCopiedNode(false), 2500);
  };

  const totalEarnedFromFriends = friends.length * 10000 + friends.reduce((sum, f) => sum + Math.floor(f.coinsEarned * 0.1), 0);

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28 pt-2 overflow-y-auto space-y-4 select-none">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-4 shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h2 className="text-base font-extrabold text-slate-100">Do&apos;stlarni Taklif Qiling</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Har bir taklif qilingan yangi do&apos;st uchun +10,000 tanga va uning daromadidan 10% doimiy komissiya oling.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-medium block">Haqiqiy do&apos;stlar</span>
            <span className="text-sm font-extrabold text-slate-100">{friends.length} ta do&apos;st</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-medium block">Ishlab topilgan</span>
            <span className="text-sm font-extrabold text-amber-400">+{formatCoins(totalEarnedFromFriends)}</span>
          </div>
        </div>
      </div>

      {/* 2. Referral Link Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>Telegram Bot Taklif Havolasi</span>
          </div>

          <button
            onClick={() => setShowBotCodeModal(true)}
            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 active:scale-95 transition-transform"
          >
            <Code2 className="w-3 h-3" />
            <span>Bot kodi &amp; sozlash</span>
          </button>
        </div>

        {/* Bot Username Configuration */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-medium">Botingiz usernami:</span>
            {!isEditingBot ? (
              <button
                onClick={() => {
                  setCustomBotInput(cleanBot);
                  setIsEditingBot(true);
                }}
                className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>O&apos;zgartirish</span>
              </button>
            ) : null}
          </div>

          {isEditingBot ? (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customBotInput}
                onChange={(e) => setCustomBotInput(e.target.value)}
                placeholder="Botingiz usernami (masalan: LenzyCoinBot)"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 flex-1 outline-none font-mono"
              />
              <button
                onClick={handleSaveBotUsername}
                className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400"
              >
                Saqlash
              </button>
              <button
                onClick={() => setIsEditingBot(false)}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs"
              >
                Bekor
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-300 font-mono font-bold">@{cleanBot}</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Ulangan
              </span>
            </div>
          )}
        </div>

        {/* Link Input & Copy */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={currentLink}
            className="bg-transparent text-xs text-amber-300 flex-1 outline-none px-2 font-mono truncate select-all"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
          </button>
        </div>

        {/* Buttons Row: Share & Test */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleShare}
            className="col-span-3 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-wide"
          >
            <Share2 className="w-4 h-4" />
            <span>Telegramda do&apos;stlarga ulashish</span>
          </button>

          <button
            onClick={handleTestLink}
            className="col-span-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
            title="Bot orqali ochib ko'rish"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tekshirish</span>
          </button>
        </div>

        {/* Telegram Bot Flow Steps */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Do&apos;stlik havolasi qanday ishlaydi?</span>
          </div>
          
          <div className="space-y-1 text-[10px] text-slate-400 leading-relaxed">
            <p>1️⃣ Do&apos;stingiz havolani bosganda botga o&apos;tadi (<code className="text-amber-300">/start ref_{gameState.userId}</code>).</p>
            <p>2️⃣ Bot unga chiroyli xush kelibsiz xabari va <strong className="text-emerald-300">&quot;🎮 O&apos;yinga kirish va +10,000 tanga olish&quot;</strong> tugmasini chiqaradi.</p>
            <p>3️⃣ Tugma bosilishi bilanoq o&apos;yin ochiladi, sizga va unga <strong className="text-amber-300">+10,000 tanga</strong> taqdim etiladi!</p>
          </div>
        </div>
      </div>

      {/* 3. Referral Rewards Cards */}
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
              <span className="text-xs font-bold text-slate-200">Yangi do&apos;st</span>
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
              <span className="text-[10px] text-slate-400 block mt-0.5">Do&apos;st daromadidan ulush</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real Friends List from Database */}
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
              Yuqoridagi bot havolasini do&apos;stlaringizga yuboring. Ular bot orqali o&apos;yinga kirishi bilan bu yerda avtomatik ko&apos;rinadi!
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

      {/* 5. Complete Bot Code & Setup Modal */}
      {showBotCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">Telegram Bot Server Kodi</h3>
                  <span className="text-[10px] text-slate-400">Tayyor va 100% dasturlangan kod</span>
                </div>
              </div>
              <button
                onClick={() => setShowBotCodeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-300">
              {/* Language Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedBotLang('python')}
                  className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedBotLang === 'python'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Python (bot.py)</span>
                </button>

                <button
                  onClick={() => setSelectedBotLang('nodejs')}
                  className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedBotLang === 'nodejs'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Node.js (bot.js)</span>
                </button>
              </div>

              {/* Bot Info Banner */}
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-[11px] text-sky-200 space-y-1">
                <span className="font-bold text-sky-300 block">✨ Bu bot kodi nimalarni bajaradi?</span>
                <p>• Yangi o&apos;yinchi /start bosganda chiroyli xabar va <strong className="text-amber-300">🎮 O&apos;yinni boshlash</strong> tugmasini chiqaradi.</p>
                <p>• Do&apos;st havolasi bilan kirganda <strong className="text-emerald-300">&quot;+10,000 tanga olish&quot;</strong> maxsus tugmasini ko&apos;rsatadi va ikkala o&apos;yinchiga ham tanga beradi!</p>
                <p>• Botning pastki burchagiga doimiy <strong className="text-sky-300">🎮 Menyu</strong> tugmasini o&apos;rnatadi.</p>
              </div>

              {/* Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    {selectedBotLang === 'python' ? 'bot.py kodi:' : 'bot.js kodi:'}
                  </span>
                  
                  {selectedBotLang === 'python' ? (
                    <button
                      onClick={handleCopyPython}
                      className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 shadow"
                    >
                      {copiedPython ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPython ? 'Nusxalandi!' : 'Kodni nusxalash'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyNode}
                      className="px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 shadow"
                    >
                      {copiedNode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNode ? 'Nusxalandi!' : 'Kodni nusxalash'}</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-52 overflow-y-auto font-mono text-[10px] text-slate-300 whitespace-pre leading-relaxed select-all">
                  {selectedBotLang === 'python' ? pythonBotCode : nodeBotCode}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 text-xs block">Ishga tushirish yo&apos;riqnomasi:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li><strong className="text-sky-300">@BotFather</strong> dan bot ochib, tokenni oling.</li>
                  <li>Koddagi <code className="text-amber-300">&quot;BOT_TOKENINGIZNI_SHU_YERGA_YOZING&quot;</code> o&apos;rniga bot tokenni qo&apos;ying.</li>
                  <li>Terminalda ishga tushiring:
                    <div className="bg-slate-900 p-1.5 rounded mt-1 font-mono text-emerald-400 text-[10px]">
                      {selectedBotLang === 'python' ? 'pip install pyTelegramBotAPI && python bot.py' : 'npm install node-telegram-bot-api && node bot.js'}
                    </div>
                  </li>
                  <li>Tayyor! Botingiz do&apos;stlik havolalarini avtomatik qabul qilib, o&apos;yinga ulaydi.</li>
                </ol>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowBotCodeModal(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs active:scale-95 transition-all uppercase tracking-wide"
              >
                Tushunarli, yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
