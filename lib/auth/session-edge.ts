import type { AdminSession } from "./types";

const SESSION_COOKIE = "kroo_admin_session";

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (expectedB64.length !== signature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedB64.length; i += 1) {
    mismatch |= expectedB64.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

async function decodeSessionEdge(token: string, secret: string): Promise<AdminSession | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const valid = await verifySignature(payload, signature, secret);
  if (!valid) return null;

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    const session = JSON.parse(json) as AdminSession;
    if (Date.now() > session.expiresAt) return null;
    if (!session.email || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

export async function parseSessionFromCookieHeaderEdge(
  cookieHeader: string | null,
  secret: string | null,
): Promise<AdminSession | null> {
  if (!cookieHeader || !secret) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;

  const token = sessionCookie.slice(SESSION_COOKIE.length + 1);
  return decodeSessionEdge(token, secret);
}

export { SESSION_COOKIE };
