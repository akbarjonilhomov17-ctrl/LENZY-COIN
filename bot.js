/**
 * ==============================================================================
 * 🎮 LENZY COIN - NODE.JS TELEGRAM BOT SERVER
 * ==============================================================================
 * O'rnatish: npm install node-telegram-bot-api
 * Ishga tushirish: node bot.js
 * ==============================================================================
 */

const TelegramBot = require('node-telegram-bot-api');

// 1. BOT TOKENINGIZ (@BotFather bergan token):
const BOT_TOKEN = process.env.BOT_TOKEN || 'BOT_TOKENINGIZNI_SHU_YERGA_YOZING';

// 2. O'YIN HAVOLASI (Vercel / Cloud Run / Netlify):
const GAME_URL = process.env.GAME_URL || 'https://ais-pre-owanp3lrdlklvx2gqvtafo-787186879028.asia-southeast1.run.app';

// 3. BANNER RASMI:
const BANNER_URL = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80';

if (BOT_TOKEN === 'BOT_TOKENINGIZNI_SHU_YERGA_YOZING') {
  console.log('\n⚠️ DIQQAT: BOT_TOKEN kiritilmagan! @BotFather dan olgan tokenni bot.js ga qo\'ying.\n');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Pastki doimiy menyu tugmasini (Menu Button) sozlash
bot.setChatMenuButton({
  menu_button: {
    type: 'web_app',
    text: "🎮 Lenzy Coin O'ynash",
    web_app: { url: GAME_URL }
  }
}).catch((err) => console.warn('Menu Button sozlashda ogohlantirish:', err.message));

// /start buyrug'ini qabul qilish
bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || "Do'st";
  const rawParam = match ? match[1] : null;

  const botInfo = await bot.getMe();
  const botUsername = botInfo.username;

  // 1-HOLAT: Agar foydalanuvchi do'stining taklif havolasi orqali kirgan bo'lsa
  if (rawParam && rawParam.startsWith('ref_')) {
    const refCode = rawParam.replace('ref_', '');
    const refGameUrl = `${GAME_URL}?ref=${refCode}`;

    const welcomeRefText = `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
      `🎁 <b>Siz do'stingiz taklifi bilan keldingiz!</b>\n\n` +
      `🪙 <b>Lenzy Coin</b> — bu eng qiziqarli Telegram kliker o'yini.\n\n` +
      `⚡ <b>Siz uchun maxsus sovg'a:</b>\n` +
      `Quyidagi tugmani bosib o'yinga kiring va <b>+10,000 tanga</b> start bonusiga ega bo'ling! Taklif qilgan do'stingizga ham <b>+10,000 tanga</b> beriladi.\n\n` +
      `👇 <i>O'yinni boshlash uchun bosing:</i>`;

    const myRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n${myRefLink}`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🎮 O'yinga kirish va +10,000 tanga olish 🎁",
            web_app: { url: refGameUrl }
          }
        ],
        [
          {
            text: "👥 Do'stlarni taklif qilish",
            url: `https://t.me/share/url?url=${encodeURIComponent(myRefLink)}&text=${encodeURIComponent(shareText)}`
          }
        ]
      ]
    };

    try {
      await bot.sendPhoto(chatId, BANNER_URL, {
        caption: welcomeRefText,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } catch {
      await bot.sendMessage(chatId, welcomeRefText, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
    return;
  }

  // 2-HOLAT: Oddiy /start bosilganda
  const directGameUrl = `${GAME_URL}?ref=tg_${userId}`;
  const myRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
  const shareText = `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n${myRefLink}`;

  const welcomeText = `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
    `🪙 <b>Lenzy Coin</b> rasmiy o'yiniga xush kelibsiz!\n\n` +
    `⚡ <b>O'yinda sizni nimalar kutmoqda:</b>\n` +
    `• 👆 Ekranga bosib tangalar to'plash\n` +
    `• ⚡ Energiyani oshirish va Boostlar sotib olish\n` +
    `• 🤖 Avto-bot (Offline daromad) faollashtirish\n` +
    `• 🏆 Kunlik mukofotlar va Vazifalarni bajarish\n` +
    `• 👥 Har bir taklif qilingan do'st uchun <b>+10,000 tanga</b> va 10% komissiya\n\n` +
    `👇 <i>O'yinni boshlash uchun quyidagi tugmani bosing:</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎮 O'yinni boshlash (Play) 🚀",
          web_app: { url: directGameUrl }
        }
      ],
      [
        {
          text: "👥 Do'stlarni taklif qilish",
          url: `https://t.me/share/url?url=${encodeURIComponent(myRefLink)}&text=${encodeURIComponent(shareText)}`
        }
      ]
    ]
  };

  try {
    await bot.sendPhoto(chatId, BANNER_URL, {
      caption: welcomeText,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } catch {
    await bot.sendMessage(chatId, welcomeText, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }
});

console.log('🚀 Lenzy Coin Telegram Boti (Node.js) ishga tushdi...');
