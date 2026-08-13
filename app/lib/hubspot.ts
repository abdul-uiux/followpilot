import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

export const hubSpotScopes = [
  "oauth",
  "crm.objects.contacts.read",
  "crm.objects.contacts.write",
  "crm.objects.companies.read",
  "crm.objects.companies.write",
  "crm.objects.deals.read",
  "crm.objects.deals.write",
];

export const hubSpotTokenCookie = "followpilot-hubspot-token";
export const hubSpotStateCookie = "followpilot-hubspot-state";

export type HubSpotTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

function config() {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const encryptionKey = process.env.HUBSPOT_TOKEN_ENCRYPTION_KEY;

  if (!clientId || !clientSecret || !redirectUri || !encryptionKey) return null;
  return { clientId, clientSecret, redirectUri, encryptionKey };
}

export function hubSpotIsConfigured() {
  return Boolean(config());
}

export function hubSpotConfig() {
  const value = config();
  if (!value) throw new Error("HubSpot OAuth is not configured.");
  return value;
}

function cipherKey() {
  return createHash("sha256").update(hubSpotConfig().encryptionKey).digest();
}

export function sealHubSpotTokens(tokens: HubSpotTokens) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cipherKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function unsealHubSpotTokens(value: string): HubSpotTokens | null {
  try {
    const payload = Buffer.from(value, "base64url");
    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", cipherKey(), iv);
    decipher.setAuthTag(authTag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as HubSpotTokens;
  } catch {
    return null;
  }
}

export async function exchangeHubSpotCode(code: string) {
  const { clientId, clientSecret, redirectUri } = hubSpotConfig();
  const body = new URLSearchParams({ grant_type: "authorization_code", code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri });
  const response = await fetch("https://api.hubapi.com/oauth/v3/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!response.ok) throw new Error("HubSpot could not complete authorization.");
  const value = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
  return { accessToken: value.access_token, refreshToken: value.refresh_token, expiresAt: Date.now() + value.expires_in * 1000 } satisfies HubSpotTokens;
}

export async function refreshHubSpotTokens(tokens: HubSpotTokens) {
  if (tokens.expiresAt > Date.now() + 60_000) return tokens;
  const { clientId, clientSecret } = hubSpotConfig();
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refreshToken, client_id: clientId, client_secret: clientSecret });
  const response = await fetch("https://api.hubapi.com/oauth/v3/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!response.ok) throw new Error("Your HubSpot connection has expired.");
  const value = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
  return { accessToken: value.access_token, refreshToken: value.refresh_token, expiresAt: Date.now() + value.expires_in * 1000 } satisfies HubSpotTokens;
}

export async function hubSpotTokensFromRequest(request: NextRequest) {
  const savedTokens = request.cookies.get(hubSpotTokenCookie)?.value;
  const tokens = savedTokens ? unsealHubSpotTokens(savedTokens) : null;
  if (!tokens) throw new Error("Connect HubSpot before running a CRM review.");
  return refreshHubSpotTokens(tokens);
}

export async function hubSpotFetch(path: string, accessToken: string, init?: RequestInit) {
  return fetch(`https://api.hubapi.com${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers ?? {}) }, cache: "no-store" });
}

export const tokenCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };
