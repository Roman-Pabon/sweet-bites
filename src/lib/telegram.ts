import { TOTAL_STAMPS } from "./constants";

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

function getChatIds() {
  const raw = process.env.TELEGRAM_CHAT_ID?.trim() || "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isTelegramConfigured() {
  return Boolean(getBotToken() && getChatIds().length > 0);
}

export async function sendTelegramMessage(text: string) {
  const token = getBotToken();
  const chatIds = getChatIds();

  if (!token || chatIds.length === 0) {
    return { skipped: true as const, reason: "Telegram no configurado" };
  }

  const results = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          return { chatId, ok: false as const, error: body };
        }

        return { chatId, ok: true as const };
      } catch (error) {
        return {
          chatId,
          ok: false as const,
          error: error instanceof Error ? error.message : "Error de red",
        };
      }
    })
  );

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error("[telegram] Falló el envío:", failed);
    return { ok: false as const, results };
  }

  return { ok: true as const, results };
}

export async function notifyStampMilestone(username: string, stamps: number) {
  if (stamps === TOTAL_STAMPS - 1) {
    return sendTelegramMessage(
      `🍪 Sweet Bites\n${username} lleva ${stamps}/${TOTAL_STAMPS}.\nAlista el premio (Mini bites).`
    );
  }

  if (stamps >= TOTAL_STAMPS) {
    return sendTelegramMessage(
      `🎉 Sweet Bites\n${username} completó ${TOTAL_STAMPS}/${TOTAL_STAMPS}.\nListo para canjear.`
    );
  }

  return { skipped: true as const, reason: "Sin hito" };
}
