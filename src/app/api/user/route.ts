import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, toPublicUser, type User } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = await getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.userId) as User | undefined;

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(toPublicUser(user));
}
