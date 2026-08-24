import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listRegisteredUsers } from "@/lib/stamps";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const users = await listRegisteredUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Error al listar usuarios" }, { status: 500 });
  }
}
