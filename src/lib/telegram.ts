/**
 * Telegram Bot API Notification Module for 3NFM Multi-Tenant SaaS
 * Serverless-safe, zero disk writes (pure in-memory Buffers/Blobs)
 * Non-blocking execution with safe fallbacks
 */

export interface TelegramAlertOptions {
  message: string;
  base64Photo?: string | null;
  customChatId?: string | null;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
}

export interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send an alert to Telegram Bot API.
 * If base64Photo is supplied, dispatches via sendPhoto with message caption.
 * Falls back safely to sendMessage if photo upload fails or is not present.
 */
export async function sendTelegramAlert(
  options: TelegramAlertOptions
): Promise<TelegramResult> {
  const { message, base64Photo, customChatId, parseMode = "HTML" } = options;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const targetChatId = (customChatId || process.env.TELEGRAM_CHAT_ID)?.trim();

  // If credentials are not configured, log and exit gracefully without throwing
  if (!botToken || !targetChatId) {
    console.warn(
      `[Telegram Notification Notice] Skipped alert dispatch: ${
        !botToken ? "TELEGRAM_BOT_TOKEN missing" : "Target Chat ID missing"
      }`
    );
    return {
      success: false,
      error: "Telegram credentials or target Chat ID not configured",
    };
  }

  try {
    // 1. If photo is present, attempt sendPhoto
    if (base64Photo && typeof base64Photo === "string") {
      try {
        let mimeType = "image/jpeg";
        let base64Data = base64Photo;

        const dataUrlMatch = base64Photo.match(
          /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/
        );
        if (dataUrlMatch) {
          mimeType = dataUrlMatch[1];
          base64Data = dataUrlMatch[2];
        }

        const buffer = Buffer.from(base64Data, "base64");
        const blob = new Blob([buffer], { type: mimeType });

        // Telegram photo caption maximum limit is 1024 characters
        const MAX_CAPTION_LEN = 1024;
        const isCaptionLong = message.length > MAX_CAPTION_LEN;
        const caption = isCaptionLong
          ? message.slice(0, MAX_CAPTION_LEN - 30) + "\n\n<i>[ข้อความเต็มแสดงด้านล่าง]</i>"
          : message;

        const formData = new FormData();
        formData.append("chat_id", targetChatId);
        formData.append("photo", blob, "slip.jpg");
        formData.append("caption", caption);
        formData.append("parse_mode", parseMode);

        const photoRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: "POST",
            body: formData,
          }
        );

        const photoJson = await photoRes.json();

        if (photoJson.ok) {
          // If caption was truncated, follow up with complete text
          if (isCaptionLong) {
            await sendTextMessage(botToken, targetChatId, message, parseMode);
          }
          return {
            success: true,
            messageId: photoJson.result?.message_id,
          };
        } else {
          console.warn(
            "[Telegram sendPhoto Warning] Failed, falling back to sendMessage:",
            photoJson.description
          );
          // Fallback to text sendMessage below
        }
      } catch (photoErr: any) {
        console.warn(
          "[Telegram Photo Processing Warning] Fallback to sendMessage:",
          photoErr?.message
        );
      }
    }

    // 2. Text Message dispatch (Standard or Fallback)
    return await sendTextMessage(botToken, targetChatId, message, parseMode);
  } catch (error: any) {
    console.error("[Telegram Notification Error]:", error?.message || error);
    return {
      success: false,
      error: error?.message || "Internal network error contacting Telegram API",
    };
  }
}

/**
 * Helper to dispatch text messages via sendMessage endpoint
 */
async function sendTextMessage(
  botToken: string,
  chatId: string,
  text: string,
  parseMode: string
): Promise<TelegramResult> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    }),
  });

  const json = await res.json();
  if (json.ok) {
    return {
      success: true,
      messageId: json.result?.message_id,
    };
  }

  return {
    success: false,
    error: json.description || "Failed to send message via Telegram API",
  };
}
