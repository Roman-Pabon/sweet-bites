import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log("Uso: npm run reset-admin -- <usuario> <nueva_contraseña>");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sweet.db");

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.error("No existe la base de datos. Inicia la app primero.");
    process.exit(1);
  }

  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), "node_modules/sql.js/dist", file),
  });

  const db = new SQL.Database(fs.readFileSync(dbPath));
  const normalized = username.trim().toLowerCase();
  const check = db.prepare("SELECT id FROM admins WHERE username = ?");
  check.bind([normalized]);
  if (!check.step()) {
    check.free();
    console.error(
      `No existe el admin "${username}". Créalo con: npm run create-admin -- ${username} ${password}`
    );
    process.exit(1);
  }
  const adminId = check.get()[0];
  check.free();

  const hash = bcrypt.hashSync(password, 10);
  db.run("UPDATE admins SET password_hash = ? WHERE id = ?", [hash, adminId]);

  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  console.log(`Contraseña de "${normalized}" actualizada.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
