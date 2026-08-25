import os
import sys
import logging
import telebot
from telebot import types

# ==============================================================================
# 🎮 LENZY COIN - TELEGRAM BOT SERVER (Python)
# Bot: @lenzycoin_bot
# ==============================================================================
# O'rnatish: pip install pyTelegramBotAPI
# Ishga tushirish: python bot.py
# ==============================================================================

BOT_TOKEN = os.environ.get("BOT_TOKEN", "8989659664:AAFJbMaWPAFWzdQMdsXdNppUXMrKBEBEgjY")
GAME_URL = os.environ.get(
    "GAME_URL", 
    "https://lenzycoin.vercel.app"
)
BANNER_URL = "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

bot = telebot.TeleBot(BOT_TOKEN, parse_mode="HTML")

# Pastki doimiy WebApp menyu tugmasini (Menu Button) ulash
try:
    bot.set_chat_menu_button(
        menu_button=types.MenuButtonWebApp(
            type="web_app",
            text="🎮 Lenzy Coin O'ynash",
            web_app=types.WebAppInfo(url=GAME_URL)
        )
    )
    print("✅ Telegram chat pastki menyusi (Menu Button) ulandi!")
except Exception as e:
    logger.warning(f"Menu Button sozlash: {e}")


@bot.message_handler(commands=['start'])
def handle_start(message: types.Message):
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Do'st"
    
    # Buyruq bilan kelgan referal kodni tekshirish (/start ref_12345 yoki /start 12345)
    command_args = message.text.split()
    ref_code = None
    if len(command_args) > 1:
        raw_ref = command_args[1].strip()
        ref_code = raw_ref.replace("ref_", "")

    bot_username = "lenzycoin_bot"
    try:
        me = bot.get_me()
        bot_username = me.username or "lenzycoin_bot"
    except Exception:
        pass

    # ==============================================================================
    # 1-HOLAT: Foydalanuvchi do'stining taklif havolasi (Referral Link) orqali kirdi
    # ==============================================================================
    if ref_code and str(ref_code) != str(user_id) and f"tg_{user_id}" != str(ref_code):
        ref_game_url = f"{GAME_URL}?ref={ref_code}"
        my_ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
        share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"

        welcome_ref_text = (
            f"👋 <b>Assalomu alaykum, {first_name}!</b>\n\n"
            f"🎁 <b>Siz do'stingiz taklifi orqali keldingiz!</b>\n\n"
            f"🪙 <b>Lenzy Coin</b> — Telegramdagi eng qiziqarli va tezkor kliker o'yini.\n\n"
            f"⚡ <b>Siz uchun maxsus sovg'a:</b>\n"
            f"Quyidagi tugmani bosib o'yinga kiring va <b>+10,000 tanga</b> start bonusiga ega bo'ling! Sizni taklif qilgan do'stingizga ham <b>+10,000 tanga</b> taqdim etiladi.\n\n"
            f"👇 <i>O'yinni boshlash uchun quyidagi tugmani bosing:</i>"
        )

        keyboard = types.InlineKeyboardMarkup(row_width=1)
        
        # 1-TUGMA: Referal bilan to'g'ridan-to'g'ri o'yinni ochish
        play_btn = types.InlineKeyboardButton(
            text="🎮 O'yinga kirish va +10,000 tanga olish 🎁",
            web_app=types.WebAppInfo(url=ref_game_url)
        )
        
        # 2-TUGMA: O'z do'stlariga ulashish
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
    my_ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
    share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"

    welcome_text = (
        f"👋 <b>Assalomu alaykum, {first_name}!</b>\n\n"
        f"🪙 <b>Lenzy Coin</b> rasmiy o'yiniga xush kelibsiz!\n\n"
        f"⚡ <b>O'yinda sizni nimalar kutmoqda:</b>\n"
        f"• 👆 Ekranga bosib tangalar to'plash\n"
        f"• ⚡ Energiyani oshirish va Boostlar sotib olish\n"
        f"• 🤖 Avto-bot (Offline daromad) faollashtirish\n"
        f"• 🏆 Kunlik mukofotlar va Vazifalarni bajarish\n"
        f"• 👥 Har bir taklif qilingan do'st uchun <b>+10,000 tanga</b> va 10% doimiy komissiya!\n\n"
        f"👇 <i>O'yinni boshlash uchun quyidagi tugmani bosing:</i>"
    )

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    
    # Asosiy o'yin tugmasi (Telegram Web App)
    play_btn = types.InlineKeyboardButton(
        text="🎮 O'yinni boshlash (Play) 🚀",
        web_app=types.WebAppInfo(url=direct_game_url)
    )

    # Do'stlarni taklif qilish tugmasi
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
    print(f"🚀 Lenzy Coin Telegram Boti (@lenzycoin_bot) muvaffaqiyatli ishga tushdi...")
    bot.infinity_polling(skip_pending=True)
