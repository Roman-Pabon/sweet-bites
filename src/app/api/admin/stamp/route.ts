import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { addStampToUser, getUserByStampToken } from "@/lib/stamps";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const user = await getUserByStampToken(token);
    if (!user) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const result = await addStampToUser(user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      user: result.user,
      earnedReward: result.earnedReward,
    });
  } catch {
    return NextResponse.json({ error: "Error al marcar sello" }, { status: 500 });
  }
}
