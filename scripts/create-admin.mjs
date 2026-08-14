import fs from "fs";
import path from "path";
import { bcrypt, Database } from "./_load-deps.mjs";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log("Uso: npm run create-admin -- <usuario> <contraseña>");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sweet.db");
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const existing = db
  .prepare("SELECT id FROM admins WHERE username = ?")
  .get(username.trim().toLowerCase());

if (existing) {
  console.error(`El admin "${username}" ya existe.`);
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(
  username.trim().toLowerCase(),
  hash
);

console.log(`Admin "${username.trim().toLowerCase()}" creado correctamente.`);
