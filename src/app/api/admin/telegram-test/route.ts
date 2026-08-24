import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      {
        error:
          "Telegram no está configurado. Añade TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en Railway.",
      },
      { status: 400 }
    );
  }

  const result = await sendTelegramMessage(
    `✅ Sweet Bites\nPrueba OK (${admin.username}).\nCuando alguien llegue a 9/10 te avisaré aquí.`
  );

  if ("ok" in result && result.ok === false) {
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Revisa el token y el chat id." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
