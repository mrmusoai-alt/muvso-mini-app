// MUVSO Telegram webhook. Requires TELEGRAM_BOT_TOKEN in Vercel Environment Variables.
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

    // Keep the bot intentionally simple: /start + one button to open the Mini App.
    if (command === "/start") {
      await sendMessage(
        chatId,
        "Добро пожаловать в MUVSO — твой личный финансовый помощник.\n\nНажми кнопку ниже, чтобы открыть приложение.",
        {
          reply_markup: {
            inline_keyboard: [[
              { text: "Открыть приложение MUVSO", web_app: { url: APP_URL } }
            ]]
          }
        }
      );
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("MUVSO Telegram webhook error:", error);
    return res.status(200).json({ ok: false });
  }
}
