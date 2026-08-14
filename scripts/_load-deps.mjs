import { createRequire } from "module";
import fs from "fs";
import path from "path";

function resolveDepsEntry() {
  const adminEntry = path.join(
    process.cwd(),
    "node_modules_admin/bcryptjs/package.json"
  );
  if (fs.existsSync(adminEntry)) return adminEntry;

  return path.join(process.cwd(), "node_modules/bcryptjs/package.json");
}

const require = createRequire(resolveDepsEntry());

export const bcrypt = require("bcryptjs");
export const Database = require("better-sqlite3");
