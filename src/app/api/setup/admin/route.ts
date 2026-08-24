import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { clientIp, safeEqualString } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "Setup desactivado. SETUP_SECRET no está configurado." },
      { status: 503 }
    );
  }

  const limited = rateLimit(`setup:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const { setupSecret: secret, username, password } = await request.json();

    if (typeof secret !== "string" || !safeEqualString(secret, setupSecret)) {
      return NextResponse.json({ error: "Secret incorrecto" }, { status: 403 });
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña de admin debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const adminCount = db.prepare("SELECT COUNT(*) AS c FROM admins").get() as
      | { c: number }
      | undefined;

    if ((adminCount?.c ?? 0) > 0 && process.env.SETUP_ALLOW_MORE !== "true") {
      return NextResponse.json(
        {
          error:
            "Ya existe un admin. Quita SETUP_SECRET de Railway o pon SETUP_ALLOW_MORE=true solo si necesitas otro.",
        },
        { status: 403 }
      );
    }

    const normalized = username.trim().toLowerCase();

    const existing = db
      .prepare("SELECT id FROM admins WHERE username = ?")
      .get(normalized);

    if (existing) {
      return NextResponse.json(
        { error: `El admin "${normalized}" ya existe` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(
      normalized,
      passwordHash
    );

    return NextResponse.json({
      success: true,
      message: `Admin "${normalized}" creado. Borra SETUP_SECRET en Railway ahora.`,
    });
  } catch {
    return NextResponse.json({ error: "Error al crear admin" }, { status: 500 });
  }
}
