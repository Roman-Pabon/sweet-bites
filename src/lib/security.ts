import { timingSafeEqual } from "crypto";

const DEV_FALLBACK_SECRET = "sweet-dev-secret-change-in-production";

/**
 * Nunca lanza: si falla el login por secret inválido, se pierden las cuentas “en apariencia”.
 * En producción conviene JWT_SECRET >= 32, pero si falta usamos el fallback anterior
 * para no romper sesiones/login ya desplegados.
 */
export function getJwtSecretBytes() {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    if (process.env.NODE_ENV === "production" && secret.length < 32) {
      console.warn(
        "[security] JWT_SECRET debería tener al menos 32 caracteres. Sigue usándose el valor actual."
      );
    }
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[security] Falta JWT_SECRET. Usando fallback temporal. Configura JWT_SECRET (>=32) en Railway."
    );
  }

  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
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
