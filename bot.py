import os
import sys
import logging
from telebot import TeleBot, types

# ==============================================================================
# 🎮 LENZY COIN - TELEGRAM BOT SERVER
# ==============================================================================
# O'rnatish: pip install pyTelegramBotAPI
# Ishga tushirish: python bot.py
# ==============================================================================

# 1. BOT TOKENINGIZNI KIRITING (@BotFather bergan token):
BOT_TOKEN = os.environ.get("BOT_TOKEN", "BOT_TOKENINGIZNI_SHU_YERGA_YOZING")

# 2. O'YININGIZ HAVOLASI (Cloud Run / Vercel / Netlify havolasi):
GAME_URL = os.environ.get(
    "GAME_URL", 
    "https://ais-pre-owanp3lrdlklvx2gqvtafo-787186879028.asia-southeast1.run.app"
)

# 3. RASM YOKI BANNER HAVOLASI:
BANNER_URL = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

if BOT_TOKEN == "BOT_TOKENINGIZNI_SHU_YERGA_YOZING":
    print("\n⚠️ DIQQAT: BOT_TOKEN o'zgartirilmagan! @BotFather dan olgan tokeningizni bot.py fayliga qo'ying.\n")

bot = TeleBot(BOT_TOKEN, parse_mode="HTML")

# Pastki doimiy menyu tugmasini (Menu Button) sozlash
try:
    bot.set_chat_menu_button(
        menu_button=types.MenuButtonWebApp(
            type="web_app",
            text="🎮 Lenzy Coin O'ynash",
            web_app=types.WebAppInfo(url=GAME_URL)
        )
    )
    print("✅ Telegram chat pastki menyusi (Menu Button) muvaffaqiyatli ulandi!")
except Exception as e:
    logger.warning(f"Menu Button sozlashda ogohlantirish: {e}")


@bot.message_handler(commands=['start'])
def handle_start(message: types.Message):
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Do'st"
    username = f"@{message.from_user.username}" if message.from_user.username else first_name

    # /start buyrug'i bilan kelgan referal kodni ajratib olish (masalan: /start ref_tg_12345)
    command_args = message.text.split()
    ref_code = None
    if len(command_args) > 1:
        raw_ref = command_args[1].strip()
        ref_code = raw_ref.replace("ref_", "")

    # ==============================================================================
    # 1-HOLAT: Foydalanuvchi do'stining taklif havolasi (Referral Link) orqali kirdi
    # ==============================================================================
    if ref_code:
        # Referal parametri bilan ochiladigan o'yin havolasi
        ref_game_url = f"{GAME_URL}?ref={ref_code}"

        welcome_ref_text = (
            f"👋 <b>Assalomu alaykum, {first_name}!</b>\n\n"
            f"🎁 <b>Siz do'stingiz taklifi bilan keldingiz!</b>\n\n"
            f"🪙 <b>Lenzy Coin</b> — bu eng tez rivojlanayotgan Telegram kliker o'yini.\n\n"
            f"⚡ <b>Siz uchun maxsus sovg'a:</b>\n"
            f"Quyidagi tugmani bosib o'yinga kiring va <b>+10,000 tanga</b> start bonusiga ega bo'ling! Taklif qilgan do'stingizga ham <b>+10,000 tanga</b> beriladi.\n\n"
            f"👇 <i>O'yinni boshlash uchun bosing:</i>"
        )

        keyboard = types.InlineKeyboardMarkup(row_width=1)
        
        # 1-TUGMA: Referal bilan to'g'ridan-to'g'ri o'yinni ochish (Mini App)
        play_btn = types.InlineKeyboardButton(
            text="🎮 O'yinga kirish va +10,000 tanga olish 🎁",
            web_app=types.WebAppInfo(url=ref_game_url)
        )
        
        # 2-TUGMA: Do'stlarga ulashish tugmasi
        my_ref_link = f"https://t.me/{bot.get_me().username}?start=ref_{user_id}"
        share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"
        share_btn = types.InlineKeyboardButton(
            text="👥 Do'stlarni taklif qilish",
            url=f"https://t.me/share/url?url={my_ref_link}&text={share_text}"
        )

        keyboard.add(play_btn, share_btn)

        try:
            bot.send_photo(
                chat_id=message.chat.id,
                photo=BANNER_URL,
                caption=welcome_ref_text,
                reply_markup=keyboard
            )
        except Exception:
            bot.send_message(
                chat_id=message.chat.id,
                text=welcome_ref_text,
                reply_markup=keyboard
            )
        return

    # ==============================================================================
    # 2-HOLAT: Foydalanuvchi oddiy /start bosdi (hech qanday referalsiz)
    # ==============================================================================
    direct_game_url = f"{GAME_URL}?ref=tg_{user_id}"
    
    welcome_text = (
        f"👋 <b>Assalomu alaykum, {first_name}!</b>\n\n"
        f"🪙 <b>Lenzy Coin</b> rasmiy o'yiniga xush kelibsiz!\n\n"
        f"⚡ <b>O'yinda sizni nimalar kutmoqda:</b>\n"
        f"• 👆 Ekranga bosib tangalar to'plash\n"
        f"• ⚡ Energiyani oshirish va Boostlar sotib olish\n"
        f"• 🤖 Avto-bot (Offline daromad) faollashtirish\n"
        f"• 🏆 Kunlik mukofotlar va Vazifalarni bajarish\n"
        f"• 👥 Har bir taklif qilingan do'st uchun <b>+10,000 tanga</b> va 10% komissiya\n\n"
        f"👇 <i>O'yinni boshlash uchun quyidagi tugmani bosing:</i>"
    )

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    
    # Asosiy o'yin tugmasi (Telegram Web App)
    play_btn = types.InlineKeyboardButton(
        text="🎮 O'yinni boshlash (Play) 🚀",
        web_app=types.WebAppInfo(url=direct_game_url)
    )

    # Do'stlarni taklif qilish tugmasi
    bot_info = bot.get_me()
    my_ref_link = f"https://t.me/{bot_info.username}?start=ref_{user_id}"
    share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"
    share_btn = types.InlineKeyboardButton(
        text="👥 Do'stlarni taklif qilish",
        url=f"https://t.me/share/url?url={my_ref_link}&text={share_text}"
    )

    keyboard.add(play_btn, share_btn)

    try:
        bot.send_photo(
            chat_id=message.chat.id,
            photo=BANNER_URL,
            caption=welcome_text,
            reply_markup=keyboard
        )
    except Exception:
        bot.send_message(
            chat_id=message.chat.id,
            text=welcome_text,
            reply_markup=keyboard
        )


@bot.message_handler(commands=['help'])
def handle_help(message: types.Message):
    help_text = (
        "ℹ️ <b>Lenzy Coin Bot yordam:</b>\n\n"
        "1. /start — O'yinni ochish va menyuni ko'rish\n"
        "2. Do'stingizga taklif havolangizni yuboring va har bir do'st uchun <b>+10,000 tanga</b> oling!\n"
        "3. O'yin to'g'ridan-to'g'ri Telegram ichida ochiladi."
    )
    bot.reply_to(message, help_text)


if __name__ == "__main__":
    print("🚀 Lenzy Coin Telegram Boti ishga tushdi...")
    bot.infinity_polling(skip_pending=True)
