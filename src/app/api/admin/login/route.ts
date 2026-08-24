import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, type Admin } from "@/lib/db";
import { createAdminSession } from "@/lib/admin-auth";
import { clientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`admin-login:${clientIp(request)}`, 12, 10 * 60 * 1000);
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
    const admin = db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .get(username.trim().toLowerCase()) as Admin | undefined;

    if (!admin) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    await createAdminSession({
      adminId: admin.id,
      username: admin.username,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
