import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getAvatarsDir } from "@/lib/paths";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ninguna imagen" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no válido. Usa JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen es muy grande (máx. 2 MB)" },
        { status: 400 }
      );
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const uploadsDir = getAvatarsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${session.userId}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Remove old avatar files with different extensions
    for (const oldExt of ["jpg", "png", "webp"]) {
      if (oldExt !== ext) {
        const oldPath = path.join(uploadsDir, `${session.userId}.${oldExt}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = `/api/avatar-image/${session.userId}?t=${Date.now()}`;
    const db = getDb();
    db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatarUrl, session.userId);

    return NextResponse.json({ avatarUrl });
  } catch {
    return NextResponse.json({ error: "Error al subir la foto" }, { status: 500 });
  }
}
