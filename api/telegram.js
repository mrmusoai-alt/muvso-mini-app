// Vercel Serverless Function: Telegram webhook for MUVSO.
// Required environment variable: TELEGRAM_BOT_TOKEN
const APP_URL = "https://muvso-mini-app.vercel.app";

async function sendMessage(chatId, text, extra = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
  if (!response.ok) throw new Error(`Telegram API error: ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("MUVSO Telegram webhook is ready");
  try {
    const update = req.body || {};
    const message = update.message;
    if (!message?.chat?.id) return res.status(200).json({ ok: true });
    const chatId = message.chat.id;
    const text = (message.text || "").trim();
    const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();

    if (command === "/start") {
      await sendMessage(chatId,
        "Добро пожаловать в MUVSO — твой личный финансовый помощник.\n\nОткрывай приложение, чтобы вести доходы, расходы, бюджет и цели.\n\nВажно: синхронизация операций между ботом и приложением ещё не подключена.",
        { reply_markup: { inline_keyboard: [[{ text: "Открыть MUVSO", web_app: { url: APP_URL } }]] } }
      );
    } else if (command === "/help") {
      await sendMessage(chatId,
        "Команды MUVSO:\n/start — запуск\n/add — открыть приложение для записи операции\n/balance — открыть финансовый экран\n\nСтатистика и цели доступны в нижнем меню приложения."
      );
    } else if (command === "/add") {
      await sendMessage(chatId, "Чтобы добавить доход или расход, открой MUVSO и выбери нужное действие.", {
        reply_markup: { inline_keyboard: [[{ text: "Добавить операцию в MUVSO", web_app: { url: APP_URL } }]] }
      });
    } else if (command === "/balance") {
      await sendMessage(chatId, "Открой MUVSO, чтобы посмотреть баланс. Синхронизация баланса с ботом будет доступна после подключения общей базы данных.", {
        reply_markup: { inline_keyboard: [[{ text: "Открыть баланс", web_app: { url: APP_URL } }]] }
      });
    } else if (text && !text.startsWith("/")) {
      await sendMessage(chatId, "Чтобы безопасно записывать операции, открой приложение MUVSO. Ввод обычным сообщением в чате будет включён после подключения общей базы данных.", {
        reply_markup: { inline_keyboard: [[{ text: "Открыть MUVSO", web_app: { url: APP_URL } }]] }
      });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("MUVSO Telegram webhook error:", error);
    return res.status(200).json({ ok: false });
  }
}
