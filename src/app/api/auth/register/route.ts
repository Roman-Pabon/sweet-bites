import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { generateStampToken } from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

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

    if (password.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username.trim().toLowerCase());

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
      .run(username.trim().toLowerCase(), passwordHash, stampToken);

    await createSession({
      userId: Number(result.lastInsertRowid),
      username: username.trim().toLowerCase(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
