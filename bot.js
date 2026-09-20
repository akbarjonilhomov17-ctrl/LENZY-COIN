/**
 * ==============================================================================
 * 🎮 LENZY COIN - NODE.JS TELEGRAM BOT SERVER
 * Bot: @lenzycoin_bot
 * ==============================================================================
 * O'rnatish: npm install node-telegram-bot-api dotenv
 * Ishga tushirish: node bot.js
 * ==============================================================================
 */

const TelegramBot = require('node-telegram-bot-api');

// Load environment variables from .env if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional
}

// BOT TOKEN (Xavfsiz: faqat .env yoki tizim muhitidan olinadi):
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN.includes('SIZNING_BOT_TOKENINGIZ')) {
  console.error("❌ XAVFSIZLIK XATOSI: BOT_TOKEN topilmadi!");
  console.error("Xavfsizlik yuzasidan token kod ichida ochiq saqlanmaydi.");
  console.error("Iltimos, loyihaning .env fayliga BOT_TOKEN=... ko'rinishida yozing yoki muhit o'zgaruvchisini o'rnating.");
  process.exit(1);
}

// O'YIN HAVOLASI (Vercel yoki Cloud Run Web App manzili):
const GAME_URL = process.env.GAME_URL || process.env.APP_URL || 'https://lenzycoin.vercel.app';

// BANNER RASMI:
const BANNER_URL = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80';

// Telegram Bot instance yaratish
const bot = new TelegramBot(BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Xavfsiz xatolik ushlagich (polling conflict yoki tarmoq xatolari serverni to'xtatib qo'ymasligi uchun)
bot.on('polling_error', (error) => {
  if (error && error.code !== 'EFATAL') {
    console.warn('⚠️ Polling ogohlantirish:', error.message || error);
  }
});

// HTML matnlar uchun maxsus belgilarni xavfsiz qilish
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Bot username kesh
let cachedBotUsername = 'lenzycoin_bot';
bot.getMe().then((info) => {
  if (info && info.username) {
    cachedBotUsername = info.username;
    console.log(`🤖 Bot muvaffaqiyatli ulandi: @${cachedBotUsername} (${info.first_name})`);
  }
}).catch((err) => {
  console.warn('getMe ogohlantirish:', err.message);
});

// Pastki doimiy menyu tugmasini (Menu Button) ulash
bot.setChatMenuButton({
  menu_button: {
    type: 'web_app',
    text: "🎮 Lenzy Coin O'ynash",
    web_app: { url: GAME_URL }
  }
}).catch((err) => console.warn('Menu Button sozlash:', err.message));

// Botning rasmiy buyruqlar ro'yxatini (Commands Menu) o'rnatish
bot.setMyCommands([
  { command: 'start', description: "🚀 O'yinni boshlash (Play Lenzy Coin)" },
  { command: 'play', description: "🎮 O'yinni ochish (Web App)" },
  { command: 'check', description: "✅ Kanal va chat obunasini tekshirish" },
  { command: 'channel', description: "📢 Rasmiy kanal (@lenzy_coin)" },
  { command: 'community', description: "💬 O'yinchilar guruhi (@lenzy_coin_chat)" },
  { command: 'ref', description: "👥 Do'stlarni taklif qilish va bonuslar" },
  { command: 'bonus', description: "🎁 Kundalik bonuslar va airdrop" },
  { command: 'help', description: "ℹ️ O'yin haqida qo'llanma" }
]).catch((err) => console.warn('Bot buyruqlari sozlash:', err.message));

// ==============================================================================
// 1. /start BUYRUG'I
// ==============================================================================
bot.onText(/^\/start(?:@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const rawFirstName = msg.from.first_name || "Do'st";
  const safeName = escapeHtml(rawFirstName);
  const rawParam = match && match[1] ? match[1].trim() : null;

  const botUsername = cachedBotUsername || 'lenzycoin_bot';

  // 1-HOLAT: Agar do'st taklif havolasi orqali kirgan bo'lsa (/start ref_12345 yoki /start 12345)
  const cleanRef = rawParam ? rawParam.replace(/^ref_/, '').trim() : '';
  if (cleanRef && cleanRef !== String(userId) && cleanRef !== 'tg_' + userId) {
    const refCode = cleanRef;
    const refGameUrl = `${GAME_URL}?ref=${encodeURIComponent(refCode)}`;
    const myRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
    const shareText = `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n${myRefLink}`;

    const welcomeRefText = 
      `👋 <b>Assalomu alaykum, ${safeName}!</b>\n\n` +
      `🎁 <b>Siz do'stingiz taklifi orqali keldingiz!</b>\n\n` +
      `🪙 <b>Lenzy Coin</b> — Telegramdagi eng qiziqarli va daromadli Web3 kliker o'yini!\n\n` +
      `⚡ <b>Siz uchun maxsus sovg'a:</b>\n` +
      `Quyidagi <b>"O'yinni boshlash"</b> tugmasini bosib o'yinga kiring va <b>+10,000 tanga</b> start bonusiga ega bo'ling! Taklif qilgan do'stingizga ham <b>+10,000 tanga</b> beriladi.\n\n` +
      `📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n` +
      `<i>(Eng so'nggi yangiliklar va airdrop e'lonlari kanalimizda)</i>\n\n` +
      `👇 <b>O'yinni boshlash uchun bosing:</b>`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🎮 O'yinni boshlash (+10,000 tanga) 🎁",
            web_app: { url: refGameUrl }
          }
        ],
        [
          {
            text: "📢 Rasmiy Kanal (@lenzy_coin)",
            url: "https://t.me/lenzy_coin"
          }
        ],
        [
          {
            text: "👥 Do'stlarni taklif qilish",
            url: `https://t.me/share/url?url=${encodeURIComponent(myRefLink)}&text=${encodeURIComponent(shareText)}`
          },
          {
            text: "💬 Hamjamiyat Chati",
            url: "https://t.me/lenzy_coin_chat"
          }
        ]
      ]
    };

    // Taklif qilgan do'stiga xabar berish (notification)
    try {
      const inviterId = refCode.replace(/^tg_/, '').trim();
      if (/^\d+$/.test(inviterId) && inviterId !== String(userId)) {
        bot.sendMessage(
          inviterId,
          `🎉 <b>Yangi do'st taklif qilindi!</b>\n\n` +
          `👤 <b>${safeName}</b> sizning do'stlik taklif havolangiz orqali botga kirdi!\n` +
          `🪙 U o'yinga kirib start tugmasini bosgach, balansingizga <b>+10,000 tanga</b> qo'shiladi!`,
          { parse_mode: 'HTML' }
        ).catch(() => {});
      }
    } catch (e) {
      // Ignore notification error
    }

    try {
      await bot.sendPhoto(chatId, BANNER_URL, {
        caption: welcomeRefText,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } catch (err) {
      await bot.sendMessage(chatId, welcomeRefText, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }).catch((e) => console.error('send message error:', e.message));
    }
    return;
  }

  // 2-HOLAT: Oddiy /start bosilganda
  const directGameUrl = `${GAME_URL}?ref=tg_${userId}`;
  const myRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
  const shareText = `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n${myRefLink}`;

  const welcomeText = 
    `👋 <b>Assalomu alaykum, ${safeName}!</b>\n\n` +
    `🪙 <b>Lenzy Coin</b> — Telegramdagi yangi avlod kripto-kliker va Web3 mini-o'yiniga xush kelibsiz!\n\n` +
    `Bu yerda siz o'yin o'ynab, o'z virtual tangalaringizni ko'paytirishingiz va jamoangiz bilan yetakchilikka erishishingiz mumkin.\n\n` +
    `⚡ <b>O'yinda sizni nimalar kutmoqda:</b>\n` +
    `• 👆 <b>Tap qiling:</b> Ekranga bosib oltin tangalar to'plang\n` +
    `• 🚀 <b>Boostlar:</b> Quvvat va maksimal energiyani oshiring\n` +
    `• 🤖 <b>Avto-bot:</b> Siz oflayn bo'lganingizda ham passiv daromad oling\n` +
    `• 🏆 <b>Ligalar:</b> Bronzadan tortib afsonaviy Lenzy Lord darajasigacha ko'tariling\n` +
    `• 🎁 <b>Kunlik bonuslar:</b> Har kuni kirib qimmatbaho sovg'alarga ega bo'ling\n` +
    `• 👥 <b>Do'stlar:</b> Har bir taklif uchun <b>+10,000 tanga</b> va 10% doimiy komissiya!\n\n` +
    `📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n` +
    `<i>(Barcha yangiliklar, listing sanalari va sovg'alar kanalimizda e'lon qilinadi)</i>\n\n` +
    `👇 <b>O'yinni boshlash uchun quyidagi tugmani bosing:</b>`;

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
          text: "📢 Rasmiy Kanal (@lenzy_coin)",
          url: "https://t.me/lenzy_coin"
        }
      ],
      [
        {
          text: "👥 Do'stlarni taklif qilish",
          url: `https://t.me/share/url?url=${encodeURIComponent(myRefLink)}&text=${encodeURIComponent(shareText)}`
        },
        {
          text: "💬 Hamjamiyat Chati",
          url: "https://t.me/lenzy_coin_chat"
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
    }).catch((e) => console.error('send message error:', e.message));
  }
});

// ==============================================================================
// 2. /play BUYRUG'I - O'yinni to'g'ridan-to'g'ri boshlash
// ==============================================================================
bot.onText(/^\/play(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const directGameUrl = `${GAME_URL}?ref=tg_${userId}`;

  const playText = 
    `🎮 <b>Lenzy Coin O'yini</b>\n\n` +
    `O'yinga kirish va tangalarni yig'ish uchun quyidagi tugmani bosing 👇`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 O'yinni boshlash (Play)",
          web_app: { url: directGameUrl }
        }
      ],
      [
        {
          text: "📢 Rasmiy Kanal (@lenzy_coin)",
          url: "https://t.me/lenzy_coin"
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, playText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 3. /channel BUYRUG'I - Rasmiy kanal haqida
// ==============================================================================
bot.onText(/^\/channel(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const channelText = 
    `📢 <b>Lenzy Coin Rasmiy Telegram Kanali:</b> @lenzy_coin\n\n` +
    `Bizning rasmiy kanalimizga a'zo bo'ling va eng muhim imkoniyatlarni o'tkazib yubormang:\n\n` +
    `• 🎁 Katta airdrop va sovg'alar tanlovlari\n` +
    `• 🚀 Yangi xususiyatlar va yangilanishlar xabarlari\n` +
    `• 💎 Eksklyuziv bonus promokodlari\n` +
    `• 📈 Token taqsimoti va rivojlanish rejasi (Roadmap)\n\n` +
    `👇 <b>Kanalga a'zo bo'lish uchun bosing:</b>`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "📢 Kanalga a'zo bo'lish (@lenzy_coin)",
          url: "https://t.me/lenzy_coin"
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, channelText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 4. /community BUYRUG'I - O'yinchilar guruhi
// ==============================================================================
bot.onText(/^\/community(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const commText = 
    `💬 <b>Lenzy Coin Hamjamiyat Chati:</b> @lenzy_coin_chat\n\n` +
    `Boshqa o'yinchilar bilan suhbatlashing, strategiyalarni muhokama qiling va jamoangizni shakllantiring!`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "💬 Chatga qo'shilish (@lenzy_coin_chat)",
          url: "https://t.me/lenzy_coin_chat"
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, commText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 5. /ref BUYRUG'I - Taklif havolasi va bonuslar
// ==============================================================================
bot.onText(/^\/ref(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const botUsername = cachedBotUsername || 'lenzycoin_bot';

  const myRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
  const shareText = `🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n${myRefLink}`;

  const refText = 
    `👥 <b>Sizning shaxsiy do'stlik havolangiz:</b>\n\n` +
    `🔗 <code>${myRefLink}</code>\n\n` +
    `🎁 <b>Har bir taklif qilingan do'st uchun sizga:</b>\n` +
    `• <b>+10,000 tanga</b> bir martalik bonus\n` +
    `• Do'stingiz ishlab topgan tangalaridan <b>10% doimiy komissiya!</b>\n` +
    `• Do'stingiz ham kirishi bilanoq <b>+10,000 tanga</b> oladi.\n\n` +
    `Do'stlaringizga yuboring va daromadingizni oshiring!`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 Do'stlarga yuborish",
          url: `https://t.me/share/url?url=${encodeURIComponent(myRefLink)}&text=${encodeURIComponent(shareText)}`
        }
      ],
      [
        {
          text: "🎮 O'yinga qaytish",
          web_app: { url: `${GAME_URL}?ref=tg_${userId}` }
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, refText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 6. /bonus BUYRUG'I - Kunlik bonuslar va airdrop ma'lumoti
// ==============================================================================
bot.onText(/^\/bonus(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const bonusText = 
    `🎁 <b>Lenzy Coin Mukofotlari va Bonuslar:</b>\n\n` +
    `1. 📅 <b>Kundalik Bonus:</b> O'yinga har kuni kirib, ko'payib boruvchi tangalarni oling (1-kundan 7-kungacha).\n` +
    `2. 📢 <b>Kanalga a'zo bo'lish:</b> +25,000 tanga (@lenzy_coin)\n` +
    `3. 💬 <b>Chatga qo'shilish:</b> +15,000 tanga (@lenzy_coin_chat)\n` +
    `4. 👥 <b>Do'st taklifi:</b> Har bir do'st uchun +10,000 tanga + 10% doimiy keshbek!\n\n` +
    `Mukofotlarni olish uchun o'yin ichidagi "Vazifalar" (Tasks) bo'limiga o'ting.`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎁 Bonuslarni olish (O'yinga kirish)",
          web_app: { url: `${GAME_URL}?ref=tg_${userId}` }
        }
      ],
      [
        {
          text: "✅ Obunani tekshirish",
          callback_data: "check_subs"
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, bonusText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 7. /help BUYRUG'I - O'yin qo'llanmasi
// ==============================================================================
bot.onText(/^\/help(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const helpText = 
    `ℹ️ <b>Lenzy Coin O'yini Bo'yicha Qo'llanma:</b>\n\n` +
    `1. 👆 <b>Tap qilib ishlash:</b>\n` +
    `Ekranni bosganingizda hisobingizga tangalar tushadi. Har bir bosish energiyani sarflaydi.\n\n` +
    `2. ⚡ <b>Boostlar (Kuchaytirgichlar):</b>\n` +
    `• <b>Multitap:</b> Bir bosishda ko'proq tanga olish\n` +
    `• <b>Energy Limit:</b> Maksimal energiya sig'imini oshirish\n` +
    `• <b>Recharging Speed:</b> Energiya tiklanish tezligini oshirish\n\n` +
    `3. 🤖 <b>Avto-bot (Offline daromad):</b>\n` +
    `O'yindan chiqqan bo'lsangiz ham avto-bot 3 soatgacha siz uchun tanga yig'ib beradi.\n\n` +
    `4. 🏆 <b>Ligalar:</b>\n` +
    `Ko'proq tanga to'plab yuqori ligalarga ko'tariling va maxsus mukofotlarni qo'lga kiriting.\n\n` +
    `📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n` +
    `💬 <b>Muloqot Guruhi:</b> @lenzy_coin_chat`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎮 O'yinni boshlash",
          web_app: { url: `${GAME_URL}?ref=tg_${userId}` }
        }
      ],
      [
        {
          text: "📢 Rasmiy Kanal (@lenzy_coin)",
          url: "https://t.me/lenzy_coin"
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, helpText, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch((e) => console.error(e.message));
});

// ==============================================================================
// 8. /check BUYRUG'I - Kanal va Chat obunasini tekshirish
// ==============================================================================
async function checkUserSubscription(chatUsername, userId) {
  try {
    const member = await bot.getChatMember(chatUsername, userId);
    // status: 'creator', 'administrator', 'member', 'restricted' (agar guruhda bo'lsa)
    const validStatuses = ['creator', 'administrator', 'member', 'restricted'];
    return validStatuses.includes(member.status);
  } catch (err) {
    return false;
  }
}

bot.onText(/^\/check(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const isChannelMember = await checkUserSubscription('@lenzy_coin', userId);
  const isChatMember = await checkUserSubscription('@lenzy_coin_chat', userId);

  let statusText = `🔍 <b>Obunalarni tekshirish natijasi:</b>\n\n`;
  statusText += `📢 <b>Rasmiy kanal (@lenzy_coin):</b> ${isChannelMember ? '✅ A\'zo bo\'lgansiz (+25,000 tanga)' : '❌ A\'zo emassiz'}\n`;
  statusText += `💬 <b>Rasmiy guruh (@lenzy_coin_chat):</b> ${isChatMember ? '✅ A\'zo bo\'lgansiz (+15,000 tanga)' : '❌ A\'zo emassiz'}\n\n`;

  if (isChannelMember && isChatMember) {
    statusText += `🎉 <b>Tabriklaymiz!</b> Siz ikkala rasmiy resursga ham a'zo bo'lgansiz!\nO'yinga kirib <b>+40,000 tanga</b> umumiy mukofotingizni oling:`;
  } else {
    statusText += `💡 <i>Bonuslarni to'liq olish uchun kanal va guruhga a'zo bo'ling va qayta tekshiring!</i>`;
  }

  const buttons = [];
  if (!isChannelMember) {
    buttons.push([{ text: "📢 Kanalga a'zo bo'lish (@lenzy_coin)", url: "https://t.me/lenzy_coin" }]);
  }
  if (!isChatMember) {
    buttons.push([{ text: "💬 Guruhga qo'shilish (@lenzy_coin_chat)", url: "https://t.me/lenzy_coin_chat" }]);
  }
  buttons.push([
    { text: "🔄 Qayta tekshirish", callback_data: "check_subs" },
    { text: "🎮 O'yinga kirish", web_app: { url: `${GAME_URL}?ref=tg_${userId}` } }
  ]);

  await bot.sendMessage(chatId, statusText, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: buttons }
  }).catch((e) => console.error(e.message));
});

// Callback query handler for "🔄 Qayta tekshirish"
bot.on('callback_query', async (query) => {
  try {
    if (query.data === 'check_subs') {
      const userId = query.from.id;
      const chatId = query.message ? query.message.chat.id : userId;

      const isChannelMember = await checkUserSubscription('@lenzy_coin', userId);
      const isChatMember = await checkUserSubscription('@lenzy_coin_chat', userId);

      let statusText = `🔍 <b>Obunalarni tekshirish natijasi:</b>\n\n`;
      statusText += `📢 <b>Rasmiy kanal (@lenzy_coin):</b> ${isChannelMember ? '✅ A\'zo bo\'lgansiz (+25,000 tanga)' : '❌ A\'zo emassiz'}\n`;
      statusText += `💬 <b>Rasmiy guruh (@lenzy_coin_chat):</b> ${isChatMember ? '✅ A\'zo bo\'lgansiz (+15,000 tanga)' : '❌ A\'zo emassiz'}\n\n`;

      if (isChannelMember && isChatMember) {
        statusText += `🎉 <b>Tabriklaymiz!</b> Siz ikkala rasmiy resursga ham a'zo bo'lgansiz!\nO'yinga kirib <b>+40,000 tanga</b> umumiy mukofotingizni oling:`;
      } else {
        statusText += `💡 <i>Bonuslarni to'liq olish uchun kanal va guruhga a'zo bo'ling va qayta tekshiring!</i>`;
      }

      const buttons = [];
      if (!isChannelMember) {
        buttons.push([{ text: "📢 Kanalga a'zo bo'lish (@lenzy_coin)", url: "https://t.me/lenzy_coin" }]);
      }
      if (!isChatMember) {
        buttons.push([{ text: "💬 Guruhga qo'shilish (@lenzy_coin_chat)", url: "https://t.me/lenzy_coin_chat" }]);
      }
      buttons.push([
        { text: "🔄 Qayta tekshirish", callback_data: "check_subs" },
        { text: "🎮 O'yinga kirish", web_app: { url: `${GAME_URL}?ref=tg_${userId}` } }
      ]);

      if (query.message) {
        await bot.editMessageText(statusText, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons }
        }).catch(() => {});
      }
      await bot.answerCallbackQuery(query.id, { text: "Tekshirildi!" }).catch(() => {});
    }
  } catch (err) {
    bot.answerCallbackQuery(query.id).catch(() => {});
  }
});

// Noma'lum buyruqlar va xabarlar uchun aqlli yo'naltiruvchi
bot.on('message', async (msg) => {
  // Faqat oddiy matnli xabarlar va buyruq bo'lmaganlari uchun
  if (!msg.text || msg.text.startsWith('/')) return;

  // Agar shaxsiy chatda biron matn yozsa, o'yinga kirish tugmasini ko'rsatish
  if (msg.chat.type === 'private') {
    const userId = msg.from.id;
    const directGameUrl = `${GAME_URL}?ref=tg_${userId}`;
    await bot.sendMessage(
      msg.chat.id,
      `🪙 <b>Lenzy Coin</b> o'yiniga xush kelibsiz!\nO'ynash uchun pastdagi tugmani bosing yoki /start buyrug'ini yuboring.`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 O'yinni boshlash (Play)", web_app: { url: directGameUrl } }]
          ]
        }
      }
    ).catch(() => {});
  }
});

console.log('🚀 Lenzy Coin Telegram Boti (@lenzycoin_bot) Node.js da muvaffaqiyatli ishga tushdi...');
