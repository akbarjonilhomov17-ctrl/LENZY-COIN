import os
import sys
import logging
import html
import telebot
from telebot import types

# ==============================================================================
# 🎮 LENZY COIN - TELEGRAM BOT SERVER (Python)
# Bot: @lenzycoin_bot
# ==============================================================================
# O'rnatish: pip install pyTelegramBotAPI python-dotenv
# Ishga tushirish: python bot.py
# ==============================================================================

# Load .env file if present
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    except Exception:
        pass

# BOT TOKEN (Xavfsiz: faqat .env yoki tizim muhitidan olinadi)
BOT_TOKEN = os.environ.get("BOT_TOKEN")

if not BOT_TOKEN or "SIZNING_BOT_TOKENINGIZ" in BOT_TOKEN:
    sys.exit("❌ XAVFSIZLIK XATOSI: BOT_TOKEN topilmadi! Tokenni .env faylida saqlang.")

GAME_URL = os.environ.get("GAME_URL") or os.environ.get("APP_URL") or "https://lenzycoin.vercel.app"
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
    # Botning rasmiy buyruqlar ro'yxatini (Bot Commands) o'rnatish
    bot.set_my_commands([
        types.BotCommand("start", "🚀 O'yinni boshlash (Play Lenzy Coin)"),
        types.BotCommand("play", "🎮 O'yinni ochish (Web App)"),
        types.BotCommand("check", "✅ Kanal va chat obunasini tekshirish"),
        types.BotCommand("channel", "📢 Rasmiy kanal (@lenzy_coin)"),
        types.BotCommand("community", "💬 O'yinchilar guruhi (@lenzy_coin_chat)"),
        types.BotCommand("ref", "👥 Do'stlarni taklif qilish va bonuslar"),
        types.BotCommand("bonus", "🎁 Kundalik bonuslar va airdrop"),
        types.BotCommand("help", "ℹ️ O'yin haqida qo'llanma")
    ])
    logger.info("✅ Telegram chat pastki menyusi va buyruqlari muvaffaqiyatli ulandi!")
except Exception as e:
    logger.warning(f"Menu Button / Commands sozlash: {e}")


# ==============================================================================
# 1. /start BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['start'])
def handle_start(message: types.Message):
    user_id = message.from_user.id
    raw_name = message.from_user.first_name or "Do'st"
    safe_name = html.escape(raw_name)
    
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

    # 1-HOLAT: Do'st taklif havolasi orqali kirganda
    if ref_code and str(ref_code) != str(user_id) and f"tg_{user_id}" != str(ref_code):
        ref_game_url = f"{GAME_URL}?ref={ref_code}"
        my_ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
        share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"

        welcome_ref_text = (
            f"👋 <b>Assalomu alaykum, {safe_name}!</b>\n\n"
            f"🎁 <b>Siz do'stingiz taklifi orqali keldingiz!</b>\n\n"
            f"🪙 <b>Lenzy Coin</b> — Telegramdagi eng qiziqarli va daromadli Web3 kliker o'yini!\n\n"
            f"⚡ <b>Siz uchun maxsus sovg'a:</b>\n"
            f"Quyidagi <b>\"O'yinni boshlash\"</b> tugmasini bosib o'yinga kiring va <b>+10,000 tanga</b> start bonusiga ega bo'ling! Taklif qilgan do'stingizga ham <b>+10,000 tanga</b> beriladi.\n\n"
            f"📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n"
            f"<i>(Barcha yangiliklar va sovg'alar kanalimizda)</i>\n\n"
            f"👇 <b>O'yinni boshlash uchun quyidagi tugmani bosing:</b>"
        )

        keyboard = types.InlineKeyboardMarkup(row_width=1)
        play_btn = types.InlineKeyboardButton(
            text="🎮 O'yinni boshlash (+10,000 tanga) 🎁",
            web_app=types.WebAppInfo(url=ref_game_url)
        )
        channel_btn = types.InlineKeyboardButton(
            text="📢 Rasmiy Kanal (@lenzy_coin)",
            url="https://t.me/lenzy_coin"
        )
        share_btn = types.InlineKeyboardButton(
            text="👥 Do'stlarni taklif qilish",
            url=f"https://t.me/share/url?url={my_ref_link}&text={share_text}"
        )
        chat_btn = types.InlineKeyboardButton(
            text="💬 Hamjamiyat Chati",
            url="https://t.me/lenzy_coin_chat"
        )

        keyboard.add(play_btn, channel_btn)
        keyboard.row(share_btn, chat_btn)

        # Taklif qilgan do'stiga bildirishnoma
        try:
            inviter_id_str = str(ref_code).replace("tg_", "").strip()
            if inviter_id_str.isdigit() and int(inviter_id_str) != user_id:
                bot.send_message(
                    chat_id=int(inviter_id_str),
                    text=(
                        f"🎉 <b>Yangi do'st taklif qilindi!</b>\n\n"
                        f"👤 <b>{safe_name}</b> sizning do'stlik taklif havolangiz orqali botga kirdi!\n"
                        f"🪙 U o'yinga kirib start tugmasini bosgach, balansingizga <b>+10,000 tanga</b> qo'shiladi!"
                    )
                )
        except Exception as e:
            logger.info(f"Inviter notification skip: {e}")

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

    # 2-HOLAT: Oddiy /start bosilganda
    direct_game_url = f"{GAME_URL}?ref=tg_{user_id}"
    my_ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
    share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"

    welcome_text = (
        f"👋 <b>Assalomu alaykum, {safe_name}!</b>\n\n"
        f"🪙 <b>Lenzy Coin</b> — Telegramdagi yangi avlod kripto-kliker va Web3 mini-o'yiniga xush kelibsiz!\n\n"
        f"Bu yerda siz o'yin o'ynab, o'z virtual tangalaringizni ko'paytirishingiz va jamoangiz bilan yetakchilikka erishishingiz mumkin.\n\n"
        f"⚡ <b>O'yinda sizni nimalar kutmoqda:</b>\n"
        f"• 👆 <b>Tap qiling:</b> Ekranga bosib oltin tangalar to'plang\n"
        f"• 🚀 <b>Boostlar:</b> Quvvat va maksimal energiyani oshiring\n"
        f"• 🤖 <b>Avto-bot:</b> Siz oflayn bo'lganingizda ham passiv daromad oling\n"
        f"• 🏆 <b>Ligalar:</b> Bronzadan tortib afsonaviy Lenzy Lord darajasigacha ko'tariling\n"
        f"• 🎁 <b>Kunlik bonuslar:</b> Har kuni kirib qimmatbaho sovg'alarga ega bo'ling\n"
        f"• 👥 <b>Do'stlar:</b> Har bir taklif uchun <b>+10,000 tanga</b> va 10% doimiy komissiya!\n\n"
        f"📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n"
        f"<i>(Barcha yangiliklar, listing sanalari va sovg'alar kanalimizda e'lon qilinadi)</i>\n\n"
        f"👇 <b>O'yinni boshlash uchun quyidagi tugmani bosing:</b>"
    )

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    play_btn = types.InlineKeyboardButton(
        text="🎮 O'yinni boshlash (Play) 🚀",
        web_app=types.WebAppInfo(url=direct_game_url)
    )
    channel_btn = types.InlineKeyboardButton(
        text="📢 Rasmiy Kanal (@lenzy_coin)",
        url="https://t.me/lenzy_coin"
    )
    share_btn = types.InlineKeyboardButton(
        text="👥 Do'stlarni taklif qilish",
        url=f"https://t.me/share/url?url={my_ref_link}&text={share_text}"
    )
    chat_btn = types.InlineKeyboardButton(
        text="💬 Hamjamiyat Chati",
        url="https://t.me/lenzy_coin_chat"
    )

    keyboard.add(play_btn, channel_btn)
    keyboard.row(share_btn, chat_btn)

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


# ==============================================================================
# 2. /play BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['play'])
def handle_play(message: types.Message):
    user_id = message.from_user.id
    direct_game_url = f"{GAME_URL}?ref=tg_{user_id}"

    play_text = (
        "🎮 <b>Lenzy Coin O'yini</b>\n\n"
        "O'yinga kirish va tangalarni yig'ish uchun quyidagi tugmani bosing 👇"
    )
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("🚀 O'yinni boshlash (Play)", web_app=types.WebAppInfo(url=direct_game_url)),
        types.InlineKeyboardButton("📢 Rasmiy Kanal (@lenzy_coin)", url="https://t.me/lenzy_coin")
    )
    bot.send_message(message.chat.id, play_text, reply_markup=keyboard)


# ==============================================================================
# 3. /channel BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['channel'])
def handle_channel(message: types.Message):
    channel_text = (
        "📢 <b>Lenzy Coin Rasmiy Telegram Kanali:</b> @lenzy_coin\n\n"
        "Bizning rasmiy kanalimizga a'zo bo'ling va eng muhim imkoniyatlarni o'tkazib yubormang:\n\n"
        "• 🎁 Katta airdrop va sovg'alar tanlovlari\n"
        "• 🚀 Yangi xususiyatlar va yangilanishlar xabarlari\n"
        "• 💎 Eksklyuziv bonus promokodlari\n"
        "• 📈 Token taqsimoti va rivojlanish rejasi (Roadmap)\n\n"
        "👇 <b>Kanalga a'zo bo'lish uchun bosing:</b>"
    )
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("📢 Kanalga a'zo bo'lish (@lenzy_coin)", url="https://t.me/lenzy_coin"))
    bot.send_message(message.chat.id, channel_text, reply_markup=keyboard)


# ==============================================================================
# 4. /community BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['community'])
def handle_community(message: types.Message):
    comm_text = (
        "💬 <b>Lenzy Coin Hamjamiyat Chati:</b> @lenzy_coin_chat\n\n"
        "Boshqa o'yinchilar bilan suhbatlashing, strategiyalarni muhokama qiling va jamoangizni shakllantiring!"
    )
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton("💬 Chatga qo'shilish (@lenzy_coin_chat)", url="https://t.me/lenzy_coin_chat"))
    bot.send_message(message.chat.id, comm_text, reply_markup=keyboard)


# ==============================================================================
# 5. /ref BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['ref'])
def handle_ref(message: types.Message):
    user_id = message.from_user.id
    bot_username = "lenzycoin_bot"
    try:
        bot_username = bot.get_me().username or "lenzycoin_bot"
    except Exception:
        pass

    my_ref_link = f"https://t.me/{bot_username}?start=ref_{user_id}"
    share_text = f"🪙 Lenzy Coin o'yiniga qo'shiling va +10,000 tanga oling! 👇\n{my_ref_link}"

    ref_text = (
        f"👥 <b>Sizning shaxsiy do'stlik havolangiz:</b>\n\n"
        f"🔗 <code>{my_ref_link}</code>\n\n"
        f"🎁 <b>Har bir taklif qilingan do'st uchun sizga:</b>\n"
        f"• <b>+10,000 tanga</b> bir martalik bonus\n"
        f"• Do'stingiz ishlab topgan tangalaridan <b>10% doimiy komissiya!</b>\n"
        f"• Do'stingiz ham kirishi bilanoq <b>+10,000 tanga</b> oladi.\n\n"
        f"Do'stlaringizga yuboring va daromadingizni oshiring!"
    )
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("🚀 Do'stlarga yuborish", url=f"https://t.me/share/url?url={my_ref_link}&text={share_text}"),
        types.InlineKeyboardButton("🎮 O'yinga qaytish", web_app=types.WebAppInfo(url=f"{GAME_URL}?ref=tg_{user_id}"))
    )
    bot.send_message(message.chat.id, ref_text, reply_markup=keyboard)


# ==============================================================================
# 6. /bonus BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['bonus'])
def handle_bonus(message: types.Message):
    user_id = message.from_user.id
    bonus_text = (
        "🎁 <b>Lenzy Coin Mukofotlari va Bonuslar:</b>\n\n"
        "1. 📅 <b>Kundalik Bonus:</b> O'yinga har kuni kirib, ko'payib boruvchi tangalarni oling.\n"
        "2. 📢 <b>Kanalga a'zo bo'lish:</b> +25,000 tanga (@lenzy_coin)\n"
        "3. 💬 <b>Chatga qo'shilish:</b> +15,000 tanga (@lenzy_coin_chat)\n"
        "4. 👥 <b>Do'st taklifi:</b> Har bir do'st uchun +10,000 tanga + 10% doimiy keshbek!\n\n"
        "Mukofotlarni olish uchun o'yin ichidagi \"Vazifalar\" (Tasks) bo'limiga o'ting."
    )
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("🎁 Bonuslarni olish (O'yin)", web_app=types.WebAppInfo(url=f"{GAME_URL}?ref=tg_{user_id}")),
        types.InlineKeyboardButton("✅ Obunani tekshirish", callback_data="check_subs")
    )
    bot.send_message(message.chat.id, bonus_text, reply_markup=keyboard)


# ==============================================================================
# 7. /help BUYRUG'I
# ==============================================================================
@bot.message_handler(commands=['help'])
def handle_help(message: types.Message):
    user_id = message.from_user.id
    help_text = (
        "ℹ️ <b>Lenzy Coin O'yini Bo'yicha Qo'llanma:</b>\n\n"
        "1. 👆 <b>Tap qilib ishlash:</b>\n"
        "Ekranni bosganingizda hisobingizga tangalar tushadi. Har bir bosish energiyani sarflaydi.\n\n"
        "2. ⚡ <b>Boostlar (Kuchaytirgichlar):</b>\n"
        "• <b>Multitap:</b> Bir bosishda ko'proq tanga olish\n"
        "• <b>Energy Limit:</b> Maksimal energiya sig'imini oshirish\n"
        "• <b>Recharging Speed:</b> Energiya tiklanish tezligini oshirish\n\n"
        "3. 🤖 <b>Avto-bot (Offline daromad):</b>\n"
        "O'yindan chiqqan bo'lsangiz ham avto-bot 3 soatgacha siz uchun tanga yig'ib beradi.\n\n"
        "4. 🏆 <b>Ligalar:</b>\n"
        "Ko'proq tanga to'plab yuqori ligalarga ko'tariling va maxsus mukofotlarni qo'lga kiriting.\n\n"
        "📢 <b>Rasmiy Kanal:</b> @lenzy_coin\n"
        "💬 <b>Muloqot Guruhi:</b> @lenzy_coin_chat"
    )
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        types.InlineKeyboardButton("🎮 O'yinni boshlash", web_app=types.WebAppInfo(url=f"{GAME_URL}?ref=tg_{user_id}")),
        types.InlineKeyboardButton("📢 Rasmiy Kanal (@lenzy_coin)", url="https://t.me/lenzy_coin")
    )
    bot.send_message(message.chat.id, help_text, reply_markup=keyboard)


# ==============================================================================
# 8. /check BUYRUG'I - Kanal va Chat obunasini tekshirish
# ==============================================================================
def check_user_sub(chat_username: str, user_id: int) -> bool:
    try:
        member = bot.get_chat_member(chat_username, user_id)
        return member.status in ['creator', 'administrator', 'member', 'restricted']
    except Exception:
        return False

@bot.message_handler(commands=['check'])
def handle_check(message: types.Message):
    user_id = message.from_user.id
    is_channel = check_user_sub("@lenzy_coin", user_id)
    is_chat = check_user_sub("@lenzy_coin_chat", user_id)

    status_text = (
        f"🔍 <b>Obunalarni tekshirish natijasi:</b>\n\n"
        f"📢 <b>Rasmiy kanal (@lenzy_coin):</b> {'✅ A\\'zo bo\\'lgansiz (+25,000 tanga)' if is_channel else '❌ A\\'zo emassiz'}\n"
        f"💬 <b>Rasmiy guruh (@lenzy_coin_chat):</b> {'✅ A\\'zo bo\\'lgansiz (+15,000 tanga)' if is_chat else '❌ A\\'zo emassiz'}\n\n"
    )

    if is_channel and is_chat:
        status_text += "🎉 <b>Tabriklaymiz!</b> Siz ikkala rasmiy resursga ham a'zo bo'lgansiz!\nO'yinga kirib <b>+40,000 tanga</b> umumiy mukofotingizni oling:"
    else:
        status_text += "💡 <i>Bonuslarni to'liq olish uchun kanal va guruhga a'zo bo'ling va qayta tekshiring!</i>"

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    if not is_channel:
        keyboard.add(types.InlineKeyboardButton("📢 Kanalga a'zo bo'lish (@lenzy_coin)", url="https://t.me/lenzy_coin"))
    if not is_chat:
        keyboard.add(types.InlineKeyboardButton("💬 Guruhga qo'shilish (@lenzy_coin_chat)", url="https://t.me/lenzy_coin_chat"))
    
    keyboard.row(
        types.InlineKeyboardButton("🔄 Qayta tekshirish", callback_data="check_subs"),
        types.InlineKeyboardButton("🎮 O'yinga kirish", web_app=types.WebAppInfo(url=f"{GAME_URL}?ref=tg_{user_id}"))
    )
    bot.send_message(message.chat.id, status_text, reply_markup=keyboard)


@bot.callback_query_handler(func=lambda call: call.data == "check_subs")
def callback_check_subs(call: types.CallbackQuery):
    user_id = call.from_user.id
    is_channel = check_user_sub("@lenzy_coin", user_id)
    is_chat = check_user_sub("@lenzy_coin_chat", user_id)

    status_text = (
        f"🔍 <b>Obunalarni tekshirish natijasi:</b>\n\n"
        f"📢 <b>Rasmiy kanal (@lenzy_coin):</b> {'✅ A\\'zo bo\\'lgansiz (+25,000 tanga)' if is_channel else '❌ A\\'zo emassiz'}\n"
        f"💬 <b>Rasmiy guruh (@lenzy_coin_chat):</b> {'✅ A\\'zo bo\\'lgansiz (+15,000 tanga)' if is_chat else '❌ A\\'zo emassiz'}\n\n"
    )

    if is_channel and is_chat:
        status_text += "🎉 <b>Tabriklaymiz!</b> Siz ikkala rasmiy resursga ham a'zo bo'lgansiz!\nO'yinga kirib <b>+40,000 tanga</b> umumiy mukofotingizni oling:"
    else:
        status_text += "💡 <i>Bonuslarni to'liq olish uchun kanal va guruhga a'zo bo'ling va qayta tekshiring!</i>"

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    if not is_channel:
        keyboard.add(types.InlineKeyboardButton("📢 Kanalga a'zo bo'lish (@lenzy_coin)", url="https://t.me/lenzy_coin"))
    if not is_chat:
        keyboard.add(types.InlineKeyboardButton("💬 Guruhga qo'shilish (@lenzy_coin_chat)", url="https://t.me/lenzy_coin_chat"))
    
    keyboard.row(
        types.InlineKeyboardButton("🔄 Qayta tekshirish", callback_data="check_subs"),
        types.InlineKeyboardButton("🎮 O'yinga kirish", web_app=types.WebAppInfo(url=f"{GAME_URL}?ref=tg_{user_id}"))
    )
    try:
        bot.edit_message_text(status_text, call.message.chat.id, call.message.message_id, reply_markup=keyboard)
        bot.answer_callback_query(call.id, text="Tekshirildi!")
    except Exception:
        bot.answer_callback_query(call.id)


@bot.message_handler(func=lambda msg: True)
def handle_all_messages(msg: types.Message):
    if msg.chat.type == 'private' and not (msg.text and msg.text.startswith('/')):
        user_id = msg.from_user.id
        direct_game_url = f"{GAME_URL}?ref=tg_{user_id}"
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(types.InlineKeyboardButton("🎮 O'yinni boshlash (Play)", web_app=types.WebAppInfo(url=direct_game_url)))
        bot.send_message(
            msg.chat.id,
            "🪙 <b>Lenzy Coin</b> o'yiniga xush kelibsiz!\nO'ynash uchun pastdagi tugmani bosing yoki /start buyrug'ini yuboring.",
            reply_markup=keyboard
        )


if __name__ == "__main__":
    print("🚀 Lenzy Coin Telegram Boti (@lenzycoin_bot) muvaffaqiyatli ishga tushdi...")
    bot.infinity_polling(skip_pending=True)
