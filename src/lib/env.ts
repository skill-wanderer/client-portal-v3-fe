import "server-only";

export type AuthConfig = {
  /** Public origin of this portal; used for redirect URIs and absolute redirects. */
  appUrl: URL;
  /** Keycloak realm issuer, e.g. https://sso.skill-wanderer.com/realms/client-portal */
  issuer: URL;
  clientId: string;
  /** Empty for a public client (PKCE only). */
  clientSecret: string | undefined;
  scope: string;
  sessionSecret: string;
  /** Cookies get the Secure flag and the __Host- prefix when the portal is served over HTTPS. */
  secureCookies: boolean;
};

let cached: AuthConfig | undefined;

// Read lazily so `next build` works without runtime secrets; the first request fails loudly instead.
export function getAuthConfig(): AuthConfig {
  if (cached) return cached;

  const appUrl = readUrl("APP_URL");
  const sessionSecret = read("SESSION_SECRET");
  if (sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  cached = {
    appUrl,
    issuer: readUrl("KEYCLOAK_ISSUER"),
    clientId: read("KEYCLOAK_CLIENT_ID"),
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || undefined,
    scope: process.env.KEYCLOAK_SCOPE || "openid profile email",
    sessionSecret,
    secureCookies: appUrl.protocol === "https:",
  };
  return cached;
}

function read(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

function readUrl(name: string): URL {
  const value = read(name);
  try {
    // Drop trailing slashes so path joins like `${issuer}/account` stay clean.
    return new URL(value.replace(/\/+$/, ""));
  } catch {
    throw new Error(`Environment variable ${name} must be an absolute URL, got "${value}".`);
  }
}
