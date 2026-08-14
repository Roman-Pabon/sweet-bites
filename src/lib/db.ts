import fs from "fs";
import path from "path";
import type { Database as SqlJsDatabase, SqlValue } from "sql.js";
import { getDbPath } from "./paths";
import { generateStampToken } from "./tokens";

type BindParams = SqlValue[];

class Statement {
  constructor(
    private db: SqlJsDatabase,
    private sql: string,
    private persist: () => void
  ) {}

  get(...params: BindParams) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, SqlValue>;
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params: BindParams) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    const rows: Record<string, SqlValue>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as Record<string, SqlValue>);
    }
    stmt.free();
    return rows;
  }

  run(...params: BindParams) {
    this.db.run(this.sql, params);
    const result = this.db.exec("SELECT last_insert_rowid() AS id");
    const lastInsertRowid = Number(result[0]?.values[0]?.[0] ?? 0);
    this.persist();
    return { lastInsertRowid };
  }
}

export class SqliteDatabase {
  constructor(
    private db: SqlJsDatabase,
    private dbPath: string,
    private onPersist?: () => void
  ) {}

  persist() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
    this.onPersist?.();
  }

  close() {
    this.db.close();
  }

  prepare(sql: string) {
    return new Statement(this.db, sql, () => this.persist());
  }

  exec(sql: string) {
    this.db.exec(sql);
    this.persist();
  }

  pragma(cmd: string) {
    this.db.run(`PRAGMA ${cmd}`);
  }
}

const dbPath = getDbPath();
let db: SqliteDatabase | null = null;
let initPromise: Promise<SqliteDatabase> | null = null;
let loadedMtime = -1;

function wasmPath(file: string) {
  return path.join(process.cwd(), "node_modules/sql.js/dist", file);
}

function getFileMtime() {
  return fs.existsSync(dbPath) ? fs.statSync(dbPath).mtimeMs : 0;
}

function markLoadedMtime() {
  loadedMtime = getFileMtime();
}

function isDbStale() {
  return !db || getFileMtime() > loadedMtime;
}

function bootstrapSchema(database: SqliteDatabase) {
  database.exec(`
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

  const columns = database
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];

  if (!columns.some((c) => c.name === "avatar_url")) {
    database.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
  }
  if (!columns.some((c) => c.name === "stamp_token")) {
    database.exec("ALTER TABLE users ADD COLUMN stamp_token TEXT");
  }

  database.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stamp_token ON users(stamp_token) WHERE stamp_token IS NOT NULL"
  );

  const usersWithoutToken = database
    .prepare("SELECT id FROM users WHERE stamp_token IS NULL")
    .all() as { id: number }[];

  const updateToken = database.prepare("UPDATE users SET stamp_token = ? WHERE id = ?");
  for (const u of usersWithoutToken) {
    updateToken.run(generateStampToken(), u.id);
  }
}

async function openDb() {
  if (db) {
    db.close();
    db = null;
  }

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const initSqlJs = (await import("sql.js")).default;
  const SQL = await initSqlJs({ locateFile: wasmPath });

  let rawDb: SqlJsDatabase;
  if (fs.existsSync(dbPath)) {
    rawDb = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    rawDb = new SQL.Database();
  }

  db = new SqliteDatabase(rawDb, dbPath, markLoadedMtime);
  bootstrapSchema(db);
  markLoadedMtime();
  return db;
}

export async function initDb() {
  await getDb();
}

export async function getDb() {
  if (!isDbStale() && db) {
    return db;
  }

  if (!initPromise) {
    initPromise = openDb().finally(() => {
      initPromise = null;
    });
  }

  return initPromise;
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
