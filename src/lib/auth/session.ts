import "server-only";
import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";
import { getAuthConfig } from "@/lib/env";

/**
 * The server-side session. It lives in an encrypted, HttpOnly cookie and never
 * reaches browser JavaScript, so Keycloak tokens stay on the server.
 */
export type Session = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  /** Access token expiry, in epoch seconds. */
  expiresAt: number;
};

/** Short-lived state that carries PKCE, state and nonce from /auth/login to /auth/callback. */
export type AuthTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
};

export type CookieWrite = { name: string; value: string; maxAge: number };

/** Anything that can list cookies: next/headers cookies(), NextRequest.cookies, NextResponse.cookies. */
type CookieSource = { getAll(): Array<{ name: string; value: string }> };

export const TRANSACTION_MAX_AGE = 10 * 60;

// Keycloak tokens together exceed the ~4 KB per-cookie limit, so the session is split across chunks.
const CHUNK_SIZE = 3800;
// Refresh slightly before the access token expires so requests never carry a stale token.
const REFRESH_LEEWAY_SECONDS = 60;

export function sessionCookieName() {
  return cookieName("cp_session");
}

export function transactionCookieName() {
  return cookieName("cp_auth");
}

function cookieName(base: string) {
  return getAuthConfig().secureCookies ? `__Host-${base}` : base;
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: getAuthConfig().secureCookies,
    // Lax (not Strict) so the cookie survives the top-level redirect back from Keycloak.
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function isExpiring(session: Session) {
  return session.expiresAt - Math.floor(Date.now() / 1000) < REFRESH_LEEWAY_SECONDS;
}

export async function readSession(cookies: CookieSource): Promise<Session | null> {
  const prefix = `${sessionCookieName()}.`;
  const chunks = cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith(prefix))
    .sort((a, b) => Number(a.name.slice(prefix.length)) - Number(b.name.slice(prefix.length)));
  if (chunks.length === 0) return null;

  const session = await unseal<Session>(chunks.map((chunk) => chunk.value).join(""));
  return session?.accessToken ? session : null;
}

/**
 * Cookie writes that store `session` (or clear it when null) and expire any
 * leftover chunks from a previously larger session.
 */
export async function sessionCookieWrites(
  existing: CookieSource,
  next: { session: Session; maxAge: number } | null,
): Promise<CookieWrite[]> {
  const name = sessionCookieName();
  const writes: CookieWrite[] = [];

  if (next) {
    const sealed = await seal(next.session, next.maxAge);
    for (let i = 0; i * CHUNK_SIZE < sealed.length; i++) {
      writes.push({
        name: `${name}.${i}`,
        value: sealed.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        maxAge: next.maxAge,
      });
    }
  }

  for (const cookie of existing.getAll()) {
    if (cookie.name.startsWith(`${name}.`) && !writes.some((w) => w.name === cookie.name)) {
      writes.push({ name: cookie.name, value: "", maxAge: 0 });
    }
  }
  return writes;
}

export async function sealTransaction(transaction: AuthTransaction) {
  return seal(transaction, TRANSACTION_MAX_AGE);
}

export async function readTransaction(cookies: { get(name: string): { value: string } | undefined }) {
  const value = cookies.get(transactionCookieName())?.value;
  return value ? unseal<AuthTransaction>(value) : null;
}

async function seal(payload: Session | AuthTransaction, maxAge: number): Promise<string> {
  return new EncryptJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .encrypt(await encryptionKey());
}

/** Returns null for anything tampered with, encrypted with another secret, or expired. */
async function unseal<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtDecrypt(token, await encryptionKey(), {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
    });
    return payload as T;
  } catch {
    return null;
  }
}

let keyPromise: Promise<Uint8Array> | undefined;

/** Derives a 256-bit AES-GCM key from SESSION_SECRET with HKDF. */
function encryptionKey(): Promise<Uint8Array> {
  keyPromise ??= (async () => {
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey(
      "raw",
      encoder.encode(getAuthConfig().sessionSecret),
      "HKDF",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: encoder.encode("skill-wanderer-client-portal"),
        info: encoder.encode("session-cookie A256GCM"),
      },
      material,
      256,
    );
    return new Uint8Array(bits);
  })();
  return keyPromise;
}
