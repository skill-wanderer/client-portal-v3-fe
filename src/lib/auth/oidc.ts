import "server-only";
import * as client from "openid-client";
import { getAuthConfig } from "@/lib/env";
import type { Session } from "./session";

// Fallback cookie lifetime when Keycloak does not report refresh_expires_in (e.g. offline tokens).
const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60;

let configPromise: Promise<client.Configuration> | undefined;

/** Keycloak's discovered OIDC configuration, fetched once per server instance. */
export function getOidcConfig(): Promise<client.Configuration> {
  if (!configPromise) {
    const { issuer, clientId, clientSecret } = getAuthConfig();
    configPromise = client
      .discovery(
        issuer,
        clientId,
        clientSecret,
        // No secret means a public client: authenticate with PKCE only.
        clientSecret ? undefined : client.None(),
        // Allow a plain-HTTP issuer for a local Keycloak (e.g. http://localhost:8080).
        issuer.protocol === "http:" ? { execute: [client.allowInsecureRequests] } : undefined,
      )
      .catch((error: unknown) => {
        configPromise = undefined; // retry discovery on the next request
        throw error;
      });
  }
  return configPromise;
}

export function callbackUrl() {
  return new URL("/auth/callback", getAuthConfig().appUrl);
}

/** Keycloak's self-service account console for this realm. */
export function accountConsoleUrl() {
  return `${getAuthConfig().issuer.href}/account`;
}

type TokenResponse = Awaited<ReturnType<typeof client.refreshTokenGrant>>;

export function sessionFromTokens(tokens: TokenResponse, previous?: Session) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = tokens.expiresIn() ?? 300;
  const session: Session = {
    accessToken: tokens.access_token,
    // Keycloak may omit tokens on refresh; keep the ones we already have.
    refreshToken: tokens.refresh_token ?? previous?.refreshToken,
    idToken: tokens.id_token ?? previous?.idToken,
    expiresAt: now + expiresIn,
  };

  // Keycloak reports how long the refresh token (its SSO session) lives; the cookie follows it.
  const refreshExpiresIn = tokens.refresh_expires_in;
  const maxAge = !session.refreshToken
    ? expiresIn
    : typeof refreshExpiresIn === "number" && refreshExpiresIn > 0
      ? refreshExpiresIn
      : DEFAULT_SESSION_MAX_AGE;

  return { session, maxAge };
}

/**
 * Exchanges the refresh token for fresh tokens. Returns null when Keycloak says
 * the session is over (expired, revoked or logged out elsewhere); throws on
 * transport errors so callers can keep the current session instead.
 */
export async function refreshSession(session: Session) {
  if (!session.refreshToken) return null;
  const config = await getOidcConfig();
  try {
    const tokens = await client.refreshTokenGrant(config, session.refreshToken);
    return sessionFromTokens(tokens, session);
  } catch (error) {
    if (error instanceof client.ResponseBodyError && error.error === "invalid_grant") {
      return null;
    }
    throw error;
  }
}
