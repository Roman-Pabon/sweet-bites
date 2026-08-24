export function safeAdminReturnPath(path: string | undefined | null, fallback = "/admin") {
  if (!path) return fallback;
  if (!path.startsWith("/stamp/")) return fallback;
  if (path.includes("//") || path.includes("?") || path.includes("#")) return fallback;
  if (path.length > 200) return fallback;
  return path;
}
