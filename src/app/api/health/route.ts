import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { getDataDir, getDbPath } from "@/lib/paths";

export async function GET() {
  const dataDir = getDataDir();
  const dbPath = getDbPath();

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.accessSync(dataDir, fs.constants.W_OK);

    const sqlitePrebuild = path.join(
      process.cwd(),
      "node_modules/better-sqlite3/prebuilds/linux-x64.node"
    );
    const sqliteMuslPrebuild = path.join(
      process.cwd(),
      "node_modules/better-sqlite3/prebuilds/linuxmusl-x64.node"
    );

    const db = new Database(dbPath);
    db.prepare("SELECT 1 AS ok").get();
    db.close();

    return NextResponse.json({
      ok: true,
      dataDir,
      dbPath,
      platform: process.platform,
      arch: process.arch,
      hasLinuxPrebuild: fs.existsSync(sqlitePrebuild),
      hasLinuxMuslPrebuild: fs.existsSync(sqliteMuslPrebuild),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        ok: false,
        dataDir,
        dbPath,
        platform: process.platform,
        arch: process.arch,
        error: message,
        stack,
      },
      { status: 500 }
    );
  }
}
