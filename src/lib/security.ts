import { timingSafeEqual } from "crypto";

export function getJwtSecretBytes() {
  const secret = process.env.JWT_SECRET?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error(
        "JWT_SECRET es obligatorio en producción y debe tener al menos 32 caracteres"
      );
    }
    return new TextEncoder().encode(secret);
  }

  return new TextEncoder().encode(secret || "sweet-dev-secret-change-in-production");
}

export function safeEqualString(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
