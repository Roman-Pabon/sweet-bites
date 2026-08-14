import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log("Uso: npm run create-admin -- <usuario> <contraseña>");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sweet.db");
const dir = path.dirname(dbPath);

async function main() {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), "node_modules/sql.js/dist", file),
  });

  const db = fs.existsSync(dbPath)
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const normalized = username.trim().toLowerCase();
  const check = db.prepare("SELECT id FROM admins WHERE username = ?");
  check.bind([normalized]);
  const exists = check.step();
  check.free();

  if (exists) {
    console.error(`El admin "${username}" ya existe.`);
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [normalized, hash]);

  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  console.log(`Admin "${username.trim().toLowerCase()}" creado correctamente.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
