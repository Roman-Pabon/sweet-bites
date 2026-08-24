import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getAvatarsDir } from "@/lib/paths";
import { clientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 2 * 1024 * 1024;

function detectImageExt(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limited = rateLimit(`avatar:${session.userId}:${clientIp(request)}`, 10, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas subidas. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ninguna imagen" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen es muy grande (máx. 2 MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = detectImageExt(buffer);
    if (!ext) {
      return NextResponse.json(
        { error: "Formato no válido. Usa JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    const uploadsDir = getAvatarsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${session.userId}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);

    for (const oldExt of ["jpg", "png", "webp"]) {
      if (oldExt !== ext) {
        const oldPath = path.join(uploadsDir, `${session.userId}.${oldExt}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = `/api/avatar-image/${session.userId}?t=${Date.now()}`;
    const db = await getDb();
    db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatarUrl, session.userId);

    return NextResponse.json({ avatarUrl });
  } catch {
    return NextResponse.json({ error: "Error al subir la foto" }, { status: 500 });
  }
}
