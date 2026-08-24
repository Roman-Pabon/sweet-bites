import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, type User } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { clientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`login:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
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

    const db = await getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.trim().toLowerCase()) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      username: user.username,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
