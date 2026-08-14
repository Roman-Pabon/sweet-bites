import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "SETUP_SECRET no está configurado en el servidor" },
      { status: 503 }
    );
  }

  try {
    const { setupSecret: secret, username, password } = await request.json();

    if (secret !== setupSecret) {
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

    if (password.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    const db = await getDb();
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

    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(
      normalized,
      passwordHash
    );

    return NextResponse.json({
      success: true,
      message: `Admin "${normalized}" creado correctamente`,
    });
  } catch {
    return NextResponse.json({ error: "Error al crear admin" }, { status: 500 });
  }
}
