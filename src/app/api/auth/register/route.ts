import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { generateStampToken } from "@/lib/tokens";
import { clientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`register:${clientIp(request)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados registros desde esta red. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 32) {
      return NextResponse.json(
        { error: "El usuario debe tener entre 3 y 32 caracteres" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      return NextResponse.json(
        { error: "El usuario solo puede usar letras, números, punto, guion y guion bajo" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const normalized = username.trim().toLowerCase();
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(normalized);

    if (existing) {
      return NextResponse.json(
        { error: "Este usuario ya existe" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const stampToken = generateStampToken();
    const result = db
      .prepare(
        "INSERT INTO users (username, password_hash, stamp_token) VALUES (?, ?, ?)"
      )
      .run(normalized, passwordHash, stampToken);

    await createSession({
      userId: Number(result.lastInsertRowid),
      username: normalized,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
