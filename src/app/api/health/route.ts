import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getDataDir, getDbPath } from "@/lib/paths";

export async function GET() {
  const dataDir = getDataDir();
  const dbFile = getDbPath();

  try {
    (await getDb()).prepare("SELECT 1 AS ok").get();
    return NextResponse.json({
      ok: true,
      dataDir,
      dbPath: dbFile,
      platform: process.platform,
      arch: process.arch,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        dataDir,
        dbPath: dbFile,
        platform: process.platform,
        arch: process.arch,
        error: message,
      },
      { status: 500 }
    );
  }
}
