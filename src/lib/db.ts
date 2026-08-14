import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { getDbPath } from "./paths";
import { generateStampToken } from "./tokens";

const dbPath = getDbPath();

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        stamps INTEGER NOT NULL DEFAULT 0,
        rewards INTEGER NOT NULL DEFAULT 0,
        avatar_url TEXT,
        stamp_token TEXT UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const columns = db
      .prepare("PRAGMA table_info(users)")
      .all() as { name: string }[];

    if (!columns.some((c) => c.name === "avatar_url")) {
      db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
    }
    if (!columns.some((c) => c.name === "stamp_token")) {
      db.exec("ALTER TABLE users ADD COLUMN stamp_token TEXT");
    }

    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stamp_token ON users(stamp_token) WHERE stamp_token IS NOT NULL"
    );

    // Assign tokens to existing users without one
    const usersWithoutToken = db
      .prepare("SELECT id FROM users WHERE stamp_token IS NULL")
      .all() as { id: number }[];

    const updateToken = db.prepare("UPDATE users SET stamp_token = ? WHERE id = ?");
    for (const u of usersWithoutToken) {
      updateToken.run(generateStampToken(), u.id);
    }
  }

  return db;
}

export type User = {
  id: number;
  username: string;
  password_hash: string;
  stamps: number;
  rewards: number;
  avatar_url: string | null;
  stamp_token: string | null;
  created_at: string;
};

export type PublicUser = {
  id: number;
  username: string;
  stamps: number;
  rewards: number;
  avatarUrl: string | null;
};

export type Admin = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    stamps: user.stamps,
    rewards: user.rewards,
    avatarUrl: user.avatar_url,
  };
}
