import path from "path";

export function getDataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export function getDbPath() {
  return path.join(getDataDir(), "sweet.db");
}

export function getAvatarsDir() {
  return path.join(getDataDir(), "uploads", "avatars");
}
