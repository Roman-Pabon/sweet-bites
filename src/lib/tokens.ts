import { randomBytes } from "crypto";

export function generateStampToken() {
  return randomBytes(24).toString("base64url");
}

export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getStampUrl(token: string) {
  return `${getAppBaseUrl()}/stamp/${token}`;
}
