import fs from "fs";
import path from "path";
import { bcrypt, Database } from "./_load-deps.mjs";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log("Uso: npm run reset-admin -- <usuario> <nueva_contraseña>");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sweet.db");
if (!fs.existsSync(dbPath)) {
  console.error("No existe la base de datos. Inicia la app primero.");
  process.exit(1);
}

const db = new Database(dbPath);
const admin = db
  .prepare("SELECT id FROM admins WHERE username = ?")
  .get(username.trim().toLowerCase());

if (!admin) {
  console.error(
    `No existe el admin "${username}". Créalo con: npm run create-admin -- ${username} ${password}`
  );
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, admin.id);

console.log(`Contraseña de "${username.trim().toLowerCase()}" actualizada.`);
