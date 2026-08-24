import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteRegisteredUser } from "@/lib/stamps";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
    }

    const result = await deleteRegisteredUser(userId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ ok: true, username: result.username });
  } catch {
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 });
  }
}
