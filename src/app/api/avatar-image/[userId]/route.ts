import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getAvatarsDir } from "@/lib/paths";

type Props = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { userId } = await params;
  const id = Number(userId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const avatarsDir = getAvatarsDir();

  for (const ext of ["jpg", "png", "webp"]) {
    const filepath = path.join(avatarsDir, `${id}.${ext}`);
    if (fs.existsSync(filepath)) {
      const buffer = fs.readFileSync(filepath);
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  return NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
