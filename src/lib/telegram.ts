// src/lib/telegram.ts

type TelegramButton = {
  text: string;
  callback_data: string;
};

export function escapeTelegramHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(
  text: string,
  buttons?: TelegramButton[][]
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,

          ...(buttons
            ? {
                reply_markup: {
                  inline_keyboard: buttons,
                },
              }
            : {}),
        }),
      }
    );

    if (!res.ok) {
      console.error(
        "[telegram.send.error]",
        await res.text()
      );
    }
  } catch (error) {
    console.error(
      "[telegram.send.error]",
      error
    );
  }
}